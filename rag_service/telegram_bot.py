import os
import traceback
import httpx
import asyncio

from dotenv import load_dotenv

from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)

# -----------------------------------
# LOAD ENV
# -----------------------------------

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
)

BOT_SECRET = os.getenv(
    "BOT_SECRET",
    "super_secret_bot_key"
)

HEADERS = {
    "x-bot-secret": BOT_SECRET
}

print("\n==============================")
print("TELEGRAM BOT STARTING")
print("==============================")
print(f"BOT TOKEN EXISTS: {bool(BOT_TOKEN)}")
print(f"BACKEND URL: {BACKEND_URL}")
print(f"BOT SECRET: {BOT_SECRET}")
print("==============================\n")

# -----------------------------------
# START COMMAND
# -----------------------------------

async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    print("\n/start command received")

    await update.message.reply_text(
        "AI Project Assistant Ready.\n\n"
        "Send documents or ask questions."
    )

# -----------------------------------
# HANDLE TEXT QUESTIONS
# -----------------------------------

async def handle_text(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    question = update.message.text

    chat_id = str(
        update.effective_chat.id
    )

    print("\n==============================")
    print("TEXT MESSAGE RECEIVED")
    print("==============================")
    print(f"CHAT ID: {chat_id}")
    print(f"QUESTION: {question}")

    try:

        payload = {
            "question": question,
            "project_id": chat_id
        }

        print("\nSending request to backend...")
        print(f"URL: {BACKEND_URL}/bot/chat")
        print(f"PAYLOAD: {payload}")

        async with httpx.AsyncClient(
            timeout=60.0
        ) as client:


            for attempt in range(3):

                try:
                    response = await client.post(
                        f"{BACKEND_URL}/bot/chat",
                        headers=HEADERS,
                        json=payload
                    )                
                    break
                except Exception as e:
                    print(f"Retry {attempt}: {e}")
                    await asyncio.sleep(1)
                

        print("\nBACKEND RESPONSE RECEIVED")
        print(f"STATUS CODE: {response.status_code}")
        print(f"RAW RESPONSE: {response.text}")

        if response.status_code != 200:

            await update.message.reply_text(
                f"Backend Error\n"
                f"Status: {response.status_code}\n\n"
                f"{response.text}"
            )

            return

        data = response.json()

        answer = data.get(
            "answer",
            "No response"
        )

        print("\nFINAL ANSWER:")
        print(answer)

        await update.message.reply_text(
            answer
        )

    except Exception as e:

        print("\nTEXT ERROR")
        print(str(e))

        traceback.print_exc()

        await update.message.reply_text(
            f"Error:\n{str(e)}"
        )

# -----------------------------------
# HANDLE DOCUMENTS
# -----------------------------------

async def handle_document(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    document = update.message.document

    chat_id = str(
        update.effective_chat.id
    )

    print("\n==============================")
    print("DOCUMENT RECEIVED")
    print("==============================")
    print(f"CHAT ID: {chat_id}")
    print(f"FILENAME: {document.file_name}")
    print(f"FILE SIZE: {document.file_size}")

    try:

        print("\nGetting Telegram file...")

        file = await context.bot.get_file(
            document.file_id
        )

        temp_path = f"temp_{document.file_name}"

        print(f"Downloading to: {temp_path}")

        await file.download_to_drive(
            temp_path
        )

        print("Download completed")

        if not os.path.exists(temp_path):

            print("TEMP FILE NOT FOUND")

            await update.message.reply_text(
                "File download failed."
            )

            return

        print(
            f"TEMP FILE SIZE: "
            f"{os.path.getsize(temp_path)} bytes"
        )

        print("\nUploading to backend...")

        async with httpx.AsyncClient(
            timeout=120.0
        ) as client:

            with open(temp_path, "rb") as f:

                files = {
                    "file": (
                        document.file_name,
                        f
                    )
                }

                data = {
                    "project_id": chat_id
                }

                print(f"URL: {BACKEND_URL}/bot/upload")
                print(f"DATA: {data}")

                response = await client.post(
                    f"{BACKEND_URL}/bot/upload",
                    headers=HEADERS,
                    files=files,
                    data=data
                )

        print("\nUPLOAD RESPONSE RECEIVED")
        print(f"STATUS CODE: {response.status_code}")
        print(f"RAW RESPONSE: {response.text}")

        if response.status_code != 200:

            await update.message.reply_text(
                f"Upload Failed\n"
                f"Status: {response.status_code}\n\n"
                f"{response.text}"
            )

            return

        result = response.json()

        print("\nFINAL RESULT:")
        print(result)

        await update.message.reply_text(
            f"Document processed successfully:\n"
            f"{document.file_name}"
        )

    except Exception as e:

        print("\nDOCUMENT ERROR")
        print(str(e))

        traceback.print_exc()

        await update.message.reply_text(
            f"Upload failed:\n{str(e)}"
        )

    finally:

        if "temp_path" in locals():

            if os.path.exists(temp_path):

                os.remove(temp_path)

                print(f"\nDeleted temp file: {temp_path}")

# -----------------------------------
# ERROR HANDLER
# -----------------------------------

async def error_handler(
    update: object,
    context: ContextTypes.DEFAULT_TYPE
):

    print("\n==============================")
    print("GLOBAL TELEGRAM ERROR")
    print("==============================")

    print(context.error)

    traceback.print_exception(
        type(context.error),
        context.error,
        context.error.__traceback__
    )

# -----------------------------------
# MAIN
# -----------------------------------

def main():

    if not BOT_TOKEN:

        print("TELEGRAM_BOT_TOKEN missing")
        return

    print("Building Telegram app...")

    app = ApplicationBuilder().token(
        BOT_TOKEN
    ).build()

    print("Adding handlers...")

    app.add_handler(
        CommandHandler(
            "start",
            start
        )
    )

    app.add_handler(
        MessageHandler(
            filters.Document.ALL,
            handle_document
        )
    )

    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_text
        )
    )

    app.add_error_handler(
        error_handler
    )

    print("\n==============================")
    print("TELEGRAM BOT RUNNING")
    print("==============================\n")

    app.run_polling()

# -----------------------------------

if __name__ == "__main__":
    main()
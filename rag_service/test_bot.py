from telegram import Bot
import asyncio


async def main():

    bot = Bot(token=TOKEN)

    me = await bot.get_me()

    print(me)

asyncio.run(main())
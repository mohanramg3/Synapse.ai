import re

from config import (
    CHUNK_SIZE,
    CHUNK_OVERLAP
)


def clean_text(text: str):

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def chunk_text(text: str):

    text = clean_text(text)

    words = text.split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + CHUNK_SIZE

        chunk = words[start:end]

        chunks.append(" ".join(chunk))

        start += (
            CHUNK_SIZE - CHUNK_OVERLAP
        )

    return chunks   
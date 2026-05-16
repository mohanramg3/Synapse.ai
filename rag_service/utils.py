import re
import hashlib
from typing import List
import json
import os


CACHE_DIR = "cache"

os.makedirs(CACHE_DIR, exist_ok=True)


def get_text_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def load_embedding_cache(text_hash: str):

    path = f"{CACHE_DIR}/{text_hash}.json"

    if os.path.exists(path):

        with open(path, "r") as f:
            return json.load(f)

    return None


def save_embedding_cache(text_hash: str, embeddings):

    path = f"{CACHE_DIR}/{text_hash}.json"

    with open(path, "w") as f:
        json.dump(embeddings, f)



def clean_text(text: str) -> str:
    """
    Clean extracted document text.
    """

    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\n+", "\n", text)

    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 600,
    overlap: int = 100
) -> List[str]:
    """
    Split text into overlapping chunks.
    """

    words = text.split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk = words[start:end]

        chunks.append(" ".join(chunk))

        start += chunk_size - overlap

    return chunks



def generate_text_hash(text: str):

    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()

def semantic_chunk_text(
    text: str,
    chunk_size: int = 600,
    overlap: int = 100
) -> List[str]:
    """
    Heading-aware semantic chunking.
    """

    # normalize
    text = re.sub(r"\n{2,}", "\n", text)

    # split by headings
    sections = re.split(
        r"\n(?=[A-Z][A-Z0-9\s]{3,}\n)|\n(?=\d+\.)",
        text
    )

    chunks = []

    for section in sections:

        words = section.split()

        if not words:
            continue

        start = 0

        while start < len(words):

            end = start + chunk_size

            chunk = " ".join(words[start:end])

            chunks.append(chunk)

            start += chunk_size - overlap

    return chunks
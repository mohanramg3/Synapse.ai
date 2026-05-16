from dotenv import load_dotenv
import os

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

QDRANT_PATH = os.getenv("QDRANT_PATH", "./qdrant_data")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "default_collection")

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 600))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 100))

TOP_K = int(os.getenv("TOP_K", 5))

MAX_CONTEXT_CHUNKS = 4
TOP_K = 10
CHUNK_SIZE = 600
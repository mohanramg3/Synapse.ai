from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict
)


class Settings(BaseSettings):

    BOT_SECRET_KEY: str = "super_secret_bot_key"

    RAG_SERVICE_URL: str = "http://localhost:8000"

    MISTRAL_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    ollama_base_url: str = Field(default="http://host.docker.internal:11434", env="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="llama3.2:latest", env="OLLAMA_MODEL")
    app_host: str = Field(default="0.0.0.0", env="APP_HOST")
    app_port: int = Field(default=8001, env="APP_PORT")
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()

"""
Configuration module for loading environment variables
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Supabase settings
    supabase_url: str
    supabase_jwt_secret: str

    # Database settings
    database_url: str

    # CORS settings
    cors_origins: str = "http://localhost:4200"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False  # Allow SUPABASE_URL or supabase_url

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Create a global settings instance
settings = Settings()

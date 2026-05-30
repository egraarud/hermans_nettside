from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    admin_token: str = "dev-admin-token"
    jwt_secret: str = "dev-jwt-secret-change-in-production"
    jwt_expire_minutes: int = 10080  # 7 days

    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = "Hermans Turnering <noreply@example.com>"


settings = Settings()

#!/usr/bin/env python3

import uvicorn
from app.main import app
from app.config.settings import settings

if __name__ == "__main__":
    print("🚀 Запуск AI Job Normalization Service")
    print(f"📚 Swagger UI: http://{settings.app_host}:{settings.app_port}/docs")
    print(f"📖 ReDoc: http://{settings.app_host}:{settings.app_port}/redoc")
    print(f"🔗 OpenAPI JSON: http://{settings.app_host}:{settings.app_port}/openapi.json")
    
    uvicorn.run(
        app,
        host=settings.app_host,
        port=settings.app_port,
        log_level=settings.log_level.lower(),
        reload=True
    )

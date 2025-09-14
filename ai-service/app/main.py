from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from .models import NormalizeRequest, NormalizeResponse, HealthResponse
from .ollama_service import OllamaService

# Загружаем переменные окружения
load_dotenv()

app = FastAPI(
    title="AI Job Normalization Service",
    description="Сервис для нормализации вакансий с помощью Ollama",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализируем Ollama сервис
ollama_host = os.getenv("OLLAMA_HOST", "localhost:11434")
ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:8b")

ollama_service = OllamaService(
    model=ollama_model,
    host=ollama_host
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Проверка здоровья сервиса"""
    try:
        health_status = await ollama_service.check_health()
        return HealthResponse(
            status="healthy" if health_status['ollama_available'] else "unhealthy",
            ollama_available=health_status['ollama_available'],
            model_loaded=health_status['model_loaded']
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            ollama_available=False,
            model_loaded=False
        )

@app.post("/api/v1/normalize", response_model=NormalizeResponse)
async def normalize_job(request: NormalizeRequest):
    """Нормализация вакансии"""
    try:
        result = await ollama_service.normalize_job(
            title=request.title,
            description=request.description,
            source_name=request.source_name,
            original_url=request.original_url
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "AI Job Normalization Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "normalize": "/api/v1/normalize"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

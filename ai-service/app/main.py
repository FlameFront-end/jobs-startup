from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config.settings import settings
from .logging_config import setup_logging
from .models import NormalizeRequest, NormalizeResponse, HealthResponse
from .services import OllamaClient, JobNormalizer, HealthChecker
from .prompts import PromptManager
from .cache import MemoryCache
from .exceptions import AIServiceError

# Настраиваем логирование
setup_logging()
logger = logging.getLogger(__name__)

# Инициализируем кэш
cache = MemoryCache(ttl_seconds=3600)

# Инициализируем сервисы
ollama_client = OllamaClient()
prompt_template = PromptManager.get_prompt("v1")
job_normalizer = JobNormalizer(ollama_client, prompt_template)
health_checker = HealthChecker(ollama_client)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    logger.info("Starting AI Job Normalization Service")
    yield
    logger.info("Shutting down AI Job Normalization Service")


app = FastAPI(
    title="AI Job Normalization Service",
    description="Сервис для нормализации вакансий с помощью Ollama",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Проверка здоровья сервиса"""
    try:
        health_status = await health_checker.check_health()
        return HealthResponse(
            status="healthy" if health_status['ollama_available'] else "unhealthy",
            ollama_available=health_status['ollama_available'],
            model_loaded=health_status['model_loaded']
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            ollama_available=False,
            model_loaded=False
        )


@app.post("/api/v1/normalize", response_model=NormalizeResponse)
async def normalize_job(request: NormalizeRequest):
    """Нормализация вакансии"""
    try:
        # Проверяем кэш
        cached_result = cache.get(request.title, request.description)
        if cached_result:
            logger.info(f"Returning cached result for job: {request.title}")
            return cached_result
        
        # Нормализуем вакансию
        result = await job_normalizer.normalize_job(
            title=request.title,
            description=request.description,
            source_name=request.source_name,
            original_url=request.original_url
        )
        
        # Сохраняем в кэш
        cache.set(request.title, request.description, result)
        
        return result
        
    except AIServiceError as e:
        logger.error(f"AI service error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "AI Job Normalization Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "normalize": "/api/v1/normalize"
        },
        "prompt_versions": PromptManager.get_available_versions()
    }


@app.get("/api/v1/cache/stats")
async def cache_stats():
    """Статистика кэша"""
    return {
        "cache_size": len(cache.cache),
        "ttl_seconds": cache.ttl_seconds
    }


@app.post("/api/v1/cache/clear")
async def clear_cache():
    """Очистка кэша"""
    cache.clear()
    return {"message": "Cache cleared successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.app_host, 
        port=settings.app_port,
        log_level=settings.log_level.lower()
    )

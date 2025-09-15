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
    logger.info(f"📚 Swagger UI: http://localhost:{settings.app_port}/docs")
    logger.info(f"📖 ReDoc: http://localhost:{settings.app_port}/redoc")
    logger.info(f"🔗 OpenAPI JSON: http://localhost:{settings.app_port}/openapi.json")
    yield
    logger.info("Shutting down AI Job Normalization Service")


app = FastAPI(
    title="AI Job Normalization Service",
    description="Сервис для нормализации вакансий с помощью Ollama",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=[
        {
            "name": "Health",
            "description": "Проверка состояния сервиса"
        },
        {
            "name": "Job Normalization", 
            "description": "Нормализация вакансий с помощью AI"
        },
        {
            "name": "Cache",
            "description": "Управление кэшем"
        },
        {
            "name": "Info",
            "description": "Информация о сервисе"
        }
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/health", 
    response_model=HealthResponse,
    tags=["Health"],
    summary="Проверка здоровья сервиса",
    description="Проверяет доступность сервиса и Ollama модели",
    responses={
        200: {
            "description": "Статус сервиса",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "ollama_available": True,
                        "model_loaded": True
                    }
                }
            }
        }
    }
)
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


@app.post(
    "/api/v1/normalize", 
    response_model=NormalizeResponse,
    tags=["Job Normalization"],
    summary="Нормализация вакансии",
    description="Нормализует данные вакансии с помощью AI модели",
    responses={
        200: {
            "description": "Успешная нормализация",
            "content": {
                "application/json": {
                    "example": {
                        "id": "job_123456",
                        "title": "Senior Python Developer",
                        "short_description": "Разработка веб-приложений",
                        "company": {
                            "name": "Tech Company",
                            "description": "IT компания",
                            "website": "https://techcompany.com"
                        },
                        "work_type": "full_time",
                        "experience_level": "senior",
                        "quality_score": 85
                    }
                }
            }
        },
        500: {
            "description": "Ошибка сервера",
            "content": {
                "application/json": {
                    "example": {"detail": "Внутренняя ошибка сервера"}
                }
            }
        }
    }
)
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

@app.get(
    "/",
    tags=["Info"],
    summary="Информация о сервисе",
    description="Возвращает основную информацию о сервисе и доступных эндпоинтах"
)
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


@app.get(
    "/api/v1/cache/stats",
    tags=["Cache"],
    summary="Статистика кэша",
    description="Возвращает информацию о состоянии кэша",
    responses={
        200: {
            "description": "Статистика кэша",
            "content": {
                "application/json": {
                    "example": {
                        "cache_size": 150,
                        "ttl_seconds": 3600
                    }
                }
            }
        }
    }
)
async def cache_stats():
    """Статистика кэша"""
    return {
        "cache_size": len(cache.cache),
        "ttl_seconds": cache.ttl_seconds
    }


@app.post(
    "/api/v1/cache/clear",
    tags=["Cache"],
    summary="Очистка кэша",
    description="Очищает весь кэш сервиса",
    responses={
        200: {
            "description": "Кэш очищен",
            "content": {
                "application/json": {
                    "example": {"message": "Cache cleared successfully"}
                }
            }
        }
    }
)
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

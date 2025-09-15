from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class WorkType(str, Enum):
    """Тип работы"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"
    HYBRID = "hybrid"

class ExperienceLevel(str, Enum):
    """Уровень опыта"""
    NO_EXPERIENCE = "no_experience"
    JUNIOR = "junior"
    MIDDLE = "middle"
    SENIOR = "senior"
    LEAD = "lead"

class CompanyInfo(BaseModel):
    """Информация о компании"""
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    size: Optional[str] = None

class SalaryInfo(BaseModel):
    """Информация о зарплате"""
    min: Optional[int] = None
    max: Optional[int] = None
    currency: Optional[str] = None
    period: Optional[str] = None
    type: Optional[str] = None

class LocationInfo(BaseModel):
    """Информация о местоположении"""
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    remote: Optional[bool] = None

class Requirements(BaseModel):
    """Требования к кандидату"""
    required: List[str] = []
    preferred: List[str] = []
    technical: List[str] = []
    languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []

class Benefits(BaseModel):
    """Преимущества и льготы"""
    social: List[str] = []
    bonuses: List[str] = []
    conditions: List[str] = []
    development: List[str] = []

class NormalizeRequest(BaseModel):
    """Запрос на нормализацию вакансии"""
    title: str = Field(..., description="Название вакансии", example="Senior Python Developer")
    description: str = Field(..., description="Описание вакансии", example="Разработка веб-приложений на Python и Django")
    source_name: Optional[str] = Field(None, description="Название источника", example="hh.ru")
    original_url: Optional[str] = Field(None, description="Оригинальная ссылка на вакансию", example="https://hh.ru/vacancy/123456")

class NormalizeResponse(BaseModel):
    """Ответ с нормализованными данными вакансии"""
    id: str
    title: str
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    company: CompanyInfo
    salary: Optional[SalaryInfo] = None
    location: Optional[LocationInfo] = None
    requirements: Requirements
    benefits: Optional[Benefits] = None
    work_type: WorkType
    experience_level: Optional[ExperienceLevel] = None
    source: str = "website"
    source_name: Optional[str] = None
    original_url: Optional[str] = None
    published_at: Optional[str] = None
    parsed_at: str
    quality_score: int
    keywords: List[str] = []

class HealthResponse(BaseModel):
    """Ответ о состоянии сервиса"""
    status: str = Field(..., description="Статус сервиса", example="healthy")
    ollama_available: bool = Field(..., description="Доступность Ollama", example=True)
    model_loaded: bool = Field(..., description="Загружена ли модель", example=True)

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class WorkType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"
    HYBRID = "hybrid"

class ExperienceLevel(str, Enum):
    NO_EXPERIENCE = "no_experience"
    JUNIOR = "junior"
    MIDDLE = "middle"
    SENIOR = "senior"
    LEAD = "lead"

class CompanyInfo(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    size: Optional[str] = None

class SalaryInfo(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    currency: Optional[str] = None
    period: Optional[str] = None
    type: Optional[str] = None

class LocationInfo(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    remote: Optional[bool] = None

class Requirements(BaseModel):
    required: List[str] = []
    preferred: List[str] = []
    technical: List[str] = []
    languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []

class Benefits(BaseModel):
    social: List[str] = []
    bonuses: List[str] = []
    conditions: List[str] = []
    development: List[str] = []

class NormalizeRequest(BaseModel):
    title: str
    description: str
    source_name: Optional[str] = None
    original_url: Optional[str] = None

class NormalizeResponse(BaseModel):
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
    status: str
    ollama_available: bool
    model_loaded: bool

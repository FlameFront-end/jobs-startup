import ollama
import json
import re
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any
from .models import (
    NormalizeResponse, CompanyInfo, SalaryInfo, LocationInfo, 
    Requirements, Benefits, WorkType, ExperienceLevel
)
from .prompts import JOB_NORMALIZATION_PROMPT

class OllamaService:
    def __init__(self, model: str = "llama3.2:8b", host: str = "localhost:11434"):
        self.model = model
        self.host = host
        self.client = None
        
    def _get_client(self):
        """Ленивая инициализация клиента Ollama"""
        if self.client is None:
            self.client = ollama.Client(host=self.host)
        return self.client
        
    async def normalize_job(
        self, 
        title: str, 
        description: str,
        source_name: Optional[str] = None,
        original_url: Optional[str] = None
    ) -> NormalizeResponse:
        """Нормализует вакансию с помощью Ollama"""
        
        try:
            # Создаем промпт
            prompt = JOB_NORMALIZATION_PROMPT.format(
                title=title,
                description=description
            )
            
            # Вызываем Ollama
            client = self._get_client()
            response = client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    'temperature': 0.1,
                    'top_p': 0.9,
                    'num_predict': 4096
                }
            )
            
            # Парсим ответ
            ai_data = self._parse_ai_response(response['response'])
            
            # Создаем нормализованный ответ
            return self._create_normalized_response(
                title=title,
                description=description,
                ai_data=ai_data,
                source_name=source_name,
                original_url=original_url
            )
            
        except Exception as e:
            raise Exception(f"Ошибка нормализации: {str(e)}")
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Парсит ответ от AI в JSON"""
        try:
            # Очищаем ответ
            cleaned = self._clean_response(response)
            
            # Ищем JSON
            json_match = re.search(r'\{[\s\S]*\}', cleaned)
            if not json_match:
                raise ValueError("JSON не найден в ответе")
            
            json_str = json_match.group(0)
            return json.loads(json_str)
            
        except Exception as e:
            raise ValueError(f"Ошибка парсинга JSON: {str(e)}")
    
    def _clean_response(self, response: str) -> str:
        """Очищает ответ от лишних символов"""
        cleaned = response
        cleaned = re.sub(r'```json\s*', '', cleaned)
        cleaned = re.sub(r'```\s*', '', cleaned)
        cleaned = re.sub(r'```\s*([\s\S]*?)\s*```', r'\1', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _create_normalized_response(
        self,
        title: str,
        description: str,
        ai_data: Dict[str, Any],
        source_name: Optional[str] = None,
        original_url: Optional[str] = None
    ) -> NormalizeResponse:
        """Создает нормализованный ответ"""
        
        # Генерируем ID
        job_id = self._generate_id(title, ai_data.get('company', {}).get('name', ''))
        
        # Создаем объекты
        company = CompanyInfo(
            name=ai_data.get('company', {}).get('name', ''),
            description=ai_data.get('company', {}).get('description'),
            website=ai_data.get('company', {}).get('website'),
            size=ai_data.get('company', {}).get('size')
        )
        
        salary = None
        if ai_data.get('salary'):
            salary = SalaryInfo(
                min=ai_data['salary'].get('min'),
                max=ai_data['salary'].get('max'),
                currency=ai_data['salary'].get('currency'),
                period=ai_data['salary'].get('period'),
                type=ai_data['salary'].get('type')
            )
        
        location = None
        if ai_data.get('location'):
            location = LocationInfo(
                city=ai_data['location'].get('city'),
                country=ai_data['location'].get('country'),
                address=ai_data['location'].get('address'),
                remote=ai_data['location'].get('remote')
            )
        
        requirements = Requirements(
            required=ai_data.get('requirements', {}).get('required', []),
            preferred=ai_data.get('requirements', {}).get('preferred', []),
            technical=ai_data.get('requirements', {}).get('technical', []),
            languages=ai_data.get('requirements', {}).get('languages', []),
            frameworks=ai_data.get('requirements', {}).get('frameworks', []),
            tools=ai_data.get('requirements', {}).get('tools', [])
        )
        
        benefits = None
        if ai_data.get('benefits'):
            benefits = Benefits(
                social=ai_data['benefits'].get('social', []),
                bonuses=ai_data['benefits'].get('bonuses', []),
                conditions=ai_data['benefits'].get('conditions', []),
                development=ai_data['benefits'].get('development', [])
            )
        
        # Маппинг типов
        work_type = self._map_work_type(ai_data.get('workType', 'full_time'))
        experience_level = self._map_experience_level(ai_data.get('experienceLevel'))
        
        # Вычисляем качество
        quality_score = self._calculate_quality_score({
            'company': company,
            'salary': salary,
            'location': location,
            'requirements': requirements,
            'benefits': benefits,
            'work_type': work_type,
            'experience_level': experience_level
        })
        
        return NormalizeResponse(
            id=job_id,
            title=title,
            short_description=ai_data.get('shortDescription'),
            full_description=ai_data.get('fullDescription'),
            company=company,
            salary=salary,
            location=location,
            requirements=requirements,
            benefits=benefits,
            work_type=work_type,
            experience_level=experience_level,
            source_name=source_name,
            original_url=original_url,
            parsed_at=datetime.now().isoformat(),
            quality_score=quality_score,
            keywords=[]
        )
    
    def _generate_id(self, title: str, company_name: str) -> str:
        """Генерирует ID на основе title и company"""
        text = f"{title}-{company_name}"
        return hashlib.md5(text.encode()).hexdigest()[:8]
    
    def _map_work_type(self, work_type: str) -> WorkType:
        """Маппинг типа работы"""
        mapping = {
            'full_time': WorkType.FULL_TIME,
            'part_time': WorkType.PART_TIME,
            'contract': WorkType.CONTRACT,
            'internship': WorkType.INTERNSHIP,
            'remote': WorkType.REMOTE,
            'hybrid': WorkType.HYBRID
        }
        return mapping.get(work_type, WorkType.FULL_TIME)
    
    def _map_experience_level(self, experience_level: Optional[str]) -> Optional[ExperienceLevel]:
        """Маппинг уровня опыта"""
        if not experience_level:
            return None
            
        mapping = {
            'no_experience': ExperienceLevel.NO_EXPERIENCE,
            'junior': ExperienceLevel.JUNIOR,
            'middle': ExperienceLevel.MIDDLE,
            'senior': ExperienceLevel.SENIOR,
            'lead': ExperienceLevel.LEAD
        }
        return mapping.get(experience_level, ExperienceLevel.MIDDLE)
    
    def _calculate_quality_score(self, data: Dict[str, Any]) -> int:
        """Вычисляет качество нормализации"""
        score = 0
        
        if data['company'].name:
            score += 20
        if data['requirements'].required:
            score += 20
        if data['work_type']:
            score += 10
        if data['salary']:
            score += 15
        if data['location']:
            score += 10
        if data['experience_level']:
            score += 10
        if data['benefits'] and any(data['benefits'].__dict__.values()):
            score += 10
        if data['requirements'].technical:
            score += 5
        
        return min(score, 100)
    
    async def check_health(self) -> Dict[str, bool]:
        """Проверяет доступность Ollama и модели"""
        try:
            # Проверяем доступность Ollama
            client = self._get_client()
            client.list()
            ollama_available = True
        except:
            ollama_available = False
        
        try:
            # Проверяем наличие модели
            client = self._get_client()
            models = client.list()
            model_loaded = any(model['name'] == self.model for model in models['models'])
        except:
            model_loaded = False
        
        return {
            'ollama_available': ollama_available,
            'model_loaded': model_loaded
        }

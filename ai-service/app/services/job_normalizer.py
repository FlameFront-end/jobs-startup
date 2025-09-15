import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from ..models import (
    NormalizeResponse, CompanyInfo, SalaryInfo, LocationInfo, 
    Requirements, Benefits, WorkType, ExperienceLevel
)
from ..utils import ResponseParser, QualityCalculator, IDGenerator
from ..exceptions import PromptProcessingError, InvalidResponseError

logger = logging.getLogger(__name__)


class JobNormalizer:
    """Сервис нормализации вакансий"""
    
    def __init__(self, ollama_client, prompt_template: str):
        self.ollama_client = ollama_client
        self.prompt_template = prompt_template
    
    async def normalize_job(
        self, 
        title: str, 
        description: str,
        source_name: Optional[str] = None,
        original_url: Optional[str] = None
    ) -> NormalizeResponse:
        """Нормализует вакансию с помощью AI"""
        
        try:
            logger.info(f"Starting normalization for job: {title}")
            
            # Создаем промпт
            prompt = self._create_prompt(title, description)
            
            # Вызываем AI
            ai_response = self.ollama_client.generate_response(prompt)
            
            # Парсим ответ
            try:
                ai_data = ResponseParser.parse_ai_response(ai_response)
                # Нормализуем структуру данных
                ai_data = self._normalize_ai_data(ai_data)
                logger.info(f"Normalized AI data: {json.dumps(ai_data, ensure_ascii=False, indent=2)}")
            except Exception as parse_error:
                logger.error(f"Failed to parse AI response: {parse_error}")
                logger.debug(f"Raw AI response: {ai_response}")
                # Создаем базовую структуру данных если парсинг не удался
                ai_data = {
                    "company": {"name": None, "description": None, "website": None, "size": None},
                    "shortDescription": None,
                    "fullDescription": None,
                    "salary": {"min": None, "max": None, "currency": None, "period": None, "type": None},
                    "location": {"city": None, "country": "Россия", "address": None, "remote": False},
                    "requirements": {"required": [], "preferred": [], "technical": [], "languages": [], "frameworks": [], "tools": []},
                    "benefits": {"social": [], "bonuses": [], "conditions": [], "development": []},
                    "workType": "full_time",
                    "experienceLevel": "middle"
                }
            
            # Создаем нормализованный ответ
            try:
                result = self._create_normalized_response(
                    title=title,
                    description=description,
                    ai_data=ai_data,
                    source_name=source_name,
                    original_url=original_url
                )
            except Exception as create_error:
                logger.error(f"Error creating normalized response: {create_error}")
                logger.debug(f"AI data that caused error: {ai_data}")
                raise create_error
            
            return result
            
        except Exception as e:
            logger.error(f"Error normalizing job {title}: {e}")
            raise PromptProcessingError(f"Ошибка нормализации вакансии: {str(e)}")
    
    def _create_prompt(self, title: str, description: str) -> str:
        """Создает промпт для AI"""
        try:
            return self.prompt_template.format(
                title=title,
                description=description
            )
        except Exception as e:
            logger.error(f"Error creating prompt: {e}")
            raise PromptProcessingError(f"Ошибка создания промпта: {str(e)}")
    
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
        company_name = ''
        company_data = self._safe_get_dict(ai_data.get('company'))
        if company_data:
            company_name = company_data.get('name', '')
        
        job_id = IDGenerator.generate_job_id(title, company_name)
        
        # Создаем объекты
        try:
            company = self._create_company_info(self._safe_get_dict(ai_data.get('company')))
        except Exception as e:
            logger.error(f"Error creating company info: {e}")
            company = CompanyInfo(name=None, description=None, website=None, size=None)
        
        try:
            salary = self._create_salary_info(self._safe_get_dict(ai_data.get('salary')))
        except Exception as e:
            logger.error(f"Error creating salary info: {e}")
            salary = None
        
        try:
            location = self._create_location_info(self._safe_get_dict(ai_data.get('location')))
        except Exception as e:
            logger.error(f"Error creating location info: {e}")
            location = None
        
        try:
            requirements = self._create_requirements(self._safe_get_dict(ai_data.get('requirements')))
        except Exception as e:
            logger.error(f"Error creating requirements: {e}")
            requirements = Requirements(required=[], preferred=[], technical=[], languages=[], frameworks=[], tools=[])
        
        try:
            benefits = self._create_benefits(self._safe_get_dict(ai_data.get('benefits')))
        except Exception as e:
            logger.error(f"Error creating benefits: {e}")
            benefits = None
        
        # Маппинг типов - теперь ai_data уже нормализован
        work_type_value = ai_data.get('workType', 'full_time')
        work_type = self._map_work_type(work_type_value)
        
        experience_level_value = ai_data.get('experienceLevel')
        experience_level = self._map_experience_level(experience_level_value)
        
        # Вычисляем качество
        quality_score = QualityCalculator.calculate_quality_score({
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
    
    def _create_company_info(self, company_data: Dict[str, Any]) -> CompanyInfo:
        """Создает информацию о компании"""
        return CompanyInfo(
            name=company_data.get('name', ''),
            description=company_data.get('description'),
            website=company_data.get('website'),
            size=company_data.get('size')
        )
    
    def _create_salary_info(self, salary_data: Optional[Dict[str, Any]]) -> Optional[SalaryInfo]:
        """Создает информацию о зарплате"""
        if not salary_data:
            return None
        
        return SalaryInfo(
            min=salary_data.get('min'),
            max=salary_data.get('max'),
            currency=salary_data.get('currency'),
            period=salary_data.get('period'),
            type=salary_data.get('type')
        )
    
    def _create_location_info(self, location_data: Optional[Dict[str, Any]]) -> Optional[LocationInfo]:
        """Создает информацию о локации"""
        if not location_data:
            return None
        
        return LocationInfo(
            city=location_data.get('city'),
            country=location_data.get('country'),
            address=location_data.get('address'),
            remote=location_data.get('remote')
        )
    
    def _create_requirements(self, requirements_data: Dict[str, Any]) -> Requirements:
        """Создает требования"""
        return Requirements(
            required=self._safe_get_string_list(requirements_data.get('required', [])),
            preferred=self._safe_get_string_list(requirements_data.get('preferred', [])),
            technical=self._safe_get_string_list(requirements_data.get('technical', [])),
            languages=self._safe_get_string_list(requirements_data.get('languages', [])),
            frameworks=self._safe_get_string_list(requirements_data.get('frameworks', [])),
            tools=self._safe_get_string_list(requirements_data.get('tools', []))
        )
    
    def _create_benefits(self, benefits_data: Optional[Dict[str, Any]]) -> Optional[Benefits]:
        """Создает преимущества"""
        if not benefits_data:
            return None
        
        return Benefits(
            social=self._safe_get_string_list(benefits_data.get('social', [])),
            bonuses=self._safe_get_string_list(benefits_data.get('bonuses', [])),
            conditions=self._safe_get_string_list(benefits_data.get('conditions', [])),
            development=self._safe_get_string_list(benefits_data.get('development', []))
        )
    
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
    
    def _safe_get_string(self, value: Any) -> Optional[str]:
        """Безопасно извлекает строку из значения"""
        if value is None:
            return None
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            # Если это словарь, пытаемся извлечь текстовое значение
            if 'text' in value:
                return str(value['text'])
            if 'description' in value:
                return str(value['description'])
            if 'title' in value:
                return str(value['title'])
            # Если ничего не найдено, возвращаем None
            return None
        if isinstance(value, list) and len(value) > 0:
            return str(value[0])
        return str(value)
    
    def _safe_get_string_list(self, value: Any) -> List[str]:
        """Безопасно извлекает список строк из значения"""
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value if item is not None]
        if isinstance(value, str):
            return [value]
        return []
    
    def _safe_get_dict(self, value: Any) -> Optional[Dict[str, Any]]:
        """Безопасно извлекает словарь из значения"""
        if value is None:
            return None
        if isinstance(value, dict):
            return value
        if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
            return value[0]
        return {}
    
    def _normalize_ai_data(self, ai_data: Dict[str, Any]) -> Dict[str, Any]:
        """Нормализует структуру данных от AI к ожидаемому формату"""
        normalized = {}
        
        # Нормализуем company
        company_data = ai_data.get('company', {})
        if isinstance(company_data, dict):
            normalized['company'] = {
                'name': self._extract_string_from_any(company_data.get('name')),
                'description': self._extract_string_from_any(company_data.get('description')),
                'website': self._extract_string_from_any(company_data.get('website')),
                'size': self._extract_string_from_any(company_data.get('size'))
            }
        else:
            normalized['company'] = {'name': None, 'description': None, 'website': None, 'size': None}
        
        # Нормализуем описания - извлекаем из сложных структур
        short_desc = ai_data.get('shortDescription')
        if isinstance(short_desc, dict):
            # Пытаемся извлечь описание из разных полей
            desc_text = (short_desc.get('description') or 
                        short_desc.get('text') or 
                        short_desc.get('title') or
                        ' '.join(short_desc.get('keyResponsibilities', [])) or
                        ' '.join(short_desc.get('responsibilities', [])))
            normalized['shortDescription'] = str(desc_text) if desc_text else None
        elif isinstance(short_desc, list):
            # Если это массив, объединяем элементы
            normalized['shortDescription'] = ' '.join([str(item) for item in short_desc if item])
        else:
            normalized['shortDescription'] = self._extract_string_from_any(short_desc)
        
        full_desc = ai_data.get('fullDescription')
        if isinstance(full_desc, dict):
            # Пытаемся извлечь описание из разных полей
            desc_text = (full_desc.get('description') or 
                        full_desc.get('text') or 
                        full_desc.get('title') or
                        ' '.join(full_desc.get('responsibilities', [])) or
                        ' '.join(full_desc.get('keyResponsibilities', [])))
            normalized['fullDescription'] = str(desc_text) if desc_text else None
        elif isinstance(full_desc, list):
            # Если это массив, объединяем элементы
            normalized['fullDescription'] = ' '.join([str(item) for item in full_desc if item])
        else:
            normalized['fullDescription'] = self._extract_string_from_any(full_desc)
        
        # Нормализуем salary
        salary_data = ai_data.get('salary', {})
        if isinstance(salary_data, dict):
            normalized['salary'] = {
                'min': salary_data.get('min'),
                'max': salary_data.get('max'),
                'currency': self._extract_string_from_any(salary_data.get('currency')),
                'period': self._extract_string_from_any(salary_data.get('period')),
                'type': self._extract_string_from_any(salary_data.get('type'))
            }
        else:
            normalized['salary'] = {'min': None, 'max': None, 'currency': None, 'period': None, 'type': None}
        
        # Нормализуем location
        location_data = ai_data.get('location', {})
        if isinstance(location_data, dict):
            normalized['location'] = {
                'city': self._extract_string_from_any(location_data.get('city')),
                'country': self._extract_string_from_any(location_data.get('country', 'Россия')),
                'address': self._extract_string_from_any(location_data.get('address')),
                'remote': location_data.get('remote', False)
            }
        elif isinstance(location_data, list):
            # Если location это массив городов
            cities = [str(city) for city in location_data if city]
            normalized['location'] = {
                'city': cities[0] if cities else None,
                'country': 'Россия',
                'address': None,
                'remote': False
            }
        else:
            normalized['location'] = {'city': None, 'country': 'Россия', 'address': None, 'remote': False}
        
        # Нормализуем requirements
        requirements_data = ai_data.get('requirements', {})
        if isinstance(requirements_data, dict):
            normalized['requirements'] = {
                'required': self._extract_string_list_from_any(requirements_data.get('required', [])),
                'preferred': self._extract_string_list_from_any(requirements_data.get('preferred', [])),
                'technical': self._extract_string_list_from_any(
                    requirements_data.get('technical', 
                        requirements_data.get('technicalSkills', 
                            requirements_data.get('technologies', [])))),
                'languages': self._extract_string_list_from_any(requirements_data.get('languages', [])),
                'frameworks': self._extract_string_list_from_any(requirements_data.get('frameworks', [])),
                'tools': self._extract_string_list_from_any(requirements_data.get('tools', []))
            }
        elif isinstance(requirements_data, list):
            # Если requirements это массив строк
            normalized['requirements'] = {
                'required': self._extract_string_list_from_any(requirements_data),
                'preferred': [],
                'technical': [],
                'languages': [],
                'frameworks': [],
                'tools': []
            }
        else:
            normalized['requirements'] = {'required': [], 'preferred': [], 'technical': [], 'languages': [], 'frameworks': [], 'tools': []}
        
        # Нормализуем benefits - обрабатываем разные варианты названий полей
        benefits_data = ai_data.get('benefits', 
            ai_data.get('premiums', 
                ai_data.get('preference', 
                    ai_data.get('preconditions', {}))))
        if isinstance(benefits_data, dict):
            normalized['benefits'] = {
                'social': self._extract_string_list_from_any(
                    benefits_data.get('social', 
                        benefits_data.get('socialPackage', 
                            benefits_data.get('social_package', [])))),
                'bonuses': self._extract_string_list_from_any(
                    benefits_data.get('bonuses', 
                        benefits_data.get('bonus', []))),
                'conditions': self._extract_string_list_from_any(
                    benefits_data.get('conditions', 
                        benefits_data.get('workConditions', 
                            benefits_data.get('work_condition', [])))),
                'development': self._extract_string_list_from_any(
                    benefits_data.get('development', []))
            }
        elif isinstance(benefits_data, list):
            # Если benefits это массив строк
            normalized['benefits'] = {
                'social': self._extract_string_list_from_any(benefits_data),
                'bonuses': [],
                'conditions': [],
                'development': []
            }
        else:
            normalized['benefits'] = {'social': [], 'bonuses': [], 'conditions': [], 'development': []}
        
        # Нормализуем workType - обрабатываем разные варианты
        work_type = ai_data.get('workType', ai_data.get('typeOfWork', ai_data.get('type_of_job', 'full_time')))
        if isinstance(work_type, dict):
            # Ищем первое не-null значение в объекте
            for key, value in work_type.items():
                if value is not None and value != '' and value != 'null':
                    work_type = key
                    break
            else:
                work_type = 'full_time'
        elif isinstance(work_type, list):
            # Если это массив, берем первый элемент
            work_type = work_type[0] if work_type else 'full_time'
        
        normalized['workType'] = self._extract_string_from_any(work_type) or 'full_time'
        
        # Нормализуем experienceLevel - обрабатываем разные варианты
        experience_level = ai_data.get('experienceLevel', ai_data.get('experience_level', 'middle'))
        if isinstance(experience_level, dict):
            # Ищем первое не-null значение в объекте
            for key, value in experience_level.items():
                if value is not None and value != '' and value != 'null':
                    experience_level = key
                    break
            else:
                experience_level = 'middle'
        elif isinstance(experience_level, list):
            # Если это массив, берем первый элемент
            experience_level = experience_level[0] if experience_level else 'middle'
        
        normalized['experienceLevel'] = self._extract_string_from_any(experience_level) or 'middle'
        
        return normalized
    
    def _extract_string_from_any(self, value: Any) -> Optional[str]:
        """Извлекает строку из любого типа данных"""
        if value is None:
            return None
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            # Пытаемся найти текстовое значение в словаре
            for key in ['text', 'description', 'title', 'name', 'value']:
                if key in value and isinstance(value[key], str):
                    return value[key]
            return None
        if isinstance(value, list) and len(value) > 0:
            return str(value[0])
        return str(value)
    
    def _extract_string_list_from_any(self, value: Any) -> List[str]:
        """Извлекает список строк из любого типа данных"""
        if value is None:
            return []
        if isinstance(value, list):
            result = []
            for item in value:
                if isinstance(item, str):
                    result.append(item)
                elif isinstance(item, dict):
                    # Пытаемся извлечь строку из словаря
                    for key in ['text', 'description', 'title', 'name', 'value']:
                        if key in item and isinstance(item[key], str):
                            result.append(item[key])
                            break
                else:
                    result.append(str(item))
            return result
        if isinstance(value, str):
            return [value]
        return []

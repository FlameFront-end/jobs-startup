import json
import re
from typing import Dict, Any
from ..exceptions import InvalidResponseError


class ResponseParser:
    """Парсер ответов от AI"""
    
    @staticmethod
    def parse_ai_response(response: str) -> Dict[str, Any]:
        """Парсит ответ от AI в JSON"""
        try:
            cleaned = ResponseParser._clean_response(response)
            
            # Пробуем найти JSON разными способами
            json_str = ResponseParser._extract_json(cleaned)
            
            if not json_str:
                raise InvalidResponseError("JSON не найден в ответе")
            
            # Пытаемся исправить JSON перед парсингом
            fixed_json = ResponseParser._fix_json(json_str)
            
            return json.loads(fixed_json)
            
        except json.JSONDecodeError as e:
            # Если не удалось исправить, пробуем извлечь частичные данные
            try:
                return ResponseParser._extract_partial_data(response)
            except Exception:
                raise InvalidResponseError(f"Ошибка парсинга JSON: {str(e)}")
        except Exception as e:
            raise InvalidResponseError(f"Неожиданная ошибка парсинга: {str(e)}")
    
    @staticmethod
    def _extract_json(text: str) -> str:
        """Извлекает JSON из текста разными способами"""
        # Способ 1: Ищем JSON между ```json и ```
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
        if json_match:
            return json_match.group(1).strip()
        
        # Способ 2: Ищем JSON между ``` и ```
        json_match = re.search(r'```\s*([\s\S]*?)\s*```', text)
        if json_match:
            candidate = json_match.group(1).strip()
            if candidate.startswith('{') and candidate.endswith('}'):
                return candidate
        
        # Способ 3: Ищем первый полный JSON объект
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json_match.group(0)
        
        # Способ 4: Ищем JSON массив
        json_match = re.search(r'\[[\s\S]*\]', text)
        if json_match:
            return json_match.group(0)
        
        return ""
    
    @staticmethod
    def _clean_response(response: str) -> str:
        """Очищает ответ от лишних символов"""
        cleaned = response
        cleaned = re.sub(r'```json\s*', '', cleaned)
        cleaned = re.sub(r'```\s*', '', cleaned)
        cleaned = re.sub(r'```\s*([\s\S]*?)\s*```', r'\1', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    @staticmethod
    def _fix_json(json_str: str) -> str:
        """Пытается исправить распространенные ошибки в JSON"""
        fixed = json_str
        
        # Убираем trailing commas
        fixed = re.sub(r',\s*}', '}', fixed)
        fixed = re.sub(r',\s*]', ']', fixed)
        
        # Исправляем одинарные кавычки на двойные
        fixed = re.sub(r"'([^']*)':", r'"\1":', fixed)
        fixed = re.sub(r":\s*'([^']*)'", r': "\1"', fixed)
        
        # Исправляем незакрытые строки
        fixed = re.sub(r'"([^"]*)\n', r'"\1"', fixed)
        
        # Убираем комментарии
        fixed = re.sub(r'//.*?\n', '\n', fixed)
        fixed = re.sub(r'/\*.*?\*/', '', fixed, flags=re.DOTALL)
        
        # Исправляем boolean значения
        fixed = re.sub(r'\btrue\b', 'true', fixed)
        fixed = re.sub(r'\bfalse\b', 'false', fixed)
        fixed = re.sub(r'\bnull\b', 'null', fixed)
        
        return fixed
    
    @staticmethod
    def _extract_partial_data(response: str) -> Dict[str, Any]:
        """Извлекает частичные данные если JSON невалидный"""
        data = {
            "company": {"name": None, "description": None, "website": None, "size": None},
            "shortDescription": None,
            "fullDescription": None,
            "salary": {"min": None, "max": None, "currency": None, "period": None, "type": None},
            "location": {"city": None, "country": "Россия", "address": None, "remote": False},
            "requirements": {
                "required": [],
                "preferred": [],
                "technical": [],
                "languages": [],
                "frameworks": [],
                "tools": []
            },
            "benefits": {
                "social": [],
                "bonuses": [],
                "conditions": [],
                "development": []
            },
            "workType": "full_time",
            "experienceLevel": "middle"
        }
        
        # Простое извлечение названия компании
        company_match = re.search(r'"name":\s*"([^"]*)"', response)
        if company_match:
            data["company"]["name"] = company_match.group(1)
        
        # Простое извлечение описания
        desc_match = re.search(r'"shortDescription":\s*"([^"]*)"', response)
        if desc_match:
            data["shortDescription"] = desc_match.group(1)
        
        return data

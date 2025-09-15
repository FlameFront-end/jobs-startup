from typing import Dict, Any
from ..models import CompanyInfo, SalaryInfo, LocationInfo, Requirements, Benefits, WorkType, ExperienceLevel


class QualityCalculator:
    """Калькулятор качества нормализации"""
    
    @staticmethod
    def calculate_quality_score(data: Dict[str, Any]) -> int:
        """Вычисляет качество нормализации (0-100)"""
        score = 0
        
        # Компания (20 баллов)
        if data.get('company') and data['company'].name:
            score += 20
        
        # Требования (20 баллов)
        if data.get('requirements') and data['requirements'].required:
            score += 20
        
        # Тип работы (10 баллов)
        if data.get('work_type'):
            score += 10
        
        # Зарплата (15 баллов)
        if data.get('salary'):
            score += 15
        
        # Локация (10 баллов)
        if data.get('location'):
            score += 10
        
        # Уровень опыта (10 баллов)
        if data.get('experience_level'):
            score += 10
        
        # Преимущества (10 баллов)
        if data.get('benefits') and any(data['benefits'].__dict__.values()):
            score += 10
        
        # Технические навыки (5 баллов)
        if data.get('requirements') and data['requirements'].technical:
            score += 5
        
        return min(score, 100)

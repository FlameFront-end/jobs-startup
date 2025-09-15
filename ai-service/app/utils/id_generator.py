import hashlib
from typing import Optional


class IDGenerator:
    """Генератор ID для вакансий"""
    
    @staticmethod
    def generate_job_id(title: str, company_name: str = "") -> str:
        """Генерирует ID на основе title и company"""
        text = f"{title}-{company_name}"
        return hashlib.md5(text.encode()).hexdigest()[:8]

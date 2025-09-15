from typing import Dict, Any
from .templates import JOB_NORMALIZATION_PROMPT_V1


class PromptManager:
    """Менеджер промптов с версионированием"""
    
    PROMPTS = {
        "v1": JOB_NORMALIZATION_PROMPT_V1
    }
    
    @classmethod
    def get_prompt(cls, version: str = "v1") -> str:
        """Получает промпт по версии"""
        if version not in cls.PROMPTS:
            raise ValueError(f"Версия промпта {version} не найдена")
        
        return cls.PROMPTS[version]
    
    @classmethod
    def get_available_versions(cls) -> list:
        """Возвращает доступные версии промптов"""
        return list(cls.PROMPTS.keys())

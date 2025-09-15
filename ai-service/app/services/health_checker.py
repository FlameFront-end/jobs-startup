import logging
from typing import Dict
from ..exceptions import OllamaConnectionError, ModelNotAvailableError

logger = logging.getLogger(__name__)


class HealthChecker:
    """Сервис проверки здоровья системы"""
    
    def __init__(self, ollama_client):
        self.ollama_client = ollama_client
    
    async def check_health(self) -> Dict[str, bool]:
        """Проверяет доступность Ollama и модели"""
        try:
            # Проверяем доступность Ollama
            ollama_available = self.ollama_client.check_connection()
            logger.debug(f"Ollama available: {ollama_available}")
            
            # Проверяем наличие модели
            model_loaded = False
            if ollama_available:
                model_loaded = self.ollama_client.check_model_availability()
                logger.debug(f"Model loaded: {model_loaded}")
            
            return {
                'ollama_available': ollama_available,
                'model_loaded': model_loaded
            }
            
        except Exception as e:
            logger.warning(f"Health check failed: {e}")
            return {
                'ollama_available': False,
                'model_loaded': False
            }

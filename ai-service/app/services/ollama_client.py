import logging
from typing import Dict, Any, Optional
from ..config.settings import settings
from ..exceptions import OllamaConnectionError, ModelNotAvailableError

logger = logging.getLogger(__name__)


class OllamaClient:
    """Клиент для работы с Ollama"""
    
    def __init__(self, model: str = None, base_url: str = None):
        self.model = model or settings.ollama_model
        self.base_url = base_url or settings.ollama_base_url
        self.client = None
    
    def _get_client(self):
        """Ленивая инициализация клиента Ollama"""
        if self.client is None:
            try:
                import ollama
                self.client = ollama.Client(host=self.base_url)
                logger.info(f"Ollama client initialized with base_url: {self.base_url}")
            except Exception as e:
                logger.error(f"Failed to initialize Ollama client: {e}")
                raise OllamaConnectionError(f"Не удалось подключиться к Ollama: {e}")
        return self.client
    
    def generate_response(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Генерирует ответ от модели"""
        try:
            client = self._get_client()
            default_options = {
                'temperature': 0.1,
                'top_p': 0.9,
                'num_predict': 4096
            }
            if options:
                default_options.update(options)
            
            response = client.generate(
                model=self.model,
                prompt=prompt,
                options=default_options
            )
            
            logger.debug(f"Generated response for model {self.model}")
            return response['response']
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise OllamaConnectionError(f"Ошибка генерации ответа: {e}")
    
    def check_connection(self) -> bool:
        """Проверяет подключение к Ollama"""
        try:
            client = self._get_client()
            client.list()
            return True
        except Exception as e:
            logger.error(f"Ollama connection check failed: {e}")
            return False
    
    def check_model_availability(self) -> bool:
        """Проверяет доступность модели"""
        try:
            client = self._get_client()
            models = client.list()
            
            # Ollama возвращает объекты с атрибутом model, а не name
            if hasattr(models, 'models') and models.models:
                model_names = [model.model for model in models.models]
                is_available = any(model.model == self.model for model in models.models)
            else:
                # Fallback для других структур
                model_names = []
                is_available = False
            
            logger.debug(f"Looking for model: {self.model}")
            logger.debug(f"Available models: {model_names}")
            
            return is_available
        except Exception as e:
            logger.error(f"Model availability check failed: {e}")
            return False

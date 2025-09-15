class AIServiceError(Exception):
    """Базовое исключение для AI сервиса"""
    pass


class OllamaConnectionError(AIServiceError):
    """Ошибка подключения к Ollama"""
    pass


class ModelNotAvailableError(AIServiceError):
    """Модель недоступна"""
    pass


class InvalidResponseError(AIServiceError):
    """Некорректный ответ от AI"""
    pass


class PromptProcessingError(AIServiceError):
    """Ошибка обработки промпта"""
    pass

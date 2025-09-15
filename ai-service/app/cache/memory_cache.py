import hashlib
import logging
from typing import Any, Optional, Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class MemoryCache:
    """Простое in-memory кэширование"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds
    
    def _generate_key(self, title: str, description: str) -> str:
        """Генерирует ключ для кэша"""
        content = f"{title}|{description}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, title: str, description: str) -> Optional[Any]:
        """Получает значение из кэша"""
        key = self._generate_key(title, description)
        
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        if datetime.now() > entry['expires_at']:
            del self.cache[key]
            logger.debug(f"Cache entry expired for key: {key}")
            return None
        
        logger.debug(f"Cache hit for key: {key}")
        return entry['value']
    
    def set(self, title: str, description: str, value: Any) -> None:
        """Сохраняет значение в кэш"""
        key = self._generate_key(title, description)
        expires_at = datetime.now() + timedelta(seconds=self.ttl_seconds)
        
        self.cache[key] = {
            'value': value,
            'expires_at': expires_at
        }
        
        logger.debug(f"Cached value for key: {key}")
    
    def clear(self) -> None:
        """Очищает кэш"""
        self.cache.clear()
        logger.info("Cache cleared")
    
    def cleanup_expired(self) -> None:
        """Удаляет истекшие записи"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now > entry['expires_at']
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")

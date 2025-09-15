import logging
import sys
import os
from typing import Optional
from .config.settings import settings


def setup_logging(log_level: Optional[str] = None) -> None:
    """Настраивает логирование для приложения"""
    
    level = log_level or settings.log_level
    log_level_map = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL
    }
    
    # Настраиваем формат логов
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Создаем обработчики
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(log_format))
    
    # Настраиваем корневой логгер
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level_map.get(level.upper(), logging.INFO))
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)
    
    # Пытаемся создать файловый обработчик
    try:
        # Создаем директорию для логов если её нет
        current_dir = os.path.dirname(__file__)  # ai-service/app
        ai_service_dir = os.path.dirname(current_dir)  # ai-service
        project_root = os.path.dirname(ai_service_dir)  # project root
        log_dir = os.path.join(project_root, 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        log_file_path = os.path.join(log_dir, 'ai-service.log')
        file_handler = logging.FileHandler(log_file_path, encoding='utf-8')
        file_handler.setFormatter(logging.Formatter(log_format))
        root_logger.addHandler(file_handler)
        
    except (PermissionError, OSError) as e:
        # Если не можем создать файл в logs/, пробуем в temp директории
        try:
            import tempfile
            temp_dir = tempfile.gettempdir()
            log_file_path = os.path.join(temp_dir, 'ai-service.log')
            file_handler = logging.FileHandler(log_file_path, encoding='utf-8')
            file_handler.setFormatter(logging.Formatter(log_format))
            root_logger.addHandler(file_handler)
            print(f"Логи сохраняются в: {log_file_path}")
        except Exception:
            # Если и это не работает, используем только консоль
            print("Не удалось создать файловый обработчик логов, используется только консоль")
    
    # Настраиваем уровень для внешних библиотек
    logging.getLogger("ollama").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

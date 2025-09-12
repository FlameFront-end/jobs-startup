# Dev Scripts

Скрипты для запуска dev окружения.

## Доступные скрипты:

- **dev.ps1** - Запуск в двух отдельных консолях
- **dev-single.ps1** - Запуск в одной консоли с логами

## Использование:

```bash
# Две консоли (рекомендуется)
npm run dev

# Одна консоль с логами
npm run dev:single

# Напрямую
powershell -ExecutionPolicy Bypass -File ./scripts/dev.ps1
powershell -ExecutionPolicy Bypass -File ./scripts/dev-single.ps1
```

## Особенности:

- Автоматическая установка зависимостей при первом запуске
- Graceful shutdown по Ctrl+C
- Цветной вывод для лучшей читаемости
- Проверка статуса сервисов

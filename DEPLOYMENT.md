# Развертывание и разработка

## Dev окружение

### Быстрый запуск

**Две консоли (рекомендуется):**

```bash
npm run dev
```

**Одна консоль с логами:**

```bash
npm run dev:single
```

### Установка зависимостей

```bash
npm run install:all
```

## Продакшен

### Быстрый старт

```bash
# Сборка и запуск всех сервисов
docker-compose -f docker-compose.prod.yml up --build -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Остановка
docker-compose -f docker-compose.prod.yml down
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://user:password@host:port/database
AI_SERVICE_URL=https://your-ai-service.com
AI_SERVICE_API_KEY=your-api-key
```

## Структура сервисов

- **client** (порт 80) - React приложение с nginx
- **parser** (порт 3000) - NestJS API сервер

## Nginx конфигурация

- Статические файлы с кешированием
- Проксирование API запросов на parser сервис
- Gzip сжатие
- SPA роутинг (fallback на index.html)

## Мониторинг

```bash
# Логи всех сервисов
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f client
docker-compose -f docker-compose.prod.yml logs -f parser
```

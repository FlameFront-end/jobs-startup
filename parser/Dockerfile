# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Создаем директории для логов
RUN mkdir -p logs && chown -R nestjs:nodejs logs

# Переключаемся на пользователя nestjs
USER nestjs

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["node", "dist/main.js"]
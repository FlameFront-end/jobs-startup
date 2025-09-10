import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
		logger: ['error', 'warn', 'log', 'debug', 'verbose']
	})

	// Winston logger
	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

	// Security
	app.use(helmet())

	// CORS
	app.enableCors()

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	)

	// API prefix
	const apiPrefix = process.env.API_PREFIX || 'api'
	app.setGlobalPrefix(apiPrefix)

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle('Job Parser Service API')
		.setDescription('API для автоматического сбора вакансий с сайтов и Telegram-каналов')
		.setVersion('1.0')
		.addTag('jobs', 'Управление вакансиями')
		.addTag('website-parser', 'Парсинг веб-сайтов')
		.addTag('telegram-parser', 'Парсинг Telegram каналов')
		.addTag('stats', 'Статистика')
		.addTag('health', 'Состояние сервиса')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
		customCss: '.swagger-ui .topbar { display: none }',
		customSiteTitle: 'Job Parser Service API'
	})

	const port = process.env.PORT || 3000
	await app.listen(port)

	console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`)
	console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`)
}

bootstrap()

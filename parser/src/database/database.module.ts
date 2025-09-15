import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Job, ParsingLog } from './entities'

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres' as const,
				host: configService.get('DATABASE_HOST', 'localhost'),
				port: configService.get('DATABASE_PORT', 5432),
				username: configService.get('DATABASE_USERNAME', 'postgres'),
				password: configService.get('DATABASE_PASSWORD', 'password'),
				database: configService.get('DATABASE_NAME', 'job_parser'),
				entities: [Job, ParsingLog],
				synchronize: configService.get('NODE_ENV') === 'development',
				ssl: false
			}),
			inject: [ConfigService]
		}),
		TypeOrmModule.forFeature([Job, ParsingLog])
	],
	exports: [TypeOrmModule]
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.POSTGRESQL_HOST,
			port: parseInt(process.env.POSTGRESQL_PORT || '3306'),
			username: process.env.POSGRESQL_USERNAME,
			password: process.env.POSTGRESQL_PASSWORD,
			database: process.env.POSTGRESQL_DATABASE,
			entities: [User],
			synchronize: true,
		}),
	],
})
export class AppModule {}

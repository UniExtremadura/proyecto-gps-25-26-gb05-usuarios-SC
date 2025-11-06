import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { ServiceTokenProvider } from '../../common/providers/service-token.provider';

@Module({
	imports: [TypeOrmModule.forFeature([User]), HttpModule],
	controllers: [UsersController],
	providers: [UsersService, ServiceTokenProvider],
})
export class UsersModule {}

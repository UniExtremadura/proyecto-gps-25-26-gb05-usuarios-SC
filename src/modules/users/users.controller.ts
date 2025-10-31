import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	Post,
	Put,
	Req,
	Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IsNotEmpty } from 'class-validator';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// TODO: Definir controladores de users/

	@Post()
	async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
		return await this.usersService.insert(createUserDto);
	}
}

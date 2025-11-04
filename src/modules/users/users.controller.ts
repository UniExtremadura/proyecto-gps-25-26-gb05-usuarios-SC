import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { SupabaseUser } from '../../auth/user.decorator';
import { type User as SbUser } from '@supabase/supabase-js';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

    @Post()
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async postUser(
		@Body() createUserDto: CreateUserDto,
		@SupabaseUser() sbUser: SbUser,
	): Promise<User> {
		try {
			return await this.usersService.findOneById(sbUser.id);
		} catch (error) {
			return await this.usersService.insert({ ...createUserDto, id: sbUser.id });
		}
	}
}

import {
    Body,
    Controller,
    Delete, Get,
    HttpCode,
    HttpStatus, Param,
    Post, Put,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { SupabaseUser } from '../../auth/user.decorator';
import { type User as SbUser } from '@supabase/supabase-js';
import { Roles } from '../../auth/roles.decorator';

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
			return await this.usersService.findOneByUuid(sbUser.id);
		} catch (error) {
			return await this.usersService.create({ ...createUserDto, uuid: sbUser.id });
		}
	}

    @UseGuards(AuthGuard)
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @SupabaseUser() sbUser: SbUser,
    ): Promise<User> {
        if (sbUser.id !== id) {
            throw new Error('No tienes permiso para modificar este usuario');
        }

        return this.usersService.updateUser(id, updateUserDto);
    }

    @Delete()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteUser(@SupabaseUser() sbUser: SbUser): Promise<void> {
      await this.usersService.delete(sbUser.id);
    }

	@Get(':uuid')
	@Roles(['admin'])
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getUserByUuid(@Param('uuid') uuid: string): Promise<User> {
		return await this.usersService.findOneByUuid(uuid);
	}
}

import {
    Body,
    Controller,
    HttpCode,
    HttpStatus, Param,
    Post, Put, Req,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './entities/user.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { SupabaseUser } from '../../auth/user.decorator';
import { type User as SbUser } from '@supabase/supabase-js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @Post()
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

}
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
import {Address} from "./entities/address.entity";
import {CreateAddressDto} from "./dto/create-address.dto";
import {UpdateAddressDto} from "./dto/update-address.dto";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

	@Get()
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getUserByToken(@SupabaseUser() sbUser: SbUser) {
		return await this.usersService.findOneByUuid(sbUser.id);
	}

	@Get('addresses')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getAddressesByToken(@SupabaseUser() sbUser: SbUser) {
		return await this.usersService.findAddressesByUserUuid(sbUser.id);
	}

	@Get(':uuid')
	@Roles(['admin'])
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async getUserByUuid(@Param('uuid') uuid: string): Promise<User> {
		return await this.usersService.findOneByUuid(uuid);
	}

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

	@Post('addresses')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async postAddress(
		@SupabaseUser() sbUser: SbUser,
		@Body() createAddressDto: CreateAddressDto
	): Promise<Address> {
		return await this.usersService.createAddress(sbUser.id, createAddressDto);
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

        return this.usersService.update(id, updateUserDto);
    }

	@Put()
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async updateUserByToken(
		@SupabaseUser() sbUser: SbUser,
		@Body() updateUserDto: UpdateUserDto
	) {
		return this.usersService.update(sbUser.id, updateUserDto);
	}

	@Put('/addresses/:uuid')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async updateAddress(
		@Param('uuid') uuid: string,
		@SupabaseUser() sbUser: SbUser,
		@Body() updateAddressDto: UpdateAddressDto
	) {
		updateAddressDto.userUuid = sbUser.id;
		return this.usersService.updateAddress(uuid, updateAddressDto);
	}

    @Delete()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteUser(@SupabaseUser() sbUser: SbUser): Promise<void> {
      await this.usersService.delete(sbUser.id);
    }

	@Delete('/addresses/:uuid')
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.OK)
	async deleteAddress(
		@Param('uuid') uuid: string,
		@SupabaseUser() sbUser: SbUser
	): Promise<void> {
		await this.usersService.deleteAddress(sbUser.id, uuid);
	}
}

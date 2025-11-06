import { IsEmail, IsEmpty, IsEnum, IsIn, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
	@IsEmpty()
	uuid?: string;

	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty()
	lastName: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	@IsIn(['user', 'artist'])
	role: 'user' | 'artist';

	@IsNotEmpty()
	username: string;
}

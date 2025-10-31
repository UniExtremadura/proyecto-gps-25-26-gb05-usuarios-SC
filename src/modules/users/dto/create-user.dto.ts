import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
	@IsEmpty()
	id?: string;

	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty({ message: 'El apellido no puede estar vacío' })
	lastName: string;

	@IsEmail()
	@IsNotEmpty({ message: 'El email no puede estar vacío' })
	email: string;

	@IsNotEmpty({ message: 'El rol no puede estar vacío' })
	role: UserRole;
}

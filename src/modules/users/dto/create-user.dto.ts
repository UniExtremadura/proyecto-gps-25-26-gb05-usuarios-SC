import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty({ message: 'El apellido no puede estar vacío' })
	lastName: string;

	@IsEmail()
	@IsNotEmpty({ message: 'El email no puede estar vacío' })
	email: string;

	@IsNotEmpty({ message: 'La contraseña no puede estar vacío' })
	password: string;

	@IsNotEmpty({ message: 'El rol no puede estar vacío' })
	role: UserRole;
}

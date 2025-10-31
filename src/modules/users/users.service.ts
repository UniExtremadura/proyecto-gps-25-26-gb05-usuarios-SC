import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
	) {}

	//Obtener un usuario
	async findOneByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ email: email });
		if (!user) throw NotFoundException;
		return user;
	}

	//Obtener un usuario
	async findOneById(id: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ id: id });
		if (!user) throw NotFoundException;
		return user;
	}

	//Actualizar un usuario
	async update(id: string, user: User): Promise<User> {
		const insertedUser = await this.usersRepository.save(user);
		if (!insertedUser) throw NotFoundException;
		return insertedUser;
	}

	//Crear un nuevo usuario
	async insert(insertedUser: CreateUserDto): Promise<User> {
		const emailExists = await this.usersRepository.findOneBy({
			email: insertedUser.email,
		});

		if (emailExists) {
			throw new ConflictException('El email ya está en uso');
		}

		const user = this.usersRepository.create(insertedUser);

		try {
			console.log('Entro en insertar el usuario');
			const insertedUser = await this.usersRepository.save(user);
			console.log('inserte el usuario', user);
			return insertedUser;
		} catch (error) {
			if (error.code === '23505') {
				throw new ConflictException('El email ya está registrado');
			}
			// Error de PostgreSQL para "violación de NOT NULL" (datos faltantes)
			if (error.code === '23502') {
				throw new BadRequestException(
					`Falta un campo obligatorio: ${error.column}`,
				);
			}

			// Cualquier otro error
			console.error('Error al insertar el usuario:', error);
			throw new InternalServerErrorException('Error al crear el usuario');
		}
	}

	//Borrar usuario por ID
	async remove(id: string): Promise<void> {
		await this.usersRepository.delete(id);
	}

	// TODO: Definir lógica de negocio de users/
}

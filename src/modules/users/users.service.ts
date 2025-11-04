import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { supabase } from '../../lib/supabase';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
	) {}

	async findOneByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ email: email });
		if (!user) throw NotFoundException;
		return user;
	}

	async findOneById(id: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ id: id });
		if (!user) throw NotFoundException;
		return user;
	}

	async update(id: string, user: User): Promise<User> {
		const insertedUser = await this.usersRepository.save(user);
		if (!insertedUser) throw NotFoundException;
		return insertedUser;
	}

	async insert(insertedUser: CreateUserDto): Promise<User> {
		const user = this.usersRepository.create(insertedUser);

		try {
			return await this.usersRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException();
		}
	}

	async delete(id: string): Promise<void> {
		await this.usersRepository.delete(id);
		const { data, error } = await supabase.auth.admin.deleteUser(id);
		if (error) throw new InternalServerErrorException();
	}
}

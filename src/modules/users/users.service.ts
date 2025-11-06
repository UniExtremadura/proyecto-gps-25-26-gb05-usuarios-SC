import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {supabase} from "../../lib/supabase";

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

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.usersRepository.preload({id, ...dto});
        if (!user) throw new NotFoundException;

        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException;
        }
    }

	async insert(insertedUser: CreateUserDto): Promise<User> {
		const user = this.usersRepository.create(insertedUser);

		try {
			return await this.usersRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException();
		}
	}

	async remove(id: string): Promise<void> {
		await this.usersRepository.delete(id);
	}
}

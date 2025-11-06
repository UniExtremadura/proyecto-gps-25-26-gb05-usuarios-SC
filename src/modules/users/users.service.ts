import {
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { supabase } from '../../lib/supabase';
import { HttpService } from '@nestjs/axios';
import { ServiceTokenProvider } from '../../common/providers/service-token.provider';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		private httpService: HttpService,
		private serviceTokenProvider: ServiceTokenProvider,
	) {}

	async findOneByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ email });
		if (!user) throw NotFoundException;
		return user;
	}

	async findOneByUuid(uuid: string): Promise<User> {
		const user = await this.usersRepository.findOneBy({ uuid });
		if (!user) throw NotFoundException;
		return user;
	}

	async create(insertedUser: CreateUserDto): Promise<User> {
		const user = this.usersRepository.create(insertedUser);

		const serviceToken = await this.serviceTokenProvider.getToken();
		await firstValueFrom(
			this.httpService.post(
				`${process.env.CONTENIDOS_SERVICE_BASE_URL}/users`,
				{
					uuid: insertedUser.uuid,
					username: insertedUser.username,
				},
				{
					headers: {
						Authorization: `Bearer ${serviceToken}`,
					},
				},
			),
		);

		if (user.role === 'artist') {
			await firstValueFrom(
				this.httpService.post(
					`${process.env.CONTENIDOS_SERVICE_BASE_URL}/artists`,
					{
						uuid: insertedUser.uuid,
					},
					{
						headers: {
							Authorization: `Bearer ${serviceToken}`,
						},
					},
				),
			);
		}

		return await this.usersRepository.save(user);
	}

	async delete(uuid: string): Promise<void> {
		const user = await this.usersRepository.findOneBy({ uuid });
		if (!user) throw new NotFoundException();

		await this.usersRepository.delete(uuid);
		const { data, error } = await supabase.auth.admin.deleteUser(uuid);
		if (error) console.log(error);

		const serviceToken = await this.serviceTokenProvider.getToken();
		await firstValueFrom(
			this.httpService.delete(
				`${process.env.CONTENIDOS_SERVICE_BASE_URL}/users/${user.uuid}`,
				{
					headers: {
						Authorization: `Bearer ${serviceToken}`,
					},
				},
			),
		);

		if (user.role === 'artist') {
			await firstValueFrom(
				this.httpService.delete(
					`${process.env.CONTENIDOS_SERVICE_BASE_URL}/artists/${user.uuid}`,
					{
						headers: {
							Authorization: `Bearer ${serviceToken}`,
						},
					},
				),
			);
		}
	}
}

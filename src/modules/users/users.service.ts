import {
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { supabase } from "../../lib/supabase";
import { HttpService } from '@nestjs/axios';
import { ServiceTokenProvider } from '../../common/providers/service-token.provider';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {Address} from "./entities/address.entity";
import {CreateAddressDto} from "./dto/create-address.dto";
import {UpdateAddressDto} from "./dto/update-address.dto";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Address) private addressRepository: Repository<Address>,
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

    async findBashByUuids(uuids: string[]): Promise<User[]>{
        const users =  await this.usersRepository.find({
            where: {uuid: In(uuids)},
        })
        if(!users) throw NotFoundException;
        return users;
    }

	async findAddressesByUserUuid(uuid: string): Promise<Address[]> {
		return await this.addressRepository.findBy({ user: { uuid } });
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

			await firstValueFrom(
				this.httpService.post(
					`${process.env.COMPRAS_SERVICE_BASE_URL}/payments/wallet`,
					{
						artistUuid: insertedUser.uuid,
					},
					{
						headers: {
							Authorization: `Bearer ${serviceToken}`
						}
					}
				)
			)
		}

		return await this.usersRepository.save(user);
	}

	async createAddress(uuid: string, createAddressDto: CreateAddressDto) {
		const user = await this.usersRepository.findOneBy({ uuid });
		if (!user) throw new NotFoundException();

		const address = this.addressRepository.create({
			...createAddressDto,
			uuid: uuidv4(),
			user
		});

		return await this.addressRepository.save(address);
	}

    async update(uuid: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.usersRepository.preload({uuid, ...dto});
        if (!user) throw new NotFoundException;

        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException;
        }
    }

	async updateAddress(uuid: string, updateAddressDto: UpdateAddressDto): Promise<any> {
		const address = await this.addressRepository.findOne({
			relations: ['user'],
			where: { uuid }
		});
		if (!address) throw new NotFoundException();
		if (address.user.uuid !== updateAddressDto.userUuid) throw new UnauthorizedException();
		return await this.addressRepository.save({
			...address,
			...updateAddressDto,
			userUuid: undefined
		})
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

	async deleteAddress(userUuid: string, addressUuid: string) {
		const user = await this.findOneByUuid(userUuid);
		const address = await this.addressRepository.findOne({
			relations: ['user'],
			where: { uuid: addressUuid }
		});
		if (!address) throw new NotFoundException();
		if (user.uuid !== address.user.uuid) throw new UnauthorizedException();
		await this.addressRepository.delete(address);
	}
}

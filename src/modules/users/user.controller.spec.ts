import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUserRepository = {
	insert: jest.fn(),
};

describe('UserController', () => {
	let usersController: UsersController;
	let usersService: UsersService;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
			],
		}).compile();

		usersService = moduleRef.get(UsersService);
		usersController = moduleRef.get(UsersController);
	});

	describe('signUp', () => {
		it('Debería devolver el usuario recien creado', async () => {
			const mockCreateUserDto: CreateUserDto = {
				firstName: 'Test name',
				lastName: 'Test lastname',
				email: 'test@gmail.com',
				password: 'test123',
				role: UserRole.USER,
			};

			// El usuario que FINGIMOS que el servicio creó y devolvió
			const mockCreatedUser: User = {
				id: 'un-id-aleatorio-123',
				firstName: 'Test name',
				lastName: 'Test lastname',
				email: 'test@gmail.com',
				role: UserRole.USER,
				addressBook: [],
			};

			// Cuando 'usersService.insert' sea llamado, debe devolver 'mockCreatedUser'
			jest.spyOn(usersService, 'insert').mockResolvedValue(mockCreatedUser);

			const result = await usersController.signUp(mockCreateUserDto);

			expect(usersService.insert).toHaveBeenCalledWith(mockCreateUserDto);
			// Verificamos que el controlador devolvió exactamente lo que el servicio le dio
			expect(result).toBe(mockCreatedUser);
		});
	});
});

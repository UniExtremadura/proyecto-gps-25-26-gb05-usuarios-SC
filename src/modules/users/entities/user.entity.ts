import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Address } from './address.entity';

export enum UserRole {
	ADMIN = 'admin',
	ARTIST = 'artist',
	USER = 'user',
}

@Entity()
export class User {
	@PrimaryColumn('uuid')
	id: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	email: string;

	@Column({
		type: 'enum',
		enum: UserRole,
	})
	role: string;

	@OneToMany(() => User, (user) => user.addressBook)
	addressBook: Address[];
}

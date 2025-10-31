import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	Generated,
	ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	alias: string;

	@Column()
	recipientName: string;

	@Column()
	street: string;

	@Column()
	additionalInfo: string;

	@Column()
	city: string;

	@Column()
	state: string;

	@Column()
	zipCode: string;

	@Column('int')
	phoneNumber: number;

	@ManyToOne(() => Address, (address) => address.user)
	user: User;
}

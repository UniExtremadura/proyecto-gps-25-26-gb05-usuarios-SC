import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	Generated,
	ManyToOne,
	PrimaryColumn, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
	@PrimaryColumn('uuid')
	uuid: string;

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

	@ManyToOne(() => User, (user) => user.addressBook, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user' })
	user: User;
}

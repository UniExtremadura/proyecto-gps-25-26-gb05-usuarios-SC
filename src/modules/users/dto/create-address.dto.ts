import {IsNotEmpty, IsNumber, IsString, MaxLength} from "class-validator";

export class CreateAddressDto {

	@IsNotEmpty()
	@IsString()
	alias: string;

	@IsNotEmpty()
	@IsString()
	recipientName: string;

	@IsNotEmpty()
	@IsString()
	street: string;

	@IsString()
	additionalInfo: string;

	@IsNotEmpty()
	@IsString()
	city: string;

	@IsNotEmpty()
	@IsString()
	state: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(5)
	zipCode: string;

	@IsNotEmpty()
	@IsNumber()
	phoneNumber: number;
}
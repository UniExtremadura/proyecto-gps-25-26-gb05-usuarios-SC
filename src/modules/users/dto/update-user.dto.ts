import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

const OmittedAttributes = OmitType(CreateUserDto, ['role', 'email'] as const);

export class UpdateUserDto extends PartialType(OmittedAttributes) {}

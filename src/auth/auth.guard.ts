import {
	CanActivate,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { supabase } from '../lib/supabase';
import { Reflector } from '@nestjs/core';
import { ServiceTokenProvider } from '../common/providers/service-token.provider';
import { Roles } from './roles.decorator';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly usersService: UsersService,
	) {}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) throw new UnauthorizedException();

		const { data, error } = await supabase.auth.getUser(token);
		if (error) throw new UnauthorizedException();

		const roles = this.reflector.get(Roles, context.getHandler());
		if (!roles) {
			request.user = data.user;
			return true;
		}

		const user = await this.usersService.findOneByUuid(data.user?.id);
		if (!roles.includes(user.role)) throw new UnauthorizedException();

		request.user = data.user;
		return true;
	}
}

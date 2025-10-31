import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { supabase } from '../lib/supabase';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor() {}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException();
		}

		const { data, error } = await supabase.auth.getUser(token);
		if (error) {
			throw new UnauthorizedException('Token de sesión inválido');
		}

		request.user = data.user;
		return true;
	}
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import UsersService from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    const authHeader: string = req.headers?.authorization;

    if (!authHeader || !authHeader.toLocaleLowerCase().includes('bearer'))
      return false;

    const token = authHeader.split(' ')[1];

    if (!token) return false;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        iat: number;
        exp: number;
      };

      const user = await this.usersService.findById(decoded.id);

      if (!user) return false;

      // Check if user is archived
      if (user.archived) {
        throw new UnauthorizedException('Your account has been archived. Please contact support for assistance.');
      }

      // Check if route requires admin access
      const requiresAdmin = this.reflector.get<boolean>(
        'isAdmin',
        context.getHandler(),
      );

      if (requiresAdmin && !user.isAdmin) {
        return false;
      }

      req.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return false;
    }
  }
}

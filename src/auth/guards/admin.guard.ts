import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Giriş yapmanız gerekiyor');
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bu işlem sadece admin kullanıcılar için geçerlidir');
    }

    return true;
  }
}
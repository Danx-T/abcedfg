import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

 async validate(payload: any) {
  const user = await this.usersService.findById(payload.sub);
  if (!user) {
    throw new Error('User not found');
  }
  return { 
    id: user.id, 
    email: user.email, 
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
}
}
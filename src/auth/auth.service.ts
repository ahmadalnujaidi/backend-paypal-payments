import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    // check if lastPayment is more than 1 month or null, then set isActive to false
    if (user.lastPayment && new Date().getTime() - user.lastPayment.getTime() > 30 * 24 * 60 * 60 * 1000 || !user.lastPayment) {
      user.isActive = false;
      await this.usersService.update(user.id, user);
    }
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

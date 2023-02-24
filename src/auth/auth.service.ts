import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepo: AuthRepository) {}

  async register(data: RegisterUserDto): Promise<void> {
    try {
      const { firstName, lastName, email, password } = data;
      this.logger.log(`Invoked register: ${{ firstName, lastName, email }}`);

      const found = await this.authRepo.findUserByEmail(email);

      if (found) {
        throw new BadRequestException('Email already registered');
      }

      const salt = await bcrypt.genSalt();
      const hashPass = await bcrypt.hash(password, salt);

      const created = await this.authRepo.register({
        firstName,
        lastName,
        email,
        password: hashPass,
      });

      this.logger.log(`Registered user: ${JSON.stringify(created)}`);
    } catch (error) {
      this.logger.error(`Failed register: ${{ error }}`);
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from '../../auth/application/bcrypt.service';
import { User } from '../entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<number> {
    const passwordHash = await this.bcryptService.createHash(dto.password);

    const user = User.create(dto.login, dto.email, passwordHash);

    await this.usersRepository.save(user);

    return user.id;
  }
}

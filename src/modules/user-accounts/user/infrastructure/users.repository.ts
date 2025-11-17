import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<void> {
    await this.usersRepository.save(user); //создание ИЛИ обновление
    // await this.usersRepository.insert(user);
    // this.usersRepository.create(user); Только создает объект, как в entity
  }

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async find(loginOrEmail: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: [
        { email: loginOrEmail }, // ИЛИ
        { login: loginOrEmail }, // TypeORM автоматически преобразует массив условий в SQL с оператором OR
      ],
    });
    //where: {
    //       email: Or(loginOrEmail),
    //       login: Or(loginOrEmail)
    //     }, и так можно
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.softDelete({ id }); //тогда не надо в поиске указывать deletedAt: IsNull()
  }
}

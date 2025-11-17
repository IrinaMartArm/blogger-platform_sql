import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ExternalUsersQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  async findUserOrFail(id: number): Promise<UserViewDto> {
    const result: User[] = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL `,
      [id],
    );
    const user = result[0];

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async findUsersByIds(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const users: { id: number; login: string }[] = await this.dataSource.query(
      `SELECT id, login FROM users  WHERE id = ANY($1::int[]) AND deleted_at IS NULL`,
      [ids],
    );

    return new Map(users.map((user) => [user.id.toString(), user.login]));
  }
}

import { User } from '../entity/user.entity';
import { Injectable } from '@nestjs/common';
import { MeViewDto, UserViewDto } from '../api/view-dto/user.view-dto';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<UserViewDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    return UserViewDto.mapToView(user);
  }

  async getMe(id: number): Promise<MeViewDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    return MeViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    const skip = (pageNumber - 1) * pageSize;

    const sortFields = ['createdAt', 'login', 'email'];
    const safeSortField = sortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'createdAt';

    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const filter: any[] = [];

    if (searchEmailTerm) {
      filter.push({
        email: ILike(`%${searchEmailTerm}%`),
      });
    }

    if (searchLoginTerm) {
      filter.push({
        login: ILike(`%${searchLoginTerm}%`),
      });
    }

    const where = filter.length > 0 ? filter : {};

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where,
      order: {
        [safeSortField]: dir,
        id: dir,
      },
      take: pageSize,
      skip,
    });

    const items: UserViewDto[] = users.map((user) =>
      UserViewDto.mapToView(user),
    );

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}

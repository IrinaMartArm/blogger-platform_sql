import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQuery } from '../application/query/get_blogs.query';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { BindWithUserCommand } from '../application/commands/bind_with_user.use-case';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class AdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async BindWithUser(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Param('userId', ObjectIdValidationPipe) userId: number,
  ): Promise<void> {
    return this.commandBus.execute(new BindWithUserCommand(id, userId));
  }

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QuestionsViewDto } from './view-dto/question.wiew-dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import {
  PublishInputDto,
  QuestionsInputDto,
} from './input-dto/question.input-dto';
import { CreateQuestionCommand } from '../application/commands/create_question.use-case';
import { GetQuestionQuery } from '../application/query/get_question.query';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { DeleteQuestionCommand } from '../application/commands/delete_question.use-case';
import { UpdateQuestionCommand } from '../application/commands/update_question.use-case';
import { UpdatePublishCommand } from '../application/commands/update_publish.use-case';
import { GetQuestionsQueryParamsInputDto } from './input-dto/get_questions_query_params.input-dto';
import { GetQuestionsQuery } from '../application/query/get_questions.query';

@Controller('sa/quiz')
export class QuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('questions')
  @UseGuards(BasicAuthGuard)
  async getQuestions(
    @Query() query: GetQuestionsQueryParamsInputDto,
  ): Promise<PaginatedViewDto<QuestionsViewDto[]>> {
    return this.queryBus.execute(new GetQuestionsQuery(query));
  }

  @Post('questions')
  @UseGuards(BasicAuthGuard)
  async createQuestion(
    @Body() body: QuestionsInputDto,
  ): Promise<QuestionsViewDto> {
    const questionId: number = await this.commandBus.execute(
      new CreateQuestionCommand(body),
    );
    return this.queryBus.execute(new GetQuestionQuery(questionId));
  }

  @Delete('questions/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(
    @Param('id', ObjectIdValidationPipe) id: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }

  @Put('questions/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() body: QuestionsInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateQuestionCommand(id, body));
  }

  @Put('questions/:id/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePublish(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() body: PublishInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePublishCommand(id, body.published),
    );
  }
}

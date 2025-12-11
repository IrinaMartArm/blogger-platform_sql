import { Processor, Process } from '@nestjs/bull';
import { DataSource } from 'typeorm';
import { Job } from 'bull';
import { GameRepository } from '../../infrastructure/game.repository';
import { Logger } from '@nestjs/common';

@Processor('game-finish')
export class GameFinishProcessor {
  private readonly logger = new Logger(GameFinishProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly gameRepository: GameRepository,
  ) {}

  @Process('finish_timeout')
  async handleFinishTimeout(job: Job<{ gameId: number; jobId: string }>) {
    const { gameId, jobId } = job.data;
    await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      const gameRepo = this.gameRepository.withTransaction(manager);

      const game = await gameRepo.findGameById(gameId);

      if (!game || game.finishTimeoutJobId !== jobId) {
        this.logger.warn(`Game ${gameId} not found`);
        return;
      }

      const firstFinished = game.firstPlayerProgress.answers.length >= 5;
      const secondFinished = game.secondPlayerProgress!.answers.length >= 5;

      if (firstFinished && secondFinished) {
        this.logger.debug(`Game ${gameId} already finished by both`);
        return;
      }

      game.finishGameWithMissingAnswers();

      await gameRepo.save(game);
    });
    // можно удалить job (Bull автоматически удалит по настройке removeOnComplete)
  }
}

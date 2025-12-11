import { Test, TestingModule } from '@nestjs/testing';
import { configModule } from '../../src/config-dynamic-module';
import { CoreModule } from '../../src/core/core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfig } from '../../src/core/configs/core.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserAccountsModule } from '../../src/modules/user-accounts/user-accounts.module';
import { UsersTestManager } from './usersTestManager';
import { TestingController } from '../../src/modules/testing/testing.controller';
import { QuizGameModule } from '../../src/modules/quizGame/quizGame.module';
import { GameTestManager } from './gameTestManager';
import { pipesSetup } from '../../src/setup/pipes.setup';
import { DomainHttpExceptionsFilter } from '../../src/core/filters/domain-exception-filter';
import { GameFinishProcessor } from '../../src/modules/quizGame/game/application/processors/game-finish.processor';
import { BullModule } from '@nestjs/bull';

export const getInitApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      configModule,
      CoreModule,
      TypeOrmModule.forRootAsync({
        inject: [CoreConfig],
        useFactory: (coreConfig: CoreConfig) => ({
          type: 'postgres',
          host: 'localhost',
          port: coreConfig.pgPort,
          username: coreConfig.postgreUser,
          password: coreConfig.postgrePass,
          database: coreConfig.database,
          autoLoadEntities: true,
          synchronize: true,
        }),
      }),
      ThrottlerModule.forRoot({
        throttlers: [
          {
            name: 'short',
            ttl: 10000,
            limit: 55,
          },
        ],
      }),
      BullModule.forRoot({
        redis: { host: 'localhost', port: 6379 },
      }),
      UserAccountsModule,
      QuizGameModule,
    ],
    controllers: [TestingController],
  }).compile();

  const app = moduleFixture.createNestApplication();
  pipesSetup(app);
  app.useGlobalFilters(new DomainHttpExceptionsFilter());
  await app.init();
  // await app.listen(0); // ← обязательно!
  const userTestManger = new UsersTestManager(app);
  const gameTestManager = new GameTestManager(app);

  return { app, userTestManger, gameTestManager, moduleFixture };
};

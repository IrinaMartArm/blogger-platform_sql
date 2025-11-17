import { Test, TestingModule } from '@nestjs/testing';
import { configModule } from '../../src/config-dynamic-module';
import { CoreModule } from '../../src/core/core.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfig } from '../../src/core/core.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserAccountsModule } from '../../src/modules/user-accounts/user-accounts.module';
import { UsersTestManager } from './usersTestManager';
import { TestingController } from '../../src/modules/testing/testing.controller';

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
            limit: 5,
          },
        ],
      }),
      UserAccountsModule,
    ],
    controllers: [TestingController],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  // await app.listen(0); // ← обязательно!
  const userTestManger = new UsersTestManager(app);

  return { app, userTestManger };
};

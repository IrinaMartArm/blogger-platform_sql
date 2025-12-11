import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggerModule } from './modules/blogger/blogger.module';
import { TestingModule } from './modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/filters/all-exceptions-filter';
import { DomainHttpExceptionsFilter } from './core/filters/domain-exception-filter';
import { CoreModule } from './core/core.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfig } from './core/configs/core.config';
import { getTypeOrmConfig } from './core/configs/typeorm.moduleOptions.config';
import { QuizGameModule } from './modules/quizGame/quizGame.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    configModule,
    CoreModule,
    TypeOrmModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: getTypeOrmConfig,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 10000, // 10 секунд в миллисекундах / 1000 → это 1 секунда
          limit: 95,
        },
      ],
    }),
    BullModule.forRoot({ redis: { host: 'localhost', port: 6379 } }),
    UserAccountsModule,
    BloggerModule,
    QuizGameModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const dynamicImports: any[] = [];

    if (coreConfig.includeTestingModule) {
      dynamicImports.push(TestingModule);
    }
    console.log('app module loaded', coreConfig.port);

    return Promise.resolve({
      module: AppModule,
      imports: dynamicImports,
    });
  }
}

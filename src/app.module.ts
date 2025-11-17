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
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    configModule,
    CoreModule,
    // DatabaseModule,
    TypeOrmModule.forRootAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: coreConfig.pgPort,
          username: coreConfig.postgreUser, // твой пользователь БД
          password: coreConfig.postgrePass, // пароль от PostgreSQL
          database: coreConfig.database, // название базы данных
          autoLoadEntities: true,
          synchronize: true, // ⚠️ автоматически создаёт таблицы
          // logging: true,
        };
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 10000, // 10 секунд в миллисекундах / 1000 → это 1 секунда
          limit: 5,
        },
      ],
    }),
    UserAccountsModule,
    BloggerModule,
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

    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    //@Module — это статический декоратор, он вычисляется на этапе компиляции, не во время запуска.
    // А вот forRoot() — это динамический метод, который вызывается во время выполнения и может принимать аргументы.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return Promise.resolve({
      module: AppModule,
      imports: dynamicImports,
    });
  }
}

import 'dotenv/config';
import process from 'node:process';
import { CoreConfig } from './core.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (config: CoreConfig): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.pgHost,
  port: config.pgPort,
  username: config.postgreUser,
  password: config.postgrePass,
  database: config.database,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

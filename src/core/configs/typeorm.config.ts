import * as process from 'node:process';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as path from 'path';

// config({ path: path.resolve(__dirname, '../../env/.env.development') });
config({ path: 'src/env/.env.development' });

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // entities: [path.resolve(__dirname, '../../**/*.entity.ts')],
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/*{.ts,.js}'],
  // migrations: [path.resolve('migrations/*.ts')],
  synchronize: false,
});

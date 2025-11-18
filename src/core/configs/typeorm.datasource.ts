import { DataSource } from 'typeorm';
import 'dotenv/config';
import process from 'node:process';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // entities: [path.join(process.cwd(), 'src/**/*.entity.ts')],
  // migrations: [path.join(process.cwd(), 'migrations/*.ts')],

  entities: [__dirname + '../../**/*.entity.ts'],
  migrations: [process.cwd() + 'migrations/*.ts'],
  synchronize: false,
});

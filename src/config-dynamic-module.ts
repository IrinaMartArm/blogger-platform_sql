import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    join(process.cwd(), 'src/env', `.env.${process.env.NODE_ENV}.local`),
    join(process.cwd(), 'src/env', `.env.${process.env.NODE_ENV}`),
    join(process.cwd(), 'src/env', '.env.production'),
  ],
  isGlobal: true,
});

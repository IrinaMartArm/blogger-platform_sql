import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/configs/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  appSetup(app);

  app.use(cookieParser());

  app.set('trust proxy', true);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  const PORT = coreConfig.port;

  await app.listen(PORT, () => {
    console.log(
      'Server is running on port ' + PORT + ' http://localhost:' + PORT,
    );
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();

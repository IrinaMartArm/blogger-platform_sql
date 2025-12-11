import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { setupBullBoard } from './bullDashboard';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
  setupBullBoard(app);
}

import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './configs/core.config';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule.forRoot()],
  providers: [CoreConfig],
  exports: [CoreConfig],
})
export class CoreModule {}

import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { INestApplication } from '@nestjs/common';

export const setupBullBoard = (app: INestApplication) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const queue = app.get<Queue>(getQueueToken('game-finish'));

  createBullBoard({
    queues: [new BullAdapter(queue)],
    serverAdapter,
  });

  app.use('/queues', serverAdapter.getRouter());
};

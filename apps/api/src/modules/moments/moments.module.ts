import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service.js';
import { MomentsController } from './moments.controller.js';

@Module({
  controllers: [MomentsController],
  providers: [MomentsService],
  exports: [MomentsService],
})
export class MomentsModule {}

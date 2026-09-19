import { Module } from '@nestjs/common';
import { EmotionsController } from './emotions.controller.js';
import { EmotionsService } from './emotions.service.js';

@Module({
  controllers: [EmotionsController],
  providers: [EmotionsService],
  exports: [EmotionsService],
})
export class EmotionsModule {}

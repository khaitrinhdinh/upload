import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlaygroundService } from './playground.service';
import { PlaygroundController } from './playground.controller';

@Module({
  imports: [HttpModule],
  providers: [PlaygroundService],
  controllers: [PlaygroundController]
})
export class PlaygroundModule {}

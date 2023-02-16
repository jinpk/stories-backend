import { Module } from '@nestjs/common';
import { StaticService } from './static.service';

@Module({
  providers: [StaticService]
})
export class StaticModule {}

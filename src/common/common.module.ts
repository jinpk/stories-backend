import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import * as providers from './providers';

const services = Object.values(providers);

@Global()
@Module({
  imports: [AwsModule, HttpModule],
  providers: services,
  exports: services,
})
export class CommonModule {}

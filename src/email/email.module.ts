import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { EmailService } from './email.service';

@Module({
  imports: [AwsModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

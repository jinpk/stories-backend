import { Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class EmailService {
  constructor(private awsService: AwsService) {}

  sendPaymendtedEmail() {}

  async sendPasswordResetEmail(email: string, link: string) {
    let html = '';
    await this.awsService.sendEmail({
      addrs: [email],
      subject: 'Password reset instruction for TTMIK Stories',
      data: html,
      dataType: 'html',
    });
  }

  async sendPasswordChangedEmail(email: string) {
    let html = '';
    await this.awsService.sendEmail({
      addrs: [email],
      subject: 'Password changed for TTMIK Stories',
      data: html,
      dataType: 'html',
    });
  }
}

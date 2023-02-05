import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  sendRegieredEmail() {}
  
  sendPaymendtedEmail() {}
  
  sendVerifyEmail() {}

  sendPasswordResetEmail() {}
  
  sendPasswordChangedEmail() {}
}

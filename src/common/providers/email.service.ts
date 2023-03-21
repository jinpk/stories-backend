import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { AwsService } from 'src/aws/aws.service';
import { AppConfigService } from 'src/config';
import {
  DYNAMICLINK_PAID,
  DYNAMICLINK_WELCOME,
  EMAIL_HERO_IMAGE_PATH,
  EMAIL_WELCOME_IMAGE_PATH,
} from '../common.constant';
import { EmailTemplateParams } from '../interfaces';
import * as ejs from 'ejs';

@Injectable()
export class EmailService {
  private emailLogoImageUri: string;

  constructor(
    private awsService: AwsService,
    private configService: AppConfigService,
  ) {
    this.emailLogoImageUri = `${this.configService.host}/${EMAIL_HERO_IMAGE_PATH}`;
  }

  async sendJoinedEmail(email: string, nickname: string) {
    const welcomeImage = `${this.configService.host}/${EMAIL_WELCOME_IMAGE_PATH}`;
    const params: EmailTemplateParams = {
      host: this.configService.host,
      title: 'Welcome to',
      logoImageUri: this.emailLogoImageUri,
      intro: `안녕하세요! Hello, ${nickname}!<br />
      We are very exited to have you with us on TTMIK Stories.<br /><br />
      You are going to embark on a very enjoyable and meaningful journey with us.
      As a Korean learner, you have been learning with various resources, but it has most certainly been difficult to find
       sufficient reading materials for your current level... until now!<br /><br />
      With TTMIK Stories, you can improve your Korean through reading, on the go, conveniently on you mobile device.
       1,500 stories are waiting for your inside. Thease stories have been specially and carefully 
       created for Korean learners of various levels.<br /><br />
      The stories are divided into 10 different levels. You can choose a level that is not too challenging for you
       and start with it! The effective learning tools in our app will help you learn and imporve more effectively.
       <div class='image-bg'>
        <img src=${welcomeImage} alt='welcome' />
       </div>
      You don't need to prepare anything else. Just sit back and start reading your first story.`,
      button: 'Open TTMIK Stories',
      link: DYNAMICLINK_WELCOME,
      caption: '',
    };

    const html = await this._convertEJSToHtml(params);

    await this.awsService.sendEmail({
      addrs: [email],
      subject: params.title,
      data: html,
      dataType: 'html',
    });
  }

  async sendVerifyEmail(email: string, link: string) {
    const params: EmailTemplateParams = {
      host: this.configService.host,
      title: 'Please verify your email for TTMIK Stories.',
      logoImageUri: this.emailLogoImageUri,
      intro: `Thank you for signing up for TTMIK Stories.<br />
      Please click on the button below to finish the sign-ip process`,
      button: 'Verify Your Email Address',
      link,
      caption: `If you didn't sign up for TTMIK Stories through this email, please click here to delete your email address from out list. Thank you.`,
    };

    const html = await this._convertEJSToHtml(params);

    await this.awsService.sendEmail({
      addrs: [email],
      subject: params.title,
      data: html,
      dataType: 'html',
    });
  }

  async sendPaymendtedEmail(email: string, nickname: string) {
    const params: EmailTemplateParams = {
      host: this.configService.host,
      title: "Let's start reading with",
      logoImageUri: this.emailLogoImageUri,
      intro: `안녕하세요!<br />
      ${nickname}, welcome aboard TTMIK Stories!<br /><br />
      You are all set now. Let's start reading!<br />
      Consistency is key to successful language learning.<br />
      Try to read at least one story each day, and we'll help you with the rest.<br />
      Are you ready? Let's go!`,
      button: 'Open TTMIK Stories',
      link: DYNAMICLINK_PAID,
      caption: '',
    };

    const html = await this._convertEJSToHtml(params);

    await this.awsService.sendEmail({
      addrs: [email],
      subject: params.title,
      data: html,
      dataType: 'html',
    });
  }

  async sendPasswordResetEmail(email: string, nickname: string, link: string) {
    const params: EmailTemplateParams = {
      host: this.configService.host,
      logoImageUri: this.emailLogoImageUri,
      title: 'Password reset instruction for TTMIK Stories',
      intro: `Hello, ${nickname}.<br />
      You have requested a password reset for your TTMIK account.<br /><br />
      Please click on this link to set a new password. If you haven't made this request,<br />
      you can ignore this email but we still recommend that you change your password regularly to keep your account secure.`,
      button: 'Reset Password',
      link: link,
      caption: `If you didn't sign up for TTMIK Stories through this email, please click here to delete your email address from out list. Thank you.`,
    };

    const html = await this._convertEJSToHtml(params);

    await this.awsService.sendEmail({
      addrs: [email],
      subject: params.title,
      data: html,
      dataType: 'html',
    });
  }

  async sendPasswordChangedEmail(
    email: string,
    nickname: string,
    resetLink: string,
  ) {
    const params: EmailTemplateParams = {
      host: this.configService.host,
      logoImageUri: this.emailLogoImageUri,
      title: 'Password changed for TTMIK Stories',
      intro: `Hello, ${nickname}.<br />
      Per your request, we have reset your password.<br /><br />
      Change date: ${dayjs().toISOString()}<br /><br />
      If you haven't changed the password yourself, please reset it now to make sure your account is secure.
       <a target="_blank" href=${resetLink}">Click here</a> to reset it.`,
      caption: '',
      link: '',
      button: '',
    };

    const html = await this._convertEJSToHtml(params);

    await this.awsService.sendEmail({
      addrs: [email],
      subject: params.title,
      data: html,
      dataType: 'html',
    });
  }

  async _convertEJSToHtml(params: EmailTemplateParams): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        'views/emails/template.ejs',
        params,
        {},
        function (err, html) {
          if (err) {
            reject(err);
          } else {
            resolve(html);
          }
        },
      );
    });
  }
}

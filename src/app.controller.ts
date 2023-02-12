import { Controller, Get, Query, Render } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorator/auth.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return 'Success';
  }

  @Get('email')
  @Public()
  @Render('emails/template')
  email(@Query('type') type: string) {
    const nickname = 'david';
    if (type === 'joined') {
      return {
        host: 'http://localhost:3000',
        title: "Let's start reading with",
        intro: `안녕하세요!<br />
        ${nickname}, welcome aboard TTMIK Stories!<br /><br />
        You are all set now. Let's start reading!<br />
        Consistency is key to successful language learning.<br />
        Try to read at least one story each day, and we'll help you with the rest.<br />
        Are you ready? Let's go!`,
        button: 'Open TTMIK Stories',
        caption: '',
        link: 'https://ttmik.com',
      };
    }
    if (type === 'password-changed') {
      const date = new Date();
      const resetLink = 'https://naver.com';
      return {
        host: 'http://localhost:3000',
        title: 'Password changed for TTMIK Stories',
        intro: `Hello, ${nickname}.<br />
        Per your request, we have reset your password.<br /><br />
        Change date: ${date}<br /><br />
        If you haven't changed the password yourself, please reset it now to make sure your account is secure.
         <a target="_blank" href=${resetLink}">Click here</a> to reset it.`,
        button: '',
        caption: ``,
        link: 'https://naver.com',
      };
    }
    return {
      host: 'http://localhost:3000',
      title: 'Password reset for TTMIK Stories',
      intro: `Hello, ${nickname}.<br />
      You have requested a password reset for your TTMIK account.<br /><br />
      Please click on this link to set a new password. If you haven't made this request,<br />
      you can ignore this email but we still recommend that you change your password regularly to keep your account secure.`,
      button: 'Reset Password',
      caption: `If you didn't sign up for TTMIK Stories through this email, please click here to delete your email address from out list. Thank you.`,
      link: 'https://naver.com',
    };
  }
}

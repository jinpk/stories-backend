// 이메일 인증요청 이벤트
export class VerifyEmailEvent {
  static event = 'verifiy.email';

  constructor(private _email: string, private _code: string) {}

  get code(): string {
    return this._code;
  }

  get email(): string {
    return this._email;
  }
}

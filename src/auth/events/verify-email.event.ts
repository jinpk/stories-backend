export class VerifyEmailEvent {
  static event = 'verifiy.email';

  private _email: string;
  private _link: string;

  constructor(email: string, link: string) {
    this._link = link;
    this._email = email;
  }

  get link(): string {
    return this._link;
  }

  get email(): string {
    return this._email;
  }
}

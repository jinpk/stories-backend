export class PasswordResetedEvent {
  static event = 'password.reseted';

  private _email: string;
  private _nickname: string;
  private _resetLink: string;

  constructor(email: string, nickname: string, resetLink: string) {
    this._email = email;
    this._nickname = nickname;
    this._resetLink = resetLink;
  }

  get email(): string {
    return this._email;
  }
  get nickname(): string {
    return this._nickname;
  }
  get resetLink(): string {
    return this._resetLink;
  }
}

export class PasswordResetEvent {
  static event = 'password.reset';

  private _email: string;
  private _nickname: string;
  private _link: string;

  constructor(email: string, nickname: string, link: string) {
    this._email = email;
    this._nickname = nickname;
    this._link = link;
  }

  get email(): string {
    return this._email;
  }

  get link(): string {
    return this._link;
  }

  get nickname(): string {
    return this._nickname;
  }
}

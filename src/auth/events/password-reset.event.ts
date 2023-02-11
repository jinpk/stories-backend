import { IsNotEmpty } from 'class-validator';

export class PasswordResetedEvent {
  static event = 'password.reseted';

  @IsNotEmpty()
  private _email: string;

  constructor(email: string) {
    this._email = email;
  }

  get email(): string {
    return this._email;
  }
}

export class PasswordResetEvent {
  static event = 'password.reset';

  @IsNotEmpty()
  private _email: string;

  @IsNotEmpty()
  private _link: string;

  constructor(email: string, link: string) {
    this._email = email;
    this._link = link;
  }

  get email(): string {
    return this._email;
  }

  get link(): string {
    return this._link;
  }
}

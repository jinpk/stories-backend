import { IsNotEmpty } from 'class-validator';

export class UserCreatedEvent {
  static event = 'users.created';

  private _userId: string;
  private _email: string;
  private _nickname: string;

  constructor(userId: string, email: string, nickname: string) {
    this._userId = userId;
    this._email = email;
    this._nickname = nickname;
  }

  get userId(): string {
    return this._userId;
  }

  get nickname(): string {
    return this._nickname;
  }

  get email(): string {
    return this._email;
  }
}

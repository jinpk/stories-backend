import { IsNotEmpty } from 'class-validator';

export class UserCreatedEvent {
  static event = 'users.created';

  @IsNotEmpty()
  private _userId: string;

  constructor(userId: string) {
    this._userId = userId;
  }

  get userId(): string {
    return this._userId;
  }
}

export enum SubscriptionTypes {
  Year = 'year',
  Month = 'month',
}

export enum SubscriptionStates {
  Pending = 'pending',
  Active = 'active',
  Expried = 'expired',
  Cancel = 'cancel',
}

export interface ItunesValidationResponse {
  status: number;
}
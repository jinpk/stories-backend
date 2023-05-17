export enum SubscriptionTypes {
  Year = 'year',
  Month = 'month',
}

export enum SubscriptionStates {
  Active = 'active',
  Expried = 'expired',
}

export interface ItunesValidationResponse {
  status: number;
}
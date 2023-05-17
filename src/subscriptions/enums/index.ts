export enum SubscriptionTypes {
  Year = 'year',
  Month = 'month',
}

export enum SubscriptionStates {
  Active = 'active',
  Expired = 'expired',
}

export interface ItunesValidationResponse {
  status: number;
}
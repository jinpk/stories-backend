export enum CouponTypes {
  Percent = 'percent',
  Amount = 'amount',
  Period = 'period',
}

export const CouponTypesLabel = {
  [CouponTypes.Percent]: '비율할인',
  [CouponTypes.Amount]: '금액할인',
  [CouponTypes.Period]: '기간연장',
};

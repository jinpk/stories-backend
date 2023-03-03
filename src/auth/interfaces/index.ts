export interface TTMIKJwtPayload {
  sub: number;
  iss: string;
  iat: number;
  isPremium: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
  exp: number;
}
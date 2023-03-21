export interface TTMIKJwtPayload {
  sub: number;
  iss: string;
  iat: number;
  isPremium: boolean;
  isAdmin: boolean;
  isVerify: boolean;
  name: string;
  email: string;
  exp: number;

  referer: 'talktomeinkorean' | 'ttmik-stories';
}

import { OAuthProviers } from '../enums';

export interface OAuthResult {
  provider: OAuthProviers;
  id: string;
  name: string;
  email: string;
}

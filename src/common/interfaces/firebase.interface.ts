import { DynamicLinkActions } from "../enums";

export interface DynamicLinkQuery {
  action: DynamicLinkActions;
  payload: string;
}

export interface PushParams {
  tokens: string[];
  title: string;
  message: string;
  payload?: object;
}

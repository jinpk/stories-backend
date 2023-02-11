export enum NotificationConfigTypes {
  Paymented = 'paymented',
  PrePayment = 'prepayment',
  Quiz = 'quiz',
  LevelUp = 'levelup',
  Reminder = 'reminder',
  AppConn = 'appconn',
}

export enum NotificationContexts {
  All = 'all',
  InApp = 'inapp',
  Push = 'push',
}

export const NotificationContextsLabel = {
  [NotificationContexts.All]: '전체',
  [NotificationContexts.InApp]: '인앱알림',
  [NotificationContexts.Push]: '푸시알림',
};

export enum NotificationSettingTypes {
  Promotion = 'promotion',
  Service = 'service',
  Study = 'study',
  Reminder = 'reminder',
}

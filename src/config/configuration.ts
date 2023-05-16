import { registerAs } from '@nestjs/config';


// 프로세스 시작시 받아온 env 정보를 프로세스 메모리로 할당함.
export default registerAs('app', () => ({
  host: process.env.HOST,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  ttmikJwtSecret: process.env.TTMIK_JWT_SECRET,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecret: process.env.AWS_SECRET_KEY,

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientId: process.env.FIREBASE_CLIENT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,


  googleAPIKey: process.env.GOOGLE_API_KEY,

  playConsoleClientEmail: process.env.PLAYCONSOLE_CLIENT_EMAIL,
  playConsolePrivateKey: process.env.PLAYCONSOLE_PRIVATE_KEY,
}));

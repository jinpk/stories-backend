import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecret: process.env.AWS_SECRET_KEY,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
}));

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecret: process.env.AWS_SECRET_KEY,
}));

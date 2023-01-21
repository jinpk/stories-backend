import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
}));

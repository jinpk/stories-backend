import { IntersectionType, PickType } from '@nestjs/swagger';
import { LoginDto, SignUpDto } from 'src/auth/dto';

export class CreateUserDto extends PickType(
  IntersectionType(SignUpDto, LoginDto),
  ['email', 'nickname', 'password'] as const,
) {}

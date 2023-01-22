import { ApiProperty } from '@nestjs/swagger';

export class AccountDto {
  @ApiProperty({})
  id: string;

  @ApiProperty({})
  email: string;

  @ApiProperty({})
  isAdmin: boolean;
}

import { Controller } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@ApiBasicAuth()
export class UsersController {}

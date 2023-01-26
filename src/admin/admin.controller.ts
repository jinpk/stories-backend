import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}
}

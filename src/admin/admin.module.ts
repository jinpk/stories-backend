import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    UsersModule,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

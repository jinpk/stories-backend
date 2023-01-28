import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => {
        const destFolderExist = existsSync('./uploads');
        if (!destFolderExist) {
          mkdirSync('./uploads');
        }

        return {
          storage: diskStorage({
            destination: function (req, file, cb) {
              cb(null, './uploads');
            },
            filename: function (req, file, cb) {
              const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(
                null,
                `${req.user['id']}-${uniqueSuffix}.${file.originalname
                  .split('.')
                  .pop()}`,
              );
            },
          }),
        };
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}

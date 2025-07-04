import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileHandler } from './handler/file-handler';
import {SupabaseModule} from '../../supabase/supabase.module';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  imports : [
    MulterModule.register({
      dest: './file',
    }), SupabaseModule
  ],
  controllers: [FileController],
  providers: [FileService, FileHandler , SupabaseService],
})
export class FileModule {}

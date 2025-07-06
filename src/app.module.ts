import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { FileModule } from './modules/file/file.module';
import { FileService } from './modules/file/file.service';
import { FileHandler } from './modules/file/handler/file-handler';
import {FileController} from './modules/file/file.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './response.interceptor';
import { SupabaseModule } from './supabase/supabase.module';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  controllers: [AppController, FileController],
  providers: [AppService, FileService, FileHandler,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    SupabaseService
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule, FileModule, SupabaseModule
  ],
})
export class AppModule {}

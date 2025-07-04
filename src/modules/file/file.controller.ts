import { Controller, Get, Post, Put, Delete , UseInterceptors, UploadedFile, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express } from 'express';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService
  ) {}

  // @Get()

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userID') userID: string,
    @Body('sectionID') sectionID: string,
  ) {
    return this.fileService.uploadFile(file, userID, sectionID);
  }

  @Delete(':fileID')
  deleteFile(@Param('fileID') filename: string) {
    return this.fileService.deleteFile(filename);
  }
}
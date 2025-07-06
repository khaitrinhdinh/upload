import { Controller, Get, Post, Put, Delete , UseInterceptors, UploadedFile, Param, Body, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express } from 'express';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService
  ) {}

  @Get(':fileID')
  async getFileById(@Param('fileID') fileID: string, @Res() res: Response) {
    const { stream, contentType, fileName } = await this.fileService.getFileById(fileID);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    stream.pipe(res);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userID') userID: string,
    @Body('sessionID') sessionID: string,
  ) {
    return this.fileService.uploadFile(file, userID, sessionID);
  }

  @Delete(':fileID')
  deleteFile(@Param('fileID') filename: string) {
    return this.fileService.deleteFile(filename);
  }
}
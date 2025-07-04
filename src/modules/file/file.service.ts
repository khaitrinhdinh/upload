import { Injectable } from '@nestjs/common';
import { FileHandler } from './handler/file-handler';

@Injectable()
export class FileService {
  constructor(private readonly fileHandler: FileHandler) {}

  async uploadFile(file: Express.Multer.File, userID: string, sectionID: string) {
    // Logic to process file
    return this.fileHandler.uploadFile(file, userID, sectionID);
  }

  async deleteFile(fileID: string) {
    // Logic to delete file
    return this.fileHandler.deleteFile(fileID);
  }
}

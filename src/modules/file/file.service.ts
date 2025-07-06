import { Injectable } from '@nestjs/common';
import { FileHandler } from './handler/file-handler';

@Injectable()
export class FileService {
  constructor(private readonly fileHandler: FileHandler) {}

  async getFileById(fileID: string) {
    // Logic to retrieve file by ID
    return this.fileHandler.getFileById(fileID);
  }

  async uploadFile(file: Express.Multer.File, userID: string, sessionID: string) {
    // Logic to process file
    return this.fileHandler.uploadFile(file, userID, sessionID);
  }

  async deleteFile(fileID: string) {
    // Logic to delete file
    return this.fileHandler.deleteFile(fileID);
  }

}

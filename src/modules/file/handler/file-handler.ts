import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import * as path from 'path';
import * as Minio from 'minio'
import { Loader } from '../loader/loader';

@Injectable()
export class FileHandler {
  private minioClient: Minio.Client;
  private readonly bucketName = 'ttnt';
  private readonly Loader: Loader;

  constructor(private readonly supabaseService: SupabaseService,) {
    // Khởi tạo S3Client
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'admin123',
    });
    this.Loader = new Loader(); 

  }

  async uploadFile(file: Express.Multer.File, userID: string, conversationID: string): Promise<string> {
    // Kiểm tra lại định dạng tệp hợp lệ
    this.validateFileExtension(file.originalname);

    // Tạo 1 fileID để làm id cho file

    // Tạo cấu trúc của Table File
    const fileTable ={
      title: file.originalname,
    }

    try {
      // upload file lên postgres
      console.log('Insert file to postgres:', fileTable);
      const reponse = await this.supabaseService.insertData('FILE', fileTable);
      console.log ('Insert file to postgres:', reponse);
      const fileID = reponse[0].id; // Lấy id của file vừa insert
      // Tạo cấu trúc của Table Upload
      const uploadTable = {
        fileID: fileID,
        conversationID: conversationID,
        timestamp: new Date(),
      }

      // Tạo metadata theo định dạng: {'userID': 'any', 'conversationID': 'any', 'fileID': 'any', 'createdAt': 'any'}
      const metadata = {
        'fileID': fileID,
        'createdAt': new Date().toISOString(),
        'userID': userID,
        'sectionID': conversationID,
      };

      await this.supabaseService.insertData('UPLOAD', uploadTable);

      // Tải tệp lên min.io
      await this.minioClient.putObject(this.bucketName, file.originalname, file.buffer, file.size,metadata);
      
      // Tải tệp lên unstract
      const unstructResponse = await this.Loader.unstructLoader(file);

      // Tải unstruct response lên webhook để ghi vào astradb
      await this.Loader.webhookLoader(unstructResponse, userID, conversationID, fileID);
      return fileID;
    }catch(error){
      throw new InternalServerErrorException('Upload file failed', error);
    }
  }
  
  validateFileExtension(fileName: string): void {
    const fileExt = path.extname(fileName);
    const supportedExtensions = ['.jpg', '.jpeg','.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
    if (!supportedExtensions.includes(fileExt)) {
      throw new InternalServerErrorException(
        `Unsupported file extension: ${fileExt}. Supported extensions: ${supportedExtensions.join(', ')}`,
      );
    }
  }
  
  async deleteFile(fileID: string): Promise<void> {
    // xóa file trên min.io
    try {
      // Gọi delete trên supabase để xóa file
      const deleteResponse = await this.supabaseService.deleteData('FILE', 'id', fileID);
      console.log ('Delete file from postgres:', deleteResponse);

      // const deleteUploadResponse = await this.supabaseService.deleteData('UPLOAD', 'fileID', fileID);
      // console.log ('Delete upload from postgres:', deleteUploadResponse);

      // Liệt kê tất cả các đối tượng trong bucket
      const objects = await this.minioClient.listObjectsV2(this.bucketName, '', true);

      // Tìm đối tượng có metadata chứa fileID
      for await (const obj of objects) {
        const stat = await this.minioClient.statObject(this.bucketName, obj.name);
        if (stat.metaData['fileid'] === fileID) {
          await this.minioClient.removeObject(this.bucketName, obj.name);

          //console tên của file mới xóa
          console.log(`Đã xóa tệp: ${obj.name}`);
          return ;
        }
      }

      // xóa file trên astradb
      await this.Loader.astradbDelete(fileID);

      throw new InternalServerErrorException(`Không tìm thấy tệp với fileID: ${fileID}`);
    } catch (error) {
      console.error('Lỗi khi xóa tệp:', error);
      throw new InternalServerErrorException(`Không thể xóa tệp: ${error.message}`);
    }
  }
}

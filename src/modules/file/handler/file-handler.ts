import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../../supabase/supabase.service';
import * as path from 'path';
import * as Minio from 'minio'
import { Loader } from '../loader/loader';

@Injectable()
export class FileHandler {
  private minioClient: Minio.Client;
  private readonly bucketName = 'ttnt';
  private readonly Loader: Loader;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    // Khởi tạo S3Client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: Number(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    this.Loader = new Loader(this.configService); 
    
  }

  async getFileById(fileID: string) {
    try {
      // Liệt kê tất cả các đối tượng trong bucket
      const objects = await this.minioClient.listObjectsV2(this.bucketName, '', true);

      for await (const obj of objects) {

        // Lấy thông tin metadata của đối tượng
        const stat = await this.minioClient.statObject(this.bucketName, obj.name);
        const contentType = stat.metaData['content-type'] || 'application/octet-stream';
        const stream = await this.minioClient.getObject(this.bucketName, obj.name);
        return { stream, contentType, fileName: obj.name };
      }
      throw new InternalServerErrorException(`Không tìm thấy tệp với fileID: ${fileID}`);
    } catch (error) {
      throw new InternalServerErrorException(`Không thể lấy file: ${error.message}`);
    }
  }

  async uploadFile(file: Express.Multer.File, userID: string, sessionID: string): Promise<string> {
    // Kiểm tra lại định dạng tệp hợp lệ
    this.validateFileExtension(file.originalname);

    // Tạo cấu trúc của Table File
    const fileTable ={
      title: file.originalname,
    }

    try {
      // upload file lên postgres
      const reponse = await this.supabaseService.insertData('FILE', fileTable);
      const fileID = reponse[0].id;
      // Tạo cấu trúc của Table Upload
      const uploadTable = {
        fileID: fileID,
        sessionID: sessionID,
        timestamp: new Date(),
      }

      // Tạo metadata theo định dạng: {'userID': 'any', 'sessionID': 'any', 'fileID': 'any', 'createdAt': 'any'}
      const metadata = {
        'fileID': fileID,
        'createdAt': new Date().toISOString(),
        'userID': userID,
        'sectionID': sessionID,
      };

      // await this.supabaseService.insertData('UPLOAD', uploadTable);

      // Tải tệp lên min.io
      await this.minioClient.putObject(this.bucketName, file.originalname, file.buffer, file.size,metadata);
      
      // Tải tệp lên unstract
      const unstructResponse = await this.Loader.unstructLoader(file);

      // Tải unstruct response lên webhook để ghi vào astradb
      await this.Loader.webhookLoader(unstructResponse, userID, sessionID, fileID);
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
      await this.supabaseService.deleteData('FILE', 'id', fileID);
      await this.supabaseService.deleteData('UPLOAD', 'fileID', fileID);
      // // xóa file trên astradb
      await this.Loader.astradbDelete(fileID);

     
      
      // xóa file trên min.io
      // Liệt kê tất cả các đối tượng trong bucket
      const objects = await this.minioClient.listObjectsV2(this.bucketName, '', true);

      // Tìm đối tượng có metadata chứa fileID
      for await (const obj of objects) {
        const stat = await this.minioClient.statObject(this.bucketName, obj.name);
        if (stat.metaData['fileid'] === fileID) {
          await this.minioClient.removeObject(this.bucketName, obj.name);

          //console tên của file mới xóa
          return ;
        }
      }

      throw new InternalServerErrorException(`Không tìm thấy tệp với fileID: ${fileID}`);
    } catch (error) {
      console.error('Lỗi khi xóa tệp:', error);
      throw new InternalServerErrorException(`Không thể xóa tệp: ${error.message}`);
    }
  }
}

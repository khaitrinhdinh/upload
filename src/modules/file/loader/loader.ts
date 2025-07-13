import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { DataAPIClient } from "@datastax/astra-db-ts";

@Injectable()
export class Loader {
    private readonly httpService: HttpService;
    constructor(
        private readonly configService: ConfigService
    ) {
        // Khởi tạo HttpService
        this.httpService = new HttpService();
    }

    //load file lên unstruct và trả về json
    async unstructLoader(file: Express.Multer.File) {

        const formData = new FormData();
        formData.append('files', file.buffer, { filename: file.originalname });
        formData.append('timeout', `300`);
        formData.append('include_metadata', `false`);

        const headers = {
        Authorization: `Bearer ${this.configService.get<string>('UNSTRUCT_TOKEN')}`,
        ...formData.getHeaders(),
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.configService.get<string>('UNSTRUCT_URL') ?? '',
                    formData,
                    { headers }
                )
            );
            return response.data.message.result[0].result.output.ttnt_1;
        } catch (error) {
            throw new Error(`Không thể tải tệp lên: ${error.message}`);
        }
    }   

    //load file lên webhook và trả về json
    async webhookLoader(file: string, userID: string, spaceID: string, fileID: string, sessionID: string) {
        const formData = new FormData();
       
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.configService.get<string>('LANGFLOW_TOKEN')}`,
        };
        const payload = {
            data: file,
            userID: userID,
            spaceID: spaceID,
            fileID: fileID,
            sessionID: sessionID
        };
        console
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.configService.get<string>('LANGFLOW_WEBHOOK_URL') ?? '',
                    payload,
                    { headers }
                )
            );
            return response.data;
        } catch (error) {
            throw new Error(`Không thể tải text lên webhook: ${error.message}`);
        }
       
    }

    async astradbDelete(fileID: string): Promise<void> {
      const fileIDStringToNumber = +fileID;
      const client = new DataAPIClient(this.configService.get<string>('ASTRA_TOKEN'));
      const database = client.db(this.configService.get<string>('ASTRA_DB_URL') ?? '');
      const collection = database.collection(this.configService.get<string>('ASTRA_COLLECTION') ?? '');
      // Delete all row where fileID = fileID
      (async function () {

        const result = await collection.deleteMany({
            "metadata.fileID": {"$eq": fileIDStringToNumber}
        });

        console.log(result);
      })();
    }
    

}   
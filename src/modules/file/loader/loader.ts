import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { DataAPIClient } from "@datastax/astra-db-ts";

@Injectable()
export class Loader {
    private readonly httpService: HttpService;
    constructor() {
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
        Authorization: `Bearer ${'e5f0a61d-484d-408c-9cff-6a09e6221079'}`,
        ...formData.getHeaders(),
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                'https://us-central.unstract.com/deployment/api/org_aGknKCX3UIlRUmKV/tnnt/',
                formData,
                { headers }
                )
            );
            return response.data.message.result[0].result.output.TNNT;
        } catch (error) {
            throw new Error(`Không thể tải tệp lên: ${error.message}`);
        }
    }   

    //load file lên webhook và trả về json
    async webhookLoader(file: string, userID: string, sectionID: string, fileID: string) {
        const formData = new FormData();
       
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${'AstraCS:fNrfwRiDIoHqWFCHezApzRKc:670e413b3d0c2e8533595d9e0e861dd37d65b19f50c4a2b040d0196a1b79a6ae'}`,
        };
        const payload = {
            data: file,
            userID: userID,
            sectionID: sectionID,
            fileID: fileID,
        };
        console
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    'https://api.langflow.astra.datastax.com/lf/2da59bef-80d5-4816-9a3b-bd6790a28953/api/v1/webhook/f7ef163f-a3de-405b-a6bb-3153cde52d04',
                    payload,
                    { headers }
                )
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            throw new Error(`Không thể tải text lên webhook: ${error.message}`);
        }
       
    }

    async astradbDelete(fileID: string): Promise<void> {

      const client = new DataAPIClient("AstraCS:CbxFyLJeHnKalXICgKexvZOa:48ce5d46efb8db0e7854639ad18925745732499d14bed9bf8d882a4f118196e4");
      const database = client.db("https://dd83e6e8-6a92-4e27-980a-b403bf7eabde-us-east-2.apps.astra.datastax.com");
      const collection = database.collection("test");

      // Delete all row where fileID = fileID
      (async function () {
        const result = await collection.deleteMany({
            "metadata.fileID": {"$eq": fileID}
        });

        console.log(result);
      })();
    }
    

}
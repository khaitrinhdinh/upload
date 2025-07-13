import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';


@Injectable()
export class PlaygroundService {
  constructor(
    private http: HttpService,
    private readonly configService: ConfigService
  ) {}

  async sendToWebhookPlayground(
    sessionID: string , 
    userID: string, 
    spaceID: string, 
    text: string,
    type: string
  ): Promise<any> {

    const webhookUrl = this.configService.get<string>('WEBHOOK_URL') || "";

    const payload = {
      "output_type": "chat",
      "tweaks": {}
    };

    payload.tweaks[this.configService.get<string>('WEBHOOK_COMPONENT_ID') || ''] = {
      "data": JSON.stringify({ type, text, userID, sessionID, spaceID })
    };

    const response = await lastValueFrom(
        this.http.post(webhookUrl, payload, {
          headers: { 
            'Content-Type': 'application/json' ,
          },
    }));
    return response.data.outputs[0].outputs[0].results.message.data;
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { PlaygroundService } from './playground.service';

@Controller('playground')
export class PlaygroundController {
  constructor(private svc: PlaygroundService    ) {}

  @Post('run')
  async runPipeline(
    @Body('sessionID') sessionID: string,
    @Body('userID') userID: string,
    @Body('spaceID') spaceID: string,
    @Body('text') text: string,
    @Body('type') type: string,
  ) {
    const result = await this.svc.sendToWebhookPlayground(sessionID, userID, spaceID, text, type);
    const reponse_text = JSON.parse(result.text)
    return { sessionID: result.session_id, userID: reponse_text.user_id, spaceID: reponse_text.space_id ,text: reponse_text.text };
  }
}

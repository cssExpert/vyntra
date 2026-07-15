import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreAIService, type ChatMessage } from '../services/ai.service';

@Controller('store/ai')
@UseGuards(JwtAuthGuard)
export class StoreAIController {
  constructor(private aiService: StoreAIService) {}

  @Post('chat')
  async chat(
    @Body('messages') messages: ChatMessage[],
    @Body('model') model?: string,
  ) {
    if (!messages?.length) {
      throw new BadRequestException('messages array is required');
    }
    const content = await this.aiService.chat(messages, model);
    return { content };
  }
}

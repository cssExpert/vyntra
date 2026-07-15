import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class StoreAIService {
  constructor(private config: ConfigService) {}

  private get apiKey(): string | undefined {
    return this.config.get<string>('ANTHROPIC_API_KEY');
  }

  async chat(messages: ChatMessage[], model?: string): Promise<string> {
    const key = this.apiKey;
    if (!key) {
      throw new ServiceUnavailableException(
        'AI assistant is not configured. Add ANTHROPIC_API_KEY to your environment.',
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model ?? 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system:
          'You are a helpful store management AI assistant. You help store owners analyze data, manage products, handle orders, and grow their business. Be concise and actionable.',
        messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ServiceUnavailableException(`AI API error: ${response.status} ${body}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    if (!text) {
      throw new ServiceUnavailableException('Unexpected response from AI API');
    }
    return text;
  }
}

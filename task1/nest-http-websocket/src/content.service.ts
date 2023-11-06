// content.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
  private contentMap = new Map<string, string>(); // Соответствие URL и контента

  saveContent(url: string, content: string): void {
    // Сохранить контент в соответствии с URL
    this.contentMap.set(url, content);
  }

  getContent(url: string): string | undefined {
    // Получить контент по URL
    return this.contentMap.get(url);
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class DataService {
  private contentMap = new Map<string, string>(); // Соответствие URL и контента

  // Другие методы для работы с данными, например, добавление и получение контента по URL
}
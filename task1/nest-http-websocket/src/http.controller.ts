import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HttpController {
  @Get()
  getHello(): string {
    return 'https://ya.ru';
  }
}
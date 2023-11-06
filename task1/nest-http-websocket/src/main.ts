import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as WebSocket from 'ws';
import { KeywordsService } from './keywords.service'; 
async function bootstrap() {
  // Создаем Nest.js приложение
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка CORS
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
  });

  // Создаем HTTP сервер на основе Nest.js приложения
  const httpServer = app.getHttpServer();
 // Создаем WebSocket сервер на основе HTTP сервера
 const wss = new WebSocket.Server({ server: httpServer, path: '/keywords' });
 // Получаем экземпляр KeywordsService из контейнера Nest.js
 const keywordsService = app.get(KeywordsService);
 wss.on('connection', (socket, req) => {
   // Используйте метод обработки WebSocket соединения из KeywordsService
   keywordsService.handleWebSocketConnection(socket, req);
 });
  
  
  
  // Настраиваем адаптер WebSocket
  app.useWebSocketAdapter(new IoAdapter(wss));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}

bootstrap();
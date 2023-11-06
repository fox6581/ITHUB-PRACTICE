// keywords.service.ts
import { Injectable } from '@nestjs/common';
import { Worker } from 'worker_threads';

import axios from 'axios'; 
@Injectable()
export class KeywordsService {
  private readonly data = [
    { keyword: '1', urls: [ 'http://gas-kvas.com/uploads/posts/2023-02/1675489758_gas-kvas-com-p-izobrazheniya-i-kartinki-na-fonovii-risuno-41.jpg','http://u.9111s.ru/uploads/202112/06/235ec4f67bf4056c9071fd211089bd17.jpg' ]},
    { keyword: '2', urls: ['http://gas-kvas.com/uploads/posts/2023-02/1675489758_gas-kvas-com-p-izobrazheniya-i-kartinki-na-fonovii-risuno-41.jpg'] },
    { keyword: '3', urls: ['http://u.9111s.ru/uploads/202112/06/235ec4f67bf4056c9071fd211089bd17.jpg'] },
  ];

  private workerPool: Worker[] = [];


  async handleWebSocketConnection(socket, req) {
    socket.on('message', (message) => {
      if (typeof message === 'string') {
        const keyword = message.trim();
        this.processMessage(socket, keyword);
      } else if (message instanceof Buffer) {
        const binaryData = message.toString('utf-8');
        this.processMessage(socket, binaryData);
      } else {
        console.log('Получено неподдерживаемое сообщение:', message);
      }
    });

    socket.on('close', () => {
      console.log('WebSocket соединение закрыто');
    });
  }

  private processMessage(socket, message) {
    const urlData = this.data.find(item => item.keyword === message);
  
    if (urlData) {
      socket.send(JSON.stringify(urlData.urls));
    } else {
      const availableWorker = this.workerPool.shift();
      if (availableWorker) {
        availableWorker.postMessage({ action: 'download', url: message }); // Отправляем сообщение о скачивании
        availableWorker.on('message', (content) => {
          socket.send(JSON.stringify(content));
          // Возвращаем рабочего в пул после обработки
          this.workerPool.push(availableWorker);
        });
      } else {
        console.log('Достигнуто максимальное количество потоков.');
      }
    }
  }

  private async downloadContent(worker, url) {
    try {
      const response = await axios.get(url); // Используем axios для скачивания контента
      const content = response.data;
      worker.postMessage(content);
    } catch (error) {
      console.error('Ошибка при скачивании контента:', error);
      worker.postMessage(null); // Отправляем null в случае ошибки
    }
  }
}

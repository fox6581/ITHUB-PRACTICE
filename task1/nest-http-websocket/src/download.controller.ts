import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { DownloadService } from './download.service';
import * as http from 'http';
import { DataService } from './data.service';
import config from './config';
@Controller()
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}


  @Get('config/download-limit')
  getDownloadLimit() {
    return { downloadLimit: config.downloadLimit };
  }

  @Get('config/byte-limit-per-second')
  getByteLimitPerSecond() {
    return { byteLimitPerSecond: config.byteLimitPerSecond };
  }
  @Get('download/:url') // Эндпоинт теперь принимает параметр :url
  async downloadFile(@Param('url') url: string, @Res() res: Response) {
    const timestamp = new Date().getTime();

    const downloadPath = 'Download/file_${timestamp}.jpg';
    

    try {
      // Вызываем метод downloadFile из DownloadService для скачивания файла
      await this.downloadService.downloadFile(url, downloadPath);

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-disposition', `attachment; filename=file_${timestamp}.jpg`);
      res.setHeader('Content-type', 'image/jpeg');

      console.log(`Setting Content-Disposition header to: attachment; filename=file_${timestamp}.jpg`);
      console.log(`Sending file from path: ${downloadPath}`);
      
      // Отправляем файл напрямую в ответ с помощью http.get
      http.get(url, (fileResponse) => {
        fileResponse.pipe(res);
      });
    } catch (error) {
      console.error(`Error downloading file: ${error}`);
      res.status(500).send('Internal server error');
    }
  }
}

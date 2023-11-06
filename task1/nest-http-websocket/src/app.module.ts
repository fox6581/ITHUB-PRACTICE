import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeywordsService } from './keywords.service';

import { DownloadService } from './download.service';
import { ContentService } from './content.service'; 
import { DownloadController } from './download.controller'
@Module({
  imports: [],
  controllers: [AppController,DownloadController],
  providers: [AppService,   KeywordsService, DownloadService, ContentService],
})
export class AppModule {}

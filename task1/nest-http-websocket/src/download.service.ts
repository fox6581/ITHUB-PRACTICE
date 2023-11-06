import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { Throttle } from 'stream-throttle';
import config from './config';

const pipeline = promisify(stream.pipeline);
const pLimit = require('p-limit');
const tempFilePaths = [];
@Injectable()
export class DownloadService {
    private readonly logger = new Logger(DownloadService.name);

    async downloadFile(url: string, downloadPath: string): Promise<void> {
        const response = await axios.head(url);
        const fileSize = parseInt(response.headers['content-length'], 10);

        this.logger.log(`Downloading file from ${url}, Size: ${fileSize} bytes`);
        // Используйте новый путь для временных файлов
        const tempDir = path.join(__dirname, '..', 'temp'); // Путь к каталогу temp
        
        const size_limit = config.downloadLimit;;
        const limit = pLimit(size_limit);
        let downloadedBytes = 0;
        const partSize = Math.ceil(fileSize / size_limit);

        const finalFilePath = path.join(__dirname, '..', '..', downloadPath);
        const finalFile = fs.createWriteStream(finalFilePath);

        while (downloadedBytes < fileSize) {
            const streams = [];

            for (let i = 0; i < size_limit; i++) {
                if (downloadedBytes >= fileSize) {
                    break;
                }

                const endByte = Math.min(downloadedBytes + partSize - 1, fileSize - 1);

                streams.push(
                    limit(async () => {
                        try {
                            const offset = downloadedBytes;
                            const range = `bytes=${offset}-${endByte}`;

                            const response = await axios.get(url, {
                                headers: {
                                    Range: range,
                                },
                                responseType: 'stream',
                            });

                            const tempFilePath = path.join(tempDir, `temp_${offset}_${endByte}.jpg`); // Путь для временных файлов
                            
                            const throttle = new Throttle({ rate: config.byteLimitPerSecond }); 
                            const writer = fs.createWriteStream(tempFilePath);
                            response.data.pipe(throttle).pipe(writer);
            
                            await pipeline(response.data, writer);
                            this.logger.log(`Downloaded part ${offset}-${endByte}`);
                            return tempFilePath;
                        } catch (error) {
                            if (error.response && error.response.status === 416) {
                                // Обработка ошибки 416 (закончился диапазон)
                                this.logger.log(`Reached the end of the file: ${downloadedBytes}-${endByte}`);
                                return null; // Возвращаем null, чтобы показать, что часть файла скачана до конца
                            } else {
                                // Другие ошибки
                                this.logger.error(`Error downloading part ${downloadedBytes}-${endByte}: ${error.message}`);
                                throw error;
                            }
                       
                       
                        }
                    })
                );

                downloadedBytes += partSize;
            }

            const downloadedParts = await Promise.all(streams);

            for (const partPath of downloadedParts) {
                if (partPath !== null) {
                    tempFilePaths.push(partPath); // Добавляем путь к временному файлу в массив
                    const partStream = fs.createReadStream(partPath);
                    await pipeline(partStream, finalFile);
                } else {
                    break;
                }
            }
            
        }

        this.logger.log(`File downloaded to ${finalFilePath}`);
    }
}

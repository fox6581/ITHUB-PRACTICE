"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DownloadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const util_1 = require("util");
const stream_throttle_1 = require("stream-throttle");
const config_1 = require("./config");
const pipeline = (0, util_1.promisify)(stream.pipeline);
const pLimit = require('p-limit');
const tempFilePaths = [];
let DownloadService = DownloadService_1 = class DownloadService {
    constructor() {
        this.logger = new common_1.Logger(DownloadService_1.name);
    }
    async downloadFile(url, downloadPath) {
        const response = await axios_1.default.head(url);
        const fileSize = parseInt(response.headers['content-length'], 10);
        this.logger.log(`Downloading file from ${url}, Size: ${fileSize} bytes`);
        const tempDir = path.join(__dirname, '..', 'temp');
        const size_limit = config_1.default.downloadLimit;
        ;
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
                streams.push(limit(async () => {
                    try {
                        const offset = downloadedBytes;
                        const range = `bytes=${offset}-${endByte}`;
                        const response = await axios_1.default.get(url, {
                            headers: {
                                Range: range,
                            },
                            responseType: 'stream',
                        });
                        const tempFilePath = path.join(tempDir, `temp_${offset}_${endByte}.jpg`);
                        const throttle = new stream_throttle_1.Throttle({ rate: config_1.default.byteLimitPerSecond });
                        const writer = fs.createWriteStream(tempFilePath);
                        response.data.pipe(throttle).pipe(writer);
                        await pipeline(response.data, writer);
                        this.logger.log(`Downloaded part ${offset}-${endByte}`);
                        return tempFilePath;
                    }
                    catch (error) {
                        if (error.response && error.response.status === 416) {
                            this.logger.log(`Reached the end of the file: ${downloadedBytes}-${endByte}`);
                            return null;
                        }
                        else {
                            this.logger.error(`Error downloading part ${downloadedBytes}-${endByte}: ${error.message}`);
                            throw error;
                        }
                    }
                }));
                downloadedBytes += partSize;
            }
            const downloadedParts = await Promise.all(streams);
            for (const partPath of downloadedParts) {
                if (partPath !== null) {
                    tempFilePaths.push(partPath);
                    const partStream = fs.createReadStream(partPath);
                    await pipeline(partStream, finalFile);
                }
                else {
                    break;
                }
            }
        }
        this.logger.log(`File downloaded to ${finalFilePath}`);
    }
};
exports.DownloadService = DownloadService;
exports.DownloadService = DownloadService = DownloadService_1 = __decorate([
    (0, common_1.Injectable)()
], DownloadService);
//# sourceMappingURL=download.service.js.map
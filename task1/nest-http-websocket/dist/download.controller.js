"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadController = void 0;
const common_1 = require("@nestjs/common");
const download_service_1 = require("./download.service");
const http = require("http");
const config_1 = require("./config");
let DownloadController = class DownloadController {
    constructor(downloadService) {
        this.downloadService = downloadService;
    }
    getDownloadLimit() {
        return { downloadLimit: config_1.default.downloadLimit };
    }
    getByteLimitPerSecond() {
        return { byteLimitPerSecond: config_1.default.byteLimitPerSecond };
    }
    async downloadFile(url, res) {
        const timestamp = new Date().getTime();
        const downloadPath = 'Download/file_${timestamp}.jpg';
        try {
            await this.downloadService.downloadFile(url, downloadPath);
            res.setHeader('Content-disposition', `attachment; filename=file_${timestamp}.jpg`);
            res.setHeader('Content-type', 'image/jpeg');
            console.log(`Setting Content-Disposition header to: attachment; filename=file_${timestamp}.jpg`);
            console.log(`Sending file from path: ${downloadPath}`);
            http.get(url, (fileResponse) => {
                fileResponse.pipe(res);
            });
        }
        catch (error) {
            console.error(`Error downloading file: ${error}`);
            res.status(500).send('Internal server error');
        }
    }
};
exports.DownloadController = DownloadController;
__decorate([
    (0, common_1.Get)('config/download-limit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DownloadController.prototype, "getDownloadLimit", null);
__decorate([
    (0, common_1.Get)('config/byte-limit-per-second'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DownloadController.prototype, "getByteLimitPerSecond", null);
__decorate([
    (0, common_1.Get)('download/:url'),
    __param(0, (0, common_1.Param)('url')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "downloadFile", null);
exports.DownloadController = DownloadController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [download_service_1.DownloadService])
], DownloadController);
//# sourceMappingURL=download.controller.js.map
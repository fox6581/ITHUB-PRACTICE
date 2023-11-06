"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let KeywordsService = class KeywordsService {
    constructor() {
        this.data = [
            { keyword: '1', urls: ['http://gas-kvas.com/uploads/posts/2023-02/1675489758_gas-kvas-com-p-izobrazheniya-i-kartinki-na-fonovii-risuno-41.jpg', 'http://u.9111s.ru/uploads/202112/06/235ec4f67bf4056c9071fd211089bd17.jpg'] },
            { keyword: '2', urls: ['http://gas-kvas.com/uploads/posts/2023-02/1675489758_gas-kvas-com-p-izobrazheniya-i-kartinki-na-fonovii-risuno-41.jpg'] },
            { keyword: '3', urls: ['http://u.9111s.ru/uploads/202112/06/235ec4f67bf4056c9071fd211089bd17.jpg'] },
        ];
        this.workerPool = [];
    }
    async handleWebSocketConnection(socket, req) {
        socket.on('message', (message) => {
            if (typeof message === 'string') {
                const keyword = message.trim();
                this.processMessage(socket, keyword);
            }
            else if (message instanceof Buffer) {
                const binaryData = message.toString('utf-8');
                this.processMessage(socket, binaryData);
            }
            else {
                console.log('Получено неподдерживаемое сообщение:', message);
            }
        });
        socket.on('close', () => {
            console.log('WebSocket соединение закрыто');
        });
    }
    processMessage(socket, message) {
        const urlData = this.data.find(item => item.keyword === message);
        if (urlData) {
            socket.send(JSON.stringify(urlData.urls));
        }
        else {
            const availableWorker = this.workerPool.shift();
            if (availableWorker) {
                availableWorker.postMessage({ action: 'download', url: message });
                availableWorker.on('message', (content) => {
                    socket.send(JSON.stringify(content));
                    this.workerPool.push(availableWorker);
                });
            }
            else {
                console.log('Достигнуто максимальное количество потоков.');
            }
        }
    }
    async downloadContent(worker, url) {
        try {
            const response = await axios_1.default.get(url);
            const content = response.data;
            worker.postMessage(content);
        }
        catch (error) {
            console.error('Ошибка при скачивании контента:', error);
            worker.postMessage(null);
        }
    }
};
exports.KeywordsService = KeywordsService;
exports.KeywordsService = KeywordsService = __decorate([
    (0, common_1.Injectable)()
], KeywordsService);
//# sourceMappingURL=keywords.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const WebSocket = require("ws");
const keywords_service_1 = require("./keywords.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        allowedHeaders: '*',
        origin: '*',
    });
    const httpServer = app.getHttpServer();
    const wss = new WebSocket.Server({ server: httpServer, path: '/keywords' });
    const keywordsService = app.get(keywords_service_1.KeywordsService);
    wss.on('connection', (socket, req) => {
        keywordsService.handleWebSocketConnection(socket, req);
    });
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(wss));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
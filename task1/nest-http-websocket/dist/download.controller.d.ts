import { Response } from 'express';
import { DownloadService } from './download.service';
export declare class DownloadController {
    private readonly downloadService;
    constructor(downloadService: DownloadService);
    getDownloadLimit(): {
        downloadLimit: number;
    };
    getByteLimitPerSecond(): {
        byteLimitPerSecond: number;
    };
    downloadFile(url: string, res: Response): Promise<void>;
}

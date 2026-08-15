import { Request, Response, NextFunction } from "express";
import {
  cleanupBackup,
  createInventoryBackup,
} from "./backup.service.js";

export const backupController = {
  async download(req: Request, res: Response, next: NextFunction) {
    let backupFilePath: string | null = null;

    try {
      const backup = await createInventoryBackup();

      backupFilePath = backup.filePath;

      res.download(
        backup.filePath,
        backup.fileName,
        async (error) => {
          if (backupFilePath) {
            await cleanupBackup(backupFilePath);
          }

          if (error && !res.headersSent) {
            next(error);
          }
        },
      );
    } catch (error) {
      next(error);
    }
  },
};
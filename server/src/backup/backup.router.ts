import { Router } from "express";
import { backupController } from "./backup.controller.js";

const router = Router();

router.get("/", (req, res, next) =>
  backupController.download(req, res, next),
);

export default router;
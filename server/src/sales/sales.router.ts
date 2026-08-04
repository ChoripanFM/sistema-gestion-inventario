import { Router } from "express";
import { salesController } from "./sales.controller.js";

const router = Router();

router.post("/", (req, res, next) => salesController.process(req, res, next));

export default router;

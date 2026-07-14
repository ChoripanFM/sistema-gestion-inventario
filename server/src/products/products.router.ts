import { Router } from "express";
import { productsController } from "./products.controller.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/", (req, res, next) => productsController.getAll(req, res, next));
router.get("/:id", (req, res, next) =>
  productsController.getById(req, res, next),
);
router.post("/", upload.single("image"), (req, res, next) =>
  productsController.create(req, res, next),
);
router.put("/:id", upload.single("image"), (req, res, next) =>
  productsController.update(req, res, next),
);
router.delete("/:id", (req, res, next) =>
  productsController.delete(req, res, next),
);

export default router;

import { Request, Response, NextFunction } from "express";
import { salesService } from "./sales.service.js";

export const salesController = {
  process(req: Request, res: Response, next: NextFunction) {
    try {
      salesService.process(req.body);
      res.status(200).json({ message: "Venta procesada correctamente" });
    } catch (error) {
      next(error);
    }
  },
};

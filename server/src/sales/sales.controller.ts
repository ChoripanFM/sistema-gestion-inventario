import { Request, Response, NextFunction } from "express";
import { salesService } from "./sales.service.js";

export const salesController = {
  process(req: Request, res: Response, next: NextFunction) {
    try {
      const result = salesService.process(req.body);

      res.status(200).json({ message: "Venta procesada correctamente",
        saleId: result.saleId,
        total: result.total,
       });
    } catch (error) {
      next(error);
    }
  },

  history(req: Request, res: Response, next: NextFunction) {
    try {
      const result = salesService.getHistory();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

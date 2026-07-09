import { NextFunction, Request, Response } from "express";
import { productsService } from "./products.service.js";

export const productsController = {
  getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId } = req.query;
      const products = productsService.getAll(
        search as string,
        categoryId ? Number(categoryId) : undefined,
      );
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = productsService.getById(Number(req.params.id));
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, sku, price, stock, category_id } = req.body;
      const result = productsService.create({
        name,
        description,
        sku,
        price,
        stock,
        category_id,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, sku, price, stock, category_id } = req.body;
      const result = productsService.update(Number(req.params.id), {
        name,
        description,
        sku,
        price,
        stock,
        category_id,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  delete(req: Request, res: Response, next: NextFunction) {
    try {
      productsService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

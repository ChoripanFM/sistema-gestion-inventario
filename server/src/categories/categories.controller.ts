import { NextFunction, Request, Response } from "express";
import { categoriesService } from "./categories.service.js";

export const categoriesController = {
  getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = categoriesService.getAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = categoriesService.getById(Number(req.params.id));
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const result = categoriesService.create(name, description);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const result = categoriesService.update(
        Number(req.params.id),
        name,
        description,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const deleteProducts = req.query.deleteProducts === "true";
      categoriesService.delete(id, deleteProducts);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

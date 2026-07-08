import { Request, Response } from "express";
import { categoriesService } from "./categories.service.js";

export const categoriesController = {
  getAll(req: Request, res: Response) {
    const categories = categoriesService.getAll();
    res.json(categories);
  },

  getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const category = categoriesService.getById(id);

    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }

    res.json(category);
  },

  create(req: Request, res: Response) {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Se requiere el nombre" });
      return;
    }

    const result = categoriesService.create(name, description);
    res.status(201).json(result);
  },

  update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Se requiere el nombre" });
      return;
    }

    const result = categoriesService.update(id, name, description);
    res.json(result);
  },

  delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    categoriesService.delete(id);
    res.status(204).send();
  },
};

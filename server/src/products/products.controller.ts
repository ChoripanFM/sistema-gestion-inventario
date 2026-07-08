import { Request, Response } from "express";
import { productsService } from "./products.service.js";

export const productsController = {
  getAll(req: Request, res: Response) {
    const { search, categoryId } = req.query;
    const products = productsService.getAll(
      search as string | undefined,
      categoryId ? Number(categoryId) : undefined,
    );
    res.json(products);
  },

  getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const product = productsService.getById(id);

    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json(product);
  },

  create(req: Request, res: Response) {
    const { name, description, sku, price, stock, category_id } = req.body;

    if (!name || price === undefined || stock === undefined || !category_id) {
      res.status(400).json({ message: "Faltan campos requeridos" });
      return;
    }

    try {
      const result = productsService.create({
        name,
        description,
        sku,
        price,
        stock,
        category_id,
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, description, sku, price, stock, category_id } = req.body;

    if (!name || price === undefined || stock === undefined || !category_id) {
      res.status(400).json({ message: "Faltan campos requeridos" });
      return;
    }

    try {
      const result = productsService.update(id, {
        name,
        description,
        sku,
        price,
        stock,
        category_id,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    productsService.delete(id);
    res.status(204).send();
  },
};

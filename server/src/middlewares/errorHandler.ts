import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //Errores creados en la aplicación
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Errores de SQLite
  if (err instanceof Error && "code" in err) {
    const code = (err as any).code;

    if (code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ message: "Valores duplicados" });
      return;
    }

    if (code === "SQLITE_CONSTRAINT_TRIGGER") {
      res.status(409).json({
        message: "No se puede eliminar porque tiene registros asociados",
      });
      return;
    }

    if (code === "SQLITE_CONSTRAINT_CHECK") {
      res.status(400).json({ message: "Valor fuera del rango permitido" });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
}

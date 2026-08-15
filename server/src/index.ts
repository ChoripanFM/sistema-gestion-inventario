import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import "./db/init.js";
import categoriesRouter from "./categories/categories.router.js";
import productsRouter from "./products/products.router.js";
import salesRouter from "./sales/sales.router.js";
import backupRouter from "./backup/backup.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/backup", backupRouter);

app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;

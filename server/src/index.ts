import express from "express";
import "./database.js";
import "./db/schema.js";
import categoriesRouter from "./categories/categories.router.js";

const app = express();

app.use(express.json());

app.use("/api/categories", categoriesRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;

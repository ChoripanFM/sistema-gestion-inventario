import express from "express";
import "./database.js";
import "./db/schema.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
                                                                     
app.listen(PORT, () => {                                            
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;

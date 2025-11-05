import { Router } from "express";
import type { Product } from "../types/index.d.ts";
import { getProducts } from "../data/store.js"; // 👈 usar getProducts del store

const router = Router();

router.get("/", async (_req, res) => {
  const products = await getProducts();
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

export default router;

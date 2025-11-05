// src/routes/cart.ts
import { Router } from "express";
import type { CartItem } from "../types/index.d.js";
import { getCartForUser, setCartForUser } from "../data/store.js";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (req.session?.user?.id) return next();
  return res.status(401).json({ error: "No autenticado" });
}

router.get("/", requireAuth, async (req: any, res) => {
  const cart = await getCartForUser(req.session.user.id);
  res.json(cart);
});

router.post("/add", requireAuth, async (req: any, res) => {
  const { productId, qty } = req.body as CartItem;
  if (!productId || qty == null || qty <= 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const cart = await getCartForUser(req.session.user.id);
  const idx = cart.findIndex(i => i.productId === productId);
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({ productId, qty });
  await setCartForUser(req.session.user.id, cart);
  res.json({ ok: true, cart });
});

router.post("/remove", requireAuth, async (req: any, res) => {
  const { productId } = req.body as { productId: number };
  if (!productId) return res.status(400).json({ error: "productId requerido" });
  const cart = (await getCartForUser(req.session.user.id)).filter(i => i.productId !== productId);
  await setCartForUser(req.session.user.id, cart);
  res.json({ ok: true, cart });
});

router.post("/clear", requireAuth, async (req: any, res) => {
  await setCartForUser(req.session.user.id, []);
  res.json({ ok: true, cart: [] });
});

export default router;

// src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../data/store.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "email y password son requeridos" });
  }

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  (req.session as any).user = { id: user.id, email: user.email, name: user.name };
  res.json({ ok: true, user: (req.session as any).user });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  (req.session as any).user = null;
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  res.json({ user: (req.session as any).user || null });
});

export default router;

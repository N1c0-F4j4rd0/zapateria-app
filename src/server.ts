import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import rateLimit from "express-rate-limit";
import csrf from "csurf";                     // 👈 tipos via @types/csurf
import productsRouter from "./routes/products.ts";
import cartRouter from "./routes/cart.ts";
import authRouter from "./routes/auth.ts";
import { ensureSeed } from "./data/store.ts";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
const ALLOWED = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(cors({ origin: ALLOWED, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cookieSession({
  name: "session",
  secret: process.env.SESSION_SECRET || "zapateria-secret",
  httpOnly: true,
  sameSite: "lax",
  secure: false, // true en producción HTTPS
  maxAge: 24 * 60 * 60 * 1000
}));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/", apiLimiter);

// CSRF por cookie
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: "lax", secure: false } });

// endpoint para obtener token
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });  // 👈 ya no marca error
});

// static + routers
app.use(express.static("public"));
app.use("/api/auth", authRouter);

// Aplica CSRF antes de rutas que escriben en carrito
app.use("/api/cart", csrfProtection, cartRouter);
app.use("/api/products", productsRouter);

(async () => {
  await ensureSeed();
  app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
})();

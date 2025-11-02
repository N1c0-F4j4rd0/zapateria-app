import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieSession({
  name: "session",
  secret: "zapateria-secret",
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000
}));

// Static files (frontend)
app.use(express.static("public"));

// API
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

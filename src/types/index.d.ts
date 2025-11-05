export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem {
  productId: number;
  qty: number;
}

declare module "bcrypt"; // por si tu editor insiste

declare global {
  namespace Express {
    interface Request {
      csrfToken(): string; // la agrega csurf en runtime
    }
  }
}
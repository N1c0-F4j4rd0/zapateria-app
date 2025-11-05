import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
};

type User = {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
};

type DB = {
  products: Product[];
  users: User[];
  cartByUserId: Record<string, { productId: number; qty: number }[]>;
};

const DATA_PATH = path.resolve("src/data/data.json");

async function readRaw(): Promise<any> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    // si el archivo está vacío, evita JSON.parse("") que rompe
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function normalizeDB(input: any): DB {
  return {
    products: Array.isArray(input?.products) ? input.products : [],
    users: Array.isArray(input?.users) ? input.users : [],
    cartByUserId:
      input && typeof input.cartByUserId === "object" && input.cartByUserId !== null
        ? input.cartByUserId
        : {}
  };
}

async function readDB(): Promise<DB> {
  const raw = await readRaw();
  return normalizeDB(raw);
}

async function writeDB(db: DB) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  const normalized = normalizeDB(db); // asegura estructura antes de guardar
  await fs.writeFile(DATA_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function ensureSeed() {
  const db = await readDB();

  // seed productos
  if (!db.products.length) {
    db.products = [
      { id: 1, name: "Runner Azul",  price: 199999, image: "/img/shoe_1.png", description: "Zapatilla ligera para correr, malla transpirable.", stock: 12 },
      { id: 2, name: "Classic Rojo", price: 149999, image: "/img/shoe_2.png", description: "Clásico urbano para uso diario.", stock: 24 },
      { id: 3, name: "Eco Verde",    price: 179999, image: "/img/shoe_3.png", description: "Materiales reciclados, cómodo y resistente.", stock: 8  },
      { id: 4, name: "Urban Naranja",price: 159999, image: "/img/shoe_4.png", description: "Estilo urbano con suela de alta tracción.", stock: 16 },
      { id: 5, name: "Sport Morado", price: 189999, image: "/img/shoe_5.png", description: "Para entrenamientos de alto rendimiento.",   stock: 10 },
      { id: 6, name: "Trail Gris",   price: 209999, image: "/img/shoe_6.png", description: "Ideal para montaña y terrenos irregulares.", stock: 7  },
    ];
  }

  // seed usuario demo
  const demoEmail = "demo@demo.com";
  const exists = db.users.find(u => u.email === demoEmail);
  if (!exists) {
    const passwordHash = await bcrypt.hash("demo123", 10);
    db.users.push({ id: 1, email: demoEmail, passwordHash, name: "Demo User" });
  }

  await writeDB(db);
}

export async function findUserByEmail(email: string) {
  const db = await readDB();
  return db.users.find(u => u.email === email) || null;
}

export async function getProducts() {
  const db = await readDB();
  return db.products;
}

export async function getCartForUser(userId: number) {
  const db = await readDB();
  return db.cartByUserId[String(userId)] || [];
}

export async function setCartForUser(userId: number, cart: { productId: number; qty: number }[]) {
  const db = await readDB();
  db.cartByUserId[String(userId)] = cart;
  await writeDB(db);
}

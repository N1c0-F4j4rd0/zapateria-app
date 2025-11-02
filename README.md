# Zapatería Aether (Bootstrap + TypeScript + Express)

Tienda de zapatos de ejemplo con frontend en Bootstrap y un backend en Express escrito en TypeScript.
El carrito se guarda por sesión (cookie-session) y el catálogo es en memoria.

## Requisitos
- Node.js 18+
- npm

## Instalación
```bash
npm install
```

## Desarrollo con ts-node
```bash
npm run dev
```
Visita: http://localhost:3000

## Producción (build + start)
```bash
npm run build
npm start
```

## Estructura
```
zapateria-app/
├─ public/
│  ├─ index.html
│  ├─ cart.html
│  ├─ js/
│  │  ├─ app.js
│  │  └─ cart.js
│  └─ img/
│     └─ shoe_*.png
├─ src/
│  ├─ routes/
│  │  ├─ products.ts
│  │  └─ cart.ts
│  ├─ types/
│  │  └─ index.d.ts
│  └─ server.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Notas
- Este proyecto usa `type: module` para ESM.
- Las imágenes son generadas localmente y sirven como placeholders.

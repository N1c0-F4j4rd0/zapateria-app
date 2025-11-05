Calzado Andino (Bootstrap + TypeScript + Express)

Tienda de ejemplo con frontend en Bootstrap 5 y backend en Express (TypeScript).
Incluye carrito, autenticación simple, CSRF, rate-limit, y persistencia básica en archivo JSON.

👥 Integrantes y roles

Juan Nicolas Fajardo Solorzano: Backend (APIs) y QA/Pruebas

Freddy Guerrero: Frontend (UI/UX)

Brayan Pulecio: DevOps/Docs

🧩 Dependencias:

Producción

express – Servidor HTTP.

cors – CORS headers para el front.

cookie-session – Sesiones ligeras en cookie.

helmet – Cabeceras de seguridad.

cookie-parser – Lectura/escritura de cookies.

express-rate-limit – Límite de peticiones (anti-abuso).

csurf – Protección CSRF basada en cookie.

bcrypt – Hash de contraseñas.

Desarrollo

typescript – Tipado y compilación TS.

ts-node – Ejecutar TS sin build previo.

@types/* – Tipos de las librerías (express, cookie-session, cors, bcrypt, csurf, etc).

Revisa package.json para ver versiones exactas usadas.

🚀 Puesta en marcha
# 1) Instalar dependencias
npm install

# 2) Ejecutar en desarrollo (TS directo con ts-node/esm)
npm run dev
# Servidor: http://localhost:3000

# 3) (Opcional) Build + Start en producción
npm run build
npm start


La carpeta public/ sirve el frontend (HTML/CSS/JS) y las imágenes.
La API se expone bajo /api/.

🗂 Estructura del proyecto
zapateria-app/
├─ public/
│  ├─ index.html          # Home (lista + filtros + login modal)
│  ├─ cart.html           # Carrito
│  ├─ js/
│  │  ├─ app.js           # Lógica de catálogo/filtros/CSRF add-to-cart
│  │  ├─ cart.js          # Lógica de carrito (render, inc/dec/remove/clear)
│  │  └─ auth.js          # Login/logout, estado de botones, modal
│  └─ img/                # Imágenes de productos
├─ src/
│  ├─ routes/
│  │  ├─ products.ts      # Rutas de productos
│  │  ├─ cart.ts          # Rutas de carrito (protegidas + CSRF)
│  │  └─ auth.ts          # Login/Logout/Me
│  ├─ data/
│  │  ├─ data.json        # Persistencia simple (productos, usuarios, carritos)
│  │  └─ store.ts         # Lectura/escritura y seed seguro
│  ├─ types/
│  │  └─ index.d.ts       # Tipos Product/CartItem
│  └─ server.ts           # App Express, middlewares, estáticos y montaje de rutas
├─ package.json
├─ tsconfig.json
└─ README.md

🔌 Rutas del backend
Autenticación (/api/auth)
Método	Ruta	Descripción
GET	/api/auth/me	Devuelve el usuario autenticado (si existe).
POST	/api/auth/login	Login: { email, password } → set de sesión. Requiere header X-CSRF-Token.
POST	/api/auth/logout	Logout (invalida la sesión). Requiere X-CSRF-Token.
CSRF (/api/csrf-token)
Método	Ruta	Descripción
GET	/api/csrf-token	Devuelve { csrfToken }. El front debe enviarlo en X-CSRF-Token en POST.
Productos (/api/products)
Método	Ruta	Descripción
GET	/api/products	Lista completa de productos.
GET	/api/products/:id	Producto por id.
Carrito (/api/cart) (Protegido: requiere usuario autenticado + CSRF)
Método	Ruta	Descripción
GET	/api/cart	Devuelve el carrito del usuario actual.
POST	/api/cart/add	Agrega/actualiza item { productId, qty }. Valida existencia/stock/cantidades.
POST	/api/cart/remove	Elimina un producto { productId } del carrito.
POST	/api/cart/clear	Vacía el carrito.
GET	/api/cart/total	Total actual del carrito { total }.

Las rutas de escritura (add/remove/clear/login/logout) exigen CSRF y sesión.


🛒 Cómo funciona el carrito

Persistencia: el backend guarda datos en src/data/data.json mediante fs.promises.
La estructura incluye:

products: catálogo.

users: lista (se hace seed con usuario demo demo@demo.com / demo123).

cartByUserId: carritos por userId (array de { productId, qty }).

Autenticación:

El usuario inicia sesión en el modal (front envía email/password).

El backend valida con bcrypt (hash) y crea cookie-session.

/api/auth/me permite al front saber si hay sesión activa.

CSRF:

Front pide GET /api/csrf-token → guarda csrfToken.

Toda petición POST (login, add, remove, clear, logout) envía el header X-CSRF-Token: <token> y credentials: 'include'.

Flujo front–back:

index.html carga catálogo con GET /api/products y renderiza tarjetas.

El usuario aplica filtros (nombre, rango de precios) en el front; el filtrado es sin recargar la página.

Al presionar Agregar, app.js llama a GET /api/csrf-token (si hace falta) y luego a POST /api/cart/add con el token CSRF y las cookies de sesión.
Si todo va bien, muestra un Toast “Producto agregado al carrito”.

cart.html usa GET /api/cart y GET /api/products para armar la tabla con subtotales y total.
Los botones + / − / Quitar / Vaciar disparan POST a /api/cart/* (con CSRF).

GET /api/cart/total expone el total en JSON para pruebas (Postman) o UI adicional.

Validaciones de servidor:

productId debe existir.

qty debe ser entero positivo (no negativos, no cero).

En remove/clear se verifican parámetros y formatos.

Errores responden 400 con { error: "mensaje claro" }.


🧪 Notas de pruebas (QA)

Postman: primero GET /api/csrf-token, luego usar X-CSRF-Token + “cookies” habilitadas para POST a /api/auth/login y /api/cart/*.

UI: probar filtros, agregar varios items, + / −, quitar y vaciar.

Rutas: verificar GET /api/cart/total devuelve la suma correcta.


🔐 Seguridad aplicada

Helmet (cabeceras seguras).

Rate limit sobre /api/.

CSRF por cookie + header X-CSRF-Token.

Sesión en cookie-session (httpOnly, sameSite=lax).

bcrypt para contraseñas.

Validaciones estrictas en rutas de carrito.


📝 Créditos

Proyecto de práctica académica.
Frameworks/Librerías: Bootstrap, Express, TypeScript.
# BeatHub — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4.4-orange?style=for-the-badge)

**Frontend completo para la plataforma de e-commerce BeatHub.ar**

*Instrumentos musicales · Tienda online · Panel de administración*

🌐 [Read in English](./README.md)

[Funcionalidades](#-funcionalidades) •
[Tecnologías](#-tecnologías) •
[Estructura](#-estructura-del-proyecto) •
[Instalación](#-instalación-y-uso) •
[Pantallas](#-pantallas-principales)

</div>

---

## 📋 Índice

- [Descripción general](#-descripción-general)
- [Funcionalidades](#-funcionalidades)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y uso](#-instalación-y-uso)
- [Variables de entorno](#-variables-de-entorno)
- [Pantallas principales](#-pantallas-principales)
- [Autor](#-autor)

---

## 🎯 Descripción general

**BeatHub** es una plataforma de e-commerce especializada en instrumentos musicales, desarrollada como proyecto final de la materia **Programación** (UTN). El frontend está construido con **React + Vite + Tailwind CSS** y se conecta a una API REST desarrollada en FastAPI.

La aplicación contempla dos tipos de usuario: **clientes** y **administradores**, cada uno con su propio flujo de navegación y funcionalidades exclusivas.

---

## ✨ Funcionalidades

### 🛍️ Tienda (cliente)

- **Home** con cartelera de productos destacados, novedades y banners de marcas
- **Catálogo de productos** con filtros por categoría, marca, precio y búsqueda en tiempo real
- **Detalle de producto** con galería, descripción, precio con/sin IVA y stock disponible
- **Carrito de compras** con manejo de cantidades, resumen de compra y envío gratis automático a partir de $70.000
- **Checkout** con selección de método de pago
- **Mis Compras** — historial de órdenes con estado en tiempo real, factura y opciones de cancelación / devolución
- **Zona Relax** — sección exclusiva para usuarios registrados

### 🔐 Autenticación

- Registro e inicio de sesión con JWT
- Recuperación de contraseña por email (token de un solo uso)
- Perfil de usuario editable (nombre, email, dirección)
- Rutas protegidas por rol (cliente / administrador)

### 🗂️ Panel de administración

- **Dashboard** con métricas generales
- **Gestión de productos**: crear, editar nombre/precio/stock, activar/desactivar, marcar como destacado o "Lo nuevo", eliminar
- **Gestión de órdenes**: visualización con fotos de productos y resumen económico, cambio de estado en flujo forward-only (Aprobado → En camino → Entregado), gestión de devoluciones con envío de email al usuario
- **Gestión de usuarios**: listado y cambio de rol
- **Gestión de categorías**

### 📧 Sistema de emails automáticos

Los siguientes eventos disparan un email al cliente:

| Evento | Descripción |
|--------|-------------|
| Compra aprobada | Confirmación con detalle de orden |
| Pedido en camino | Notificación de despacho |
| Pedido entregado | Confirmación de entrega |
| Cancelación | Confirmación de cancelación |
| Devolución solicitada | Confirmación + instrucciones |
| Contacto admin (devolución) | Email con instrucciones de logística |

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.2.0 | Biblioteca principal de UI |
| **Vite** | 5.0 | Build tool y dev server |
| **Tailwind CSS** | 3.3.6 | Estilos utilitarios |
| **React Router DOM** | 6.20.0 | Enrutamiento SPA |
| **Axios** | 1.6.2 | Cliente HTTP para la API |
| **Zustand** | 4.4.0 | Manejo de estado global (auth, carrito) |
| **date-fns** | 2.30.0 | Formateo de fechas |
| **ESLint** | 8.54.0 | Linting y calidad de código |
| **PostCSS + Autoprefixer** | — | Procesamiento de CSS |

---

## 📁 Estructura del proyecto

```
src/
├── api/
│   ├── client.js          # Instancia de Axios con interceptores JWT
│   └── services.js        # Todos los endpoints: auth, productos, órdenes, etc.
│
├── components/
│   ├── Layout.jsx         # Header sticky, footer, navbar con menú responsive
│   └── Toast.jsx          # Notificaciones globales
│
├── pages/
│   ├── Admin/
│   │   ├── Categories.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx     # Panel de órdenes con fotos, resumen y acciones
│   │   ├── Products.jsx   # CRUD completo de productos
│   │   └── Users.jsx
│   ├── Auth/
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx    # Perfil + Mis compras (tabs)
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── Ecom/
│   │   ├── AboutPage.jsx
│   │   ├── BrandPage.jsx
│   │   ├── BrandsPage.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── ContactPage.jsx
│   │   ├── DiscountsPage.jsx
│   │   ├── Home.jsx
│   │   ├── NewArrivalsPage.jsx
│   │   ├── ProductDetail.jsx
│   │   └── ProductsPage.jsx
│   └── Relax/
│       └── Relax.jsx
│
├── stores/
│   ├── authStore.js       # Estado de autenticación (Zustand)
│   └── cartStore.js       # Estado del carrito (Zustand + persistencia)
│
├── utils/
│   └── format.js          # Formateo de moneda ARS
│
├── App.jsx                # Rutas y guards (AdminRoute / ProtectedRoute)
└── main.jsx
```

---

## 🚀 Instalación y uso

### Prerrequisitos

- Node.js 18+
- El backend de BeatHub corriendo (FastAPI en Docker, puerto 8000)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/beathub-frontend.git
cd beathub-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
# Los archivos estáticos quedan en /dist
```

---

## ⚙️ Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000
```

En producción (Vercel), configurar:

```env
VITE_API_URL=https://tu-backend.onrender.com
```

---

## 🖥️ Pantallas principales

### Tienda
| Ruta | Descripción |
|------|-------------|
| `/` | Home con productos destacados y novedades |
| `/productos` | Catálogo completo con filtros |
| `/product/:id` | Detalle de producto |
| `/cart` | Carrito de compras |
| `/checkout` | Finalizar compra *(requiere login)* |
| `/profile` | Perfil y Mis Compras *(requiere login)* |

### Navegación
| Ruta | Descripción |
|------|-------------|
| `/marcas` | Listado de marcas |
| `/descuentos` | Productos con descuento |
| `/nuevo` | Lo nuevo |
| `/about` | Sobre BeatHub |
| `/contact` | Información de contacto |

### Autenticación
| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |
| `/forgot-password` | Recuperar contraseña |
| `/reset-password` | Restablecer contraseña |

### Administración *(requiere rol admin)*
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Gestión de productos |
| `/admin/orders` | Gestión de órdenes |
| `/admin/categories` | Gestión de categorías |
| `/admin/users` | Gestión de usuarios |

---

## 👤 Autor

**Leandro Nuñez**
Estudiante de Tecnicatura en Programación — UTN

- 📧 [leandro_mojang27@hotmail.com](mailto:leandro_mojang27@hotmail.com)
- 🌐 [BeatHub.ar](https://beathub.ar)

---

<div align="center">
  <sub>Proyecto Final · Programación · UTN · 2025</sub>
</div>

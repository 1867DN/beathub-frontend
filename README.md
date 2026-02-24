# BeatHub — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4.4-orange?style=for-the-badge)

**Full frontend for the BeatHub.ar e-commerce platform**

*Musical instruments · Online store · Admin panel*

🌐 [Leer en Español](./README.es.md)

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started) •
[Main Screens](#-main-screens)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Main Screens](#-main-screens)
- [Author](#-author)

---

## 🎯 Overview

**BeatHub** is a full-featured e-commerce platform specialized in musical instruments, developed as the final project for the **Programming** course at UTN. The frontend is built with **React + Vite + Tailwind CSS** and connects to a FastAPI REST backend.

The app supports two user roles: **customers** and **administrators**, each with their own navigation flow and exclusive features.

---

## ✨ Features

### 🛍️ Store (customer)

- **Home** with featured products carousel, new arrivals section and brand banners
- **Product catalog** with filters by category, brand, price and real-time search
- **Product detail** with gallery, description, price with/without VAT and available stock
- **Shopping cart** with quantity management, order summary and free shipping threshold ($70.000 ARS)
- **Checkout** with payment method selection
- **My Orders** — order history with real-time status, invoice details, cancel and return options
- **Relax Zone** — exclusive section for registered users

### 🔐 Authentication

- Register and login with JWT
- Password recovery via email (single-use token)
- Editable user profile (name, email, address)
- Role-based protected routes (customer / admin)

### 🗂️ Admin panel

- **Dashboard** with general metrics
- **Product management**: create, edit name/price/stock, toggle visibility, mark as featured or "New arrival", delete
- **Order management**: card view with product images and economic summary, forward-only status flow (Approved → Shipped → Delivered), return management with automated user email
- **User management**: listing and role toggle
- **Category management**

### 📧 Automated email system

The following events trigger an email to the customer:

| Event | Description |
|-------|-------------|
| Order approved | Confirmation with order details |
| Order shipped | Dispatch notification |
| Order delivered | Delivery confirmation |
| Cancellation | Cancellation confirmation |
| Return requested | Confirmation + next steps |
| Admin return contact | Email with logistics instructions |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|--------|
| **React** | 18.2.0 | Main UI library |
| **Vite** | 5.0 | Build tool & dev server |
| **Tailwind CSS** | 3.3.6 | Utility-first styling |
| **React Router DOM** | 6.20.0 | SPA routing |
| **Axios** | 1.6.2 | HTTP client for the API |
| **Zustand** | 4.4.0 | Global state management (auth, cart) |
| **date-fns** | 2.30.0 | Date formatting |
| **ESLint** | 8.54.0 | Linting & code quality |
| **PostCSS + Autoprefixer** | — | CSS processing |

---

## 📁 Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptors
│   └── services.js        # All endpoints: auth, products, orders, etc.
│
├── components/
│   ├── Layout.jsx         # Sticky header, footer, responsive navbar
│   └── Toast.jsx          # Global toast notifications
│
├── pages/
│   ├── Admin/
│   │   ├── Categories.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx     # Orders panel with product images, summary & actions
│   │   ├── Products.jsx   # Full product CRUD
│   │   └── Users.jsx
│   ├── Auth/
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx    # Profile + My Orders (tabs)
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
│   ├── authStore.js       # Authentication state (Zustand)
│   └── cartStore.js       # Cart state (Zustand + persistence)
│
├── utils/
│   └── format.js          # ARS currency formatter
│
├── App.jsx                # Routes and guards (AdminRoute / ProtectedRoute)
└── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- BeatHub backend running (FastAPI in Docker, port 8000)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/beathub-frontend.git
cd beathub-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your backend URL

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production build

```bash
npm run build
# Static files are output to /dist
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

In production (Vercel), set:

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🖥️ Main Screens

### Store
| Route | Description |
|-------|-------------|
| `/` | Home — featured products & new arrivals |
| `/productos` | Full catalog with filters |
| `/product/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Place order *(login required)* |
| `/profile` | Profile & My Orders *(login required)* |

### Browse
| Route | Description |
|-------|-------------|
| `/marcas` | Brand listing |
| `/descuentos` | Discounted products |
| `/nuevo` | New arrivals |
| `/about` | About BeatHub |
| `/contact` | Contact information |

### Auth
| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password recovery |
| `/reset-password` | Set new password |

### Admin *(admin role required)*
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/categories` | Category management |
| `/admin/users` | User management |

---

## 👤 Author

**Leandro Nuñez**
Programming Technology Student — UTN

- 📧 [leandro_mojang27@hotmail.com](mailto:leandro_mojang27@hotmail.com)
- 🌐 [BeatHub.ar](https://beathub.ar)

---

<div align="center">
  <sub>Final Project · Programming · UTN · 2025</sub>
</div>

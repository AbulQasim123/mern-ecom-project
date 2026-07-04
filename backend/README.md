# 🛒 Bhiwandi Store — Full Stack E-Commerce Application

A premium dark-themed e-commerce platform built with **React (Vite) + Tailwind CSS** frontend and **Node.js + Express + MongoDB** backend. Features include user authentication, product catalog with pagination, shopping cart, checkout with address management, order placement (COD), and a complete admin panel for product management.

---

## 📁 Project Structure

```
Bhiwandi-Store/
├── frontend/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/axios.js      # Axios instance with base URL
│   │   ├── components/       # Reusable components (Navbar, ConfirmModal, ErrorBoundary)
│   │   ├── pages/            # User-facing pages (Home, Cart, Checkout, etc.)
│   │   ├── admin/            # Admin pages (ProductList, AddProduct, EditProduct)
│   │   ├── utils/            # Helpers (imageUrl.js)
│   │   ├── App.jsx           # Router setup with error handling
│   │   └── main.jsx          # Entry point
│   ├── public/
│   └── package.json
│
└── backend/                  # Node.js + Express + MongoDB
    ├── config/db.js          # MongoDB connection
    ├── controllers/          # Business logic (auth, product, cart, order, address)
    ├── middleware/           # Multer for image uploads, auth middleware
    ├── models/               # Mongoose schemas (User, Product, Cart, Order, Address)
    ├── routes/               # API route definitions
    ├── public/products/      # Uploaded product images
    ├── .env                  # Environment variables
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local or Atlas cloud)
- **npm** or **yarn**

---

## ⚙️ Backend Setup

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bhiwandi-store
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhiwandi-store

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Create required directories
```bash
mkdir -p public/products
```

### 5. Start the server
```bash
# Development (with nodemon)
npm run dev

# OR Production
npm start
```

**Server runs on:** `http://localhost:5001`

---

## 🎨 Frontend Setup

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Update API base URL (if needed)
In `src/api/axios.js`:
```js
const api = axios.create({
    baseURL: "http://localhost:5001/api",  // Change if backend URL differs
});
```

### 4. Start the dev server
```bash
npm run dev
```

**App runs on:** `http://localhost:5173`

---

## 📦 Required NPM Packages

### Backend Dependencies
```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install --save-dev nodemon
```

### Frontend Dependencies
```bash
npm install react react-dom react-router axios
npm install -D tailwindcss postcss autoprefixer vite
npx tailwindcss init -p
```

---

## 🗄️ MongoDB Models Overview

### User
| Field | Type | Description |
|-------|------|-------------|
| name | String | User full name |
| email | String | Unique email address |
| password | String | Hashed password |

### Product
| Field | Type | Description |
|-------|------|-------------|
| title | String | Product name |
| description | String | Product description |
| price | Number | Price in ₹ (must be ≥ 0) |
| category | String | Product category |
| image | String | Image path `/products/filename.webp` |
| stock | Number | Available quantity (must be ≥ 0) |

### Cart
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| items | Array | [{ productId, quantity }] |

### Order
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| items | Array | Ordered products |
| address | Object | Delivery address |
| totalAmount | Number | Order total |
| status | String | pending/shipped/delivered |

### Address
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| fullName | String | Recipient name |
| phone | String | Contact number |
| addressLine | String | Street address |
| city | String | City |
| state | String | State |
| pincode | String | PIN code |

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user, returns token |
| GET | `/me` | Get current user profile |
| DELETE | `/delete` | Delete account (requires password + "DELETE" confirmation) |

### Products (`/api/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/?search=&category=&page=1&limit=12` | Get products with pagination |
| POST | `/add` | Create product (multipart/form-data with image) |
| PUT | `/update/:id` | Update product (multipart/form-data, image optional) |
| DELETE | `/delete/:id` | Delete product |

### Cart (`/api/cart`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:userId` | Get user's cart |
| POST | `/add` | Add item to cart |
| POST | `/update` | Update item quantity |
| POST | `/remove` | Remove item from cart |

### Address (`/api/address`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:userId` | Get user's addresses |
| POST | `/add` | Add new address |

### Order (`/api/order`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/place` | Place order (COD) |

---

## 🖼️ Image Handling

### Upload Flow
1. User selects image in frontend (Add/Edit Product)
2. Frontend sends `multipart/form-data` via `FormData`
3. **Multer** middleware saves file to `backend/public/products/`
4. File path stored in DB: `/products/filename.webp`
5. **Static serving**: `app.use("/products", express.static(...))`
6. Frontend uses `getImageUrl()` helper to build full URL:
   ```js
   // /products/filename.webp → http://localhost:5001/products/filename.webp
   ```

### Image URL Helper (`src/utils/imageUrl.js`)
```js
const API_BASE_URL = "http://localhost:5001";

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_BASE_URL}${imagePath}`;
    return imagePath;
};
```

---

## 🎨 UI Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-dark` | `#0a0a0a` | Page background |
| `--bg-card` | `#111111` | Card/container background |
| `--accent` | `#e8c547` | Primary buttons, prices, highlights |
| `--text-primary` | `#ffffff` | Headings |
| `--text-secondary` | `rgba(255,255,255,0.5)` | Body text |
| `--border` | `rgba(255,255,255,0.06)` | Card borders |

### Key Features
- **Glassmorphism Navbar**: `backdrop-blur-xl` with scroll detection
- **Gold Gradient Buttons**: `from-[#e8c547] to-[#d4a520]`
- **Hover Animations**: Lift (`-translate-y-1`), shadow glow
- **Loading States**: Skeleton shimmer, spinners
- **Toast Feedback**: Green checkmark on add-to-cart

---

## 🔒 Authentication Flow

1. User logs in → Backend returns **JWT token** + user data
2. Token stored in `localStorage` ("token")
3. `userId` stored in `localStorage` ("userId")
4. Axios interceptor adds token to headers
5. Protected routes check `localStorage.getItem("token")`
6. Logout clears `localStorage` + redirects to `/login`

---

## 🛒 Cart Flow

1. User clicks "Add to Cart" on product
2. API call: `POST /api/cart/add` with `{ userId, productId }`
3. Backend updates cart, returns updated cart
4. Frontend calculates total quantity, dispatches `cartUpdated` event
5. Navbar listens for `cartUpdated`, refreshes cart count badge

---

## 📋 Checkout Flow

1. User goes to `/cart` → sees items + total
2. Clicks "Proceed to Checkout" → `/checkout-address`
3. Enters delivery address → saved to DB
4. Redirects to `/checkout` → selects address + sees order summary
5. Clicks "Place Order (COD)" → `POST /api/order/place`
6. Cart cleared, order created → redirect to `/order-success/:orderId`

---

## 🛠️ Error Handling

### Frontend
| Error Type | Handler |
|------------|---------|
| 404 Route | `path: "*"` → `<NotFound />` page |
| Render Error | `<ErrorBoundary>` wrapper |
| Route Error | `errorElement` on parent route |
| API Error | Try-catch with user-friendly messages |

### Backend
| Error Type | Response |
|------------|----------|
| Validation | `400` with message |
| Not Found | `404` with message |
| Server Error | `500` with error details (dev only) |

---

## 📱 Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Layout Changes |
|------------|-----------------|----------------|
| < 640px | Default | 2-column grid, stacked layouts |
| ≥ 640px | `sm:` | Larger text, side-by-side forms |
| ≥ 768px | `md:` | Table view (admin), 3-column grid |
| ≥ 1024px | `lg:` | 4-column grid, 2-column checkout |

---

## 🧪 Development Tips

### Reset Everything
```bash
# Clear localStorage in browser DevTools
localStorage.clear()

# Restart servers after backend changes
# Frontend hot-reloads automatically
```

### Check API Response Format
```js
// In browser console, check what backend returns
const res = await fetch("http://localhost:5001/api/products");
const data = await res.json();
console.log(data);  // Should be { products: [...], pagination: {...} }
```

### Common Issues
| Issue | Solution |
|-------|----------|
| Image not loading | Check `getImageUrl()` has correct `API_BASE_URL` |
| CORS error | Ensure `cors()` middleware is in backend |
| 404 on refresh | Configure Vite `server.historyApiFallback: true` |
| Products not showing | Check backend response format (array vs object) |

---

## 📝 Environment Variables Reference

### Backend `.env`
```env
PORT=5001                          # Server port
MONGODB_URI=...                   # MongoDB connection string
JWT_SECRET=your-secret-key        # JWT signing key
```

### Frontend (Vite)
Create `.env` in frontend root:
```env
VITE_API_URL=http://localhost:5001/api
```
Access in code: `import.meta.env.VITE_API_URL`

---

## 🚀 Deployment Checklist

### Backend
- [ ] Change `cors()` to allow production frontend URL
- [ ] Use environment variables for all secrets
- [ ] Set up MongoDB Atlas (cloud)
- [ ] Configure `public/products` directory permissions
- [ ] Use PM2 or similar process manager

### Frontend
- [ ] Update `API_BASE_URL` in `imageUrl.js` to production backend
- [ ] Update axios baseURL to production
- [ ] Run `npm run build` for production bundle
- [ ] Serve `dist/` folder via Nginx or similar

---

## 👨‍💻 Author

**Bhiwandi Store** — Built with ❤️ for premium shopping experience.

---

*Last updated: 05 July 2026*

import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import AddProduct from "./admin/AddProduct";
import EditProduct from "./admin/EditProduct";
import ProductList from "./admin/ProductList";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/CheckoutAddress";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Account from "./pages/Account";

function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}

// ✅ Global error element for all routes
function GlobalError() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="text-center max-w-md animate-[slideUp_0.4s_ease-out]">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
                <p className="text-white/40 text-sm mb-6">
                    The application encountered an unexpected error.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 transition-all"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        errorElement: <GlobalError />, // ✅ Catch all render errors
        children: [
            { path: "/", element: <Home /> },
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Signup /> },
            { path: "/product/:id", element: <ProductDetails /> },
            { path: "/cart", element: <Cart /> },
            { path: "/checkout-address", element: <CheckoutAddress /> },
            { path: "/checkout", element: <Checkout /> },
            { path: "/order-success/:id", element: <OrderSuccess /> },
            { path: "/account", element: <Account /> },

            // Admin routes
            { path: "/admin/products", element: <ProductList /> },
            { path: "/admin/products/add", element: <AddProduct /> },
            { path: "/admin/products/edit/:id", element: <EditProduct /> },

            
            { path: "*", element: <NotFound /> },
        ],
    },
]);

export default function App() {
    return (
        <ErrorBoundary> {}
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
}
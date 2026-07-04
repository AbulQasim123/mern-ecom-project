import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Navbar() {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const loadCart = async () => {
            if (!userId) return setCartCount(0);
            try {
                const res = await api.get(`/cart/${userId}`);
                const total = res.data.items.reduce(
                    (sum, item) => sum + item.quantity, 0
                );
                setCartCount(total);
            } catch {
                setCartCount(0);
            }
        };
        loadCart();
        window.addEventListener("cartUpdated", loadCart);
        return () => window.removeEventListener("cartUpdated", loadCart);
    }, [userId]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const logout = () => {
        localStorage.clear();
        setCartCount(0);
        navigate("/login");
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
                ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl" 
                : "bg-[#0a0a0a] border-b border-transparent"
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link 
                    to="/" 
                    className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#e8c547] bg-clip-text text-transparent hover:scale-[1.02] transition-transform"
                >
                    Bhiwandi Store
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Cart */}
                    <Link 
                        to="/cart" 
                        className="relative p-2 sm:p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-[popIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {!userId ? (
                        <>
                            <Link 
                                to="/login" 
                                className="hidden sm:block px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] rounded-lg hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/account" 
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                My Account
                            </Link>
                            <button 
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
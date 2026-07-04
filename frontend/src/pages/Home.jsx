import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { Link } from "react-router";
import { getImageUrl } from "../utils/imageUrl";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [loading, setLoading] = useState(true);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/products?search=${search}&category=${category}&page=${page}&limit=${limit}`
            );
            // Handle BOTH old and new response formats
            if (Array.isArray(res.data)) {
                // Old format: res.data is array of products
                setProducts(res.data);
                setPagination(null);
            } else if (res.data.products) {
                // New format: res.data = { products: [], pagination: {} }
                setProducts(res.data.products);
                setPagination(res.data.pagination);
            } else {
                setProducts([]);
                setPagination(null);
            }
        } catch {
            setProducts([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [search, category, page, limit]);

    useEffect(() => {
        setPage(1); // Reset to page 1 when search/category changes
    }, [search, category]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const addToCart = async (productId) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            window.location.href = "/login";
            return;
        }

        try {
            const res = await api.post(`/cart/add`, { userId, productId });
            const total = res.data.cart.items.reduce(
                (sum, item) => sum + item.quantity, 0
            );
            localStorage.setItem("cartCount", total);
            window.dispatchEvent(new Event("cartUpdated"));

            // Toast feedback
            const btn = document.getElementById(`btn-${productId}`);
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                btn.classList.add("bg-green-500", "border-green-500");
                btn.classList.remove("bg-[#0a0a0a]", "border-white/[0.08]");
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.classList.remove("bg-green-500", "border-green-500");
                    btn.classList.add("bg-[#0a0a0a]", "border-white/[0.08]");
                }, 1500);
            }
        } catch {
            alert("Failed to add to cart. Please try again.");
        }
    };

    // Generate page numbers array
    const getPageNumbers = () => {
        if (!pagination) return [];
        const { currentPage, totalPages } = pagination;
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12 animate-[slideUp_0.5s_ease-out]">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-[#e8c511] bg-clip-text text-transparent mb-4">
                        Premium Shopping, Delivered
                    </h1>
                    <p className="text-white/40 text-base sm:text-lg max-w-lg mx-auto">
                        Discover the finest collection curated just for you at Bhiwandi Store.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c511]/50 focus:ring-2 focus:ring-[#e8c511]/10 transition-all"
                            />
                        </div>
                        <div className="relative sm:w-52">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-11 pr-8 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-[#e8c511]/50 focus:ring-2 focus:ring-[#e8c511]/10 transition-all cursor-pointer"
                            >
                                <option value="" className="bg-[#111]">All Categories</option>
                                <option value="Laptops" className="bg-[#111]">Laptops</option>
                                <option value="Mobiles" className="bg-[#111]">Mobiles</option>
                                <option value="Tablets" className="bg-[#111]">Tablets</option>
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Results Info Bar */}
                {pagination && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <p className="text-white/40 text-sm">
                            Showing <span className="text-white font-medium">{products.length}</span> of <span className="text-white font-medium">{pagination.totalItems}</span> products
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs">Per page:</span>
                            {[8, 12, 24, 48].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => { setLimit(n); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${limit === n
                                        ? "bg-[#e8c511] text-[#0a0a0a]"
                                        : "bg-[#111] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/[0.12]"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {[...Array(limit)].map((_, i) => (
                            <div key={i} className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-white/[0.03]" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                                    <div className="h-3 bg-white/[0.03] rounded w-1/2" />
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="h-5 bg-white/[0.05] rounded w-16" />
                                        <div className="h-8 w-8 bg-white/[0.05] rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4 opacity-20">🔍</div>
                        <h2 className="text-xl font-bold text-white mb-2">No products found</h2>
                        <p className="text-white/40 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="group bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                                >
                                    <Link to={`/product/${product._id}`} className="block">
                                        <div className="aspect-square bg-[#0a0a0a] overflow-hidden relative">
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.src = ""; e.target.parentElement.innerHTML = "📦"; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </Link>

                                    <div className="p-4">
                                        <Link to={`/product/${product._id}`}>
                                            <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-[#e8c511] transition-colors">
                                                {product.title}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[#e8c511] font-bold text-sm sm:text-base">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                            <button
                                                id={`btn-${product._id}`}
                                                onClick={() => addToCart(product._id)}
                                                className="w-9 h-9 flex items-center justify-center bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-white hover:bg-[#e8c511] hover:text-[#0a0a0a] hover:border-[#e8c511] transition-all duration-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                {/* Prev */}
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="p-2.5 bg-[#111] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:border-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/[0.06] transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers().map((p, i) => (
                                    p === "..." ? (
                                        <span key={`dots-${i}`} className="px-2 text-white/30 text-sm">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-semibold transition-all ${page === p
                                                ? "bg-gradient-to-r from-[#e8c511] to-[#d4a520] text-[#0a0a0a] shadow-lg shadow-[#e8c511]/20"
                                                : "bg-[#111] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/[0.12]"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}

                                {/* Next */}
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNextPage}
                                    className="p-2.5 bg-[#111] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:border-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/[0.06] transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        {pagination && (
                            <p className="text-center text-white/30 text-xs mt-3">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
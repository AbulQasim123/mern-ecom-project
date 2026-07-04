import { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router";
import { getImageUrl } from "../utils/imageUrl";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get("/products/");

            // ✅ FIX: Handle both old and new response formats
            const allProducts = Array.isArray(res.data)
                ? res.data
                : res.data.products || [];

            const p = allProducts.find((item) => item._id === id);
            setProduct(p || null);
        } catch (err) {
            console.error("Error loading product:", err);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const addToCart = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/login");
            return;
        }

        setAdding(true);
        try {
            const res = await api.post("/cart/add", {
                userId,
                productId: product._id,
            });

            const total = res.data.cart.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            localStorage.setItem("cartCount", total);
            window.dispatchEvent(new Event("cartUpdated"));

            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {
            alert("Failed to add to cart. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center pt-16">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                    <span className="text-white/40 text-sm">Loading product...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-16">
                <div className="text-center animate-[slideUp_0.4s_ease-out]">
                    <div className="text-5xl mb-4 opacity-20">📦</div>
                    <h2 className="text-xl font-bold text-white mb-2">Product not found</h2>
                    <p className="text-white/40 text-sm mb-6">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 transition-all duration-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto animate-[slideUp_0.4s_ease-out]">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-white/30 mb-8">
                    <button onClick={() => navigate("/")} className="hover:text-white/60 transition-colors">Home</button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-white/60 truncate max-w-[200px]">{product.title}</span>
                </nav>

                <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12">
                    {/* Product Image */}
                    <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 sm:p-10 flex items-center justify-center shadow-xl">
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-full max-h-[400px] object-contain rounded-xl"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-white/20 text-6xl">📦</div>';
                            }}
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                                    {product.title}
                                </h1>
                                <button
                                    onClick={() => {
                                        navigator.share?.({
                                            title: product.title,
                                            url: window.location.href,
                                        }).catch(() => { });
                                    }}
                                    className="p-2.5 bg-[#111] border border-white/[0.06] rounded-xl text-white/30 hover:text-white/60 hover:border-white/[0.12] transition-all flex-shrink-0"
                                    title="Share"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3" />
                                        <circle cx="6" cy="12" r="3" />
                                        <circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl font-extrabold text-[#e8c547]">
                                    ₹{product.price?.toLocaleString()}
                                </span>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${product.stock > 0
                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}>
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>

                            <div className="bg-[#111] border border-white/[0.06] rounded-xl p-5 mb-6">
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {product.description || "No description available for this product."}
                                </p>
                            </div>

                            {/* Product Meta */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-white text-sm font-medium">{product.category || "General"}</p>
                                </div>
                                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Stock</p>
                                    <p className="text-white text-sm font-medium">{product.stock || 0} units</p>
                                </div>
                                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Delivery</p>
                                    <p className="text-white text-sm font-medium">2-4 Days</p>
                                </div>
                                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">SKU</p>
                                    <p className="text-white text-sm font-medium font-mono">{product._id?.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={addToCart}
                            disabled={adding || product.stock <= 0}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${added
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                    : product.stock <= 0
                                        ? "bg-white/[0.05] text-white/30 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0"
                                } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                        >
                            {added ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Added to Cart!
                                </>
                            ) : adding ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Adding...
                                </>
                            ) : product.stock <= 0 ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    Out of Stock
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
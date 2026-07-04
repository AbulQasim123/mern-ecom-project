import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router";
import ConfirmModal from "../components/ConfirmModal";
import { getImageUrl } from "../utils/imageUrl";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const navigate = useNavigate();

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/products?page=${page}&limit=${limit}`);

            // Handle BOTH old and new response formats
            if (Array.isArray(response.data)) {
                setProducts(response.data);
                setPagination(null);
            } else if (response.data.products) {
                setProducts(response.data.products);
                setPagination(response.data.pagination);
            } else {
                setProducts([]);
                setPagination(null);
            }
            setError("");
        } catch {
            setError("Failed to load products. Please try again.");
            setProducts([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const deleteProduct = async (id) => {
        setDeleting(true);
        try {
            await api.delete(`/products/delete/${id}`);
            setDeleteTarget(null);
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete product.");
        } finally {
            setDeleting(false);
        }
    };

    // Client-side search filter (on current page products)
    const filteredProducts = products.filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const getStockStatus = (stock) => {
        if (stock <= 0) return { label: "Out of Stock", color: "text-red-400 bg-red-500/10 border-red-500/20" };
        if (stock < 10) return { label: "Low Stock", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
        return { label: "In Stock", color: "text-green-400 bg-green-500/10 border-green-500/20" };
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

    const ProductImage = ({ src, alt, className }) => {
        const [error, setError] = useState(false);

        if (error) {
            return (
                <div className={`${className} flex items-center justify-center bg-[#0a0a0a] text-white/20 text-xs`}>
                    📦
                </div>
            );
        }

        return (
            <img
                src={getImageUrl(src)}
                alt={alt}
                className={className}
                onError={() => setError(true)}
                loading="lazy"
            />
        );
    };


    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto animate-[slideUp_0.4s_ease-out]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Products</h1>
                        <p className="text-white/40 text-sm mt-1">
                            {pagination ? `${pagination.totalItems} products in inventory` : `${products.length} products in inventory`}
                        </p>
                    </div>
                    <Link
                        to="/admin/products/add"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Product
                    </Link>
                </div>

                {/* Search & Per Page */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products by name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs whitespace-nowrap">Per page:</span>
                        {[8, 12, 24, 48].map((n) => (
                            <button
                                key={n}
                                onClick={() => { setLimit(n); setPage(1); }}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${limit === n
                                    ? "bg-[#e8c547] text-[#0a0a0a]"
                                    : "bg-[#111] border border-white/[0.06] text-white/50 hover:text-white hover:border-white/[0.12]"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm font-medium text-red-400 animate-[fadeIn_0.3s_ease]">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                            <span className="text-white/40 text-sm">Loading products...</span>
                        </div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4 opacity-20">📦</div>
                        <h2 className="text-xl font-bold text-white mb-2">No products found</h2>
                        <p className="text-white/40 text-sm">
                            {search ? "Try a different search term" : "Add your first product to get started"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="text-left px-6 py-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Product</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Category</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Price</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Stock</th>
                                        <th className="text-right px-6 py-4 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => {
                                        const stockStatus = getStockStatus(product.stock);
                                        return (
                                            <tr
                                                key={product._id}
                                                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg overflow-hidden border border-white/[0.06] flex-shrink-0">
                                                            <ProductImage
                                                                src={product.image}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-white font-medium text-sm truncate max-w-[200px]">{product.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-white/50 text-sm">{product.category || "—"}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[#e8c547] font-bold text-sm">₹{product.price?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${stockStatus.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.label === "In Stock" ? "bg-green-400" : stockStatus.label === "Low Stock" ? "bg-orange-400" : "bg-red-400"}`} />
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                            className="p-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/50 hover:text-[#e8c547] hover:border-[#e8c547]/30 transition-all"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(product)}
                                                            className="p-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/50 hover:text-red-400 hover:border-red-500/30 transition-all"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                return (
                                    <div
                                        key={product._id}
                                        className="bg-[#111] border border-white/[0.06] rounded-2xl p-4"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-14 h-14 bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/[0.06] flex-shrink-0">
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold text-sm truncate">{product.title}</h3>
                                                <p className="text-white/40 text-xs mt-0.5">{product.category || "—"}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[#e8c547] font-bold text-sm">₹{product.price?.toLocaleString()}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${stockStatus.color}`}>
                                                        {product.stock} left
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                                            <button
                                                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                className="flex-1 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(product)}
                                                className="flex-1 py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                                                ? "bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] shadow-lg shadow-[#e8c547]/20"
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={!!deleteTarget}
                title="Delete Product?"
                description={
                    deleteTarget
                        ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                danger
                loading={deleting}
                error={error}
                onConfirm={() => deleteProduct(deleteTarget._id)}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
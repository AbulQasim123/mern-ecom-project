import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router";

const API_BASE_URL = "http://localhost:5001"; 
const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_BASE_URL}${imagePath}`;
    return imagePath;
};

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        stock: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(""); // For file upload preview (blob URL or data URL)
    const [currentImage, setCurrentImage] = useState(""); // DB stored image path
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const allowedFields = [
        { name: "title", label: "Product Title", placeholder: "e.g. Wireless Headphones Pro", type: "text", required: true },
        { name: "description", label: "Description", placeholder: "Detailed product description...", type: "text", required: false },
        { name: "price", label: "Price (₹)", placeholder: "2999", type: "number", required: true, min: 0 },
        { name: "category", label: "Category", placeholder: "e.g. Electronics", type: "text", required: false },
        { name: "stock", label: "Stock Quantity", placeholder: "100", type: "number", required: true, min: 0 },
    ];

    const loadProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get("/products");
            const allProducts = Array.isArray(res.data) ? res.data : res.data.products || [];
            const product = allProducts.find((p) => p._id === id);

            if (product) {
                setForm({
                    title: product.title || "",
                    price: product.price || "",
                    description: product.description || "",
                    category: product.category || "",
                    stock: product.stock || "",
                });
                // ✅ Store raw DB path
                setCurrentImage(product.image || "");
                // ✅ No preview initially (will show currentImage from DB)
                setImagePreview("");
            } else {
                setError("Product not found");
            }
        } catch {
            setError("Failed to load product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === "price" || name === "stock") && value < 0) return;
        setForm({ ...form, [name]: value });
        setError("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            setError("Only .jpg, .jpeg, .png, .webp files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        setImageFile(file);
        setError("");
        // ✅ Create blob URL for instant preview
        setImagePreview(URL.createObjectURL(file));
    };

    // ✅ Remove new image, revert to current DB image
    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) { setError("Product title is required"); return; }
        if (!form.price || Number(form.price) <= 0) { setError("Valid price is required"); return; }
        if (!form.stock || Number(form.stock) < 0) { setError("Valid stock quantity is required"); return; }

        setSaving(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("price", form.price);
            formData.append("category", form.category);
            formData.append("stock", form.stock);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            await api.put(`/products/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess(true);
            setTimeout(() => navigate("/admin/products"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ✅ Determine which image to show
    const displayImage = imagePreview || getImageUrl(currentImage);
    const hasImage = !!displayImage;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                    <span className="text-white/40 text-sm">Loading product...</span>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="text-center animate-[slideUp_0.4s_ease-out]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Product Updated!</h2>
                    <p className="mt-2 text-sm text-white/50">Redirecting to product list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-xl mx-auto animate-[slideUp_0.4s_ease-out]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="p-2.5 bg-[#111] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:border-white/[0.12] transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Product</h1>
                        <p className="text-white/40 text-sm mt-0.5">Update product details</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl">
                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm font-medium text-red-400 animate-[fadeIn_0.3s_ease]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Text Fields */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {allowedFields.slice(0, 2).map((field) => (
                                <div key={field.name} className={field.name === "description" ? "sm:col-span-2" : ""}>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                                    </label>
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        required={field.required}
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            {allowedFields.slice(2).map((field) => (
                                <div key={field.name}>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                                    </label>
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        required={field.required}
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ✅ Image Upload Section */}
                        <div>
                            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                Product Image
                                {hasImage && <span className="text-green-400 ml-1.5 text-[9px]">● Active</span>}
                            </label>

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                    hasImage 
                                        ? "border-[#e8c547]/30 bg-[#e8c547]/[0.03]" 
                                        : "border-white/[0.08] hover:border-white/[0.15] bg-[#0a0a0a]"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />

                                {hasImage ? (
                                    <div className="relative">
                                        {/* ✅ Show current or new image */}
                                        <img
                                            src={displayImage}
                                            alt="Product"
                                            className="w-full h-48 object-contain rounded-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback if image fails to load */}
                                        <div className="hidden h-48 items-center justify-center text-white/20 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                                <polyline points="21 15 16 10 5 21"/>
                                            </svg>
                                            <p>Image not available</p>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                            title={imagePreview ? "Remove new image" : "Remove image"}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>

                                        <p className="text-white/30 text-xs mt-2">
                                            {imagePreview 
                                                ? "New image selected — click to change" 
                                                : "Current image — click to change"
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-white/20">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        <p className="text-white/40 text-sm font-medium">Click to upload product image</p>
                                        <p className="text-white/25 text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/products")}
                                className="flex-1 py-3.5 bg-[#0a0a0a] border border-white/[0.08] text-white/60 font-semibold text-sm rounded-xl hover:bg-white/[0.03] hover:text-white transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-[2] py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Saving...
                                    </span>
                                ) : (
                                    "Update Product"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
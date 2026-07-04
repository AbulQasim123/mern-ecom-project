import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";
import ConfirmModal from "../components/ConfirmModal";
import { getImageUrl } from "../utils/imageUrl";

export default function Cart() {
    const userId = localStorage.getItem("userId");
    const [cart, setCart] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [busyItemId, setBusyItemId] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);
    const [removing, setRemoving] = useState(false);
    const navigate = useNavigate();

    const loadCart = async () => {
        if (!userId) {
            navigate("/login");
            return;
        }

        try {
            setLoadError("");
            const res = await api.get(`/cart/${userId}`);
            setCart(res.data || { items: [] });
        } catch (err) {
            setLoadError(
                err.response?.data?.message || "Couldn't load your cart. Please try again."
            );
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const removeItem = async (productId) => {
        setRemoving(true);
        try {
            await api.post(`/cart/remove`, { userId, productId });
            await loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
            setRemoveTarget(null);
        } catch (err) {
            setLoadError(err.response?.data?.message || "Couldn't remove this item. Please try again.");
        } finally {
            setRemoving(false);
        }
    };

    const updateQty = async (productId, quantity) => {
        if (quantity === 0) {
            const item = cart.items.find((i) => i.productId._id === productId);
            setRemoveTarget(item);
            return;
        }

        setBusyItemId(productId);
        try {
            await api.post(`/cart/update`, { userId, productId, quantity });
            await loadCart();
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            setLoadError(err.response?.data?.message || "Couldn't update quantity. Please try again.");
        } finally {
            setBusyItemId(null);
        }
    };

    if (loadError && !cart) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0a0a0a]">
                <div className="max-w-md w-full text-center animate-[slideUp_0.3s_ease-out]">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-red-400 text-sm font-medium">{loadError}</p>
                    </div>
                    <button
                        onClick={loadCart}
                        className="px-5 py-2.5 bg-[#111] border border-white/[0.08] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                    <span className="text-white/40 text-sm">Loading your cart...</span>
                </div>
            </div>
        );
    }

    const total = cart.items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto animate-[slideUp_0.4s_ease-out]">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Shopping Cart</h1>
                    <span className="text-white/40 text-sm font-medium">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</span>
                </div>

                {loadError && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm font-medium text-red-400 animate-[fadeIn_0.3s_ease]">
                        {loadError}
                    </div>
                )}

                {cart.items.length === 0 ? (
                    <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-4 opacity-30">🛒</div>
                        <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
                        <p className="text-white/40 text-sm mb-6">Looks like you haven't added anything yet.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                        {/* Cart Items */}
                        <div className="space-y-3">
                            {cart.items.map((item) => {
                                const isBusy = busyItemId === item.productId._id;
                                return (
                                    <div
                                        key={item.productId._id}
                                        className={`bg-[#111] border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 ${isBusy ? "opacity-50" : "hover:border-white/[0.1]"}`}
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0a0a0a] rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.06]">
                                         <img
                                                src={getImageUrl(item.productId.image)}
                                                alt={item.productId.title}
                                                className="w-full max-h-[400px] object-contain rounded-xl"
                                            />
                                           
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                                                {item.productId.title}
                                            </h3>
                                            <p className="text-[#e8c547] font-bold text-sm mt-1">
                                                ₹{item.productId.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-[#0a0a0a] border border-white/[0.08] rounded-lg p-1">
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() => updateQty(item.productId._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </button>
                                                <span className="w-8 text-center text-white font-semibold text-sm tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() => updateQty(item.productId._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                disabled={isBusy}
                                                onClick={() => setRemoveTarget(item)}
                                                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
                                <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Subtotal</span>
                                        <span className="text-white font-medium">₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Shipping</span>
                                        <span className="text-green-400 font-medium">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Tax (5%)</span>
                                        <span className="text-white font-medium">₹{Math.round(total * 0.05).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/[0.06] mt-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-bold">Total</span>
                                        <span className="text-xl font-bold text-[#e8c547]">₹{Math.round(total * 1.05).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/checkout-address")}
                                    className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    Proceed to Checkout →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={!!removeTarget}
                title="Remove item from cart?"
                description={
                    removeTarget
                        ? `"${removeTarget.productId.title}" will be removed from your cart.`
                        : ""
                }
                confirmLabel="Remove"
                danger
                loading={removing}
                error={null}
                onConfirm={() => removeItem(removeTarget.productId._id)}
                onCancel={() => setRemoveTarget(null)}
            />
        </div>
    );
}
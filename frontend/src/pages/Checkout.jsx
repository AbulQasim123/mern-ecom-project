import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";
import { getImageUrl } from "../utils/imageUrl";


export default function Checkout() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cart, setCart] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        api.get(`/cart/${userId}`).then((res) => setCart(res.data));
        api.get(`/address/${userId}`).then((res) => {
            setAddresses(res.data);
            setSelectedAddress(res.data[0]);
        });
    }, [userId, navigate]);

    if (!cart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                    <span className="text-white/40 text-sm">Loading checkout...</span>
                </div>
            </div>
        );
    }

    const total = cart.items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
    );

    const placeOrder = async () => {
        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        setPlacing(true);
        setError("");

        try {
            const res = await api.post("/order/place", {
                userId,
                address: selectedAddress,
            });
            navigate(`/order-success/${res.data.orderId}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
            setPlacing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto animate-[slideUp_0.4s_ease-out]">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Checkout</h1>

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm font-medium text-red-400 animate-[fadeIn_0.3s_ease]">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                    {/* Address Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Delivery Address</h2>
                            <button
                                onClick={() => navigate("/checkout-address")}
                                className="text-[#e8c547] text-sm font-semibold hover:underline"
                            >
                                + Add New
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-8 text-center">
                                <p className="text-white/50 text-sm mb-4">No addresses saved yet.</p>
                                <button
                                    onClick={() => navigate("/checkout-address")}
                                    className="px-5 py-2.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 transition-all duration-200"
                                >
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <label
                                        key={addr._id}
                                        className={`block bg-[#111] border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                                            selectedAddress?._id === addr._id
                                                ? "border-[#e8c547]/50 bg-[#e8c547]/[0.03]"
                                                : "border-white/[0.06] hover:border-white/[0.1]"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                selectedAddress?._id === addr._id
                                                    ? "border-[#e8c547] bg-[#e8c547]"
                                                    : "border-white/20"
                                            }`}>
                                                {selectedAddress?._id === addr._id && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1" onClick={() => setSelectedAddress(addr)}>
                                                <p className="text-white font-semibold text-sm">{addr.fullName}</p>
                                                <p className="text-white/40 text-sm mt-1 leading-relaxed">
                                                    {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
                                                </p>
                                                <p className="text-white/30 text-xs mt-2 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                    </svg>
                                                    {addr.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>

                            {/* Items list */}
                            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                                {cart.items.map((item) => (
                                    <div key={item.productId._id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg overflow-hidden border border-white/[0.06] flex-shrink-0">
                                            {/* <img src={item.productId.image} alt="" className="w-full h-full object-cover" /> */}
                                             <img
                                               src={getImageUrl(item.productId.image)}
                                                alt={item.productId.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium truncate">{item.productId.title}</p>
                                            <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-[#e8c547] text-xs font-bold">
                                            ₹{(item.productId.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
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
                                onClick={placeOrder}
                                disabled={placing || addresses.length === 0}
                                className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {placing ? "Placing Order..." : "Place Order (COD)"}
                            </button>

                            <p className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                Cash on Delivery
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
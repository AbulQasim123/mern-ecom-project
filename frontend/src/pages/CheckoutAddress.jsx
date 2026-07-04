import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

export default function CheckoutAddress() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await api.post("/address/add", { ...form, userId });
            navigate("/checkout");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save address. Please try again.");
            setSaving(false);
        }
    };

    const fields = [
        { name: "fullName", label: "Full Name", placeholder: "John Doe", type: "text" },
        { name: "phone", label: "Phone Number", placeholder: "+91 98765 43210", type: "tel" },
        { name: "addressLine", label: "Address Line", placeholder: "123, Main Street, Apartment 4B", type: "text" },
        { name: "city", label: "City", placeholder: "Mumbai", type: "text" },
        { name: "state", label: "State", placeholder: "Maharashtra", type: "text" },
        { name: "pincode", label: "PIN Code", placeholder: "400001", type: "text" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-[#e8c547]/[0.05] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg animate-[slideUp_0.4s_ease-out]">
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50">
                    <button
                        onClick={() => navigate("/checkout")}
                        className="flex items-center gap-2 text-white/40 text-sm hover:text-white transition-colors mb-6"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Checkout
                    </button>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Delivery Address</h2>
                    <p className="text-white/40 text-sm mb-8">Enter your shipping details below</p>

                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm font-medium text-red-400 animate-[fadeIn_0.3s_ease]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={saveAddress} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {fields.slice(0, 2).map((field) => (
                                <div key={field.name}>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                        {field.label}
                                    </label>
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                {fields[2].label}
                            </label>
                            <input
                                name={fields[2].name}
                                type={fields[2].type}
                                placeholder={fields[2].placeholder}
                                value={form.addressLine}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                            />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            {fields.slice(3).map((field) => (
                                <div key={field.name}>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                                        {field.label}
                                    </label>
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {saving ? "Saving..." : "Save Address & Continue"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
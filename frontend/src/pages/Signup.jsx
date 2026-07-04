import { useState } from "react";
import { Link } from "react-router";
import api from "../api/axios";

export default function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [msg, setMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const response = await api.post("/auth/signup", form);
            setMsg(response.data.message);
            setIsSuccess(true);
            setForm({ name: "", email: "", password: "" });
        } catch (err) {
            setMsg(err.response?.data?.message || "An error occurred");
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-[#e8c547]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] bg-red-500/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 animate-[slideUp_0.5s_ease-out]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                        Create Account
                    </h2>
                    <p className="text-white/50 text-center text-sm mb-8">
                        Join Bhiwandi Store today
                    </p>

                    {/* Tab switcher */}
                    <div className="flex gap-1 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-1 mb-6">
                        <Link
                            to="/login"
                            className="flex-1 py-2.5 text-center text-sm font-semibold text-white/50 rounded-lg transition-all"
                        >
                            Login
                        </Link>
                        <div className="flex-1 py-2.5 text-center text-sm font-semibold bg-[#111] text-white rounded-lg shadow-sm">
                            Sign Up
                        </div>
                    </div>

                    {/* Alert */}
                    {msg && (
                        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium text-center animate-[fadeIn_0.3s_ease] ${isSuccess
                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                            }`}>
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8c547]/50 focus:ring-2 focus:ring-[#e8c547]/10 transition-all duration-200 hover:border-white/15"
                                
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#e8c547] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
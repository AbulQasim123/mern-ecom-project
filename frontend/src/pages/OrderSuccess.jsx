import { useParams, useNavigate } from "react-router";

export default function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();

    const goHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#e8c547]/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full text-center animate-[slideUp_0.5s_ease-out]">
                {/* Success Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                    Order Placed Successfully!
                </h1>
                <p className="text-white/40 text-base mb-8 leading-relaxed">
                    Thank you for shopping with us. Your order has been confirmed and will be delivered soon.
                </p>

                {/* Order ID Card */}
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 mb-8 shadow-xl">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                        Order ID
                    </p>
                    <p className="text-[#e8c547] font-mono text-lg font-bold tracking-wide">
                        #{id}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Confirmed
                    </div>
                </div>

                <button
                    onClick={goHome}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}
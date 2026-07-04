import { useNavigate } from "react-router";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#e8c547]/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-md animate-[slideUp_0.5s_ease-out]">
                {/* 404 Number */}
                <div className="relative mb-6">
                    <span className="text-[120px] sm:text-[160px] font-extrabold leading-none bg-gradient-to-b from-white/10 to-transparent bg-clip-text text-transparent select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl sm:text-7xl">🚀</span>
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Lost in Space?
                </h1>
                <p className="text-white/40 text-sm sm:text-base mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved to another dimension.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-[#111] border border-white/[0.08] text-white/70 font-semibold text-sm rounded-xl hover:bg-white/[0.03] hover:text-white hover:border-white/[0.12] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useRef } from "react";

export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    loading = false,
    error = null,
    onConfirm,
    onCancel,
    children,
    confirmDisabled = false,
}) {
    const dialogRef = useRef(null);

    // useEffect(() => {
    //     if (!open) return;

    //     const handleKeyDown = (e) => {
    //         if (e.key === "Escape" && !loading) {
    //             onCancel?.();
    //         }
    //     };

    //     document.addEventListener("keydown", handleKeyDown);
    //     dialogRef.current?.focus();

    //     return () => document.removeEventListener("keydown", handleKeyDown);
    // }, [open, loading, onCancel]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !loading) {
                onCancel?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, loading]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel?.();
            }}
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="w-full max-w-md bg-[#111] border border-white/[0.06] rounded-[20px] p-7 shadow-2xl shadow-black/80 outline-none animate-[scaleIn_0.18s_ease-out]"
            >
                {/* Header */}
                <div className="flex items-start gap-3.5">
                    <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${danger
                            ? "bg-red-500/10 border border-red-500/15 text-red-500"
                            : "bg-[#e8c547]/10 border border-[#e8c547]/15 text-[#e8c547]"
                            }`}
                    >
                        {danger ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 id="confirm-modal-title" className="text-lg font-bold text-white leading-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="mt-1.5 text-[13px] text-white/45 leading-relaxed">{description}</p>
                        )}
                    </div>
                </div>

                {/* Children (form inputs etc.) */}
                {children && (
                    <div className="mt-5 pt-5 border-t border-white/[0.06]">
                        {children}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-3.5 rounded-xl bg-red-500/[0.06] border border-red-500/10 px-4 py-3 text-[13px] font-medium text-red-400 animate-[shake_0.3s_ease-in-out]">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/50 bg-transparent border border-white/[0.08] hover:bg-white/[0.03] hover:text-white hover:border-white/[0.12] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading || confirmDisabled}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${danger
                            ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30"
                            : "bg-gradient-to-r from-[#e8c547] to-[#d4a520] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#e8c547]/20 hover:-translate-y-0.5"
                            }`}
                    >
                        {loading && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                        {loading ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
}
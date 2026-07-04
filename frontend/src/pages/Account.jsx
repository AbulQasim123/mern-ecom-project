import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

export default function Account() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [pageError, setPageError] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const loadProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (err) {
                setPageError(
                    err.response?.data?.message || "Couldn't load your account right now."
                );
            } finally {
                setPageLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const openModal = () => {
        setPassword("");
        setConfirmText("");
        setDeleteError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (deleting) return;
        setModalOpen(false);
    };

    const handleDelete = async () => {
        setDeleteError(null);

        if (confirmText !== "DELETE") {
            setDeleteError('Please type "DELETE" exactly to confirm.');
            return;
        }
        if (!password) {
            setDeleteError("Please enter your password.");
            return;
        }

        setDeleting(true);
        try {
            await api.delete("/auth/delete", {
                data: { password, confirmation: confirmText },
            });

            setDeleted(true);
            setModalOpen(false);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");

            setTimeout(() => {
                navigate("/login");
            }, 1800);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                "Something went wrong deleting your account. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (deleted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0a0a0a]">
                <div className="text-center animate-[slideUp_0.4s_ease-out]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-3xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Account deleted</h2>
                    <p className="mt-2 text-sm text-white/50">Sorry to see you go. Redirecting you now...</p>
                </div>
            </div>
        );
    }

    if (pageLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#e8c547]" />
                    <span className="text-white/40 text-sm">Loading your profile...</span>
                </div>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0a0a0a]">
                <div className="max-w-md w-full text-center animate-[slideUp_0.3s_ease-out]">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-red-400 text-sm font-medium">{pageError}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-[#111] border border-white/[0.08] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto animate-[slideUp_0.4s_ease-out]">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">My Account</h1>

                {/* Profile Card */}
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e8c547] to-[#d4a520] text-xl font-bold text-[#0a0a0a] shadow-lg shadow-[#e8c547]/10">
                            {user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">{user?.name}</p>
                            <p className="text-sm text-white/40">{user?.email}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/[0.06]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/[0.06]">
                                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Member Since</p>
                                <p className="text-white font-medium">Active</p>
                            </div>
                            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/[0.06]">
                                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Status</p>
                                <p className="text-green-400 font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-6 bg-red-500/[0.04] border border-red-500/10 rounded-2xl p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-bold text-red-400">Danger Zone</h2>
                            <p className="mt-1 text-sm text-red-400/70 leading-relaxed">
                                Deleting your account is permanent. Your cart and saved addresses
                                will be removed and this cannot be undone.
                            </p>
                            <button
                                onClick={openModal}
                                className="mt-4 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/20 transition-all duration-200"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
                

                <ConfirmModal
                    open={modalOpen}
                    title="Delete your account?"
                    description="This will permanently delete your account, cart and saved addresses. This action cannot be undone."
                    confirmLabel="Delete Permanently"
                    danger
                    loading={deleting}
                    error={deleteError}
                    onConfirm={handleDelete}
                    onCancel={closeModal}
                    confirmDisabled={confirmText !== "DELETE" || !password}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                Confirm your password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={deleting}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                Type <span className="font-mono text-red-400">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                disabled={deleting}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>
                </ConfirmModal>
            </div>
        </div>
    );
}
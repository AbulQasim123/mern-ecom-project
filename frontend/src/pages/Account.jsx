import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

export default function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // Delete-account modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    // Edge case: not logged in at all, don't even try to hit the API
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
        // The axios interceptor already redirects on 401; this covers
        // any other unexpected failure (network down, server error, etc.)
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
    if (deleting) return; // don't allow closing mid-request
    setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleteError(null);

    // Edge case: client-side guard, mirrors server-side validation
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

      // Clean up the session, then give the user a moment to see the
      // success state before bouncing them out.
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      // Edge case: wrong password, server error, network drop mid-request
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
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl animate-[popIn_0.3s_ease-out]">
            ✅
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account deleted</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry to see you go. Redirecting you now...
          </p>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <p className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">
          {pageError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-base font-bold text-red-800">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-700">
          Deleting your account is permanent. Your cart and saved addresses
          will be removed and this cannot be undone.
        </p>
        <button
          onClick={openModal}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Delete My Account
        </button>
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
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Confirm your password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={deleting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Type <span className="font-mono text-red-600">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={deleting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
          />
        </div>
      </ConfirmModal>
    </div>
  );
}

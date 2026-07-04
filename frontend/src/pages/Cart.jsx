import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";
import ConfirmModal from "../components/ConfirmModal";

export default function Cart() {
  const userId = localStorage.getItem("userId");
  const [cart, setCart] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [busyItemId, setBusyItemId] = useState(null); // disable buttons for the item being updated
  const [removeTarget, setRemoveTarget] = useState(null); // item pending removal confirmation
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  //Load cart data
  const loadCart = async () => {
    // Edge case: not logged in, send to login instead of a blank/broken cart
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      setLoadError("");
      const res = await api.get(`/cart/${userId}`);
      // Edge case: brand-new user with no cart document yet
      setCart(res.data || { items: [] });
    } catch (err) {
      setLoadError(
        err.response?.data?.message || "Couldn't load your cart. Please try again."
      );
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = async (productId) => {
    setRemoving(true);
    try {
      await api.post(`/cart/remove`, { userId, productId });
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
      setRemoveTarget(null);
    } catch (err) {
      // Keep the modal open so the user can see what went wrong and retry
      setLoadError(err.response?.data?.message || "Couldn't remove this item. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  //Update item quantity
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
      <div className="mx-auto max-w-lg p-6 text-center">
        <p className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">
          {loadError}
        </p>
        <button
          onClick={loadCart}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {loadError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {loadError}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <p className="text-lg">Your cart is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => {
            const isBusy = busyItemId === item.productId._id;
            return (
              <div
                key={item.productId._id}
                className={`flex items-center justify-between p-4 border rounded transition-opacity ${
                  isBusy ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productId.image}
                    alt={item.productId.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {item.productId.title}
                    </h2>
                    <p className="text-gray-600">
                      ${item.productId.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isBusy}
                    onClick={() =>
                      updateQty(item.productId._id, item.quantity - 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={isBusy}
                    onClick={() =>
                      updateQty(item.productId._id, item.quantity + 1)
                    }
                    className="px-2 py-1 bg-gray-200 rounded disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div>
                  <p className="font-semibold">
                    ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  disabled={isBusy}
                  onClick={() => setRemoveTarget(item)}
                  className="text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            );
          })}

          <div className="text-right mt-4">
            <h2 className="text-xl font-bold">Total: ${total.toFixed(2)}</h2>
          </div>
          <button onClick={()=> navigate("/checkout-address")} className="w-full bg-blue-500 text-white p-2 rounded">
            Proceed to Checkout
          </button>
        </div>
      )}

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

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function Customer() {
  const [searchParams] = useSearchParams();
  const [tableId, setTableId] = useState(
    searchParams.get("table") || ""
  );
  const [tablePassword, setTablePassword] = useState("");
  const [token, setToken] = useState("");
  const [tableName, setTableName] = useState("");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState("all");
  const [orderNotes, setOrderNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const isAuthed = useMemo(() => Boolean(token), [token]);
  const total = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart]
  );

  // Update tableId when URL changes
  useEffect(() => {
    const urlTableId = searchParams.get("table");
    if (urlTableId) {
      setTableId(urlTableId);
    }
  }, [searchParams]);

  /* ---------------- FILTER MENU ---------------- */
  const filteredMenu = useMemo(() => {
    let items = menu;

    if (vegFilter === "veg") items = items.filter((m) => m.isVeg);
    if (vegFilter === "nonveg") items = items.filter((m) => !m.isVeg);

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.category || "").toLowerCase().includes(q)
      );
    }

    return items;
  }, [menu, vegFilter, search]);

  /* ---------------- VERIFY LOGIN ---------------- */
  async function verify(e) {
    e.preventDefault();
    setVerifyError("");
    try {
      const { token: t, table } = await api("/customer/table/verify", {
        method: "POST",
        body: { tableId, tablePassword },
      });
      setToken(t);
      setTableName(table?.name || tableId);
    } catch (err) {
      setVerifyError(err?.message || "Invalid table credentials. Please check your table ID and password.");
    }
  }

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!isAuthed) return;

    (async () => {
      const items = await api("/customer/menu");
      setMenu(items);

      if (token) {
        const list = await api("/customer/orders", { token });
        setOrders(list);
      }
    })();

    const id = setInterval(() => {
      if (token) api("/customer/orders", { token }).then(setOrders);
    }, 5000);

    return () => clearInterval(id);
  }, [isAuthed, token]);

  /* ---------------- CART FUNCTIONS ---------------- */
  function addToCart(i) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.menuItemId === i._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { menuItemId: i._id, name: i.name, price: i.price, quantity: 1, customizations: "" }];
    });
  }

  function changeQty(index, delta) {
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity = Math.max(1, next[index].quantity + delta);
      return next;
    });
  }

  function removeItem(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCustomization(index, value) {
    setCart((prev) => {
      const next = [...prev];
      next[index].customizations = value;
      return next;
    });
  }

  /* ---------------- PLACE ORDER ---------------- */
  async function placeOrder() {
    if (!token || cart.length === 0) return;
    const payload = {
      items: cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
        customizations: c.customizations,
      })),
      notes: orderNotes,
    };
    await api("/customer/orders", { method: "POST", body: payload, token });
    setCart([]);
    setOrderNotes("");
    await refreshOrders();
    setShowSummary(false);
  }

  async function refreshOrders() {
    const list = await api("/customer/orders", { token });
    setOrders(list);
  }

  /* ---------------- FEEDBACK ---------------- */
  async function submitFeedback(orderId, foodRating, serviceRating, suggestions) {
    await api("/customer/feedback", {
      method: "POST",
      body: { orderId, foodRating, serviceRating, suggestions },
      token,
    });
    alert("Thanks for your feedback!");
  }

  /* ---------------- CALL WAITER ---------------- */
  async function callWaiter() {
    await api("/customer/call-waiter", { method: "POST", token });
    alert("Waiter Notified!");
  }

  /* ---------------- LOGIN PAGE (LIGHT THEME) ---------------- */
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm border border-green-500">
          <h3 className="text-xl font-bold text-center text-green-600 mb-4">
            Confirm Your Table
          </h3>

          <form onSubmit={verify} className="space-y-4">
            <input
              value={tableId}
              onChange={(e) => {
                setTableId(e.target.value);
                setVerifyError("");
              }}
              placeholder="Table ID"
              required
              className="w-full p-3 border rounded-lg border-gray-300"
            />

            <input
              value={tablePassword}
              onChange={(e) => {
                setTablePassword(e.target.value);
                setVerifyError("");
              }}
              placeholder="Table Password"
              required
              className="w-full p-3 border rounded-lg border-gray-300"
            />

            {verifyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {verifyError}
              </div>
            )}

            <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg">
              Confirm
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="p-4 max-w-6xl mx-auto bg-gray-50 text-gray-900 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-600">🍽️ Table: {tableName}</h2>
        <button
          onClick={callWaiter}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold shadow"
        >
          Call Waiter
        </button>
      </div>

      {/* ---------------- MENU ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6 border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-green-700">Menu</h3>

        {/* Search + Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            className="p-3 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-3 border rounded-lg"
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredMenu.map((i) => (
            <div key={i._id} className="p-4 bg-gray-100 rounded-xl border shadow-sm">
              <h4 className="text-lg font-bold mb-1">{i.name}</h4>

              <div className="flex gap-2 mb-2">
                <span className="px-2 py-1 text-xs bg-gray-200 rounded">{i.category}</span>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    i.isVeg ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                  }`}
                >
                  {i.isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>

              <p className="font-semibold text-green-600">₹{i.price}</p>

              <button
                onClick={() => addToCart(i)}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CART ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6 border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-blue-700">Cart</h3>

        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((c, idx) => (
                <div key={c.menuItemId} className="p-4 bg-gray-100 rounded-xl border flex justify-between">
                  
                  <div className="w-2/3">
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-green-600">₹{c.price}</p>

                    <input
                      className="mt-2 p-2 border rounded w-full"
                      placeholder="Customizations"
                      value={c.customizations}
                      onChange={(e) => updateCustomization(idx, e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2">
                    <button onClick={() => changeQty(idx, -1)} className="px-3 py-1 bg-gray-300 rounded">-</button>
                    <span>{c.quantity}</span>
                    <button onClick={() => changeQty(idx, 1)} className="px-3 py-1 bg-gray-300 rounded">+</button>

                    <button onClick={() => removeItem(idx)} className="text-red-500 text-xl">✕</button>
                  </div>

                </div>
              ))}
            </div>

            <p className="mt-4 text-xl font-bold text-green-600">
              Total: ₹{total.toFixed(2)}
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowSummary(true)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Review
              </button>
              <button
                onClick={placeOrder}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </section>

      {/* ---------------- ORDER SUMMARY ---------------- */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative border border-green-400">
            <button onClick={() => setShowSummary(false)} className="absolute right-4 top-4 text-xl text-red-500">✕</button>

            <h3 className="text-2xl font-bold mb-4 text-green-700">Order Summary</h3>

            <div className="space-y-3">
              {cart.map((c) => (
                <div key={c.menuItemId} className="flex justify-between border-b pb-2">
                  <span>{c.name} x{c.quantity}</span>
                  <span className="text-green-600">₹{(c.quantity * c.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xl font-bold text-green-700">
              Total: ₹{total.toFixed(2)}
            </p>

            <button
              onClick={placeOrder}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white p-3 rounded"
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MY ORDERS ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h3 className="text-2xl font-semibold mb-4 text-purple-700">My Orders</h3>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-gray-100 p-4 rounded-xl border">
              <p className="font-bold">Order #{o._id}</p>

              <p className="text-sm text-gray-700">
                {o.items
                  .map((i) => `${i.name} x${i.quantity}`)
                  .join(", ")}
              </p>

              <div className="mt-1 flex justify-between">
                <span className="text-green-600">₹{o.total}</span>

                <span className={`px-3 py-1 rounded-lg text-sm text-white ${
                  o.status === "new"
                    ? "bg-yellow-500"
                    : o.status === "preparing"
                    ? "bg-blue-500"
                    : o.status === "ready"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}>
                  {statusLabel(o.status)}
                </span>
              </div>

              {o.status === "served" && (
                <FeedbackForm orderId={o._id} onSubmit={submitFeedback} />
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xl font-bold text-green-700">
          Current bill total: ₹
          {orders
            .filter((o) => o.status !== "cancelled")
            .reduce((s, o) => s + Number(o.total || 0), 0)
            .toFixed(2)}
        </p>
      </section>

    </div>
  );
}

/* ---------------- STATUS LABEL ---------------- */
function statusLabel(s) {
  switch (s) {
    case "new": return "New";
    case "preparing": return "Preparing";
    case "ready": return "Ready";
    case "served": return "Served";
    case "cancelled": return "Cancelled";
    default: return s;
  }
}

/* ---------------- FEEDBACK FORM (LIGHT THEME) ---------------- */
function FeedbackForm({ orderId, onSubmit }) {
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [suggestions, setSuggestions] = useState("");

  return (
    <form
      className="mt-4 p-4 bg-white border rounded-xl shadow"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(orderId, foodRating, serviceRating, suggestions);
      }}
    >
      <h4 className="font-bold mb-2 text-green-600">Rate your order</h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Food Rating</label>
          <select
            value={foodRating}
            onChange={(e) => setFoodRating(Number(e.target.value))}
            className="w-full p-2 border rounded bg-gray-100"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Service Rating</label>
          <select
            value={serviceRating}
            onChange={(e) => setServiceRating(Number(e.target.value))}
            className="w-full p-2 border rounded bg-gray-100"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <input
        placeholder="Suggestions"
        value={suggestions}
        onChange={(e) => setSuggestions(e.target.value)}
        className="w-full p-2 border rounded bg-gray-100"
      />

      <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        Submit
      </button>
    </form>
  );
}

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

  /* ---------------- LOGIN PAGE ---------------- */
  if (!isAuthed) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h3>🍽️ Confirm Your Table</h3>

          <form onSubmit={verify}>
            <input
              value={tableId}
              onChange={(e) => {
                setTableId(e.target.value);
                setVerifyError("");
              }}
              placeholder="Table ID"
              autoComplete="username"
              required
            />

            <input
              value={tablePassword}
              onChange={(e) => {
                setTablePassword(e.target.value);
                setVerifyError("");
              }}
              placeholder="Table Password"
              type="password"
              autoComplete="current-password"
              required
            />

            {verifyError && (
              <p className="error">{verifyError}</p>
            )}

            <button type="submit">
              Confirm
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '2000px', 
      margin: '0 auto', 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800' }}>🍽️ Table: {tableName}</h2>
        <button
          onClick={callWaiter}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #ff006e 0%, #ff6b35 50%, #ffd23f 100%)',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 0, 110, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 30px rgba(255, 0, 110, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(255, 0, 110, 0.4)';
          }}
        >
          Call Waiter
        </button>
      </div>

      {/* ---------------- MENU ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <h3 className="rainbow-gradient" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>Menu</h3>

        {/* Search + Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px'
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px'
            }}
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value)}
          >
            <option value="all" style={{ background: '#1a1a2e', color: '#ffffff' }}>All</option>
            <option value="veg" style={{ background: '#1a1a2e', color: '#ffffff' }}>Veg</option>
            <option value="nonveg" style={{ background: '#1a1a2e', color: '#ffffff' }}>Non-Veg</option>
          </select>
        </div>

        {/* Menu Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredMenu.map((i) => (
            <div key={i._id} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
              borderRadius: '16px',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
              boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{i.name}</h4>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#e0e0e0',
                  border: '1px solid rgba(255, 0, 110, 0.3)'
                }}>{i.category}</span>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: i.isVeg 
                      ? 'linear-gradient(135deg, rgba(6, 255, 165, 0.3), rgba(78, 205, 196, 0.3))'
                      : 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 107, 53, 0.3))',
                    color: '#ffffff',
                    border: `1px solid ${i.isVeg ? 'rgba(6, 255, 165, 0.5)' : 'rgba(255, 0, 110, 0.5)'}`
                  }}
                >
                  {i.isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>

              <p style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{i.price}</p>

              <button
                onClick={() => addToCart(i)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #ff006e 0%, #ff6b35 50%, #ffd23f 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 0, 110, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 30px rgba(255, 0, 110, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(255, 0, 110, 0.4)';
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CART ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <h3 className="rainbow-gradient" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>Cart</h3>

        {cart.length === 0 ? (
          <p style={{ color: '#e0e0e0', fontSize: '18px', textAlign: 'center', padding: '40px' }}>Your cart is empty.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              {cart.map((c, idx) => (
                <div key={c.menuItemId} style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(255, 0, 110, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  
                  <div style={{ flex: '2' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{c.name}</h4>
                    <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{c.price}</p>

                    <input
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 0, 110, 0.3)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                      placeholder="Customizations"
                      value={c.customizations}
                      onChange={(e) => updateCustomization(idx, e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => changeQty(idx, -1)} 
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #5e72e4, #a855f7)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        minWidth: '40px'
                      }}
                    >-</button>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', minWidth: '30px', textAlign: 'center' }}>{c.quantity}</span>
                    <button 
                      onClick={() => changeQty(idx, 1)} 
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        minWidth: '40px'
                      }}
                    >+</button>

                    <button 
                      onClick={() => removeItem(idx)} 
                      style={{
                        color: '#ff006e',
                        fontSize: '24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >✕</button>
                  </div>

                </div>
              ))}
            </div>

            <p style={{ marginTop: '20px', fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
              Total: ₹{total.toFixed(2)}
            </p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setShowSummary(true)}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 0, 110, 0.5)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 0, 110, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Review
              </button>
              <button
                onClick={placeOrder}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ff006e 0%, #ff6b35 50%, #ffd23f 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 0, 110, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 30px rgba(255, 0, 110, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(255, 0, 110, 0.4)';
                }}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </section>

      {/* ---------------- ORDER SUMMARY ---------------- */}
      {showSummary && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(255, 0, 110, 0.4)',
            width: '100%',
            maxWidth: '500px',
            position: 'relative',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #ff006e, #ff6b35, #ffd23f, #06ffa5, #4ecdc4, #5e72e4, #a855f7) 1'
          }}>
            <button 
              onClick={() => setShowSummary(false)} 
              style={{
                position: 'absolute',
                right: '15px',
                top: '15px',
                fontSize: '28px',
                color: '#ff006e',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >✕</button>

            <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cart.map((c) => (
                <div key={c.menuItemId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '2px solid rgba(255, 0, 110, 0.2)'
                }}>
                  <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>{c.name} x{c.quantity}</span>
                  <span style={{ background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '16px', fontWeight: '700' }}>₹{(c.quantity * c.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p style={{
              marginTop: '20px',
              fontSize: '24px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px'
            }}>
              Total: ₹{total.toFixed(2)}
            </p>

            <button
              onClick={placeOrder}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: 'linear-gradient(135deg, #ff006e 0%, #ff6b35 50%, #ffd23f 100%)',
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 0, 110, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 30px rgba(255, 0, 110, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(255, 0, 110, 0.4)';
              }}
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MY ORDERS ---------------- */}
      <section className="card">
        <h3 className="rainbow-gradient" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>My Orders</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          {orders.map((o) => (
            <div key={o._id} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)'
            }}>
              <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Order #{o._id.slice(-6)}</p>

              <p style={{ fontSize: '14px', color: '#e0e0e0', marginBottom: '15px', lineHeight: '1.6' }}>
                {o.items
                  .map((i) => `${i.name} x${i.quantity}`)
                  .join(", ")}
              </p>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}>₹{o.total}</span>

                <span style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  background: o.status === "new"
                    ? 'linear-gradient(135deg, #ffd23f, #ff6b35)'
                    : o.status === "preparing"
                    ? 'linear-gradient(135deg, #4ecdc4, #5e72e4)'
                    : o.status === "ready"
                    ? 'linear-gradient(135deg, #06ffa5, #4ecdc4)'
                    : 'linear-gradient(135deg, #5e72e4, #a855f7)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  {statusLabel(o.status)}
                </span>
              </div>

              {o.status === "served" && (
                <FeedbackForm orderId={o._id} onSubmit={submitFeedback} />
              )}
            </div>
          ))}
        </div>

        <p style={{
          marginTop: '20px',
          fontSize: '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
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

/* ---------------- FEEDBACK FORM ---------------- */
function FeedbackForm({ orderId, onSubmit }) {
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [suggestions, setSuggestions] = useState("");

  return (
    <form
      style={{
        marginTop: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        border: '2px solid rgba(255, 0, 110, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)'
      }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(orderId, foodRating, serviceRating, suggestions);
      }}
    >
      <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rate your order</h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#e0e0e0' }}>Food Rating</label>
          <select
            value={foodRating}
            onChange={(e) => setFoodRating(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} style={{ background: '#1a1a2e', color: '#ffffff' }}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#e0e0e0' }}>Service Rating</label>
          <select
            value={serviceRating}
            onChange={(e) => setServiceRating(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} style={{ background: '#1a1a2e', color: '#ffffff' }}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <input
        placeholder="Suggestions"
        value={suggestions}
        onChange={(e) => setSuggestions(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 0, 110, 0.3)',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '14px',
          marginBottom: '15px'
        }}
      />

      <button 
        type="submit"
        style={{
          width: '100%',
          marginTop: '10px',
          padding: '12px',
          background: 'linear-gradient(135deg, #5e72e4 0%, #a855f7 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(94, 114, 228, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 30px rgba(94, 114, 228, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 20px rgba(94, 114, 228, 0.4)';
        }}
      >
        Submit
      </button>
    </form>
  );
}

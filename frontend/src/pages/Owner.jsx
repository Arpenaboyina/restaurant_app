
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { QRCodeSVG } from "qrcode.react";

/**
 * Owner.jsx (Light Modern Gradient Theme)
 * - UI-only improvements (glassmorphism, gradients, softer tables)
 * - No backend logic changed; all original api calls kept intact
 * - Tailwind CSS assumed in the project (used for styling)
 *
 * Paste this file into your frontend project (e.g., frontend/src/pages/Owner.jsx)
 */

export default function Owner() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const isAuthed = useMemo(() => Boolean(token), [token]);
  const [loginError, setLoginError] = useState("");

  /* ---------------- LOGIN ---------------- */
  async function login(e) {
    e.preventDefault();
    setLoginError("");

    try {
      const { token: t } = await api("/owner/login", {
        method: "POST",
        body: { password },
      });
      setToken(t);
    } catch (err) {
      setLoginError(err?.message || "Login failed");
    }
  }

  /* ---------------- INITIAL DATA ---------------- */
  useEffect(() => {
    if (!isAuthed) return;

    (async () => {
      const [m, t, o, f] = await Promise.all([
        api("/owner/menu", { token }),
        api("/owner/tables", { token }),
        api("/owner/orders", { token }),
        api("/owner/feedback", { token }),
      ]);

      setMenu(m);
      setTables(t);
      setOrders(o);
      setFeedback(f);
    })();
  }, [isAuthed, token]);

  async function refreshAll() {
    const [m, t, o, f] = await Promise.all([
      api("/owner/menu", { token }),
      api("/owner/tables", { token }),
      api("/owner/orders", { token }),
      api("/owner/feedback", { token }),
    ]);
    setMenu(m);
    setTables(t);
    setOrders(o);
    setFeedback(f);
  }

  /* ---------------- MENU OPERATIONS ---------------- */
  async function addMenu(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    const body = {
      name: form.get("name").toString().trim(),
      price: Number(form.get("price")),
      category: form.get("category").toString().trim(),
      available: Boolean(form.get("available")),
      imageUrl: form.get("imageUrl")?.toString().trim() || "",
      stock: Number(form.get("stock") || 0),
      popularity: Number(form.get("popularity") || 0),
      tags: form.get("tags")?.toString() || "",
      discountLabel: form.get("discountLabel")?.toString() || "",
      customizationOptions:
        form.get("customizationOptions")?.toString() || "",
    };

    await api("/owner/menu", { method: "POST", body, token });

    formEl.reset();
    refreshAll();
  }

  async function updateMenu(id, update) {
    await api(`/owner/menu/${id}`, {
      method: "PUT",
      body: update,
      token,
    });
    refreshAll();
  }

  async function deleteMenu(id) {
    await api(`/owner/menu/${id}`, { method: "DELETE", token });
    refreshAll();
  }

  async function editItem(item) {
    const name = window.prompt("Name", item.name);
    if (name == null) return;

    const priceStr = window.prompt("Price", String(item.price));
    if (priceStr == null) return;

    const category = window.prompt("Category", item.category);
    if (category == null) return;

    const tags = window.prompt(
      "Tags (comma separated)",
      (item.tags || []).join(",")
    );
    if (tags == null) return;

    const discountLabel = window.prompt(
      "Discount Label",
      item.discountLabel || ""
    );
    if (discountLabel == null) return;

    const popularityStr = window.prompt(
      "Popularity (0-100)",
      String(item.popularity ?? 0)
    );
    if (popularityStr == null) return;

    await api(`/owner/menu/${item._id}`, {
      method: "PUT",
      body: {
        name,
        price: Number(priceStr),
        category,
        tags,
        discountLabel,
        popularity: Number(popularityStr),
      },
      token,
    });

    refreshAll();
  }

  /* ---------------- TABLE OPERATIONS ---------------- */
  async function addTable(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await api("/owner/tables", {
      method: "POST",
      body: {
        tableId: form.get("tableId").toString().trim(),
        tablePassword: form.get("tablePassword").toString().trim(),
      },
      token,
    });

    e.target.reset();
    refreshAll();
  }

  async function updateTable(tableId, update) {
    await api(`/owner/tables/${tableId}`, {
      method: "PUT",
      body: update,
      token,
    });
    refreshAll();
  }

  async function deleteTable(tableId) {
    await api(`/owner/tables/${tableId}`, { method: "DELETE", token });
    refreshAll();
  }

  /* ---------------- ORDER OPERATIONS ---------------- */
  async function updateStatus(id, status) {
    await api(`/owner/orders/${id}/status`, {
      method: "POST",
      body: { status },
      token,
    });
    refreshAll();
  }

  /* -------------------------------------------------- LOGIN UI -------------------------------------------------- */

  if (!isAuthed) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>🔐 Owner Login</h2>

          <form onSubmit={login}>
            <input
              type="text"
              name="username"
              autoComplete="username"
              style={{ display: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <input
              value={password}
              type="password"
              placeholder="Owner password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {loginError && (
              <p className="error">{loginError}</p>
            )}

            <button type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- AUTHED UI -------------------------------------------------- */

  return (
    <div style={{
      padding: '20px',
      maxWidth: '2000px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      minHeight: '100vh'
    }}>

      <header style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '40px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 className="rainbow-gradient" style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
              📊 Owner Dashboard
            </h2>
            <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Dark · Modern · Responsive</p>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setToken("");
                setPassword("");
              }}
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
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>

            <button
              onClick={refreshAll}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #5e72e4 0%, #a855f7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
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
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MENU MANAGEMENT ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800' }}>Menu Management</h3>
          <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Add, edit or remove menu items</p>
        </div>

        <form
          onSubmit={addMenu}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}
        >
          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="name" 
            placeholder="Item name" 
            required 
          />

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="price" 
            placeholder="Price" 
            type="number" 
            required 
          />

          <select 
            name="category" 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          >
            <option value="Starter" style={{ background: '#1a1a2e', color: '#ffffff' }}>Starter</option>
            <option value="Main" style={{ background: '#1a1a2e', color: '#ffffff' }}>Main</option>
            <option value="Drinks" style={{ background: '#1a1a2e', color: '#ffffff' }}>Drinks</option>
            <option value="Dessert" style={{ background: '#1a1a2e', color: '#ffffff' }}>Dessert</option>
          </select>

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="imageUrl" 
            placeholder="Image URL (optional)" 
          />

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="tags" 
            placeholder="Tags (comma separated)" 
          />

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="stock" 
            placeholder="Stock" 
            type="number" 
          />

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="discountLabel" 
            placeholder="Discount label" 
          />

          <input 
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="popularity" 
            placeholder="Popularity (0-100)" 
            type="number" 
          />

          <input
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            name="customizationOptions"
            placeholder="Customization options"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 1' }}>
            <input 
              name="available" 
              type="checkbox" 
              defaultChecked 
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#e0e0e0', fontWeight: '600' }}>Available</span>
          </label>

          <button 
            type="submit"
            style={{
              gridColumn: '1 / -1',
              padding: '14px',
              background: 'linear-gradient(135deg, #06ffa5 0%, #4ecdc4 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(6, 255, 165, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 30px rgba(6, 255, 165, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(6, 255, 165, 0.4)';
            }}
          >
            Add Item
          </button>
        </form>

        {/* Menu Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '2px solid rgba(255, 0, 110, 0.3)', boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(168, 85, 247, 0.2))' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: '700' }}>Name</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Price</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Category</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Tags</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Availability</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {menu.map((i) => (
                <tr key={i._id} style={{ borderBottom: '2px solid rgba(255, 0, 110, 0.2)' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt={i.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        🍽️
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '16px' }}>{i.name}</div>
                      <div style={{ fontSize: '12px', color: '#e0e0e0' }}>{i.discountLabel || ""}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#ffffff', fontSize: '16px' }}>₹{Number(i.price).toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#e0e0e0', fontSize: '14px' }}>{i.category}</td>
                  <td style={{ padding: '12px', color: '#e0e0e0', fontSize: '14px' }}>{(i.tags || []).join(", ")}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: i.available 
                        ? 'linear-gradient(135deg, rgba(6, 255, 165, 0.3), rgba(78, 205, 196, 0.3))'
                        : 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 107, 53, 0.3))',
                      color: '#ffffff',
                      border: `1px solid ${i.available ? 'rgba(6, 255, 165, 0.5)' : 'rgba(255, 0, 110, 0.5)'}`
                    }}>
                      {i.available ? "Yes" : "No"}
                    </span>
                  </td>

                  <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 210, 63, 0.5)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 210, 63, 0.2)';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(1)';
                      }}
                      onClick={() => updateMenu(i._id, { available: !i.available })}
                    >
                      {i.available ? "Disable" : "Enable"}
                    </button>

                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(78, 205, 196, 0.5)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(78, 205, 196, 0.2)';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(1)';
                      }}
                      onClick={() => editItem(i)}
                    >
                      Edit
                    </button>

                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #ff006e, #ff6b35)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(255, 0, 110, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                      onClick={() => deleteMenu(i._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </section>

      {/* ---------------- FEEDBACK ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800' }}>Customer Feedback</h3>
          <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Recent feedback & suggestions</p>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '2px solid rgba(255, 0, 110, 0.3)', boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(168, 85, 247, 0.2))' }}>
              <tr>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Date</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Order</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Table</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Food</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Service</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Suggestions</th>
              </tr>
            </thead>

            <tbody>
              {feedback.map((f) => (
                <tr key={f._id} style={{ borderBottom: '2px solid rgba(255, 0, 110, 0.2)' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{new Date(f.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{f.orderId}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{f.tableId}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{f.foodRating}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{f.serviceRating}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{f.suggestions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- ANALYTICS ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>Analytics</h3>
        <Analytics token={token} />
      </section>

      {/* ---------------- TABLE MANAGEMENT ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800' }}>Tables</h3>
          <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Create tables and share QR codes</p>
        </div>

        <p style={{ fontSize: '14px', marginBottom: '20px', color: '#e0e0e0' }}>
          QR URL format: <b style={{ color: '#ffffff' }}>{window.location.origin}/customer?table=&lt;tableId&gt;</b>
        </p>

        {/* Add Table Form */}
        <form
          onSubmit={addTable}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}
        >
          <input
            name="tableId"
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            placeholder="Table ID"
            required
          />
          <input
            name="tablePassword"
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }}
            placeholder="Table Password"
            required
          />

          <button 
            type="submit"
            style={{
              gridColumn: '1 / -1',
              padding: '14px',
              background: 'linear-gradient(135deg, #06ffa5 0%, #4ecdc4 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(6, 255, 165, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 30px rgba(6, 255, 165, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(6, 255, 165, 0.4)';
            }}
          >
            Create Table
          </button>
        </form>

        {/* Tables List with QR Codes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {tables.map((t) => {
            const qrUrl = `${window.location.origin}/customer?table=${t.tableId}`;
            return (
              <div key={t.tableId} style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(255, 0, 110, 0.3)',
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 0, 110, 0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 0, 110, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Table {t.tableId}</h4>
                  <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '16px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <QRCodeSVG
                      value={qrUrl}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#e0e0e0' }}>
                    <strong style={{ color: '#ffffff' }}>Password:</strong> <span style={{ fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.1)', padding: '4px 8px', borderRadius: '6px', color: '#ffffff' }}>{t.tablePassword}</span>
                  </p>
                  <p style={{ fontSize: '14px' }}>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#ffffff',
                      background: t.active 
                        ? 'linear-gradient(135deg, rgba(6, 255, 165, 0.3), rgba(78, 205, 196, 0.3))'
                        : 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 107, 53, 0.3))',
                      border: `1px solid ${t.active ? 'rgba(6, 255, 165, 0.5)' : 'rgba(255, 0, 110, 0.5)'}`
                    }}>
                      {t.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#e0e0e0', wordBreak: 'break-all' }}>
                    <strong style={{ color: '#ffffff' }}>URL:</strong> {qrUrl}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button
                    style={{
                      flex: '1',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(78, 205, 196, 0.5)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(78, 205, 196, 0.2)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    onClick={() => updateTable(t.tableId, { active: !t.active })}
                  >
                    {t.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    style={{
                      flex: '1',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #ff006e, #ff6b35)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(255, 0, 110, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'scale(1)';
                    }}
                    onClick={() => deleteTable(t.tableId)}
                  >
                    Delete
                  </button>
                </div>
                <button
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #5e72e4 0%, #a855f7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
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
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.target = '_blank';
                    link.click();
                  }}
                >
                  🔗 Open Menu
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- ORDERS SECTION ---------------- */}
      <section className="card" style={{ marginBottom: '30px' }}>
        <h3 className="rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>Orders</h3>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '2px solid rgba(255, 0, 110, 0.3)', boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(168, 85, 247, 0.2))' }}>
              <tr>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>ID</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Table</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Items</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Notes</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Total</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '12px', color: '#ffffff', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr 
                  key={o._id} 
                  style={{ 
                    borderBottom: '2px solid rgba(255, 0, 110, 0.2)',
                    background: 'rgba(26, 26, 46, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 0, 110, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(26, 26, 46, 0.3)';
                  }}
                >
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{o._id.slice(-8)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{o.tableId}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>
                    {o.items
                      .map(
                        (i) =>
                          `${i.name} x${i.quantity}${
                            i.customizations ? ` (${i.customizations})` : ""
                          }`
                      )
                      .join(", ")}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#e0e0e0' }}>{o.notes || "-"}</td>
                  <td style={{ padding: '12px', fontSize: '16px', fontWeight: '700', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{Number(o.total).toFixed(2)}</td>

                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '6px 16px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#ffffff',
                        background: o.status === "new"
                          ? 'linear-gradient(135deg, #ffd23f, #ff6b35)'
                          : o.status === "preparing"
                          ? 'linear-gradient(135deg, #4ecdc4, #5e72e4)'
                          : o.status === "ready"
                          ? 'linear-gradient(135deg, #06ffa5, #4ecdc4)'
                          : o.status === "served"
                          ? 'linear-gradient(135deg, #5e72e4, #a855f7)'
                          : 'linear-gradient(135deg, #ff006e, #ff6b35)',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {["new", "preparing", "ready"].includes(o.status) && (
                      <>
                        <button
                          onClick={() => updateStatus(o._id, "preparing")}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(78, 205, 196, 0.5)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(78, 205, 196, 0.2)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          Preparing
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "ready")}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(6, 255, 165, 0.5)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(6, 255, 165, 0.2)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          Ready
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "served")}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #5e72e4, #a855f7)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(94, 114, 228, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          Served
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "cancelled")}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #ff006e, #ff6b35)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(255, 0, 110, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </section>
    </div>
  );
}

/* ---------------- ANALYTICS COMPONENT ---------------- */
function Analytics({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let stop = false;

    async function load() {
      const res = await api("/owner/analytics/summary", { token });
      if (!stop) setData(res);
    }

    load();
    const id = setInterval(load, 10000);

    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [token]);

  if (!data) return <div style={{ color: '#e0e0e0', fontSize: '18px', padding: '20px', textAlign: 'center' }}>Loading analytics...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
        textAlign: 'center'
      }}>
        <strong style={{ display: 'block', fontSize: '14px', color: '#e0e0e0', marginBottom: '12px', fontWeight: '600' }}>Daily Orders</strong>
        <div style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #ff006e, #ff6b35, #ffd23f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{data.dailyOrders}</div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(6, 255, 165, 0.3), rgba(78, 205, 196, 0.3)) 1',
        textAlign: 'center'
      }}>
        <strong style={{ display: 'block', fontSize: '14px', color: '#e0e0e0', marginBottom: '12px', fontWeight: '600' }}>Satisfaction</strong>
        <div style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {data.satisfaction?.toFixed(2) || "N/A"}
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(94, 114, 228, 0.3)) 1',
        textAlign: 'center'
      }}>
        <strong style={{ display: 'block', fontSize: '14px', color: '#e0e0e0', marginBottom: '12px', fontWeight: '600' }}>Avg Prep Time (min)</strong>
        <div style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #4ecdc4, #5e72e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {data.avgPrepMinutes?.toFixed(1) || "N/A"}
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
        gridColumn: 'span 2'
      }}>
        <strong style={{ display: 'block', fontSize: '16px', color: '#ffffff', marginBottom: '15px', fontWeight: '700' }}>Top Selling Items</strong>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(data.topSelling || []).map((x) => (
            <li key={x._id} style={{ fontSize: '14px', color: '#e0e0e0', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>{x._id}</span> — <span style={{ background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>{x.qty}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 0, 110, 0.2)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(168, 85, 247, 0.3)) 1',
        gridColumn: 'span 2'
      }}>
        <strong style={{ display: 'block', fontSize: '16px', color: '#ffffff', marginBottom: '15px', fontWeight: '700' }}>Least Selling Items</strong>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(data.leastSelling || []).map((x) => (
            <li key={x._id} style={{ fontSize: '14px', color: '#e0e0e0', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>{x._id}</span> — <span style={{ background: 'linear-gradient(135deg, #ff006e, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>{x.qty}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


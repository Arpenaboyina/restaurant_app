import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function Chef() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const isAuthed = useMemo(() => Boolean(token), [token]);
  const [loginError, setLoginError] = useState("");

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

  useEffect(() => {
    if (!isAuthed) return;
    const load = async () => {
      const list = await api("/owner/orders", { token });
      setOrders(list);
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [isAuthed, token]);

  async function updateStatus(id, status) {
    await api("/owner/orders/" + id + "/status", {
      method: "POST",
      body: { status },
      token,
    });
    const list = await api("/owner/orders", { token });
    setOrders(list);
  }

  // ⛔ Show login page if not authenticated
  if (!isAuthed) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h3>🍳 Chef Login</h3>

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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Staff password"
              type="password"
              autoComplete="current-password"
              required
            />

            {Boolean(loginError) && (
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

  // Group orders by status
  const cookable = orders.filter(
    (o) => Array.isArray(o.items) && o.items.length > 0 && o.status !== "cancelled"
  );

  const grouped = {
    new: cookable.filter((o) => o.status === "new"),
    preparing: cookable.filter((o) => o.status === "preparing"),
    ready: cookable.filter((o) => o.status === "ready"),
    served: cookable.filter((o) => o.status === "served"),
  };

  // ⭐ Kitchen Dashboard UI with Dark Theme and Rainbow Colors
  return (
    <div style={{
      padding: '20px',
      maxWidth: '2000px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <h2 className="rainbow-gradient" style={{ fontSize: '36px', fontWeight: '800', marginBottom: '30px' }}>
        🍳 Kitchen Dashboard
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {Object.entries(grouped).map(([status, list]) => {
          const statusColors = {
            new: {
              bg: 'linear-gradient(135deg, rgba(255, 210, 63, 0.2), rgba(255, 107, 53, 0.2))',
              border: 'rgba(255, 210, 63, 0.5)',
              borderShadow: 'rgba(255, 210, 63, 0.3)',
              borderShadowHover: 'rgba(255, 210, 63, 0.6)',
              text: 'linear-gradient(135deg, #ffd23f, #ff6b35)',
              button: 'linear-gradient(135deg, #ffd23f, #ff6b35)'
            },
            preparing: {
              bg: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(94, 114, 228, 0.2))',
              border: 'rgba(78, 205, 196, 0.5)',
              borderShadow: 'rgba(78, 205, 196, 0.3)',
              borderShadowHover: 'rgba(78, 205, 196, 0.6)',
              text: 'linear-gradient(135deg, #4ecdc4, #5e72e4)',
              button: 'linear-gradient(135deg, #4ecdc4, #5e72e4)'
            },
            ready: {
              bg: 'linear-gradient(135deg, rgba(6, 255, 165, 0.2), rgba(78, 205, 196, 0.2))',
              border: 'rgba(6, 255, 165, 0.5)',
              borderShadow: 'rgba(6, 255, 165, 0.3)',
              borderShadowHover: 'rgba(6, 255, 165, 0.6)',
              text: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
              button: 'linear-gradient(135deg, #06ffa5, #4ecdc4)'
            },
            served: {
              bg: 'linear-gradient(135deg, rgba(94, 114, 228, 0.2), rgba(168, 85, 247, 0.2))',
              border: 'rgba(94, 114, 228, 0.5)',
              borderShadow: 'rgba(94, 114, 228, 0.3)',
              borderShadowHover: 'rgba(94, 114, 228, 0.6)',
              text: 'linear-gradient(135deg, #5e72e4, #a855f7)',
              button: 'linear-gradient(135deg, #5e72e4, #a855f7)'
            },
          };

          const colors = statusColors[status] || statusColors.served;

          return (
            <section
              key={status}
              style={{
                padding: '20px',
                borderRadius: '20px',
                border: `2px solid ${colors.border}`,
                background: colors.bg,
                boxShadow: `0 8px 32px ${colors.borderShadow}`
              }}
            >
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                textAlign: 'center',
                textTransform: 'capitalize',
                marginBottom: '20px',
                background: colors.text,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {status}
              </h3>

              {list.length === 0 && (
                <p style={{
                  fontSize: '14px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic',
                  padding: '20px'
                }}>
                  No orders here
                </p>
              )}

              {list.map((o) => (
                <div
                  key={o._id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
                    border: '2px solid rgba(255, 0, 110, 0.3)',
                    boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      Table #{o.tableId}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>
                      {o.status}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: '#e0e0e0',
                    marginBottom: '12px'
                  }}>
                    <strong style={{ color: '#ffffff', display: 'block', marginBottom: '8px' }}>Items:</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                      {o.items.map((i) => (
                        <li key={i.name} style={{ marginBottom: '6px' }}>
                          <span style={{ color: '#ffffff', fontWeight: '600' }}>{i.name}</span> x{i.quantity}{" "}
                          {i.customizations && (
                            <span style={{ color: '#e0e0e0', fontStyle: 'italic' }}>
                              ({i.customizations})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {o.notes && (
                    <p style={{
                      fontSize: '14px',
                      fontStyle: 'italic',
                      color: '#e0e0e0',
                      marginTop: '12px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <strong style={{ color: '#ffffff' }}>Notes:</strong> {o.notes}
                    </p>
                  )}

                  <div style={{ marginTop: '16px' }}>
                    {status === "new" && (
                      <button
                        onClick={() => updateStatus(o._id, "preparing")}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: colors.button,
                          color: '#000000',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '16px',
                          cursor: 'pointer',
                          boxShadow: `0 4px 20px ${colors.borderShadow}`,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 6px 30px ${colors.borderShadowHover}`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = `0 4px 20px ${colors.borderShadow}`;
                        }}
                      >
                        Start Cooking
                      </button>
                    )}

                    {status === "preparing" && (
                      <button
                        onClick={() => updateStatus(o._id, "ready")}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: colors.button,
                          color: '#000000',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '16px',
                          cursor: 'pointer',
                          boxShadow: `0 4px 20px ${colors.borderShadow}`,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 6px 30px ${colors.borderShadowHover}`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = `0 4px 20px ${colors.borderShadow}`;
                        }}
                      >
                        Mark Ready
                      </button>
                    )}

                    {status === "ready" && (
                      <button
                        onClick={() => updateStatus(o._id, "served")}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: colors.button,
                          color: '#000000',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '16px',
                          cursor: 'pointer',
                          boxShadow: `0 4px 20px ${colors.borderShadow}`,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 6px 30px ${colors.borderShadowHover}`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = `0 4px 20px ${colors.borderShadow}`;
                        }}
                      >
                        Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

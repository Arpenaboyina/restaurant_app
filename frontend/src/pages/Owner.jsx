import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { QRCodeSVG } from "qrcode.react";

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

    const category = window.prompt(
      "Category",
      item.category
    );
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
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Owner Login
          </h2>

          <form onSubmit={login} className="space-y-4">
            <input
              value={password}
              type="password"
              placeholder="Owner password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg"
              autoComplete="new-password"
            />

            {loginError && (
              <p className="text-red-500 text-center">{loginError}</p>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- AUTHED UI -------------------------------------------------- */

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <h2 className="text-3xl font-bold mb-6">📊 Owner Dashboard</h2>

      {/* ---------------- MENU MANAGEMENT ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Menu Management</h3>

        <form
          onSubmit={addMenu}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          <input className="border p-3 rounded-lg" name="name" placeholder="Item name" required />

          <input className="border p-3 rounded-lg" name="price" placeholder="Price" type="number" required />

          <select name="category" className="border p-3 rounded-lg">
            <option>Starter</option>
            <option>Main</option>
            <option>Drinks</option>
            <option>Dessert</option>
          </select>

          <input name="imageUrl" className="border p-3 rounded-lg" placeholder="Image URL" />

          <input name="tags" className="border p-3 rounded-lg" placeholder="Tags (comma separated)" />

          <input name="stock" className="border p-3 rounded-lg" placeholder="Stock" type="number" />

          <input name="discountLabel" className="border p-3 rounded-lg" placeholder="Discount label" />

          <input name="popularity" className="border p-3 rounded-lg" placeholder="Popularity (0-100)" type="number" />

          <input
            name="customizationOptions"
            className="border p-3 rounded-lg"
            placeholder="Customization options"
          />

          <label className="flex items-center gap-2">
            <input name="available" type="checkbox" defaultChecked />
            Available
          </label>

          <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow w-full col-span-full">
            Add Item
          </button>
        </form>

        {/* Menu Table */}
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2">Price</th>
                <th className="p-2">Category</th>
                <th className="p-2">Tags</th>
                <th className="p-2">Availability</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {menu.map((i) => (
                <tr key={i._id} className="border-b">
                  <td className="p-2">{i.name}</td>
                  <td className="p-2">₹{Number(i.price).toFixed(2)}</td>
                  <td className="p-2">{i.category}</td>
                  <td className="p-2">{(i.tags || []).join(", ")}</td>
                  <td className="p-2">{i.available ? "Yes" : "No"}</td>

                  <td className="p-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                      onClick={() =>
                        updateMenu(i._id, { available: !i.available })
                      }
                    >
                      {i.available ? "Disable" : "Enable"}
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => editItem(i)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
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
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Customer Feedback</h3>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Order</th>
                <th className="p-2">Table</th>
                <th className="p-2">Food</th>
                <th className="p-2">Service</th>
                <th className="p-2">Suggestions</th>
              </tr>
            </thead>

            <tbody>
              {feedback.map((f) => (
                <tr key={f._id} className="border-b">
                  <td className="p-2">
                    {new Date(f.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2">{f.orderId}</td>
                  <td className="p-2">{f.tableId}</td>
                  <td className="p-2">{f.foodRating}</td>
                  <td className="p-2">{f.serviceRating}</td>
                  <td className="p-2">{f.suggestions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- ANALYTICS ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Analytics</h3>
        <Analytics token={token} />
      </section>

      {/* ---------------- TABLE MANAGEMENT ---------------- */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Tables</h3>

        <p className="text-sm mb-3">
          QR URL format: <b>{window.location.origin}/?table=&lt;tableId&gt;</b>
        </p>

        {/* Add Table Form */}
        <form
          onSubmit={addTable}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <input
            name="tableId"
            className="border p-3 rounded-lg"
            placeholder="Table ID"
            required
          />
          <input
            name="tablePassword"
            className="border p-3 rounded-lg"
            placeholder="Table Password"
            required
          />

          <button className="bg-green-600 text-white p-3 rounded-lg col-span-full">
            Create Table
          </button>
        </form>

        {/* Tables List with QR Codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((t) => {
            const qrUrl = `${window.location.origin}/customer?table=${t.tableId}`;
            return (
              <div key={t.tableId} className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border-2 border-blue-200">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Table {t.tableId}</h4>
                  <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                    <QRCodeSVG 
                      value={qrUrl} 
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Password:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{t.tablePassword}</span>
                  </p>
                  <p className="text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      t.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    <strong>URL:</strong> {qrUrl}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    onClick={() => updateTable(t.tableId, { active: !t.active })}
                  >
                    {t.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    onClick={() => deleteTable(t.tableId)}
                  >
                    Delete
                  </button>
                </div>
                <button
                  className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-semibold"
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
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Orders</h3>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Table</th>
                <th className="p-2">Items</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b">
                  <td className="p-2">{o._id}</td>
                  <td className="p-2">{o.tableId}</td>
                  <td className="p-2">
                    {o.items
                      .map(
                        (i) =>
                          `${i.name} x${i.quantity}${
                            i.customizations
                              ? ` (${i.customizations})`
                              : ""
                          }`
                      )
                      .join(", ")}
                  </td>
                  <td className="p-2">{o.notes || "-"}</td>
                  <td className="p-2">₹{Number(o.total).toFixed(2)}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        o.status === "new"
                          ? "bg-yellow-500"
                          : o.status === "preparing"
                          ? "bg-blue-500"
                          : o.status === "ready"
                          ? "bg-green-500"
                          : o.status === "served"
                          ? "bg-gray-500"
                          : "bg-red-500"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-2 flex flex-wrap gap-2">
                    {["new", "preparing", "ready"].includes(o.status) && (
                      <>
                        <button
                          onClick={() => updateStatus(o._id, "preparing")}
                          className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                          Preparing
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "ready")}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Ready
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "served")}
                          className="px-3 py-1 bg-gray-600 text-white rounded"
                        >
                          Served
                        </button>

                        <button
                          onClick={() => updateStatus(o._id, "cancelled")}
                          className="px-3 py-1 bg-red-600 text-white rounded"
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

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <strong>Daily Orders</strong>
        <div className="text-xl font-bold mt-2">{data.dailyOrders}</div>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <strong>Satisfaction</strong>
        <div className="text-xl font-bold mt-2">
          {data.satisfaction?.toFixed(2) || "N/A"}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl shadow">
        <strong>Avg Prep Time (min)</strong>
        <div className="text-xl font-bold mt-2">
          {data.avgPrepMinutes?.toFixed(1) || "N/A"}
        </div>
      </div>

      {/* Top Selling */}
      <div className="bg-gray-100 p-4 rounded-xl shadow md:col-span-2">
        <strong>Top Selling Items</strong>
        <ul className="mt-2">
          {(data.topSelling || []).map((x) => (
            <li key={x._id}>
              {x._id} — {x.qty}
            </li>
          ))}
        </ul>
      </div>

      {/* Least Selling */}
      <div className="bg-gray-100 p-4 rounded-xl shadow md:col-span-2">
        <strong>Least Selling Items</strong>
        <ul className="mt-2">
          {(data.leastSelling || []).map((x) => (
            <li key={x._id}>
              {x._id} — {x.qty}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

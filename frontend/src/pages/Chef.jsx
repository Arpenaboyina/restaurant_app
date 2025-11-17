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
      <section className="max-w-sm mx-auto p-6 mt-20 bg-white shadow-lg rounded-2xl border">
        <h3 className="text-2xl font-bold mb-4 text-center">Chef Login</h3>

        <form onSubmit={login} className="flex flex-col gap-4">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Staff password"
            type="password"
            required
            className="border rounded-lg p-3"
          />

          {Boolean(loginError) && (
            <p className="text-red-500 text-sm text-center">{loginError}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </section>
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

  // ⭐ New Beautiful UI starts here
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        🍳 Kitchen Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(grouped).map(([status, list]) => {
          const colors = {
            new: "bg-yellow-100 border-yellow-300 text-yellow-800",
            preparing: "bg-blue-100 border-blue-300 text-blue-800",
            ready: "bg-green-100 border-green-300 text-green-800",
            served: "bg-gray-100 border-gray-300 text-gray-800",
          };

          return (
            <section
              key={status}
              className={`border rounded-2xl shadow-md p-4 ${colors[status]}`}
            >
              <h3 className="text-xl font-semibold text-center capitalize mb-4">
                {status}
              </h3>

              {list.length === 0 && (
                <p className="text-sm text-center opacity-60 italic">
                  No orders here
                </p>
              )}

              {list.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-xl p-4 shadow-sm mb-4 border"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">
                      Table #{o.tableId}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200">
                      {o.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Items:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {o.items.map((i) => (
                        <li key={i.name}>
                          {i.name} x{i.quantity}{" "}
                          {i.customizations && (
                            <span className="italic text-gray-500">
                              ({i.customizations})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {o.notes && (
                    <p className="text-sm italic text-gray-600 mt-2">
                      <strong>Notes:</strong> {o.notes}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    {status === "new" && (
                      <button
                        onClick={() => updateStatus(o._id, "preparing")}
                        className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Start Cooking
                      </button>
                    )}

                    {status === "preparing" && (
                      <button
                        onClick={() => updateStatus(o._id, "ready")}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      >
                        Mark Ready
                      </button>
                    )}

                    {status === "ready" && (
                      <button
                        onClick={() => updateStatus(o._id, "served")}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
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

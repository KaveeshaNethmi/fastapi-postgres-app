import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setError("");
    } catch {
      setError("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.id).includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.address?.toLowerCase().includes(q)
    );
  }, [users, filter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", address: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      if (editId) {
        await api.put(`/users/${editId}`, form);
        setMessage("User updated successfully");
      } else {
        await api.post("/users/", form);
        setMessage("User created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      console.log(err.response);
      setError(err.response?.data?.detail || "Operation failed");
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
    });
    setEditId(user.id);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await api.delete(`/users/${id}`);
      setMessage("User deleted successfully");
      fetchUsers();
    } catch {
      setError("Delete failed");
    }
    setLoading(false);
  };

  return (
    <div className="app-bg">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">👤</span>
          <h1>User Management</h1>
        </div>
        <div className="top-actions">
          <button className="btn btn-light" onClick={fetchUsers} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <div className="container">
        <div className="stats">
          <div className="chip">Total Users: {users.length}</div>
          <div className="search">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="content-grid">
          {/* Form */}
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h2>{editId ? "Edit User" : "Add User"}</h2>
              <form onSubmit={handleSubmit} className="user-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address (optional)"
                  value={form.address}
                  onChange={handleChange}
                />
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={loading}>
                    {editId ? "Update" : "Add User"}
                  </button>
                  {editId && (
                    <button className="btn btn-secondary" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              {message && <div className="success-msg">{message}</div>}
              {error && <div className="error-msg">{error}</div>}
            </div>
          </div>

          {/* Table */}
          <div className="card list-card">
            <h2>Users</h2>
            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              <div className="scroll-x">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="avatar">{getInitials(u.name)}</span>
                        </td>
                        <td className="name-cell">{u.name}</td>
                        <td className="email-cell">{u.email}</td>
                        <td className="phone-cell">{u.phone || "—"}</td>
                        <td className="address-cell">{u.address || "—"}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(u)}>
                              Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDelete(u.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h3>👥 Manage. Track. Scale.</h3>
          <p>Simple and fast user management powered by FastAPI and PostgreSQL.</p>
          <div className="company-badge">
            <span className="powered-by">Powered by</span>
            <span className="company-name">FastAPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
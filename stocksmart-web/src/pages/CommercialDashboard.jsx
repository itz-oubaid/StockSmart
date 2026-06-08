import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, productsAPI } from "../services/api";
import "../styles/CommercialDashboard.css";

export const CommercialDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [formItems, setFormItems] = useState([{ product_id: "", quantity: 1, notes: "" }]);

  useEffect(() => {
    fetchData();
    // Simulate notifications (in real app, use WebSocket)
    simulateNotifications();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        ordersAPI.list(),
        productsAPI.list(),
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const simulateNotifications = () => {
    // In production, connect to WebSocket for real notifications
    const mockNotifications = [
      { id: 1, type: "status", message: "Order #102 approved by Manager", time: "2 hours ago" },
      { id: 2, type: "rejected", message: "Order #98 was rejected - insufficient stock", time: "5 hours ago" },
      { id: 3, type: "success", message: "Order #95 confirmed - supplier selected", time: "1 day ago" },
    ];
    setNotifications(mockNotifications);
  };

  const handleCreateOrder = async () => {
    const validItems = formItems.filter((item) => item.product_id && item.quantity > 0);

    if (validItems.length === 0) {
      setError("Please add at least one product with valid quantity");
      return;
    }

    try {
      const itemsData = validItems.map((item) => {
        const product = products.find((p) => p.id === parseInt(item.product_id));
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: product?.name || "Unknown",
          notes: item.notes,
        };
      });

      await ordersAPI.create({ items: itemsData });
      setMessage("Purchase request created successfully!");
      setShowCreateForm(false);
      setFormItems([{ product_id: "", quantity: 1, notes: "" }]);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to create purchase request: " + (err.response?.data?.message || err.message));
    }
  };

  const myOrders = orders.filter((order) => order.created_by === user?.email);

  const stats = {
    total: myOrders.length,
    pending: myOrders.filter((o) => o.status === "Pending").length,
    approved: myOrders.filter((o) => o.status === "Approved").length,
    rejected: myOrders.filter((o) => o.status === "Rejected").length,
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f59e0b",
      Approved: "#10b981",
      Rejected: "#ef4444",
      Confirmed: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) {
    return <div className="commercial-dashboard">Loading...</div>;
  }

  return (
    <div className="commercial-dashboard">
      <div className="dashboard-header">
        <h1>Purchase Requests Dashboard</h1>
        <p>Manage and track all your purchase requests</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Create Request Section */}
        <div className="content-section">
          <div className="section-header">
            <h2>Create New Purchase Request</h2>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "+ New Request"}
            </button>
          </div>

          {showCreateForm && (
            <div className="form-container">
              <div className="form-items">
                {formItems.map((item, index) => (
                  <div key={index} className="form-item-row">
                    <select
                      value={item.product_id}
                      onChange={(e) => {
                        const newItems = [...formItems];
                        newItems[index].product_id = e.target.value;
                        setFormItems(newItems);
                      }}
                      className="form-select"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formItems];
                        newItems[index].quantity = parseInt(e.target.value) || 1;
                        setFormItems(newItems);
                      }}
                      className="form-input quantity-input"
                      placeholder="Quantity"
                    />

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => {
                        const newItems = [...formItems];
                        newItems[index].notes = e.target.value;
                        setFormItems(newItems);
                      }}
                      className="form-input"
                      placeholder="Notes (optional)"
                    />

                    <button
                      className="btn-remove"
                      onClick={() => {
                        const newItems = formItems.filter((_, i) => i !== index);
                        setFormItems(newItems.length > 0 ? newItems : [{ product_id: "", quantity: 1, notes: "" }]);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setFormItems([...formItems, { product_id: "", quantity: 1, notes: "" }])}
                >
                  + Add Another Product
                </button>
                <button className="btn-primary" onClick={handleCreateOrder}>
                  Submit Request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="two-column">
          {/* Recent Orders */}
          <div className="content-section">
            <h2>Recent Requests</h2>
            {myOrders.length === 0 ? (
              <div className="empty-state">
                <p>No purchase requests yet</p>
              </div>
            ) : (
              <div className="orders-list">
                {myOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <span className="order-id">#{order.id}</span>
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="order-body">
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="order-items">{order.items_count} item(s)</p>
                      {order.approved_by && (
                        <p className="order-approver">By: {order.approved_by}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="content-section">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${notif.type}`}>
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <p className="notification-time">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="content-section">
          <h2>All Requests History</h2>
          {myOrders.length === 0 ? (
            <div className="empty-state">
              <p>No purchase requests yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="orders-history-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Approved By</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.items_count}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{order.approved_by || "-"}</td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Request ID:</label>
                <span>#{selectedOrder.id}</span>
              </div>
              <div className="detail-row">
                <label>Created:</label>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span
                  className="badge"
                  style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="detail-row">
                <label>Submitted By:</label>
                <span>{selectedOrder.created_by}</span>
              </div>
              {selectedOrder.approved_by && (
                <div className="detail-row">
                  <label>Approved By:</label>
                  <span>{selectedOrder.approved_by}</span>
                </div>
              )}
              <div className="detail-row">
                <label>Items:</label>
                <span>{selectedOrder.items_count}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

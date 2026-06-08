import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../services/api";
import "../styles/ManagerApprovals.css";

export const ManagerApprovals = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.list({ status: filterStatus });
      setOrders(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch orders: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (order) => {
    setSelectedOrder(order);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const handleSupplierSelectionClick = (order) => {
    setSelectedOrder(order);
    setSelectedSupplier(null);
    setShowSupplierModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedOrder) return;

    try {
      await ordersAPI.approve(selectedOrder.id);
      setMessage("Order approved successfully!");
      setShowApprovalModal(false);
      setSelectedOrder(null);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to approve order: " + (err.response?.data?.message || err.message));
    }
  };

  const confirmReject = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      await ordersAPI.reject(selectedOrder.id, { rejection_reason: rejectionReason });
      setMessage("Order rejected successfully!");
      setShowRejectionModal(false);
      setSelectedOrder(null);
      setRejectionReason("");
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to reject order: " + (err.response?.data?.message || err.message));
    }
  };

  const confirmSupplierSelection = async () => {
    if (!selectedOrder || !selectedSupplier) {
      setError("Please select a supplier");
      return;
    }

    try {
      await ordersAPI.selectSupplier(selectedOrder.id, { supplier_id: selectedSupplier });
      setMessage("Supplier selected successfully!");
      setShowSupplierModal(false);
      setSelectedOrder(null);
      setSelectedSupplier(null);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to select supplier: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Pending: "badge-warning",
      Approved: "badge-success",
      Rejected: "badge-danger",
      Confirmed: "badge-info",
    };
    return statusMap[status] || "badge-secondary";
  };

  if (loading) {
    return <div className="manager-approvals">Loading orders...</div>;
  }

  return (
    <div className="manager-approvals">
      <div className="approvals-header">
        <h1>Purchase Request Approvals</h1>
        <p>Review and approve purchase requests from Commercial and Magasinier staff</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No {filterStatus || ''} orders found</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Created By</th>
                <th>Items Count</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.created_by}</td>
                  <td>{order.items_count}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.approved_by || "-"}</td>
                  <td>
                    {order.status === "Pending" && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveClick(order)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectClick(order)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-supplier"
                          onClick={() => handleSupplierSelectionClick(order)}
                        >
                          Select Supplier
                        </button>
                      </div>
                    )}
                    {order.status === "Approved" && (
                      <button
                        className="btn-supplier"
                        onClick={() => handleSupplierSelectionClick(order)}
                      >
                        Change Supplier
                      </button>
                    )}
                    {order.status !== "Pending" && order.status !== "Approved" && (
                      <span className="text-muted">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Approval</h2>
            {selectedOrder && (
              <>
                <div className="modal-details">
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder.id}
                  </p>
                  <p>
                    <strong>Created By:</strong> {selectedOrder.created_by}
                  </p>
                  <p>
                    <strong>Items:</strong> {selectedOrder.items_count}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="modal-message">
                  Are you sure you want to approve this purchase request?
                </p>
              </>
            )}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmApprove}>
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Order</h2>
            {selectedOrder && (
              <>
                <div className="modal-details">
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder.id}
                  </p>
                  <p>
                    <strong>Created By:</strong> {selectedOrder.created_by}
                  </p>
                </div>
                <div className="form-group">
                  <label>Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>
              </>
            )}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button className="btn-reject" onClick={confirmReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Selection Modal */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select Supplier</h2>
            {selectedOrder && (
              <>
                <div className="modal-details">
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder.id}
                  </p>
                  <p>
                    <strong>Items:</strong> {selectedOrder.items_count}
                  </p>
                </div>
                <div className="form-group">
                  <label>Choose Supplier</label>
                  <p className="supplier-info">
                    Supplier proposals will be generated based on the items in this order.
                    Select the most appropriate supplier for fulfillment.
                  </p>
                  <div className="supplier-selection">
                    <input
                      type="text"
                      placeholder="Enter Supplier ID or name"
                      value={selectedSupplier || ""}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <p className="text-muted small">
                    Note: Integration with supplier proposals pending system configuration.
                  </p>
                </div>
              </>
            )}
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowSupplierModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-supplier"
                onClick={confirmSupplierSelection}
                disabled={!selectedSupplier}
              >
                Select Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

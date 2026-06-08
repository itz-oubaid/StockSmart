import { useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiEye, FiX } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useOrders, useProducts } from "../hooks/useApi";

export const Orders = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for new order items
  const [orderItems, setOrderItems] = useState([{ product_id: "", quantity: 1 }]);

  const { orders = [], loading, error, createOrder, deleteOrder } = useOrders();
  const { products } = useProducts();

  const itemsPerPage = 10;
  
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.created_by?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addItemRow = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems.length ? newItems : [{ product_id: "", quantity: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleAddOrder = async () => {
    // Validation
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one product with a valid quantity.");
      return;
    }

    setSaving(true);
    const result = await createOrder({ 
      items: validItems.map(item => ({
        ...item,
        product_name: products.find(p => p.id === parseInt(item.product_id))?.name || "Unknown"
      }))
    });
    setSaving(false);
    
    if (result.success) {
      setShowAddForm(false);
      setOrderItems([{ product_id: "", quantity: 1 }]);
    } else {
      alert(result.error || "Failed to create order");
    }
  };

  const columns = [
    { key: "id", label: "Order ID", sortable: true },
    { key: "created_at", label: "Date", sortable: true },
    { key: "created_by", label: "Created By", sortable: true },
    { key: "items_count", label: "Items", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const variants = {
          Pending: "yellow",
          Completed: "green",
          Cancelled: "red",
        };
        return <Badge variant={variants[val] || "gray"}>{val}</Badge>;
      },
    },
    {
      key: "id",
      label: "Actions",
      render: (id) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800"><FiEye /></button>
          <button onClick={() => deleteOrder(id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <FiPlus /> New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
          <p className="text-2xl font-bold mt-2">{orders.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Pending Approval</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {orders.filter(o => o.status === 'Pending').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-4">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="search"
            placeholder="Search by creator..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Status" },
              { value: "Pending", label: "Pending" },
              { value: "Completed", label: "Completed" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedOrders}
              emptyMessage="No orders found"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Create New Order"
        className="w-full max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={handleAddOrder} disabled={saving}>
              {saving ? "Creating..." : "Confirm Order"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Order Items</h4>
            <Button variant="secondary" size="sm" onClick={addItemRow}>
              <FiPlus className="mr-1" /> Add Product
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-end border-b pb-3 border-gray-100">
                <div className="flex-1">
                  <Select
                    label={index === 0 ? "Product" : ""}
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    options={[
                      { value: "", label: "Select product..." },
                      ...products.map(p => ({ value: String(p.id), label: `${p.name} (${p.sku})` }))
                    ]}
                  />
                </div>
                <div className="w-24">
                  <Input
                    label={index === 0 ? "Qty" : ""}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>
                <button 
                  onClick={() => removeItemRow(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

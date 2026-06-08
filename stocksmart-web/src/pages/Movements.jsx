import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useMovements, useProducts } from "../hooks/useApi";

export const Movements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [newMovement, setNewMovement] = useState({
    type: "Entrée",
    product_id: "",
    quantity: "",
    reason: "",
    depot_from: "",
    depot_to: "",
  });

  // Fetch movements and products from API
  const { movements, loading, error, createMovement } = useMovements();

  // Get products list for the dropdown
  const { products } = useProducts();

  const itemsPerPage = 10;
  
  // Calculate stats from fetched movements
  const today = new Date().toISOString().split("T")[0];
  const thisWeekStart = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .split("T")[0];
  const thisMonthStart = new Date(new Date().setDate(1))
    .toISOString()
    .split("T")[0];

  const movementsToday = movements.filter((m) => m.date === today).length;
  const movementsThisWeek = movements.filter(
    (m) => m.date >= thisWeekStart
  ).length;
  const movementsThisMonth = movements.filter(
    (m) => m.date >= thisMonthStart
  ).length;

  // Client-side filtering
  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesSearch =
        movement.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || movement.type === filterType;
      const matchesDate = !filterDate || movement.date === filterDate;

      return matchesSearch && matchesType && matchesDate;
    });
  }, [movements, searchTerm, filterType, filterDate]);

  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddMovement = async () => {
    if (!newMovement.product_id || !newMovement.quantity) {
      setFormError("Product and quantity are required");
      return;
    }

    setSaving(true);
    setFormError("");

    const result = await createMovement({
      type: newMovement.type,
      product_id: parseInt(newMovement.product_id),
      quantity: parseInt(newMovement.quantity),
      reason: newMovement.reason || `${newMovement.type} - Manual`,
      depot_from: newMovement.depot_from,
      depot_to: newMovement.depot_to,
    });

    setSaving(false);

    if (result.success) {
      setShowAddForm(false);
      setNewMovement({ type: "Entrée", product_id: "", quantity: "", reason: "", depot_from: "", depot_to: "" });
    } else {
      setFormError(result.error || "Failed to create movement");
    }
  };

  const movementTypeVariants = {
    "Entrée": "green",
    "Sortie": "blue",
    "Transfert": "yellow",
  };

  const columns = [
    { key: "date", label: "Date", sortable: true },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (val) => (
        <Badge variant={movementTypeVariants[val] || "gray"}>{val}</Badge>
      ),
    },
    {
      key: "product",
      label: "Product",
      sortable: true,
      render: (_, row) => `${row.product}${row.sku ? ` (${row.sku})` : ''}`,
    },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
    },
    { key: "user", label: "User", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const variants = {
          "Completed": "green",
          "Pending Validation": "yellow",
          "Rejected": "red",
        };
        return <Badge variant={variants[val] || "gray"}>{val}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Movements</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <FiPlus /> Add Movement
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Today</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "-" : movementsToday}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">This Week</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{loading ? "-" : movementsThisWeek}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">This Month</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">{loading ? "-" : movementsThisMonth}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-4">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search by product or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Types" },
              { value: "Entrée", label: "Stock In" },
              { value: "Sortie", label: "Stock Out" },
              { value: "Transfert", label: "Transfer" },
            ]}
          />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      {/* Movements Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading movements...</div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedMovements}
              emptyMessage="No movements found"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMovements.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      {/* Add Movement Modal */}
      <Modal
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError("");
        }}
        title="Add Stock Movement"
        className="w-full max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMovement} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {formError}
            </div>
          )}
          <Select
            label="Type"
            value={newMovement.type}
            onChange={(e) => setNewMovement(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: "Entrée", label: "Stock In" },
              { value: "Sortie", label: "Stock Out" },
              { value: "Transfert", label: "Transfer" },
            ]}
            required
          />
          <Select
            label="Product"
            value={newMovement.product_id}
            onChange={(e) => setNewMovement(prev => ({ ...prev, product_id: e.target.value }))}
            options={[
              { value: "", label: "Select a product..." },
              ...products.map(p => ({ value: String(p.id), label: `${p.name} (${p.sku})` }))
            ]}
            required
          />
          <Input 
            label="Quantity" 
            type="number" 
            placeholder="0" 
            required 
            value={newMovement.quantity}
            onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
          />
          <Input 
            label="Reason" 
            placeholder="Reason for this movement" 
            value={newMovement.reason}
            onChange={(e) => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
          />
          {(newMovement.type === "Sortie" || newMovement.type === "Transfert") && (
            <Input 
              label="From Depot" 
              placeholder="Source depot" 
              value={newMovement.depot_from}
              onChange={(e) => setNewMovement(prev => ({ ...prev, depot_from: e.target.value }))}
            />
          )}
          {(newMovement.type === "Entrée" || newMovement.type === "Transfert") && (
            <Input 
              label="To Depot" 
              placeholder="Destination depot" 
              value={newMovement.depot_to}
              onChange={(e) => setNewMovement(prev => ({ ...prev, depot_to: e.target.value }))}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

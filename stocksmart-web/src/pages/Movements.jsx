import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";

export const Movements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const mockMovements = [
    {
      id: 1,
      type: "Entrée",
      product: "Laptop Pro",
      sku: "SKU-001",
      quantity: 50,
      unit: "pcs",
      date: "2026-04-08",
      user: "Admin",
      status: "Completed",
    },
    {
      id: 2,
      type: "Sortie",
      product: "Wireless Mouse",
      sku: "SKU-002",
      quantity: 100,
      unit: "pcs",
      date: "2026-04-07",
      user: "Pierre Magasinier",
      status: "Completed",
    },
    {
      id: 3,
      type: "Transfert",
      product: "Keyboard Mechanical",
      sku: "SKU-005",
      quantity: 25,
      unit: "pcs",
      date: "2026-04-06",
      user: "Marie Manager",
      status: "Pending Validation",
    },
    {
      id: 4,
      type: "Entrée",
      product: "Monitor 27\"",
      sku: "SKU-004",
      quantity: 30,
      unit: "pcs",
      date: "2026-04-05",
      user: "Admin",
      status: "Completed",
    },
  ];

  const itemsPerPage = 10;
  const today = new Date().toISOString().split("T")[0];
  const thisWeekStart = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .split("T")[0];
  const thisMonthStart = new Date(new Date().setDate(1))
    .toISOString()
    .split("T")[0];

  const movementsToday = mockMovements.filter((m) => m.date === today).length;
  const movementsThisWeek = mockMovements.filter(
    (m) => m.date >= thisWeekStart
  ).length;
  const movementsThisMonth = mockMovements.filter(
    (m) => m.date >= thisMonthStart
  ).length;

  const filteredMovements = mockMovements.filter((movement) => {
    const matchesSearch =
      movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || movement.type === filterType;
    const matchesDate = !filterDate || movement.date === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      render: (_, row) => `${row.product} (${row.sku})`,
    },
    {
      key: "quantity",
      label: `Quantity (${mockMovements[0]?.unit})`,
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Today</h3>
          <p className="text-2xl font-bold mt-2">{movementsToday}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">This Week</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{movementsThisWeek}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">This Month</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">{movementsThisMonth}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-4">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search"
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
            label="Date"
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
      </Card>

      {/* Add Movement Modal */}
      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Stock Movements"
        className="w-full max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddForm(false)}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Type"
            options={[
              { value: "Entrée", label: "Stock In" },
              { value: "Sortie", label: "Stock Out" },
              { value: "Transfert", label: "Transfer" },
            ]}
            required
          />
          <Input label="Product" placeholder="Select product" required />
          <Input label="Quantity" type="number" placeholder="0" required />
        </div>
      </Modal>
    </div>
  );
};

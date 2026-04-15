import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export const Products = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const mockProducts = [
    {
      id: 1,
      sku: "SKU-001",
      name: "Laptop Pro",
      category: "Electronics",
      unit: "pcs",
      quantity: 45,
      price_sell: 1200,
      status: "In Stock",
    },
    {
      id: 2,
      sku: "SKU-002",
      name: "Wireless Mouse",
      category: "Accessories",
      unit: "pcs",
      quantity: 8,
      price_sell: 25,
      status: "Low Stock",
    },
    {
      id: 3,
      sku: "SKU-003",
      name: "USB-C Cable",
      category: "Cables",
      unit: "pcs",
      quantity: 120,
      price_sell: 15,
      status: "In Stock",
    },
    {
      id: 4,
      sku: "SKU-004",
      name: "Monitor 27\"",
      category: "Electronics",
      unit: "pcs",
      quantity: 3,
      price_sell: 350,
      status: "Low Stock",
    },
    {
      id: 5,
      sku: "SKU-005",
      name: "Keyboard Mechanical",
      category: "Accessories",
      unit: "pcs",
      quantity: 0,
      price_sell: 120,
      status: "Out of Stock",
    },
  ];

  const itemsPerPage = 10;
  const totalProducts = mockProducts.length;
  const lowStockCount = mockProducts.filter(p => p.status === "Low Stock").length;
  const outOfStockCount = mockProducts.filter(p => p.status === "Out of Stock").length;

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||  product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "quantity", label: `Quantity (${mockProducts[0]?.unit})`, sortable: true },
    {
      key: "price_sell",
      label: "Price",
      sortable: true,
      render: (val) => `€${val}`,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const variants = {
          "In Stock": "green",
          "Low Stock": "yellow",
          "Out of Stock": "red",
        };
        return <Badge variant={variants[val] || "gray"}>{val}</Badge>;
      },
    },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedProduct(row);
              setShowDetails(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-lg"
            title="View"
          >
            <FiEye />
          </button>
          {hasPermission('manage_products') && (
            <>
              <button className="text-gray-600 hover:text-gray-800 text-lg" title="Edit">
                <FiEdit2 />
              </button>
              <button className="text-red-600 hover:text-red-800 text-lg" title="Delete">
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        {hasPermission('manage_products') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Product
          </Button>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold mt-2">{totalProducts}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{lowStockCount}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{outOfStockCount}</p>
        </Card>
      </div>

      {}
      <Card>
        <h3 className="font-semibold mb-4">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Categories" },
              { value: "Electronics", label: "Electronics" },
              { value: "Accessories", label: "Accessories" },
              { value: "Cables", label: "Cables" },
              { value: "Office", label: "Office" },
            ]}
          />
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Status" },
              { value: "In Stock", label: "In Stock" },
              { value: "Low Stock", label: "Low Stock" },
              { value: "Out of Stock", label: "Out of Stock" },
            ]}
          />
        </div>
      </Card>
        {}
      <Card>
        <Table
          columns={columns}
          data={paginatedProducts}
          emptyMessage="No products found"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </Card>

      {}
      <Modal
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct?.name}
        className="w-full max-w-2xl"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">SKU</label>
                <p className="text-lg font-semibold">{selectedProduct.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-lg font-semibold">{selectedProduct.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p className="text-lg font-semibold">{selectedProduct.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-lg font-semibold">
                  <Badge variant={selectedProduct.status === "In Stock" ? "green" : selectedProduct.status === "Low Stock" ? "yellow" : "red"}>
                    {selectedProduct.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {}
      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add Product"
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
          <Input label="Product Name" placeholder="Enter product name" required />
          <Input label="SKU" placeholder="Enter SKU" required />
          <Select
            label="Category"
            options={[
              { value: "Electronics", label: "Electronics" },
              { value: "Accessories", label: "Accessories" },
              { value: "Cables", label: "Cables" },
            ]}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

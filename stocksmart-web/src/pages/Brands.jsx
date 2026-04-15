import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export const Brands = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock brand data according to PDF requirements (Gestion des Marques)
  const mockBrands = [
    {
      id: 1,
      name: "TechPro",
      logo: "🏢",
      description: "Premium technology and electronics",
      country: "Germany",
      type: "International Brand",
      status: "active",
      website: "https://techpro.de",
      authorized_suppliers: 3,
      products_count: 45,
      stock_value: "€125,500",
      rotation_rate: "98%",
    },
    {
      id: 2,
      name: "Office Elite",
      logo: "📄",
      description: "Professional office equipment",
      country: "France",
      type: "National Brand",
      status: "active",
      website: "https://officelite.fr",
      authorized_suppliers: 2,
      products_count: 28,
      stock_value: "€45,200",
      rotation_rate: "85%",
    },
    {
      id: 3,
      name: "PowerTech",
      logo: "⚡",
      description: "Power solutions and accessories",
      country: "USA",
      type: "International Brand",
      status: "active",
      website: "https://powertech.us",
      authorized_suppliers: 5,
      products_count: 72,
      stock_value: "€189,750",
      rotation_rate: "92%",
    },
    {
      id: 4,
      name: "ConnectWorld",
      logo: "🌍",
      description: "Networking and connectivity products",
      country: "China",
      type: "International Brand",
      status: "inactive",
      website: "https://connectworld.cn",
      authorized_suppliers: 1,
      products_count: 15,
      stock_value: "€32,100",
      rotation_rate: "65%",
    },
    {
      id: 5,
      name: "HomeComfort",
      logo: "🏠",
      description: "Household and office comfort items",
      country: "France",
      type: "Private Label",
      status: "active",
      website: "https://homecomfort.fr",
      authorized_suppliers: 2,
      products_count: 38,
      stock_value: "€68,400",
      rotation_rate: "88%",
    },
  ];

  const itemsPerPage = 10;
  const totalBrands = mockBrands.length;
  const activeBrands = mockBrands.filter(b => b.status === "active").length;
  const totalProducts = mockBrands.reduce((sum, b) => sum + b.products_count, 0);
  const totalStockValue = mockBrands.reduce((sum, b) => {
    const value = parseInt(b.stock_value.replace(/[€,]/g, ""));
    return sum + value;
  }, 0);

  // Filter brands
  const filteredBrands = mockBrands.filter((brand) => {
    const matchesSearch = 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || brand.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: "name",
      label: "Brand Name",
      sortable: true,
      render: (val, row) => `${row.logo} ${val}`,
    },
    { key: "country", label: "Country", sortable: true },
    { key: "type", label: "Type", sortable: true },
    {
      key: "products_count",
      label: "Products",
      sortable: true,
    },
    {
      key: "rotation_rate",
      label: "Rotation Rate",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={val === "active" ? "green" : "gray"}>
          {val === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedBrand(row);
              setShowDetails(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-lg"
            title="View"
          >
            <FiEye />
          </button>
          {hasPermission('manage_brands') && (
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
        <h1 className="text-3xl font-bold">Brands (Marques)</h1>
        {hasPermission('manage_brands') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Brand
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Brands</h3>
          <p className="text-2xl font-bold mt-2">{totalBrands}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Active Brands</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{activeBrands}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalProducts}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Stock Value</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">€{(totalStockValue/1000).toFixed(1)}k</p>
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
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </Card>

      {/* Brands Table */}
      <Card>
        <Table
          columns={columns}
          data={paginatedBrands}
          emptyMessage="No brands found"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredBrands.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Brand Details Modal */}
      <Modal
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedBrand(null);
        }}
        title={selectedBrand?.name}
        className="w-full max-w-2xl"
      >
        {selectedBrand && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="font-semibold">{selectedBrand.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="font-semibold">{selectedBrand.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Website</label>
                <p className="text-blue-600 hover:underline"><a href={selectedBrand.website} target="_blank" rel="noreferrer">{selectedBrand.website}</a></p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={selectedBrand.status === "active" ? "green" : "gray"}>
                  {selectedBrand.status}
                </Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-700">{selectedBrand.description}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Stock Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Products</p>
                  <p className="font-semibold">{selectedBrand.products_count}</p>
                </div>
                <div>
                  <p className="text-gray-600">Stock Value</p>
                  <p className="font-semibold">{selectedBrand.stock_value}</p>
                </div>
                <div>
                  <p className="text-gray-600">Rotation Rate</p>
                  <p className="font-semibold">{selectedBrand.rotation_rate}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Authorized Suppliers</h4>
              <p className="text-sm font-semibold">{selectedBrand.authorized_suppliers} supplier(s)</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Brand Modal */}
      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add Brand"
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
          <Input label="Brand Name" placeholder="Brand name" required />
          <Input label="Description" placeholder="Brand description" />
          <Input label="Country" placeholder="Country of origin" />
          <Select
            label="Type"
            options={[
              { value: "National Brand", label: "National Brand" },
              { value: "International Brand", label: "International Brand" },
              { value: "Private Label", label: "Private Label" },
            ]}
            required
          />
          <Input label="Website" placeholder="https://..." />
        </div>
      </Modal>
    </div>
  );
};

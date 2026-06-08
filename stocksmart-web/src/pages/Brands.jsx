import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useBrands } from "../hooks/useApi";

export const Brands = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [newBrand, setNewBrand] = useState({
    name: "",
    description: "",
    country: "",
    type: "National Brand",
    website: "",
  });

  // Fetch brands from API
  const { brands, loading, error, createBrand, deleteBrand } = useBrands();

  const itemsPerPage = 10;
  
  // Calculate stats from fetched brands
  const totalBrands = brands.length;
  const activeBrands = brands.filter(b => b.status === "active").length;

  // Client-side filtering
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = 
        brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || brand.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchTerm, filterStatus]);

  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddBrand = async () => {
    if (!newBrand.name) {
      setFormError("Brand name is required");
      return;
    }

    setSaving(true);
    setFormError("");

    const result = await createBrand({
      name: newBrand.name,
      country: newBrand.country,
      type: newBrand.type,
      website: newBrand.website,
      status: 'active',
    });

    setSaving(false);

    if (result.success) {
      setShowAddForm(false);
      setNewBrand({ name: "", description: "", country: "", type: "National Brand", website: "" });
    } else {
      setFormError(result.error || "Failed to create brand");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    const result = await deleteBrand(id);
    if (!result.success) {
      alert(result.error || "Failed to delete brand");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Brand Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span>{row.logo}</span>
          <span>{val}</span>
        </div>
      ),
    },
    { key: "country", label: "Country", sortable: true },
    { key: "type", label: "Type", sortable: true },
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
              <button 
                onClick={() => handleDeleteBrand(row.id)}
                className="text-red-600 hover:text-red-800 text-lg" 
                title="Delete"
              >
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
        <h1 className="text-3xl font-bold">Brands</h1>
        {hasPermission('manage_brands') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Brand
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Brands</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "-" : totalBrands}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Active Brands</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{loading ? "-" : activeBrands}</p>
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
        {loading ? (
          <div className="text-center py-8">Loading brands...</div>
        ) : (
          <>
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
          </>
        )}
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
                <p className="text-blue-600 hover:underline">
                  <a href={selectedBrand.website} target="_blank" rel="noreferrer">{selectedBrand.website}</a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={selectedBrand.status === "active" ? "green" : "gray"}>
                  {selectedBrand.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Brand Modal */}
      <Modal
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError("");
        }}
        title="Add Brand"
        className="w-full max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBrand} disabled={saving}>
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
          <Input 
            label="Brand Name" 
            placeholder="Brand name" 
            required 
            value={newBrand.name}
            onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input 
            label="Country" 
            placeholder="Country of origin" 
            value={newBrand.country}
            onChange={(e) => setNewBrand(prev => ({ ...prev, country: e.target.value }))}
          />
          <Select
            label="Type"
            value={newBrand.type}
            onChange={(e) => setNewBrand(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: "National Brand", label: "National Brand" },
              { value: "International Brand", label: "International Brand" },
              { value: "Private Label", label: "Private Label" },
            ]}
            required
          />
          <Input 
            label="Website" 
            placeholder="https://..." 
            value={newBrand.website}
            onChange={(e) => setNewBrand(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
};

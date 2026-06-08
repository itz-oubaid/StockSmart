import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useSuppliers } from "../hooks/useApi";

export const Suppliers = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    siret: "",
    sector: "",
    email: "",
    phone: "",
    contact_name: "",
  });

  const { suppliers, loading, error, createSupplier, deleteSupplier } = useSuppliers();

  const itemsPerPage = 10;
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const averageScore = suppliers.length > 0 
    ? (suppliers.reduce((sum, s) => sum + (parseFloat(s.reliability_score) || 0), 0) / suppliers.length).toFixed(1)
    : "0";

  // Client-side filtering
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch = 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.siret?.includes(searchTerm) ||
        supplier.contacts?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || supplier.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, filterStatus]);

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddSupplier = async () => {
    if (!newSupplier.name) {
      setFormError("Supplier name is required");
      return;
    }

    setSaving(true);
    setFormError("");

    const contacts = [];
    if (newSupplier.contact_name || newSupplier.email || newSupplier.phone) {
      contacts.push({
        name: newSupplier.contact_name || '',
        email: newSupplier.email || '',
        phone: newSupplier.phone || '',
      });
    }

    const result = await createSupplier({
      name: newSupplier.name,
      siret: newSupplier.siret,
      sector: newSupplier.sector,
      contacts: contacts,
      status: 'active',
    });

    setSaving(false);

    if (result.success) {
      setShowAddForm(false);
      setNewSupplier({ name: "", siret: "", sector: "", email: "", phone: "", contact_name: "" });
    } else {
      setFormError(result.error || "Failed to create supplier");
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    const result = await deleteSupplier(id);
    if (!result.success) {
      alert(result.error || "Failed to delete supplier");
    }
  };

  const columns = [
    { key: "name", label: "Supplier Name", sortable: true },
    { key: "sector", label: "Sector", sortable: true },
    { 
      key: "reliability_score", 
      label: "Rating", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{val}/10</span>
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(val/10)*100}%` }}
            ></div>
          </div>
        </div>
      )
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
              setSelectedSupplier(row);
              setShowDetails(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-lg"
            title="View"
          >
            <FiEye />
          </button>
          {hasPermission('manage_suppliers') && (
            <>
              <button className="text-gray-600 hover:text-gray-800 text-lg" title="Edit">
                <FiEdit2 />
              </button>
              <button 
                onClick={() => handleDeleteSupplier(row.id)}
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
        <h1 className="text-3xl font-bold">Suppliers</h1>
        {hasPermission('manage_suppliers') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Supplier
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Suppliers</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "-" : totalSuppliers}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Active Suppliers</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{loading ? "-" : activeSuppliers}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Average Rating</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{loading ? "-" : averageScore}/10</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-4">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search by name, SIRET, or email..."
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

      {/* Suppliers Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading suppliers...</div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedSuppliers}
              emptyMessage="No suppliers found"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredSuppliers.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      {/* Supplier Details Modal*/}
      <Modal
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedSupplier(null);
        }}
        title={selectedSupplier?.name}
        className="w-full max-w-2xl"
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">SIRET</label>
                <p className="font-mono text-sm">{selectedSupplier.siret}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sector</label>
                <p>{selectedSupplier.sector}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={selectedSupplier.status === "active" ? "green" : "gray"}>
                  {selectedSupplier.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Reliability Score</label>
                <p className="font-semibold">{selectedSupplier.reliability_score}/10</p>
              </div>
            </div>

            {selectedSupplier.contacts && selectedSupplier.contacts.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Contact Information</h4>
                {selectedSupplier.contacts.map((contact, idx) => (
                  <div key={idx} className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {contact.name}</p>
                    <p><span className="font-medium">Phone:</span> {contact.phone}</p>
                    <p><span className="font-medium">Email:</span> {contact.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError("");
        }}
        title="Add Supplier"
        className="w-full max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier} disabled={saving}>
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
            label="Supplier Name" 
            placeholder="Supplier name" 
            required 
            value={newSupplier.name}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input 
            label="SIRET" 
            placeholder="SIRET number" 
            value={newSupplier.siret}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, siret: e.target.value }))}
          />
          <Input 
            label="Sector" 
            placeholder="Business sector" 
            value={newSupplier.sector}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, sector: e.target.value }))}
          />
          <Input 
            label="Contact Name" 
            placeholder="Contact person name" 
            value={newSupplier.contact_name}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_name: e.target.value }))}
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="Contact email" 
            value={newSupplier.email}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input 
            label="Phone" 
            placeholder="Contact phone" 
            value={newSupplier.phone}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
};
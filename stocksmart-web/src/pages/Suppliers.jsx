import { useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export const Suppliers = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const mockSuppliers = [
    {
      id: 1,
      name: "TechDirect Solutions",
      siret: "12345678901234",
      sector: "Electronics Wholesale",
      status: "active",
      contacts: [
        { name: "Jean Martin", phone: "+33123456789", email: "jean.martin@techdirect.com" }
      ],
      address_hq: "123 Business Park, Paris, France",
      address_delivery: "456 Logistics Zone, Lyon, France",
      payment_terms: "30 days",
      avg_delivery_days: 5,
      reliability_score: 9.2,
      total_orders: 45,
      on_time_delivery: "96%",
      conformity_rate: "98%",
    },
    {
      id: 2,
      name: "Global Parts Interactive",
      siret: "98765432109876",
      sector: "Components & Accessories",
      status: "active",
      contacts: [
        { name: "Marie Dubois", phone: "+33987654321", email: "marie.d@globalparts.com" }
      ],
      address_hq: "789 Industrial Ave, Marseille, France",
      address_delivery: "789 Industrial Ave, Marseille, France",
      payment_terms: "45 days",
      avg_delivery_days: 7,
      reliability_score: 8.5,
      total_orders: 32,
      on_time_delivery: "92%",
      conformity_rate: "95%",
    },
    {
      id: 3,
      name: "Premium IT Equipment",
      siret: "55555555555555",
      sector: "Computer Hardware",
      status: "inactive",
      contacts: [
        { name: "Pierre Leclerc", phone: "+33555555555", email: "pierre@premiumit.com" }
      ],
      address_hq: "999 Tech Street, Toulouse, France",
      address_delivery: "999 Tech Street, Toulouse, France",
      payment_terms: "60 days",
      avg_delivery_days: 10,
      reliability_score: 7.8,
      total_orders: 15,
      on_time_delivery: "87%",
      conformity_rate: "92%",
    },
    {
      id: 4,
      name: "Eurotech Suppliers",
      siret: "44444444444444",
      sector: "Networking & Cables",
      status: "active",
      contacts: [
        { name: "Sophie Moreau", phone: "+33444444444", email: "sophie@eurotech.fr" }
      ],
      address_hq: "111 Supply Way, Bordeaux, France",
      address_delivery: "111 Supply Way, Bordeaux, France",
      payment_terms: "Net 15",
      avg_delivery_days: 3,
      reliability_score: 9.5,
      total_orders: 78,
      on_time_delivery: "99%",
      conformity_rate: "99%",
    },
  ];

  const itemsPerPage = 10;
  const totalSuppliers = mockSuppliers.length;
  const activeSuppliers = mockSuppliers.filter(s => s.status === "active").length;
  const averageScore = (mockSuppliers.reduce((sum, s) => sum + s.reliability_score, 0) / mockSuppliers.length).toFixed(1);

  // Filter suppliers
  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.siret.includes(searchTerm) ||
      supplier.contacts[0]?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || supplier.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <h1 className="text-3xl font-bold">Suppliers</h1>
        {hasPermission('manage_suppliers') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Supplier
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Suppliers</h3>
          <p className="text-2xl font-bold mt-2">{totalSuppliers}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Active Suppliers</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{activeSuppliers}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Average Rating</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{averageScore}/10</p>
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

      {/* Suppliers Table */}
      <Card>
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
      </Card>

      {/* Supplier Details Modal */}
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

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">On-Time Delivery</p>
                  <p className="font-semibold">{selectedSupplier.on_time_delivery}</p>
                </div>
                <div>
                  <p className="text-gray-600">Conformity Rate</p>
                  <p className="font-semibold">{selectedSupplier.conformity_rate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Delivery Days</p>
                  <p className="font-semibold">{selectedSupplier.avg_delivery_days} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Orders</p>
                  <p className="font-semibold">{selectedSupplier.total_orders}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add Supplier"
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
          <Input label="Supplier Name" placeholder="Supplier name" required />
          <Input label="SIRET" placeholder="SIRET number" />
          <Input label="Sector" placeholder="Business sector" />
          <Input label="Email" type="email" placeholder="Contact email" />
          <Input label="Phone" placeholder="Contact phone" />
        </div>
      </Modal>
    </div>
  );
};

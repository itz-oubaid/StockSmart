import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Pagination, Table } from "../components/Table";
import { Badge, Button, Card, Input, Modal, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../hooks/useApi";

export const Products = () => {
  const { hasPermission, tenant } = useAuth();
  const currency = tenant?.currency || localStorage.getItem('stocksmart_currency') || 'EUR';
  const symbol = currency === 'USD' ? '$' : '€';
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state for adding product
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    price_buy: "",
    price_sell: "",
    quantity: "",
    min_qty: "",
    max_qty: "",
  });

  // Fetch products from API
  const { products, loading, error, createProduct, deleteProduct } = useProducts();

  const itemsPerPage = 10;
  
  // Calculate stats from fetched products
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.category === filterCategory;
      
      let matchesStatus = true;
      if (filterStatus === "In Stock") matchesStatus = product.quantity > 10;
      else if (filterStatus === "Low Stock") matchesStatus = product.quantity > 0 && product.quantity <= 10;
      else if (filterStatus === "Out of Stock") matchesStatus = product.quantity === 0;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, filterCategory, filterStatus]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku) {
      setFormError("Product name and SKU are required");
      return;
    }

    setSaving(true);
    setFormError("");
    
    const result = await createProduct({
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      price_buy: parseFloat(newProduct.price_buy) || 0,
      price_sell: parseFloat(newProduct.price_sell) || 0,
      quantity: parseInt(newProduct.quantity) || 0,
      min_qty: parseInt(newProduct.min_qty) || 0,
      max_qty: parseInt(newProduct.max_qty) || 1000,
    });

    setSaving(false);

    if (result.success) {
      setShowAddForm(false);
      setNewProduct({ name: "", sku: "", category: "Electronics", price_buy: "", price_sell: "", quantity: "", min_qty: "", max_qty: "" });
    } else {
      setFormError(result.error || "Failed to create product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const result = await deleteProduct(id);
    if (!result.success) {
      alert(result.error || "Failed to delete product");
    }
  };

  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Product Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "quantity", label: "Quantity", sortable: true },
    {
      key: "price_sell",
      label: "Price",
      sortable: true,
      render: (val) => `${symbol}${val || 0}`,
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        const quantity = row.quantity;
        let status = "In Stock";
        let variant = "green";
        
        if (quantity === 0) {
          status = "Out of Stock";
          variant = "red";
        } else if (quantity <= 10) {
          status = "Low Stock";
          variant = "yellow";
        }
        
        return <Badge variant={variant}>{status}</Badge>;
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
              <button 
                onClick={() => handleDeleteProduct(row.id)}
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
        <h1 className="text-3xl font-bold">Products</h1>
        {hasPermission('manage_products') && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <FiPlus /> Add Product
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold mt-2">{loading ? "-" : totalProducts}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{loading ? "-" : lowStockCount}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{loading ? "-" : outOfStockCount}</p>
        </Card>
      </div>

      {/* Filters */}
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

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <>
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
          </>
        )}
      </Card>

      {/* Product Details Modal */}
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
                <label className="text-sm font-medium text-gray-600">Price</label>
                <p className="text-lg font-semibold">{symbol}{selectedProduct.price_sell}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormError("");
        }}
        title="Add Product"
        className="w-full max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} disabled={saving}>
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
            label="Product Name" 
            placeholder="Enter product name" 
            required 
            value={newProduct.name}
            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input 
            label="SKU" 
            placeholder="Enter SKU" 
            required 
            value={newProduct.sku}
            onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
          />
          <Select
            label="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
            options={[
              { value: "Electronics", label: "Electronics" },
              { value: "Accessories", label: "Accessories" },
              { value: "Cables", label: "Cables" },
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={`Buy Price (${symbol})`} 
              type="number" 
              placeholder="0" 
              value={newProduct.price_buy}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price_buy: e.target.value }))}
            />
            <Input 
              label={`Sell Price (${symbol})`} 
              type="number" 
              placeholder="0" 
              value={newProduct.price_sell}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price_sell: e.target.value }))}
            />
          </div>
          <Input 
            label="Initial Quantity" 
            type="number" 
            placeholder="0" 
            value={newProduct.quantity}
            onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
};

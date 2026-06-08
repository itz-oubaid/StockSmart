import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaBox,
    FaCheckCircle,
    FaExclamationTriangle,
    FaMinus,
    FaPlus,
    FaSync,
    FaTimes,
    FaTruck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { movementsAPI, ordersAPI, productsAPI } from '../services/api';
import '../styles/StorekeeperDashboard.css';

export const StorekeeperDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showLotModal, setShowLotModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form states
  const [lotForm, setLotForm] = useState({
    productId: '',
    lotNumber: '',
    serialNumber: '',
    quantity: '',
    expiryDate: '',
    action: 'add',
  });

  const [movementForm, setMovementForm] = useState({
    productId: '',
    type: 'out',
    quantity: '',
    reason: '',
    lotId: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantity: '',
    reason: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, movementsData] = await Promise.all([
        productsAPI.list(),
        movementsAPI.list({ limit: 50 }),
      ]);

      setProducts(productsData.data || []);
      setMovements(movementsData.data || []);

      // Generate mock lots from products
      const mockLots = (productsData.data || []).flatMap((product) => [
        {
          id: `lot-${product.id}-1`,
          productId: product.id,
          productName: product.name,
          lotNumber: `LOT-${product.sku}-001`,
          serialNumber: `SN-${product.sku}-001`,
          quantity: Math.floor(Math.random() * 500) + 50,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          receivedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      ]);
      setLots(mockLots);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Lot Management
  const handleAddLot = async () => {
    try {
      if (!lotForm.productId || !lotForm.quantity) {
        showAlert('Please fill all required fields', 'danger');
        return;
      }

      if (lotForm.action === 'add') {
        // Add new lot
        const newLot = {
          id: `lot-${Date.now()}`,
          productId: lotForm.productId,
          productName: products.find((p) => p.id == lotForm.productId)?.name,
          lotNumber: lotForm.lotNumber || `LOT-${Date.now()}`,
          serialNumber: lotForm.serialNumber,
          quantity: parseInt(lotForm.quantity),
          expiryDate: lotForm.expiryDate,
          receivedDate: new Date().toISOString().split('T')[0],
        };
        setLots([...lots, newLot]);

        // Update product quantity
        setProducts(
          products.map((p) =>
            p.id == lotForm.productId
              ? {
                  ...p,
                  quantity: (p.quantity || 0) + parseInt(lotForm.quantity),
                }
              : p
          )
        );
      } else if (lotForm.action === 'remove' && selectedLot) {
        // Remove lot
        const removedLot = lots.find((l) => l.id === selectedLot);
        setLots(lots.filter((l) => l.id !== selectedLot));

        setProducts(
          products.map((p) =>
            p.id == removedLot.productId
              ? {
                  ...p,
                  quantity: Math.max(0, (p.quantity || 0) - removedLot.quantity),
                }
              : p
          )
        );
      }

      showAlert(
        `Lot ${lotForm.action === 'add' ? 'added' : 'removed'} successfully`,
        'success'
      );
      setShowLotModal(false);
      resetLotForm();
    } catch (error) {
      console.error('Error managing lot:', error);
      showAlert('Failed to manage lot', 'danger');
    }
  };

  // Stock Movement
  const handleCreateMovement = async () => {
    try {
      if (!movementForm.productId || !movementForm.quantity) {
        showAlert('Please fill all required fields', 'danger');
        return;
      }

      const product = products.find((p) => p.id == movementForm.productId);
      const quantity = parseInt(movementForm.quantity);

      if (movementForm.type === 'out' && product.quantity < quantity) {
        showAlert('Insufficient stock', 'danger');
        return;
      }

      // Create movement record
      const newMovement = {
        id: `move-${Date.now()}`,
        productId: movementForm.productId,
        productName: product.name,
        type: movementForm.type,
        quantity: quantity,
        reason: movementForm.reason,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        status: 'Completed',
      };
      setMovements([newMovement, ...movements]);

      // Update product quantity
      const quantityChange =
        movementForm.type === 'in' ? quantity : -quantity;
      setProducts(
        products.map((p) =>
          p.id == movementForm.productId
            ? {
                ...p,
                quantity: Math.max(0, (p.quantity || 0) + quantityChange),
              }
            : p
        )
      );

      showAlert(`Stock movement recorded successfully`, 'success');
      setShowMovementModal(false);
      resetMovementForm();
    } catch (error) {
      console.error('Error creating movement:', error);
      showAlert('Failed to create movement', 'danger');
    }
  };

  // Purchase Request
  const handleCreatePurchaseRequest = async () => {
    try {
      if (!purchaseForm.productId || !purchaseForm.quantity) {
        showAlert('Please fill all required fields', 'danger');
        return;
      }

      const product = products.find((p) => p.id == purchaseForm.productId);

      const orderData = {
        items: [
          {
            productId: purchaseForm.productId,
            quantity: parseInt(purchaseForm.quantity),
            reason: purchaseForm.reason,
          },
        ],
        reason: purchaseForm.reason,
        requestedBy: user.email,
      };

      await ordersAPI.create(orderData);

      showAlert('Purchase request created successfully', 'success');
      setShowPurchaseModal(false);
      resetPurchaseForm();
    } catch (error) {
      console.error('Error creating purchase request:', error);
      showAlert('Failed to create purchase request', 'danger');
    }
  };

  // Reset forms
  const resetLotForm = () => {
    setLotForm({
      productId: '',
      lotNumber: '',
      serialNumber: '',
      quantity: '',
      expiryDate: '',
      action: 'add',
    });
    setSelectedLot(null);
  };

  const resetMovementForm = () => {
    setMovementForm({
      productId: '',
      type: 'out',
      quantity: '',
      reason: '',
      lotId: '',
    });
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      productId: '',
      quantity: '',
      reason: '',
    });
  };

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + (p.quantity || 0), 0),
    lowStock: products.filter((p) => (p.quantity || 0) < 50).length,
    expiringLots: lots.filter((l) => {
      const expiryDate = new Date(l.expiryDate);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow;
    }).length,
  };

  if (loading) {
    return (
      <div className="storekeeper-dashboard">
        <div className="text-center py-12">
          <p className="text-slate-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="storekeeper-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>{t('storekeeper.title') || 'Stock Management'}</h1>
        <p>{t('storekeeper.subtitle') || 'Manage stock, lots, and movements'}</p>
      </div>

      {/* Alerts */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaBox className="stat-icon total" />
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">{t('storekeeper.total_products') || 'Products'}</div>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon stock" />
          <div className="stat-value">{stats.totalStock}</div>
          <div className="stat-label">{t('storekeeper.total_stock') || 'Total Stock'}</div>
        </div>
        <div className="stat-card">
          <FaExclamationTriangle className="stat-icon warning" />
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">{t('storekeeper.low_stock') || 'Low Stock'}</div>
        </div>
        <div className="stat-card">
          <FaTruck className="stat-icon expiring" />
          <div className="stat-value">{stats.expiringLots}</div>
          <div className="stat-label">
            {t('storekeeper.expiring_soon') || 'Expiring Soon'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {t('storekeeper.overview') || 'Stock Overview'}
        </button>
        <button
          className={`tab-button ${activeTab === 'lots' ? 'active' : ''}`}
          onClick={() => setActiveTab('lots')}
        >
          {t('storekeeper.lot_management') || 'Lot Management'}
        </button>
        <button
          className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          {t('storekeeper.movements') || 'Movements'}
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t('storekeeper.history') || 'History'}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="content-section">
            <div className="section-header">
              <h2>{t('storekeeper.stock_overview') || 'Stock Overview'}</h2>
              <div className="section-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowMovementModal(true);
                    setMovementForm({ ...movementForm, type: 'in' });
                  }}
                >
                  <FaPlus /> {t('storekeeper.register_stock') || 'Register Stock'}
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <p>{t('common.no_data')}</p>
              </div>
            ) : (
              <div className="products-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('common.name')}</th>
                      <th>{t('products.sku')}</th>
                      <th>{t('storekeeper.current_stock') || 'Current Stock'}</th>
                      <th>{t('products.price')}</th>
                      <th>{t('storekeeper.status') || 'Status'}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="font-semibold">{product.name}</td>
                        <td>{product.sku}</td>
                        <td>
                          <span className="quantity-badge">
                            {product.quantity || 0}
                          </span>
                        </td>
                        <td>${product.price_sell || 0}</td>
                        <td>
                          {(product.quantity || 0) > 50 ? (
                            <span className="badge-success">In Stock</span>
                          ) : (product.quantity || 0) > 0 ? (
                            <span className="badge-warning">Low</span>
                          ) : (
                            <span className="badge-danger">Out</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setMovementForm({
                                  ...movementForm,
                                  productId: product.id,
                                });
                                setShowMovementModal(true);
                              }}
                              title="Add/Remove stock"
                            >
                              <FaSync />
                            </button>
                            {(product.quantity || 0) < 100 && (
                              <button
                                className="btn-tertiary btn-sm"
                                onClick={() => {
                                  setPurchaseForm({
                                    ...purchaseForm,
                                    productId: product.id,
                                  });
                                  setShowPurchaseModal(true);
                                }}
                                title="Create purchase request"
                              >
                                <FaTruck />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Lot Management Tab */}
        {activeTab === 'lots' && (
          <div className="content-section">
            <div className="section-header">
              <h2>{t('storekeeper.lot_management') || 'Lot Management'}</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setLotForm({ ...lotForm, action: 'add' });
                  setShowLotModal(true);
                }}
              >
                <FaPlus /> {t('storekeeper.add_lot') || 'Add Lot'}
              </button>
            </div>

            {lots.length === 0 ? (
              <div className="empty-state">
                <p>{t('common.no_data')}</p>
              </div>
            ) : (
              <div className="lots-list">
                {lots.map((lot) => (
                  <div key={lot.id} className="lot-card">
                    <div className="lot-header">
                      <div>
                        <h3>{lot.productName}</h3>
                        <p className="lot-number">Lot: {lot.lotNumber}</p>
                      </div>
                      <div className="lot-actions">
                        <button
                          className="btn-remove"
                          onClick={() => {
                            setSelectedLot(lot.id);
                            setLotForm({
                              ...lotForm,
                              productId: lot.productId,
                              action: 'remove',
                            });
                            setShowLotModal(true);
                          }}
                        >
                          <FaMinus />
                        </button>
                      </div>
                    </div>
                    <div className="lot-details">
                      <div className="detail-item">
                        <span className="label">Quantity:</span>
                        <span className="value">{lot.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Serial:</span>
                        <span className="value">{lot.serialNumber || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Received:</span>
                        <span className="value">{lot.receivedDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Expiry:</span>
                        <span
                          className={`value ${new Date(lot.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring' : ''}`}
                        >
                          {lot.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="content-section">
            <div className="section-header">
              <h2>{t('storekeeper.stock_movements') || 'Stock Movements'}</h2>
              <button
                className="btn-primary"
                onClick={() => setShowMovementModal(true)}
              >
                <FaPlus /> {t('storekeeper.new_movement') || 'New Movement'}
              </button>
            </div>

            {movements.length === 0 ? (
              <div className="empty-state">
                <p>{t('common.no_data')}</p>
              </div>
            ) : (
              <div className="movements-list">
                {movements.slice(0, 20).map((movement) => (
                  <div key={movement.id} className="movement-card">
                    <div className="movement-type">
                      {movement.type === 'in' ? (
                        <FaPlus className="type-in" />
                      ) : (
                        <FaMinus className="type-out" />
                      )}
                    </div>
                    <div className="movement-info">
                      <h3>{movement.productName}</h3>
                      <p className="reason">{movement.reason}</p>
                      <p className="timestamp">
                        {new Date(movement.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="movement-details">
                      <span
                        className={`quantity ${movement.type === 'in' ? 'in' : 'out'}`}
                      >
                        {movement.type === 'in' ? '+' : '-'}
                        {movement.quantity}
                      </span>
                      <span className="badge-info">{movement.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="content-section">
            <div className="section-header">
              <h2>{t('storekeeper.movement_history') || 'Movement History'}</h2>
            </div>

            {movements.length === 0 ? (
              <div className="empty-state">
                <p>{t('common.no_data')}</p>
              </div>
            ) : (
              <div className="history-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('common.date')}</th>
                      <th>{t('common.name')}</th>
                      <th>{t('storekeeper.movement_type') || 'Type'}</th>
                      <th>{t('products.quantity')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('storekeeper.reason') || 'Reason'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td>
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </td>
                        <td>{movement.productName}</td>
                        <td>
                          <span
                            className={`badge ${movement.type === 'in' ? 'badge-success' : 'badge-warning'}`}
                          >
                            {movement.type === 'in' ? 'In' : 'Out'}
                          </span>
                        </td>
                        <td>{movement.quantity}</td>
                        <td>
                          <span className="badge-info">{movement.status}</span>
                        </td>
                        <td>{movement.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Lot Management Modal */}
      {showLotModal && (
        <div className="modal-overlay" onClick={() => setShowLotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {lotForm.action === 'add'
                  ? t('storekeeper.add_lot') || 'Add Lot'
                  : t('storekeeper.remove_lot') || 'Remove Lot'}
              </h2>
              <button
                className="btn-close"
                onClick={() => setShowLotModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {lotForm.action === 'add' ? (
                <>
                  <div className="form-group">
                    <label>{t('common.name')} *</label>
                    <select
                      className="form-input"
                      value={lotForm.productId}
                      onChange={(e) =>
                        setLotForm({ ...lotForm, productId: e.target.value })
                      }
                    >
                      <option value="">{t('common.select')}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('products.lot_number')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lotForm.lotNumber}
                      onChange={(e) =>
                        setLotForm({ ...lotForm, lotNumber: e.target.value })
                      }
                      placeholder="LOT-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('products.serial_number')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lotForm.serialNumber}
                      onChange={(e) =>
                        setLotForm({
                          ...lotForm,
                          serialNumber: e.target.value,
                        })
                      }
                      placeholder="SN-001"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('products.quantity')} *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={lotForm.quantity}
                      onChange={(e) =>
                        setLotForm({ ...lotForm, quantity: e.target.value })
                      }
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('products.expiry_date')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={lotForm.expiryDate}
                      onChange={(e) =>
                        setLotForm({ ...lotForm, expiryDate: e.target.value })
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="confirmation-message">
                  <p>
                    {t('storekeeper.confirm_remove_lot') ||
                      'Are you sure you want to remove this lot?'}
                  </p>
                  {selectedLot && lots.find((l) => l.id === selectedLot) && (
                    <div className="lot-preview">
                      <p>
                        <strong>
                          {
                            lots.find((l) => l.id === selectedLot)
                              ?.productName
                          }
                        </strong>
                      </p>
                      <p>
                        Lot:{' '}
                        {lots.find((l) => l.id === selectedLot)?.lotNumber}
                      </p>
                      <p>
                        Quantity:{' '}
                        {lots.find((l) => l.id === selectedLot)?.quantity}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLotModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button className="btn-confirm" onClick={handleAddLot}>
                {lotForm.action === 'add'
                  ? t('storekeeper.add')
                  : t('storekeeper.remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMovementModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('storekeeper.record_movement') || 'Record Movement'}</h2>
              <button
                className="btn-close"
                onClick={() => setShowMovementModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>{t('common.name')} *</label>
                <select
                  className="form-input"
                  value={movementForm.productId}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, productId: e.target.value })
                  }
                >
                  <option value="">{t('common.select')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('storekeeper.movement_type')} *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="in"
                      checked={movementForm.type === 'in'}
                      onChange={(e) =>
                        setMovementForm({
                          ...movementForm,
                          type: e.target.value,
                        })
                      }
                    />
                    {t('storekeeper.stock_in') || 'Stock In (Add)'}
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="out"
                      checked={movementForm.type === 'out'}
                      onChange={(e) =>
                        setMovementForm({
                          ...movementForm,
                          type: e.target.value,
                        })
                      }
                    />
                    {t('storekeeper.stock_out') || 'Stock Out (Remove)'}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>{t('products.quantity')} *</label>
                <input
                  type="number"
                  className="form-input"
                  value={movementForm.quantity}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      quantity: e.target.value,
                    })
                  }
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>{t('storekeeper.reason')}</label>
                <textarea
                  className="form-textarea"
                  value={movementForm.reason}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, reason: e.target.value })
                  }
                  placeholder="e.g., Warehouse transfer, Damage, Expiry..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowMovementModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button className="btn-confirm" onClick={handleCreateMovement}>
                {t('storekeeper.record')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPurchaseModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {t('storekeeper.create_purchase_request') ||
                  'Create Purchase Request'}
              </h2>
              <button
                className="btn-close"
                onClick={() => setShowPurchaseModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>{t('common.name')} *</label>
                <select
                  className="form-input"
                  value={purchaseForm.productId}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      productId: e.target.value,
                    })
                  }
                >
                  <option value="">{t('common.select')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('products.quantity')} *</label>
                <input
                  type="number"
                  className="form-input"
                  value={purchaseForm.quantity}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      quantity: e.target.value,
                    })
                  }
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>{t('storekeeper.reason')}</label>
                <textarea
                  className="form-textarea"
                  value={purchaseForm.reason}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, reason: e.target.value })
                  }
                  placeholder="Reason for purchase request..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowPurchaseModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreatePurchaseRequest}
              >
                {t('storekeeper.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

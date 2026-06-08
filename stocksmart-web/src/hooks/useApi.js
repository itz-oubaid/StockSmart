import { useCallback, useEffect, useState } from 'react';
import {
  automationAPI,
  brandsAPI,
  dashboardAPI,
  movementsAPI,
  ordersAPI,
  productsAPI,
  reportsAPI,
  suppliersAPI,
  tenantsAPI,
} from '../services/api';

// ============ Products ============

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.list(filters);
      const productsData = response?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError(err.response?.data?.message || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = () => fetchProducts();

  const createProduct = async (data) => {
    try {
      const response = await productsAPI.create(data);
      await fetchProducts();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const updateProduct = async (id, data) => {
    try {
      await productsAPI.update(id, data);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { products, loading, error, refetch, createProduct, deleteProduct, updateProduct };
};

// ============ Suppliers ============

export const useSuppliers = (filters = {}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await suppliersAPI.list(filters);
      const data = response?.data || [];
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching suppliers:', err.message);
      setError(err.response?.data?.message || err.message);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const refetch = () => fetchSuppliers();

  const createSupplier = async (data) => {
    try {
      const response = await suppliersAPI.create(data);
      await fetchSuppliers();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await suppliersAPI.delete(id);
      await fetchSuppliers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { suppliers, loading, error, refetch, createSupplier, deleteSupplier };
};

// ============ Brands ============

export const useBrands = (filters = {}) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await brandsAPI.list(filters);
      const data = response?.data || [];
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching brands:', err.message);
      setError(err.response?.data?.message || err.message);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const refetch = () => fetchBrands();

  const createBrand = async (data) => {
    try {
      const response = await brandsAPI.create(data);
      await fetchBrands();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteBrand = async (id) => {
    try {
      await brandsAPI.delete(id);
      await fetchBrands();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { brands, loading, error, refetch, createBrand, deleteBrand };
};

// ============ Movements ============

export const useMovements = (filters = {}) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movementsAPI.list(filters);
      const movementsData = response?.data || [];

      if (Array.isArray(movementsData) && movementsData.length > 0) {
        const transformed = movementsData.map((m) => ({
          id: m.id,
          date: m.created_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
          type: m.type,
          product: m.product,
          sku: m.sku || '',
          quantity: m.quantity,
          user: m.user || 'Unknown',
          depot_from: m.depot_from || '',
          depot_to: m.depot_to || '',
          reason: m.reason || '',
          status: m.status || 'Completed',
        }));
        setMovements(transformed);
      } else {
        setMovements([]);
      }
    } catch (err) {
      console.error('Error fetching movements:', err.message);
      setError(err.response?.data?.message || err.message);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const refetch = () => fetchMovements();

  const createMovement = async (data) => {
    try {
      const response = await movementsAPI.create(data);
      await fetchMovements();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { movements, loading, error, refetch, createMovement };
};

// ============ Dashboard Stats ============

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardAPI.getStats();
        setStats(response.data.data || response.data || null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.message || err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

// ============ Reports ============

export const useStockReport = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        const response = await reportsAPI.getStockReport(filters);
        if (!isMounted) return;

        const stockData = response?.data || [];
        setData(Array.isArray(stockData) ? stockData : []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching stock report:', err.message);
        setError(err.response?.data?.message || err.message);
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [filterString]);

  return { data, loading, error };
};

export const useMovementsReport = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        const response = await reportsAPI.getMovementsReport(filters);
        if (!isMounted) return;

        const reportData = response?.data || [];
        setData(Array.isArray(reportData) ? reportData : []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching movements report:', err.message);
        setError(err.response?.data?.message || err.message);
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [filterString]);

  return { data, loading, error };
};

export const useValueReport = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        const response = await reportsAPI.getValueReport(filters);
        if (!isMounted) return;

        const valueData = response?.data || [];
        setData(Array.isArray(valueData) ? valueData : []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching value report:', err.message);
        setError(err.response?.data?.message || err.message);
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [filterString]);

  return { data, loading, error };
};

export const usePredictions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPredictions = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        const response = await reportsAPI.getPredictions();
        if (!isMounted) return;

        const reportData = response?.data?.data || response?.data || [];
        setData(Array.isArray(reportData) ? reportData : []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching predictions:', err.message);
        setError(err.response?.data?.message || err.message);
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPredictions();
    return () => { isMounted = false; };
  }, []);

  return { data, loading, error };
};

// ============ Tenants ============

export const useTenant = (id) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenant = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await tenantsAPI.getOne(id);
      setTenant(response.data);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const updateTenant = async (data) => {
    try {
      const response = await tenantsAPI.update(id, data);
      await fetchTenant();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { tenant, loading, error, refetch: fetchTenant, updateTenant };
};

// ============ Orders ============

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterString = JSON.stringify(filters);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.list(filters);
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [filterString]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data) => {
    try {
      const response = await ordersAPI.create(data);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteOrder = async (id) => {
    try {
      await ordersAPI.delete(id);
      await fetchOrders();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const approveOrder = async (id) => {
    try {
      const response = await ordersAPI.approve(id);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const rejectOrder = async (id, rejection_reason = '') => {
    try {
      const response = await ordersAPI.reject(id, { rejection_reason });
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const selectSupplier = async (id, supplier_id) => {
    try {
      const response = await ordersAPI.selectSupplier(id, { supplier_id });
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getPending();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    createOrder, 
    deleteOrder, 
    approveOrder, 
    rejectOrder, 
    selectSupplier,
    fetchPending,
    refetch: fetchOrders
  };
};

// ============ Automation ============

export const useAutomationAlerts = () => {
  const [alerts, setAlerts] = useState({
    low_stock: [],
    excess_stock: [],
    expiring_soon: [],
    pending_orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationAPI.getAlerts();
      setAlerts(response.data || {});
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, error, refetch: fetchAlerts };
};

export const useTriggerAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = async (data = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationAPI.triggerN8n(data);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  return { trigger, loading, error };
};

export function useVisionAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const analyzeShelf = async (file) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await automationAPI.visionUpdate(formData);
      setResult(res.data);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Scan failed');
      throw err;
    } finally { setLoading(false); }
  };

  const applyToStock = async (items) => {
    setSaving(true); setError(null);
    try {
      const res = await automationAPI.visionApply(items);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Save failed');
      throw err;
    } finally { setSaving(false); }
  };

  return { analyzeShelf, applyToStock, result, setResult, loading, saving, error };
}
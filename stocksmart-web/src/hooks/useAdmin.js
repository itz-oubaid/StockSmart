import { useCallback, useEffect, useState } from 'react';
import { adminAPI, tenantsAPI, usersAPI } from '../services/api';

const DEMO_TENANTS = [
  { id: 1, name: 'Demo Company', slug: 'demo', plan: 'Pro', status: 'active', locale: 'fr', currency: 'EUR', created_at: '2026-01-15' },
];

const DEMO_USERS = [
  { id: 1, name: 'Oubai Admin', email: 'admin@stocksmart.app', role: 'Admin Système', status: 'active', tenant_id: null, tenant_name: null },
  { id: 2, name: 'Marie Dupont', email: 'manager@stocksmart.app', role: 'Manager', status: 'active', tenant_id: 1, tenant_name: 'Demo Company' },
  { id: 3, name: 'Jean Commercial', email: 'commercial@stocksmart.app', role: 'Commercial', status: 'active', tenant_id: 1, tenant_name: 'Demo Company' },
];

export const useTenantsAdmin = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantsAPI.list();
      setTenants(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setTenants(DEMO_TENANTS);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (data) => {
    try {
      await tenantsAPI.create(data);
      await fetchTenants();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const updateTenant = async (id, data) => {
    try {
      await tenantsAPI.update(id, data);
      await fetchTenants();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteTenant = async (id) => {
    try {
      await tenantsAPI.delete(id);
      await fetchTenants();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { tenants, loading, error, refetch: fetchTenants, createTenant, updateTenant, deleteTenant };
};

export const useUsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.listAll();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setUsers(DEMO_USERS);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id, data) => {
    try {
      await usersAPI.update(id, data);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteUser = async (id) => {
    try {
      await usersAPI.delete(id);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const inviteTenantAdmin = async ({ email, tenant_id, name }) => {
    try {
      const response = await adminAPI.inviteTenantAdmin({ email, tenant_id, name, role: 'Admin Tenant' });
      await fetchUsers();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { users, loading, error, refetch: fetchUsers, updateUser, deleteUser, inviteTenantAdmin };
};

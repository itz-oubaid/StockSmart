import { useCallback, useEffect, useState } from 'react';
import { adminAPI, depotsAPI, usersAPI } from '../services/api';

const DEMO_TENANT_USERS = [
  { id: 2, name: 'Marie Dupont', email: 'manager@stocksmart.app', role: 'Manager', status: 'active', depots: ['all'] },
  { id: 3, name: 'Jean Commercial', email: 'commercial@stocksmart.app', role: 'Commercial', status: 'active', depots: [] },
  { id: 4, name: 'Pierre Magasinier', email: 'magasinier@stocksmart.app', role: 'Magasinier', status: 'active', depots: ['depot-001'] },
];

const DEMO_DEPOTS = [
  { id: 1, name: 'Main Warehouse', address: '12 Rue de la Logistique, Paris', type: 'warehouse' },
  { id: 2, name: 'Secondary Depot', address: '45 Avenue du Stock, Lyon', type: 'depot' },
];

export const useTenantUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.listTenant();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setUsers(DEMO_TENANT_USERS);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data) => {
    try {
      await usersAPI.create(data);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

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

  const inviteUser = async (data) => {
    try {
      const response = await adminAPI.inviteUser(data);
      await fetchUsers();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { users, loading, error, refetch: fetchUsers, createUser, updateUser, deleteUser, inviteUser };
};

export const useDepots = () => {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await depotsAPI.list();
      setDepots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setDepots(DEMO_DEPOTS);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  const createDepot = async (data) => {
    try {
      await depotsAPI.create(data);
      await fetchDepots();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const updateDepot = async (id, data) => {
    try {
      await depotsAPI.update(id, data);
      await fetchDepots();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const deleteDepot = async (id) => {
    try {
      await depotsAPI.delete(id);
      await fetchDepots();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  return { depots, loading, error, refetch: fetchDepots, createDepot, updateDepot, deleteDepot };
};

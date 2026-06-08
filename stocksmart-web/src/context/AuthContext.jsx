import { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../config/i18n';
import { authAPI } from '../services/api';

const SUPPORTED_LOCALES = ['en', 'fr', 'es'];

const applyLocale = (locale) => {
  const code = (locale || '').split('-')[0];
  if (!SUPPORTED_LOCALES.includes(code)) return;
  if (i18n.language !== code) {
    i18n.changeLanguage(code);
  }
  document.documentElement.lang = code;
  localStorage.setItem('stocksmart_language', code);
};

const ROLE_PERMISSIONS = {
  'Admin Système': {
    label: 'Administrateur Système',
    scope: 'global',
    permissions: ['manage_tenants', 'manage_all_users', 'system_config', 'supervision'],
  },
  'Admin Tenant': {
    label: 'Administrateur Tenant',
    scope: 'tenant',
    permissions: ['manage_users', 'manage_depots', 'manage_products', 'manage_suppliers', 'manage_brands', 'view_reports', 'manage_config'],
  },
  'Manager': {
    label: 'Manager',
    scope: 'tenant',
    permissions: ['validate_orders', 'supervise_stock', 'view_all_depots', 'view_reports', 'select_suppliers'],
    depots: 'all',
  },
  'Commercial': {
    label: 'Commercial',
    scope: 'tenant',
    permissions: ['view_stock', 'create_orders', 'follow_orders'],
    depots: 'none',
  },
  'Magasinier': {
    label: 'Magasinier',
    scope: 'tenant',
    permissions: ['manage_movements', 'receive_stock', 'inventory', 'scan'],
    depots: 'assigned',
  },
  'Storekeeper': {
    label: 'Magasinier Stock',
    scope: 'tenant',
    permissions: ['view_stock', 'manage_stock_lots', 'add_stock', 'remove_stock', 'perform_movements', 'create_purchase_requests', 'register_entries', 'view_history'],
    depots: 'assigned',
  },
};

const DEMO_USERS = [
  {
    id: 'user-1',
    email: 'admin@stocksmart.app',
    password: 'admin123',
    name: 'Oubai Admin',
    role: 'Admin Système',
    tenant_id: null,
    depots: [],
  },
  {
    id: 'user-5',
    email: 'tenantadmin@stocksmart.app',
    password: 'tenant123',
    name: 'Sophie Tenant Admin',
    role: 'Admin Tenant',
    tenant_id: 'tenant-demo',
    depots: [],
  },
  {
    id: 'user-2',
    email: 'manager@stocksmart.app',
    password: 'manager123',
    name: 'Marie Dupont',
    role: 'Manager',
    tenant_id: 'tenant-demo',
    depots: ['all'],
  },
  {
    id: 'user-3',
    email: 'commercial@stocksmart.app',
    password: 'commercial123',
    name: 'Jean Commercial',
    role: 'Commercial',
    tenant_id: 'tenant-demo',
    depots: [],
  },
  {
    id: 'user-4',
    email: 'magasinier@stocksmart.app',
    password: 'magasinier123',
    name: 'Pierre Magasinier',
    role: 'Magasinier',
    tenant_id: 'tenant-demo',
    depots: ['depot-001', 'depot-002'],
  },
  {
    id: 'user-6',
    email: 'storekeeper@stocksmart.app',
    password: 'storekeeper123',
    name: 'Luc Storekeeper',
    role: 'Storekeeper',
    tenant_id: 'tenant-demo',
    depots: ['depot-001', 'depot-002'],
  },
];

// Set to true to use mock data when backend is not available
const USE_FALLBACK = true;

const AuthContext = createContext({
  user: null,
  tenant: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signup: () => {},
  updateProfile: () => {},
  hasPermission: () => false,
  canAccessDepot: () => false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stocksmart_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [tenant, setTenant] = useState(() => {
    try {
      const stored = localStorage.getItem('stocksmart_tenant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('stocksmart_token');
    if (user && !token) {
      setUser(null);
      setTenant(null);
      localStorage.removeItem('stocksmart_user');
      localStorage.removeItem('stocksmart_tenant');
      return;
    }
    if (user) {
      localStorage.setItem('stocksmart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stocksmart_user');
    }
  }, [user]);

  useEffect(() => {
    if (tenant) {
      localStorage.setItem('stocksmart_tenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('stocksmart_tenant');
    }
  }, [tenant]);

  useEffect(() => {
    if (tenant?.locale) {
      applyLocale(tenant.locale);
    }
  }, [tenant?.locale]);

  const loginWithDemoUser = (found) => {
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    if (found.tenant_id) {
      const demoLocale = localStorage.getItem('stocksmart_language') || 'fr';
      const demoTenant = {
        id: found.tenant_id,
        name: 'Demo Company',
        slug: 'demo',
        plan: 'Pro',
        locale: demoLocale,
        currency: localStorage.getItem('stocksmart_currency') || 'EUR',
      };
      setTenant(demoTenant);
      applyLocale(demoLocale);
    } else {
      setTenant(null);
      const storedLocale = localStorage.getItem('stocksmart_language');
      if (storedLocale) applyLocale(storedLocale);
    }
    localStorage.setItem('stocksmart_token', 'demo-token');
    localStorage.setItem('stocksmart_demo', '1');
    return { success: true, user: safeUser };
  };

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token, tenant: tenantData } = response.data;

      if (token) {
        localStorage.setItem('stocksmart_token', token);
        localStorage.removeItem('stocksmart_demo');
      }

      let mappedUser = null;
      if (userData) {
        mappedUser = {
          ...userData,
          role: userData.role || 'Commercial',
          tenant_id: tenantData?.id || null,
        };
        setUser(mappedUser);
      }

      if (tenantData) {
        setTenant(tenantData);
        if (tenantData.locale) {
          applyLocale(tenantData.locale);
        }
      } else {
        const storedLocale = localStorage.getItem('stocksmart_language');
        if (storedLocale) applyLocale(storedLocale);
      }

      return { success: true, user: mappedUser };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Email ou mot de passe incorrect.';

      if (USE_FALLBACK) {
        const demoUser = DEMO_USERS.find(
          (u) =>
            u.email.toLowerCase() === normalizedEmail &&
            u.password === password
        );
        if (demoUser) {
          return loginWithDemoUser(demoUser);
        }
      }

      return { success: false, error: errorMsg };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await authAPI.signup(email, password, name);
      const { user: userData, token, tenant: tenantData } = response.data;

      if (token) {
        localStorage.setItem('stocksmart_token', token);
      }

      if (userData) {
        setUser(userData);
      }

      if (tenantData) {
        setTenant(tenantData);
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Erreur lors de l\'inscription. Veuillez réessayer.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (!localStorage.getItem('stocksmart_demo')) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTenant(null);
      localStorage.removeItem('stocksmart_token');
      localStorage.removeItem('stocksmart_demo');
      localStorage.removeItem('stocksmart_user');
      localStorage.removeItem('stocksmart_tenant');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      const updatedUser = response.data.user || response.data;
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  const updateTenantSettings = (updates) => {
    setTenant((prev) => {
      const current = prev || {
        id: 'tenant-demo',
        name: 'Demo Tenant',
        slug: 'demo',
        plan: 'Pro',
        locale: 'fr',
        currency: 'EUR',
      };
      const updated = { ...current, ...updates };
      localStorage.setItem('stocksmart_tenant', JSON.stringify(updated));
      return updated;
    });

    if (updates.locale) {
      applyLocale(updates.locale);
    }
    if (updates.currency) {
      localStorage.setItem('stocksmart_currency', updates.currency);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super admins and Tenant admins have access to everything
    if (user.role === 'Admin Système' || user.role === 'Admin Tenant') {
      return true;
    }
    
    const rolePerms = ROLE_PERMISSIONS[user.role];
    return rolePerms?.permissions?.includes(permission) || false;
  };

  const canAccessDepot = (depotId) => {
    if (!user) return false;
    if (user.role === 'Admin Système' || user.role === 'Admin Tenant')
      return true;
    if (user.role === 'Manager') return true;
    if (user.depots?.includes('all')) return true;
    return user.depots?.includes(depotId) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        updateProfile,
        updateTenantSettings,
        hasPermission,
        canAccessDepot,
        rolePermissions: ROLE_PERMISSIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

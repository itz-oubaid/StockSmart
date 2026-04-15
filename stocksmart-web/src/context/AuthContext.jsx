import { createContext, useContext, useEffect, useState } from 'react';

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
];

const AuthContext = createContext({
  user: null,
  tenant: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
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

  const login = (email, password) => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!found) {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    const { password: _, ...safeUser } = found;
    setUser(safeUser);

    if (found.tenant_id) {
      setTenant({
        id: found.tenant_id,
        name: 'Demo Tenant',
        slug: 'demo',
        plan: 'Pro',
        locale: 'fr',
        currency: 'EUR',
      });
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
  };

  const updateProfile = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const rolePerms = ROLE_PERMISSIONS[user.role];
    return rolePerms?.permissions?.includes(permission) || false;
  };

  const canAccessDepot = (depotId) => {
    if (!user) return false;
    if (user.role === 'Admin Système' || user.role === 'Admin Tenant') return true;
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
        updateProfile,
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

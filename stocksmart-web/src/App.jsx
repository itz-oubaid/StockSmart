import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Brands } from "./pages/Brands";
import { CommercialDashboard } from "./pages/CommercialDashboard";
import { Dashboard } from "./pages/Dashboard";
import { Depots } from "./pages/Depots";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { ManagerApprovals } from "./pages/ManagerApprovals";
import { Movements } from "./pages/Movements";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { StorekeeperDashboard } from "./pages/StorekeeperDashboard";
import { Suppliers } from "./pages/Suppliers";
import { SystemAdmin } from "./pages/SystemAdmin";
import { TenantAdmin } from "./pages/TenantAdmin";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated} = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children}) =>{
  const { isAuthenticated } =  useAuth();
  if(isAuthenticated) return <Navigate to="/home" replace />;
  return children;
};

const PermissionRoute = ({ children, permission }) => {
  const { hasPermission } = useAuth();
  // Special case: 'manage_products' users can usually view stock too
  const canAccess = hasPermission(permission) || (permission === 'view_stock' && hasPermission('manage_products'));
  
  if (!canAccess) return <Navigate to="/home" replace />;
  return children;
};
const AppRoutes = () =>{
  return (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/home" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Home />} />
      <Route path="admin" element={<PermissionRoute permission="manage_tenants"><SystemAdmin /></PermissionRoute>} />
      <Route path="tenant" element={<PermissionRoute permission="manage_users"><TenantAdmin /></PermissionRoute>} />
      <Route path="dashboard" element={<PermissionRoute permission="view_reports"><Dashboard /></PermissionRoute>} />
      <Route path="products" element={<PermissionRoute permission="view_stock"><Products /></PermissionRoute>} />
      <Route path="depots" element={<PermissionRoute permission="manage_depots"><Depots /></PermissionRoute>} />
      <Route path="orders" element={<PermissionRoute permission="create_orders"><Orders /></PermissionRoute>} />
      <Route path="commercial" element={<PermissionRoute permission="create_orders"><CommercialDashboard /></PermissionRoute>} />
      <Route path="approvals" element={<PermissionRoute permission="validate_orders"><ManagerApprovals /></PermissionRoute>} />
      <Route path="storekeeper" element={<PermissionRoute permission="manage_stock_lots"><StorekeeperDashboard /></PermissionRoute>} />
      <Route path="movements" element={<PermissionRoute permission="manage_movements"><Movements /></PermissionRoute>} />
      <Route path="suppliers" element={<PermissionRoute permission="manage_suppliers"><Suppliers /></PermissionRoute>} />
      <Route path="brands" element={<PermissionRoute permission="manage_brands"><Brands /></PermissionRoute>} />
      <Route path="settings" element={<Settings />} />
      <Route path="reports" element={<PermissionRoute permission="view_reports"><Reports/></PermissionRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace/>} />
  </Routes>
  );
}


export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
};


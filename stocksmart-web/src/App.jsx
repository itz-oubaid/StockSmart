import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Brands } from "./pages/Brands";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Movements } from "./pages/Movements";
import { Products } from "./pages/Products";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Suppliers } from "./pages/Suppliers";


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
const AppRoutes = () =>{
  return (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/home" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Home />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="movements" element={<Movements />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="brands" element={<Brands />} />
      <Route path="settings" element={<Settings />} />
      <Route path="reports" element={<Reports/>} />
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


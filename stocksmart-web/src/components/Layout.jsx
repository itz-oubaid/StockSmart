import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBars, FaBox, FaBuilding, FaChartBar, FaCog, FaFile, FaHome, FaMoon, FaSearch, FaShoppingCart, FaSignOutAlt, FaSun, FaSync, FaTag, FaTruck, FaUsers, FaWarehouse } from 'react-icons/fa';
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { path: "/home", label: "Home", translationKey: "nav.home", icon: FaHome },
  { path: "/home/admin", label: "Platform Admin", translationKey: "nav.admin", icon: FaBuilding, requiredPermission: "manage_tenants" },
  { path: "/home/tenant", label: "Tenant Admin", translationKey: "nav.tenantAdmin", icon: FaUsers, requiredPermission: "manage_users" },
  { path: "/home/dashboard", label: "Dashboard", translationKey: "nav.dashboard", icon: FaChartBar, requiredPermission: "view_reports" },
  { path: "/home/depots", label: "Depots", translationKey: "nav.depots", icon: FaWarehouse, requiredPermission: "manage_depots" },
  { path: "/home/products", label: "Products", translationKey: "nav.products", icon: FaBox, requiredPermission: "view_stock" },
  { path: "/home/commercial", label: "My Requests", translationKey: "nav.commercial", icon: FaShoppingCart, requiredPermission: "create_orders" },
  { path: "/home/orders", label: "Orders", translationKey: "nav.orders", icon: FaShoppingCart, requiredPermission: "create_orders" },
  { path: "/home/approvals", label: "Approvals", translationKey: "nav.approvals", icon: FaShoppingCart, requiredPermission: "validate_orders" },
  { path: "/home/storekeeper", label: "Stock Management", translationKey: "nav.storekeeper", icon: FaWarehouse, requiredPermission: "manage_stock_lots" },
  { path: "/home/movements", label: "Movements", translationKey: "nav.movements", icon: FaSync, requiredPermission: "manage_movements" },
  { path: "/home/suppliers", label: "Suppliers", translationKey: "nav.suppliers", icon: FaTruck, requiredPermission: "manage_suppliers" },
  { path: "/home/brands", label: "Brands", translationKey: "nav.brands", icon: FaTag, requiredPermission: "manage_brands" },
  { path: "/home/reports", label: "Reports", translationKey: "nav.reports", icon: FaFile, requiredPermission: "view_reports" },
];

export const Layout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("stocksmart-sidebar") !== "collapsed";
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("stocksmart-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark-theme");
      root.classList.add("dark");
      root.classList.remove("light-theme");
      root.classList.remove("light");
      localStorage.setItem("stocksmart-theme", "dark");
    } else {
      root.classList.remove("dark-theme");
      root.classList.remove("dark");
      root.classList.add("light-theme");
      root.classList.add("light");
      localStorage.setItem("stocksmart-theme", "light");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("stocksmart-sidebar", newState ? "open" : "collapsed");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Find the first matching item the user has permission to view
      const visibleItems = menuItems.filter(item =>
        (!item.requiredPermission || hasPermission(item.requiredPermission)) &&
        (item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t(item.translationKey).toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (visibleItems.length > 0) {
        navigate(visibleItems[0].path);
        setSearchTerm(""); // clear search after successful navigation
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          {sidebarOpen && <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">StockSmart</h2>}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${!sidebarOpen && 'mx-auto'}`}
            aria-label="Toggle sidebar"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-4 py-4">
            <form onSubmit={handleSearch} className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="search"
                placeholder={t('common.search') + "..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </form>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {sidebarOpen && <div className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">{t('nav.menu')}</div>}

          {menuItems
            .filter(item => !item.requiredPermission || hasPermission(item.requiredPermission))
            .filter(item => 
              item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
              t(item.translationKey).toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSearchTerm("")} // clear search when clicked
                  title={!sidebarOpen ? t(item.translationKey) : ""}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <IconComponent size={18} className={!sidebarOpen ? 'mx-auto' : ''} />
                  {sidebarOpen && <span>{t(item.translationKey)}</span>}
                </Link>
              );
            })}

          <Link
            to="/home/settings"
            title={!sidebarOpen ? t('nav.settings') : ""}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all mt-auto"
          >
            <FaCog size={18} className={!sidebarOpen ? 'mx-auto' : ''} />
            {sidebarOpen && <span>{t('nav.settings')}</span>}
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            {sidebarOpen && <span>{darkMode ? t('nav.lightMode') : t('nav.darkMode')}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={t('nav.logout')}
          >
            <FaSignOutAlt size={18} />
            {sidebarOpen && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};


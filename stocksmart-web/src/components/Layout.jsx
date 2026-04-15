import { useEffect, useState } from "react";
import { FaBars, FaBox, FaChartBar, FaCog, FaFile, FaHome, FaMoon, FaSearch, FaSignOutAlt, FaSun, FaSync } from 'react-icons/fa';
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { path: "/home", label: "Home", icon: FaHome },
  { path: "/home/dashboard", label: "Dashboard", icon: FaChartBar },
  { path: "/home/products", label: "Products", icon: FaBox },
  { path: "/home/movements", label: "Movements", icon: FaSync },
  { path: "/home/reports", label: "Reports", icon: FaFile },
];

export const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const handleLogout = () => {
    logout();
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
      console.log("Searching for:", searchTerm);
    }
  };

  const enableLight = () => setDarkMode(false);
  const enableDark = () => setDarkMode(true);

  return (
    <div className="home-page">
      <aside className={`home-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
        <button onClick={toggleSidebar} className="sidebar-menu-btn" aria-label="Toggle sidebar"><FaBars size={20}/></button>

        {sidebarOpen && <h2>StockSmart</h2>}
        {sidebarOpen && (
          <form className="search-menu" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-menu-input"
            />
            <button type="submit" className="search-menu-btn" aria-label="Search">
              <FaSearch size={14} />
            </button>
          </form>
        )}
        {sidebarOpen && <h5>Menu</h5>}
        <div className="menu-items">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.path} to={item.path} title={!sidebarOpen ? item.label : ""}>
                <IconComponent size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
          <Link to="/home/settings" title={!sidebarOpen ? "Settings" : ""}>
            <FaCog size={18} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </div>
        {sidebarOpen && <h5>Help & Support</h5>}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <FaSignOutAlt size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
          <button
            className={`light-btn ${!darkMode ? "active" : ""}`}
            onClick={enableLight}
            aria-label="Switch to light theme"
            type="button"
            title="Light mode"
          >
            <FaSun size={16} />
          </button>
          <button
            className={`dark-btn ${darkMode ? "active" : ""}`}
            onClick={enableDark}
            aria-label="Switch to dark theme"
            type="button"
            title="Dark mode"
          >
            <FaMoon size={16} />
          </button>
        </div>
      </aside>
      <main className="home-content">
        <Outlet />
      </main>
      <footer className="home-footer">
        &copy; contact info
      </footer>
    </div>
  );
};

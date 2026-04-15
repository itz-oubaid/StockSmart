
import { useState } from "react";

export const Dashboard = () =>{
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("Searching for:", searchTerm);
      // Add search functionality here
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <form className="dashboard-header" onSubmit={handleSearch}>
        <input 
          type="search"
          placeholder="Looking for..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="dashboard-stats">
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>256</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Movements</h3>
          <p>48</p>
          <p style={{fontSize: '12px', margin: '8px 0 0 0'}}>Today: 12 | Week: 48</p>
        </div>
        <div className="dashboard-card">
          <h3>Warehouses</h3>
          <p>5</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Suppliers</h3>
          <p>32</p>
        </div>
      </div>
      <div className="dashboard-charts">
        <h3>Sales & Purchases Overview</h3>
        <div className="dashboard-charts-placeholder">
          📊 Chart coming soon
        </div>
      </div>
    </div>
  )
}
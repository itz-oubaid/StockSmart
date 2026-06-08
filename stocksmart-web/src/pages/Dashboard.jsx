import { useState } from "react";
import { useDashboardStats } from "../hooks/useApi";
import { Card, Button, Badge } from "../components/UI";
import VisionScanner from "../components/VisionScanner";
import { 
  FiPackage, 
  FiRepeat, 
  FiTruck, 
  FiUsers, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiActivity,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSearch
} from "react-icons/fi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { motion } from "framer-motion";

export const Dashboard = () => {
  const { stats, loading, error } = useDashboardStats();
  const [searchTerm, setSearchTerm] = useState("");

  const kpis = [
    { 
      label: "Total Products", 
      value: stats?.total_products, 
      icon: <FiPackage />, 
      color: "blue",
      trend: "+12%",
      trendType: "up"
    },
    { 
      label: "Stock Movements", 
      value: stats?.total_movements, 
      icon: <FiRepeat />, 
      color: "indigo",
      trend: "+5%",
      trendType: "up"
    },
    { 
      label: "Warehouses", 
      value: stats?.total_warehouses, 
      icon: <FiTruck />, 
      color: "emerald",
      trend: "Stable",
      trendType: "neutral"
    },
    { 
      label: "Active Suppliers", 
      value: stats?.total_suppliers, 
      icon: <FiUsers />, 
      color: "amber",
      trend: "-2%",
      trendType: "down"
    },
  ];

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Warehouse Insights</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time inventory intelligence and AI operations.</p>
        </div>
        <div className="relative group max-w-md w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search products, SKUs, or movements..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${kpi.color}-50 dark:bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:scale-110 transition-transform`}>
                  {kpi.icon}
                </div>
                <div className={`flex items-center text-xs font-bold ${
                  kpi.trendType === 'up' ? 'text-emerald-500' : 
                  kpi.trendType === 'down' ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {kpi.trendType === 'up' && <FiArrowUpRight className="mr-1" />}
                  {kpi.trendType === 'down' && <FiArrowDownRight className="mr-1" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" /> : kpi.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{kpi.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Movement Chart */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FiActivity className="text-blue-500" /> Stock Movement Flux
                </h3>
                <p className="text-sm text-slate-500">Volume of IN/OUT operations (Last 7 days)</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">IN</Badge>
                <Badge variant="error">OUT</Badge>
              </div>
            </div>
            <div className="h-64 w-full">
              {loading ? (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.movement_history || []}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                    <Area type="monotone" dataKey="out" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Vision Scanner Section */}
          <VisionScanner />
        </div>

        {/* Sidebar: Alerts & Top Products */}
        <div className="space-y-8">
          {/* Critical Alerts */}
          <Card className="bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-4">
              <FiAlertTriangle /> Attention Required
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/20">
                <div className="text-sm font-bold">Low Stock Alerts</div>
                <Badge variant="error">{stats?.low_stock_count || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/20">
                <div className="text-sm font-bold">Out of Stock</div>
                <Badge variant="error">{stats?.out_of_stock_count || 0}</Badge>
              </div>
            </div>
            <Button className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white border-none">
              View Inventory Audit
            </Button>
          </Card>

          {/* Top Products */}
          <Card shadow="lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" /> High Capacity Assets
            </h3>
            <div className="space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                ))
              ) : (
                stats?.top_products?.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-slate-400">0{idx + 1}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{prod.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{prod.sku}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{prod.stock}</div>
                      <div className="text-[10px] text-slate-400">Units</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-slate-500 hover:text-blue-600">
              Full Valuation Report
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
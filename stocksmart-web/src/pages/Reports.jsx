import { useState } from 'react';
import { 
  FiBarChart2, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiEye, 
  FiSettings, 
  FiDownload,
  FiZap,
  FiClock,
  FiBox
} from 'react-icons/fi';
import { Card, Button, Badge, Alert } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { 
  useMovementsReport, 
  usePredictions, 
  useStockReport, 
  useValueReport,
  useAutomationAlerts,
  useTriggerAutomation
} from '../hooks/useApi';

const SimpleBarChart = ({ data, label, value, color = '#3b82f6', secondaryValue = null }) => {
  if (!data || data.length === 0) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No data available</div>;

  const validData = data.filter(d => d && typeof d === 'object');
  if (validData.length === 0) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Invalid data format</div>;

  const maxValue = Math.max(...validData.map(d => Number(d[value]) || 0), ...validData.map(d => Number(d[secondaryValue]) || 0), 1);
  const chartHeight = 200;
  const barWidth = Math.max(40, Math.min(80, 500 / validData.length));
  const svgWidth = validData.length * barWidth + 60;

  return (
    <div className="overflow-x-auto py-6">
      <svg width={svgWidth} height={chartHeight + 60} className="mx-auto">
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <g key={i}>
            <text x="25" y={chartHeight - (p * chartHeight) + 5} textAnchor="end" fontSize="10" className="fill-gray-400">
              {Math.round(p * maxValue)}
            </text>
            <line x1="30" y1={chartHeight - (p * chartHeight)} x2={svgWidth} y2={chartHeight - (p * chartHeight)} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
          </g>
        ))}

        {/* X-axis */}
        <line x1="30" y1={chartHeight} x2={svgWidth} y2={chartHeight} stroke="#d1d5db" strokeWidth="2" />
        
        {/* Bars */}
        {validData.map((item, idx) => {
          const itemValue = Number(item[value]) || 0;
          const barHeight = (itemValue / maxValue) * chartHeight;
          const xPos = 40 + idx * barWidth;
          const yPos = chartHeight - barHeight;
          const labelText = item[label]?.toString() || `Item ${idx + 1}`;

          return (
            <g key={idx}>
              {/* Main Bar */}
              <rect
                x={xPos}
                y={yPos}
                width={secondaryValue ? (barWidth - 10) / 2 : barWidth - 10}
                height={Math.max(barHeight, 0)}
                fill={color}
                rx="2"
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              
              {/* Secondary Bar (for predictions) */}
              {secondaryValue && (
                <rect
                  x={xPos + (barWidth - 10) / 2}
                  y={chartHeight - (Number(item[secondaryValue]) / maxValue) * chartHeight}
                  width={(barWidth - 10) / 2}
                  height={Math.max((Number(item[secondaryValue]) / maxValue) * chartHeight, 0)}
                  fill="#10b981"
                  rx="2"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              )}

              <text
                x={xPos + (barWidth - 10) / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                className="fill-gray-500 dark:fill-gray-400 font-medium"
                transform={`rotate(35, ${xPos + (barWidth - 10) / 2}, ${chartHeight + 20})`}
              >
                {labelText.length > 10 ? labelText.substring(0, 8) + '...' : labelText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const AlertItem = ({ type, title, message, items = [] }) => {
  const styles = {
    low_stock: { icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-50', badge: 'red' },
    excess_stock: { icon: FiBox, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'yellow' },
    expiring_soon: { icon: FiClock, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'purple' },
    pending_orders: { icon: FiZap, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'blue' },
  };

  const style = styles[type] || styles.pending_orders;
  const Icon = style.icon;

  if (items.length === 0) return null;

  return (
    <Card className={`mb-4 border-l-4 border-l-${style.badge}-500 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${style.bg}`}>
          <Icon className={`text-xl ${style.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white capitalize">{title}</h4>
            <Badge variant={style.badge}>{items.length} items</Badge>
          </div>
          <div className="space-y-2 mt-3">
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-sm flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-700 dark:text-gray-300">
                  {item.product_name || item.name || `Order #${item.order_id}`}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.current_qty !== undefined ? `${item.current_qty} / ${item.min_qty || item.max_qty}` : item.expiry_date || `${item.hours_pending}h`}
                </span>
              </div>
            ))}
            {items.length > 3 && (
              <p className="text-xs text-gray-500 text-center mt-2 italic">And {items.length - 3} more...</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const Reports = () => {
  const { tenant } = useAuth();
  const currency = tenant?.currency || localStorage.getItem('stocksmart_currency') || 'EUR';
  const symbol = currency === 'USD' ? '$' : '€';
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Reports Data
  const stockReport = useStockReport({ range: dateRange });
  const movementsReport = useMovementsReport({ range: dateRange });
  const valueReport = useValueReport({ range: dateRange });
  const predictionsReport = usePredictions();
  
  // Automation Data
  const { alerts, loading: alertsLoading } = useAutomationAlerts();
  const { trigger: triggerAutomation, loading: triggering } = useTriggerAutomation();

  const handleTriggerN8n = async () => {
    const res = await triggerAutomation({
      type: 'manual_report',
      scope: activeTab,
      timestamp: new Date().toISOString()
    });
    if (res.success) {
      alert('Automation triggered successfully! Check your email/n8n.');
    } else {
      alert('Error triggering automation: ' + res.error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'stock', label: 'Stock Levels', icon: FiBox },
    { id: 'movements', label: 'Movements', icon: FiTrendingUp },
    { id: 'value', label: 'Inventory Value', icon: FiDollarSign },
    { id: 'predictive', label: 'AI Forecast', icon: FiZap },
    { id: 'automation', label: 'Automation & Alerts', icon: FiSettings },
  ];

  const totalValue = valueReport.data?.reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FiBarChart2 />
            </div>
            Intelligence & Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-12">Data-driven insights and n8n automated workflows</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.print()} className="flex items-center gap-2">
            <FiDownload /> Export PDF
          </Button>
          <Button onClick={handleTriggerN8n} disabled={triggering} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
            <FiZap className={triggering ? 'animate-pulse' : ''} /> 
            {triggering ? 'Sending...' : 'Sync n8n'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-4 mb-8 border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="flex items-center gap-5 border-b-4 border-b-blue-500">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <FiBox size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Unique Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stockReport.data?.length || 0}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-5 border-b-4 border-b-green-500">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl">
                  <FiTrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Monthly Movements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{movementsReport.data?.length || 0}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-5 border-b-4 border-b-purple-500">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <FiDollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Asset Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}{totalValue.toLocaleString()}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-5 border-b-4 border-b-red-500">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                  <FiAlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(alerts.low_stock?.length || 0) + (alerts.expiring_soon?.length || 0)}
                  </p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card title="Stock Distribution">
                <h3 className="text-lg font-bold mb-4">Stock Levels by Product</h3>
                <SimpleBarChart data={stockReport.data.slice(0, 10)} label="product_name" value="quantity" color="#3b82f6" />
              </Card>
              <Card title="Recent Activity">
                <h3 className="text-lg font-bold mb-4">Transaction Volume (Last 30 Days)</h3>
                <SimpleBarChart data={movementsReport.data} label="date" value="count" color="#10b981" />
              </Card>
            </div>
          </>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Detailed Stock Report</h3>
              <Badge variant="blue">Daily Snapshot</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 dark:border-gray-700">
                  <tr className="text-gray-500 dark:text-gray-400 text-sm">
                    <th className="py-4 font-semibold">Product</th>
                    <th className="py-4 font-semibold">SKU</th>
                    <th className="py-4 font-semibold">Quantity</th>
                    <th className="py-4 font-semibold">Value</th>
                    <th className="py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {stockReport.data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 font-medium">{item.product_name}</td>
                      <td className="py-4 text-gray-500">{item.sku}</td>
                      <td className="py-4 font-bold">{item.quantity}</td>
                      <td className="py-4">{symbol}{item.total_value?.toLocaleString()}</td>
                      <td className="py-4">
                        <Badge variant={item.quantity < 10 ? 'red' : 'green'}>
                          {item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* VALUE TAB */}
        {activeTab === 'value' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-xl font-bold mb-6">Inventory Value Distribution</h3>
                <SimpleBarChart data={valueReport.data.slice(0, 15)} label="product_name" value="total_value" color="#8b5cf6" />
              </Card>
            </div>
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
              <h3 className="text-xl font-bold mb-4 opacity-90">Total Value Summary</h3>
              <div className="space-y-6 mt-8">
                <div>
                  <p className="text-sm opacity-70">Calculated on Purchase Price</p>
                  <p className="text-4xl font-extrabold">{symbol}{totalValue.toLocaleString()}</p>
                </div>
                <div className="pt-6 border-t border-white/20">
                  <p className="text-sm opacity-70 mb-2">Highest Value Asset</p>
                  <p className="text-xl font-bold">{valueReport.data[0]?.product_name || 'N/A'}</p>
                  <p className="text-lg opacity-90">{symbol}{valueReport.data[0]?.total_value.toLocaleString()}</p>
                </div>
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  Generate Weekly Report
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* PREDICTIVE TAB */}
        {activeTab === 'predictive' && (
          <div className="space-y-8">
            <Alert variant="info" title="AI Forecast Enabled" message="Our predictive model analyzes the last 8 weeks of movements to suggest order quantities for the next 4 weeks." />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-xl font-bold mb-6">Sales Forecast vs Suggested Orders</h3>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Predicted Sales
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Suggested Order
                  </div>
                </div>
                <SimpleBarChart 
                  data={predictionsReport.data} 
                  label="week" 
                  value="predicted_sales" 
                  secondaryValue="suggested_order"
                />
              </Card>

              <Card>
                <h3 className="text-xl font-bold mb-4">Order Suggestions</h3>
                <div className="space-y-4">
                  {predictionsReport.data.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{item.week}</p>
                        <p className="text-sm text-gray-500">Target Inventory Rebalancing</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Order Qty</p>
                        <p className="text-2xl font-black text-green-600">+{item.suggested_order}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* AUTOMATION TAB */}
        {activeTab === 'automation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiAlertTriangle className="text-red-500" /> Active System Alerts
              </h3>
              {alertsLoading ? (
                <div className="p-12 text-center">Loading intelligent alerts...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AlertItem type="low_stock" title="Low Stock Alerts" items={alerts.low_stock} />
                  <AlertItem type="expiring_soon" title="Expiration Alerts" items={alerts.expiring_soon} />
                  <AlertItem type="pending_orders" title="Pending Tasks" items={alerts.pending_orders} />
                  <AlertItem type="excess_stock" title="Excess Stock" items={alerts.excess_stock} />
                </div>
              )}

              <Card className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <FiEye className="text-indigo-600" /> Visual Analysis (AI Camera Support)
                </h4>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FiEye size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Main Warehouse Camera #01</p>
                    <p className="text-xs text-gray-500">Connected - Last scan 12m ago</p>
                  </div>
                  <Badge variant="green" className="ml-auto">Active</Badge>
                </div>
                <div className="text-sm text-indigo-800 dark:text-indigo-300">
                  <p>• <strong>Counting:</strong> Automated shelf counting active.</p>
                  <p>• <strong>Discrepancy:</strong> Alerts will trigger if physical stock differs from theoretical.</p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold mb-4">Automation Hub</h3>
                <div className="space-y-3">
                  <Button onClick={handleTriggerN8n} variant="primary" className="w-full flex items-center justify-center gap-2 py-3">
                    <FiZap /> Run n8n Sync
                  </Button>
                  <Button variant="secondary" className="w-full py-3">Configure Webhooks</Button>
                  <Button variant="secondary" className="w-full py-3">Integration Logs</Button>
                </div>
              </Card>
              
              <div className="p-6 bg-gradient-to-br from-gray-800 to-black rounded-2xl text-white shadow-xl">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <FiSettings /> n8n Status
                </h4>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Worker Node Online</span>
                </div>
                <p className="text-xs opacity-50 mt-4 leading-relaxed">
                  The n8n orchestrator is monitoring your database for alerts and scheduled reports.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
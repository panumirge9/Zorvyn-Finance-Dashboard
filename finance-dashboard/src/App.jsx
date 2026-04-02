import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, Plus, Trash2, Shield, Eye, TrendingUp, Wallet, ArrowDownCircle, Download, ChevronDown, Check, Flame, Activity, PieChart as PieChartIcon, TrendingDown, Sparkles, BarChart2 } from 'lucide-react';

const INITIAL_DATA = [
  { id: 1, date: '2026-03-25', amount: 45000, category: 'Salary', type: 'income' },
  { id: 2, date: '2026-03-26', amount: 1200, category: 'Food', type: 'expense' },
  { id: 3, date: '2026-03-27', amount: 8000, category: 'Rent', type: 'expense' },
  { id: 4, date: '2026-03-28', amount: 500, category: 'Transport', type: 'expense' },
  { id: 5, date: '2026-04-01', amount: 2000, category: 'Utilities', type: 'expense' },
  { id: 6, date: '2026-02-28', amount: 8000, category: 'Rent', type: 'expense' },
  { id: 7, date: '2026-02-15', amount: 4500, category: 'Shopping', type: 'expense' },
];

const TREND_DATA = [
  { day: 'Mon', balance: 30000 },
  { day: 'Tue', balance: 32000 },
  { day: 'Wed', balance: 77000 },
  { day: 'Thu', balance: 75800 },
  { day: 'Fri', balance: 67800 },
  { day: 'Sat', balance: 67300 },
  { day: 'Sun', balance: 65300 },
];

const CATEGORY_TREND_DATA = [
  { month: 'Jan', Rent: 8000, Food: 3200, Utilities: 1500, Shopping: 2000, Transport: 800 },
  { month: 'Feb', Rent: 8000, Food: 4500, Utilities: 1800, Shopping: 4500, Transport: 1200 },
  { month: 'Mar', Rent: 8000, Food: 3800, Utilities: 1600, Shopping: 1200, Transport: 900 },
  { month: 'Apr', Rent: 8000, Food: 4200, Utilities: 1500, Shopping: 3500, Transport: 1000 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl">
        <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-blue-400 font-bold text-lg">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 mb-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label} Total</p>
          <p className="text-white font-bold text-sm">₹{total.toLocaleString('en-IN')}</p>
        </div>
        <div className="space-y-2.5">
          {[...payload].reverse().map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="font-mono font-medium text-slate-100">₹{entry.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function StatCard({ title, value, icon }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-[#111122] p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg hover:border-slate-700 transition"
    >
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
      </div>
      <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">{icon}</div>
    </motion.div>
  );
}

export default function App() {
  const [role, setRole] = useState('Admin'); 
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance-dashboard-data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('finance-dashboard-data', JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const highestCategory = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], amount: sorted[0][1] } : null;
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const monthYear = t.date.substring(0, 7); 
        acc[monthYear] = (acc[monthYear] || 0) + t.amount;
        return acc;
      }, {});
    const sortedMonths = Object.keys(monthlyExpenses).sort();
    if (sortedMonths.length < 2) return null; 
    const currentTotal = monthlyExpenses[sortedMonths[sortedMonths.length - 1]];
    const previousTotal = monthlyExpenses[sortedMonths[sortedMonths.length - 2]];
    const percentChange = (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1);
    return { percentChange: Math.abs(percentChange), isIncrease: currentTotal > previousTotal };
  }, [transactions]);

  const aiObservation = useMemo(() => {
    if (!highestCategory || totalExpense === 0) return "Keep tracking your expenses to see insights here.";
    const percentage = Math.round((highestCategory.amount / totalExpense) * 100);
    if (percentage >= 40) {
      return `Watch out! ${highestCategory.name} makes up a massive ${percentage}% of your total expenses. Consider optimizing this budget.`;
    } else {
      return `Your spending is well diversified. Your biggest cost is ${highestCategory.name} at ${percentage}% of total expenses.`;
    }
  }, [highestCategory, totalExpense]);

  const handleSaveTransaction = (e) => {
    e.preventDefault(); 
    if (!formData.amount || !formData.category) return;
    const newTx = {
      id: Date.now(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type
    };
    setTransactions([newTx, ...transactions]);
    setShowModal(false); 
    setFormData({ amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id) => setTransactions(transactions.filter(t => t.id !== id));

  const exportToCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Date,Category,Type,Amount (INR)'];
      const escapeCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;
      const csvRows = filteredTransactions.map(t => `${escapeCSV(t.date)},${escapeCSV(t.category)},${escapeCSV(t.type)},${t.amount}`);
      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      const today = new Date().toISOString().split('T')[0];
      a.setAttribute('download', `Zorvyn_Finance_${today}.csv`);
      a.click();
      setTimeout(() => setIsExporting(false), 2000);
    }, 300);
  };

  return (
    <div className="flex min-h-screen bg-[#050510] text-slate-300 font-sans relative">
      
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-64 border-r border-slate-800 p-6 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <h2 className="font-bold text-white tracking-widest uppercase text-sm">Zorvyn Finance</h2>
        </div>
        <nav className="space-y-6">
          <div onClick={() => setActiveTab('Overview')} className={`font-medium cursor-pointer transition flex items-center gap-3 ${activeTab === 'Overview' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
            <PieChartIcon size={18}/> Overview
          </div>
          <div onClick={() => setActiveTab('Transactions')} className={`font-medium cursor-pointer transition flex items-center gap-3 ${activeTab === 'Transactions' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
            <Wallet size={18}/> Transactions
          </div>
          <div onClick={() => setActiveTab('Insights')} className={`font-medium cursor-pointer transition flex items-center gap-3 ${activeTab === 'Insights' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
            <Activity size={18}/> Insights
          </div>
        </nav>
      </motion.aside>

      <main className="flex-1 p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
        <motion.div variants={containerVariants} initial="hidden" animate="show" key={activeTab}>
          
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back !</h1>
              <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'Overview' && "Here is your dynamic financial overview."}
                {activeTab === 'Transactions' && "Manage and search your transaction history."}
                {activeTab === 'Insights' && "Deep dive into your spending habits."}
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto relative">
              <button onClick={exportToCSV} disabled={isExporting || filteredTransactions.length === 0} className={`hidden sm:flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all duration-300 shadow-lg ${isExporting ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-[#111122] text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'} ${filteredTransactions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isExporting ? <Check size={16} className="animate-in zoom-in duration-300" /> : <Download size={16} />}
                {isExporting ? 'Exported!' : 'Export CSV'}
              </button>
              
              <div className="relative w-full sm:w-auto">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#111122] border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg">
                  {role === 'Admin' ? <Shield size={18} className="text-blue-400" /> : <Eye size={18} className="text-emerald-400" />}
                  <span className="text-sm font-semibold text-white">Role: {role}</span>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-48 bg-[#111122] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { setRole('Admin'); setIsDropdownOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left border-b border-slate-800/50">
                      <div className="flex items-center gap-3"><Shield size={16} className="text-blue-400" /><span className={`text-sm ${role === 'Admin' ? 'text-white font-bold' : 'text-slate-400'}`}>Admin</span></div>
                      {role === 'Admin' && <Check size={16} className="text-blue-400" />}
                    </button>
                    <button onClick={() => { setRole('Viewer'); setIsDropdownOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left">
                      <div className="flex items-center gap-3"><Eye size={16} className="text-emerald-400" /><span className={`text-sm ${role === 'Viewer' ? 'text-white font-bold' : 'text-slate-400'}`}>Viewer</span></div>
                      {role === 'Viewer' && <Check size={16} className="text-emerald-400" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.header>

          {(activeTab === 'Overview' || activeTab === 'Insights') && (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Balance" value={`₹${balance.toLocaleString('en-IN')}`} icon={<Wallet className="text-blue-400"/>} />
              <StatCard title="Total Income" value={`+₹${totalIncome.toLocaleString('en-IN')}`} icon={<TrendingUp className="text-emerald-400"/>} />
              <StatCard title="Total Expenses" value={`-₹${totalExpense.toLocaleString('en-IN')}`} icon={<ArrowDownCircle className="text-rose-400"/>} />
            </motion.div>
          )}

          {(activeTab === 'Overview' || activeTab === 'Insights') && (
            <motion.div variants={containerVariants} className="flex flex-col gap-8 mb-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
    
                <motion.div variants={itemVariants} className="lg:col-span-3 bg-gradient-to-b from-[#111122] to-[#0a0a14] p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Balance Trend</h3>
                    <span className="text-xs font-medium bg-slate-800/50 text-slate-400 px-3 py-1 rounded-full border border-slate-700/50">Last 7 Days</span>
                  </div>
                  <div className="h-64 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis hide domain={['dataMin - 2000', 'dataMax + 2000']} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" activeDot={{ r: 6, fill: '#111122', stroke: '#3b82f6', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2 bg-gradient-to-b from-[#111122] to-[#0a0a14] p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><PieChartIcon size={16} className="text-purple-500" /> Spend Analysis</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-40 h-40 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={transactions.filter(t => t.type === 'expense')} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none" onMouseEnter={(data) => setHoveredSlice({ name: data.name, amount: data.value })} onMouseLeave={() => setHoveredSlice(null)}>
                            {transactions.map((_, i) => <Cell key={`cell-${i}`} fill={['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'][i % 5]} className="cursor-pointer outline-none transition-all duration-300 hover:opacity-80" />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider truncate w-full">{hoveredSlice ? hoveredSlice.name : "Total"}</span>
                        <span className="text-white font-bold text-lg leading-tight transition-all duration-300">₹{hoveredSlice ? (hoveredSlice.amount >= 1000 ? (hoveredSlice.amount/1000).toFixed(1) + 'k' : hoveredSlice.amount) : (totalExpense/1000).toFixed(1) + 'k'}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-4 w-full">
                      <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Flame size={12} className="text-rose-500"/> Top Spend</p>
                        <p className="text-white font-bold text-sm truncate">{highestCategory ? `${highestCategory.name} ` : "No data"}<span className="text-slate-400 font-medium text-xs ml-1">(₹{highestCategory?.amount.toLocaleString('en-IN')})</span></p>
                      </div>
                      <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-emerald-500"/> Monthly Trend</p>
                        {monthlyComparison ? <p className={`text-sm font-bold flex items-center gap-1 ${monthlyComparison.isIncrease ? 'text-rose-400' : 'text-emerald-400'}`}>{monthlyComparison.isIncrease ? '▲' : '▼'} {monthlyComparison.percentChange}% <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider ml-1">vs last mo</span></p> : <p className="text-slate-400 text-xs">Need more data</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition">
                    <div className="absolute -top-2 -right-2 p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:rotate-12"><Sparkles size={60} className="text-blue-400" /></div>
                    <p className="text-blue-200/80 text-xs leading-relaxed relative z-10 pr-6"><span className="font-bold text-blue-400 flex items-center gap-1.5 mb-1.5"><Sparkles size={14} /> AI Insight</span>{aiObservation}</p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#111122] to-[#0a0a14] p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 size={16} className="text-emerald-500" /> Category Trend
                  </h3>
                  <span className="text-xs font-medium bg-slate-800/50 text-slate-400 px-3 py-1 rounded-full border border-slate-700/50">Year to Date</span>
                </div>
                
                <div className="h-72 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CATEGORY_TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      
                      <RechartsTooltip 
                        cursor={{ fill: '#334155', opacity: 0.15 }}
                        content={<CustomBarTooltip />}
                      />
                      
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '20px' }} />
                      
                      <Bar dataKey="Rent" stackId="a" fill="#3b82f6" radius={[0, 0, 6, 6]} animationDuration={1500} />
                      <Bar dataKey="Food" stackId="a" fill="#10b981" animationDuration={1500} />
                      <Bar dataKey="Shopping" stackId="a" fill="#f43f5e" animationDuration={1500} />
                      <Bar dataKey="Utilities" stackId="a" fill="#f59e0b" animationDuration={1500} />
                      <Bar dataKey="Transport" stackId="a" fill="#a855f7" radius={[6, 6, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </motion.div>
          )}

          {(activeTab === 'Overview' || activeTab === 'Transactions') && (
            <motion.section variants={itemVariants} className="bg-[#111122] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-white font-semibold">Recent Transactions</h3>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input type="text" placeholder="Filter by category..." className="w-full bg-[#050510] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition text-white" onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  {role === 'Admin' && (
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 whitespace-nowrap"><Plus size={16}/> Add Transaction</button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1a1a30] text-slate-400 text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Amount</th>
                      {role === 'Admin' && <th className="px-6 py-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTransactions.map(t => (
                      <motion.tr key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/5 transition group">
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-200">{t.category}</td>
                        <td className="px-6 py-4 capitalize text-xs"><span className={`px-2 py-1 rounded-full bg-opacity-10 ${t.type === 'income' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>{t.type}</span></td>
                        <td className={`px-6 py-4 font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>{t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}</td>
                        {role === 'Admin' && <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-rose-500 transition"><Trash2 size={16}/></button></td>}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length === 0 && <div className="p-10 text-center text-slate-600 italic">No transactions found.</div>}
            </motion.section>
          )}
        </motion.div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a14]/90 backdrop-blur-lg border-t border-slate-800 flex justify-around p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('Overview')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'Overview' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}><PieChartIcon size={20} /><span className="text-[10px] font-bold uppercase tracking-widest">Overview</span></button>
        <button onClick={() => setActiveTab('Transactions')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'Transactions' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}><Wallet size={20} /><span className="text-[10px] font-bold uppercase tracking-widest">Transact</span></button>
        <button onClick={() => setActiveTab('Insights')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'Insights' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}><Activity size={20} /><span className="text-[10px] font-bold uppercase tracking-widest">Insights</span></button>
      </nav>

      {showModal && role === 'Admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111122] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Add New Transaction</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="accent-rose-500"/> Expense</label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="accent-emerald-500"/> Income</label>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input type="number" required min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#050510] border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition" placeholder="e.g. 1500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#050510] border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition" placeholder="e.g. Groceries, Salary, Rent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-[#050510] border border-slate-800 rounded-lg p-3 text-slate-300 outline-none focus:border-blue-500 transition [color-scheme:dark]" />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition shadow-lg shadow-blue-500/20">Save Entry</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
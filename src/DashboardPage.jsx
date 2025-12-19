import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, LogOut, User, Mail, Clock, Shield } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
  'Entertainment', 'Education', 'Insurance', 'Shopping', 'Other'
];

const INVESTMENT_CATEGORIES = [
  'Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Retirement Accounts',
  'Cryptocurrency', 'Savings', 'Other'
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
                '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function DashboardPage({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('expenses');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Rent', category: 'Housing', amount: 24000, date: '2024-01-15' },
    { id: 2, name: 'Groceries', category: 'Food', amount: 6000, date: '2024-02-01' }
  ]);
  const [investments, setInvestments] = useState([
    { id: 1, name: '401k', category: 'Retirement Accounts', amount: 12000, date: '2024-01-01' },
    { id: 2, name: 'Index Fund', category: 'Stocks', amount: 8000, date: '2024-03-15' }
  ]);
  
  const [newItem, setNewItem] = useState({
    name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0]
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const isExpenseTab = activeTab === 'expenses';
  const currentItems = isExpenseTab ? expenses : investments;
  const setCurrentItems = isExpenseTab ? setExpenses : setInvestments;
  const categories = isExpenseTab ? EXPENSE_CATEGORIES : INVESTMENT_CATEGORIES;

  const handleAdd = () => {
    if (newItem.name && newItem.category && newItem.amount) {
      const item = {
        id: Date.now(),
        ...newItem,
        amount: parseFloat(newItem.amount)
      };
      setCurrentItems([...currentItems, item]);
      setNewItem({ name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleDelete = (id) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const categoryData = useMemo(() => {
    const grouped = currentItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [currentItems]);

  const totalAmount = useMemo(() => 
    currentItems.reduce((sum, item) => sum + item.amount, 0),
    [currentItems]
  );

  const monthlyData = useMemo(() => {
    const months = {};
    currentItems.forEach(item => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short' });
      months[month] = (months[month] || 0) + item.amount;
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  }, [currentItems]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.amount, 0);
  const netSavings = totalInvestments - totalExpenses;

  // Format date and time
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get login time (you can store this when user logs in)
  const loginTime = new Date(); // This should come from authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Staff Login Details Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Section - User Info */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <User size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center gap-2 text-blue-100 mt-1">
                  <Mail size={16} />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Middle Section - Login Details */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Login Time</p>
                  <p className="text-sm font-semibold">{formatTime(loginTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Current Date</p>
                  <p className="text-sm font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Role</p>
                  <p className="text-sm font-semibold">Staff Member</p>
                </div>
              </div>
            </div>

            {/* Right Section - Logout Button */}
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all shadow-md hover:shadow-lg border border-white/30"
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>

        {/* App Title */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Annual Finance Tracker</h1>
              <p className="text-slate-600">Manage your expenses and investments efficiently</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{formatDate(currentTime)}</p>
              <p className="text-2xl font-bold text-blue-600">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Total Expenses</span>
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">{expenses.length} transactions</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Total Investments</span>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-500">₹{totalInvestments.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">{investments.length} investments</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Net Position</span>
              <DollarSign className={netSavings >= 0 ? "text-green-500" : "text-red-500"} size={24} />
            </div>
            <p className={`text-3xl font-bold ${netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{Math.abs(netSavings).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {netSavings >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'investments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Investments
            </button>
          </div>

          {/* Add New Item Form */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-700 mb-3">Add New {isExpenseTab ? 'Expense' : 'Investment'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newItem.amount}
                onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newItem.date}
                onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAdd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill={isExpenseTab ? '#ef4444' : '#10b981'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">
              All {isExpenseTab ? 'Expenses' : 'Investments'} (Total: ₹{totalAmount.toLocaleString()})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Calendar size={14} />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-slate-800">₹{item.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  LogOut,
  User,
  Mail,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
const EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Insurance",
  "Shopping",
  "Other",
];

const INVESTMENT_CATEGORIES = [
  "Stocks",
  "Bonds",
  "Mutual Funds",
  "Real Estate",
  "Retirement Accounts",
  "Cryptocurrency",
  "Savings",
  "Other",
];

const INCOME_CATEGORIES = [
 "Salary",
 "Business",
 "Freelance",
 "Dividends",
 "Interest",
 "Rental Income",
 "Capital Gains",
 "Other",
];

const MONTHS = [
   { id: 0, name: "All Months" },
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

export default function DashboardPage({ user, onNavigate }) {
  const [showModal, setShowModal] = useState(false);

  const [activeTab, setActiveTab] = useState("income");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [income, setIncome] = useState([]);
  const [getfinance, setgetfinance] = useState([]);
const [getmonth, setGetMonth] = useState(0);

const changemonth = (month) => {
  setGetMonth(month);   // just update state
}
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

const isExpenseTab = activeTab === "expenses";
const isInvestmentTab = activeTab === "investments";
const isIncomeTab = activeTab === "income";

 const setCurrentItems = isExpenseTab
  ? setExpenses
  : isInvestmentTab
  ? setInvestments
  : setIncome;   // new income state setter

  const categories = isExpenseTab ? EXPENSE_CATEGORIES : isInvestmentTab ? INVESTMENT_CATEGORIES : INCOME_CATEGORIES;

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;



  useEffect(() => {
    if (!user?.id) return;

    fetch(`/api/financialyear`)
      .then((res) => res.json())
      .then((data) => {
        setgetfinance(data);
        setLoading(true);
      })
      .catch((err) => {
        console.error("Failed to fetch financial", err);
        setLoading(false);
      });
  }, [user]);

  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    if (getfinance.length > 0) {
      const defaultCat = getfinance.find(cat => cat.default_select == 1);
      if (defaultCat) {
        setSelectedCat(defaultCat.id);
      }
    }
  }, [getfinance]);


  

  useEffect(() => {
    if (!user?.id || !selectedCat) return;

    fetch(`/api/expenses/${user.id}/${selectedCat}`)
      .then(res => res.json())
      .then(data => {
        setLoading(true);
        setExpenses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch expenses", err);
        setLoading(false);
      });
  }, [user?.id, selectedCat]);

  useEffect(() => {
    if (!user?.id || !selectedCat) return;

    fetch(`/api/investments/${user.id}/${selectedCat}`)
      .then(res => res.json())
      .then(data => {
        setInvestments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch investments", err);
        setLoading(false);
      });
  }, [user?.id, selectedCat]);

    useEffect(() => {
    if (!user?.id|| !selectedCat) return;

    fetch(`/api/income/${user.id}/${selectedCat}`)
      .then(res => res.json())
      .then(data => {
        setIncome(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch income", err);
        setLoading(false);
      });
  }, [user,selectedCat]);

useEffect(() => {
  if (!user?.id || !selectedCat || !getmonth) return;

  const fetchAll = async () => {
    setLoading(true);

    const [exp, inv, inc] = await Promise.all([
      fetch(`/api/expenses/${user.id}/${selectedCat}/${getmonth}`).then(r => r.json()),
      fetch(`/api/investments/${user.id}/${selectedCat}/${getmonth}`).then(r => r.json()),
      fetch(`/api/income/${user.id}/${selectedCat}/${getmonth}`).then(r => r.json())
    ]);

    setExpenses(exp);
    setInvestments(inv);
    setIncome(inc);
    setLoading(false);
  };

  fetchAll();
}, [user?.id, selectedCat, getmonth]);


  const currentItems = isExpenseTab ? expenses : isInvestmentTab ? investments : income;
  const safeItems = Array.isArray(currentItems) ? currentItems : [];

  const handleAdd = async () => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    if (newItem.name && newItem.category && newItem.amount) {
      const item = {
        id: Date.now(),
        ...newItem,
        amount: parseFloat(newItem.amount),
      };

      if (isExpenseTab) {
        const res = await fetch("/api/addexpense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            name: newItem.name,
            category: newItem.category,
            amount: parseFloat(newItem.amount),
            date: newItem.date,
            financeid: selectedCat,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.warning(data.message);
          return;
        }

        toast.success("Expense added successfully!");

        // ✅ update UI immediately (optional)
        setCurrentItems((prev) => [...prev, item]);

        // ✅ clear form
        setNewItem({
          name: "",
          category: "",
          amount: "",
          sipDay: "",
          monthly: "",
          date: new Date().toISOString().split("T")[0],
        });

        return;
      }

      if (isInvestmentTab) {
        const res = await fetch("/api/addinvestment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            name: newItem.name,
            category: newItem.category,
            amount: parseFloat(newItem.amount),
            date: newItem.date,
            sipDay: newItem.sipDay,
            monthly: newItem.monthly,
            financeid: selectedCat,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.warning(data.message);
          return;
        }

        toast.success("Investment added successfully!");

        // ✅ update UI immediately (optional)
        setCurrentItems((prev) => [...prev, item]);

        // ✅ clear form
        setNewItem({
          name: "",
          category: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
        });

        return;
      }

        if (isIncomeTab) {
        const res = await fetch("/api/addincome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            name: newItem.name,
            category: newItem.category,
            amount: parseFloat(newItem.amount),
            date: newItem.date,
            financeid: selectedCat,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.warning(data.message);
          return;
        }

        toast.success("Income added successfully!");

        // ✅ update UI immediately (optional)
        setCurrentItems((prev) => [...prev, item]);

        // ✅ clear form
        setNewItem({
          name: "",
          category: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
        });

        return;
      }

      // fallback for non-expense tab
      setCurrentItems((prev) => [...prev, item]);
      setNewItem({
        name: "",
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleDelete = async (id) => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }
    if (isInvestmentTab) {
      const res = await fetch("/api/deleteinvestment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.warning(data.message);
        return;
      }

      toast.success("Investment Delete successfully!");
      setInvestments((prev) => prev.filter((item) => item.id !== id));
    } else if(isExpenseTab) {
      const res = await fetch("/api/deleteexpenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.warning(data.message);
        return;
      }

      toast.success("Expense Delete successfully!");
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } else if(isIncomeTab) {
      const res = await fetch("/api/deleteincome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.warning(data.message);
        return;
      }

      toast.success("Income Delete successfully!");
      setIncome((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const categoryData = useMemo(() => {
    const grouped = safeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [safeItems]);

  const totalAmount = useMemo(
    () => safeItems.reduce((sum, item) => sum + parseFloat(item.amount), 0),
    [safeItems],
  );

  const monthlyData = useMemo(() => {
    const months = {};
    safeItems.forEach((item) => {
      const month = new Date(item.date).toLocaleString("default", {
        month: "short",
      });
      months[month] = (months[month] || 0) + parseFloat(item.amount);
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  }, [safeItems]);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const totalExpenses = safeExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );

    const safeincome = Array.isArray(income) ? income : [];

  const totalincome = safeincome.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const totalInvestments = safeInvestments.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );

  const netSavings = totalincome - totalExpenses;
    const currentbalance = totalincome - totalExpenses- totalInvestments;

  // Format date and time
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get login time (you can store this when user logs in)
  const loginTime = new Date(); // This should come from authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      )}
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
                  <p className="text-sm font-semibold">
                    {formatTime(loginTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-100">Current Date</p>
                  <p className="text-sm font-semibold">
                    {new Date().toLocaleDateString()}
                  </p>
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
            <select className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all shadow-md hover:shadow-lg border border-white/30"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              {getfinance.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-gray-400">
                  {cat.financial_name}
                </option>
              ))}
            </select>

             <select
  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all shadow-md hover:shadow-lg border border-white/30"
  value={getmonth}
  onChange={(e) => changemonth(e.target.value)}
>
  {MONTHS.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
            {/* Right Section - Logout Button */}
            <button
              onClick={() => onNavigate("login")}
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Annual Finance Tracker
              </h1>
              <p className="text-slate-600">
                Manage your expenses and investments efficiently
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                {formatDate(currentTime)}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Total Income</span>
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-red-500">
              ₹{totalincome.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {income.length} transactions
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Total Expenses</span>
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-red-500">
              ₹{totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {expenses.length} transactions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">
                Total Investments
              </span>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-500">
              ₹{totalInvestments.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {investments.length} investments
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Net Position</span>
              <DollarSign
                className={netSavings >= 0 ? "text-green-500" : "text-red-500"}
                size={24}
              />
            </div>
            <p
              className={`text-3xl font-bold ${netSavings >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              ₹{Math.abs(netSavings).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {netSavings >= 0 ? "Surplus" : "Deficit"}
            </p>
          </div>
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-medium">Balance</span>
              <DollarSign
                className={currentbalance >= 0 ? "text-green-500" : "text-red-500"}
                size={24}
              />
            </div>
            <p
              className={`text-3xl font-bold ${currentbalance >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              ₹{Math.abs(currentbalance).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {currentbalance >= 0 ? "Surplus" : "Deficit"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
             <button
              onClick={() => setActiveTab("income")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "income"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
                }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "expenses"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
                }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab("investments")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "investments"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
                }`}
            >
              Investments
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 ml-auto mb-4"
            >
              + Add {isExpenseTab ? "Expense" :isInvestmentTab ? "Investment" : "Income"}
            </button>
          </div>



          {/* Add New Item Form */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Add New {isExpenseTab ? "Expense" :isInvestmentTab ? "Investment" : "Income"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-black text-xl"
                  >
                    ✖
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />

                  <select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {newItem.category === "Mutual Funds" && (
                    <>
                      {/* Monthly Yes/No */}
                      <select
                        value={newItem.monthly}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            monthly: e.target.value,
                            sipDay: "",
                          })
                        }
                        className="px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select Monthly</option>
                        <option value="1">Yes (SIP)</option>
                        <option value="0">No (Lumpsum)</option>
                      </select>

                      {/* Start Date */}
                      <input
                        type="date"
                        value={newItem.startdate}
                        onChange={(e) =>
                          setNewItem({ ...newItem, startdate: e.target.value })
                        }
                        className="px-4 py-2 border rounded-lg"
                      />

                      {/* SIP Day Selector */}
                      {newItem.monthly === "1" && (
                        <select
                          value={newItem.sipDay}
                          onChange={(e) =>
                            setNewItem({ ...newItem, sipDay: e.target.value })
                          }
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="">Select SIP Day</option>
                          {[...Array(28)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  )}

                  {newItem.category !== "Mutual Funds" && (
                    <input
                      type="date"
                      value={newItem.date}
                      onChange={(e) =>
                        setNewItem({ ...newItem, date: e.target.value })
                      }
                      className="px-4 py-2 border rounded-lg"
                    />
                  )}

                  <input
                    type="number"
                    placeholder="Amount ₹"
                    value={newItem.amount}
                    onChange={(e) =>
                      setNewItem({ ...newItem, amount: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      handleAdd();
                      setShowModal(false);
                    }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3">
                Category Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 mb-3">
                Monthly Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="amount"
                    fill={isExpenseTab ? "#ef4444" : "#10b981"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">
              All {isExpenseTab ? "Expenses" : "Investments"} (Total: ₹
              {totalAmount.toLocaleString()})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {safeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800">
                        {item.name}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Calendar size={14} />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-slate-800">
                      ₹{item.amount.toLocaleString()}
                    </span>
                    <button
                     data-id={item.id}
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

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  CreditCard,
  ShoppingBag,
  Home,
  Zap,
  Coffee,
  MoreHorizontal,
  X,
  Check,
  Sparkles,
  Lightbulb,
  Loader2,
  Target,
  Repeat,
  Plane,
  Smartphone,
  Car,
  Trash2,
  Pencil,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Activity,
  Sun,
  Moon,
  LogOut,
  Infinity,
  Hexagon,
  Briefcase,
  Menu
} from 'lucide-react';
import { getTheme } from '../constants/theme';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import CalendarView from './CalendarView';
import BottomNavigation from './BottomNavigation';
// Auth components removed as handled by App.js wrapper
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  // removed authMode state

  // --- États ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // API URL
  // API URL
  const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`;

  // State Definitions
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nova_theme');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('nova_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fetch API Data
  // Fetch API Data
  // API Helper
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
  };

  // Fetch API Data
  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await authFetch('/init');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTransactions(data.transactions || []);
      setCategories(data.categories || []);
      setGoals(data.goals || []);
      setSubscriptions(data.subscriptions || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Removed conditional loading/auth checks
  // Dashboard is only rendered when authenticated


  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(amount) || 0);

  const ICON_MAP = {
    'shopping-bag': ShoppingBag,
    'home': Home,
    'car': Car,
    'coffee': Coffee,
    'activity': Activity,
    'gift': Sparkles,
    'zap': Zap,
    'wallet': Wallet,
    'circle': Hexagon,
    'piggy-bank': Wallet,
    'plane': Plane,
    'smartphone': Smartphone,
    'repeat': Repeat,
    'target': Target
  };

  const getCategoryIcon = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    const IconComponent = cat ? (ICON_MAP[cat.icon] || Zap) : Zap;
    return <IconComponent size={18} />;
  };

  // --- Calculs (moved up) ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  // --- Other States (Modal, AI, etc.) ---
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [modalMode, setModalMode] = useState('standard');
  const [editId, setEditId] = useState(null);

  const [inputs, setInputs] = useState({
    title: '', amount: '', type: 'expense', category: 'Autre', date: new Date().toISOString().split('T')[0], isRecurring: false, targetGoalId: '',
    goalName: '', goalTarget: '', goalCurrent: '',
    subName: '', subAmount: '', subCategory: 'Autre',
    catName: '', catBudget: '', catColor: 'bg-gray-500', catIcon: 'circle'
  });

  // --- Handlers (Placeholders for now, need updates) ---
  const resetModal = () => {
    setIsModalOpen(true);
    setEditId(null);
    setInputs({
      title: '', amount: '', type: 'expense', category: 'Autre', date: new Date().toISOString().split('T')[0], isRecurring: false, targetGoalId: '',
      goalName: '', goalTarget: '', goalCurrent: '',
      subName: '', subAmount: '', subCategory: 'Autre',
      catName: '', catBudget: '', catColor: 'bg-gray-500', catIcon: 'circle'
    });
  };


  const categoriesBreakdown = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const breakdown = {};
    expenses.forEach(t => {
      if (!breakdown[t.category]) breakdown[t.category] = 0;
      breakdown[t.category] += t.amount;
    });
    return Object.keys(breakdown).map(cat => ({
      name: cat, amount: breakdown[cat], percentage: totalExpenses > 0 ? (breakdown[cat] / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // --- PRO CHART CONFIGURATION ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#e2e8f0' : '#1e293b',
        bodyColor: isDarkMode ? '#94a3b8' : '#64748b',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 16,
        displayColors: false,
        titleFont: { size: 13, family: 'Inter', weight: '600' },
        bodyFont: { size: 13, family: 'Inter', weight: '500' },
        callbacks: {
          label: (context) => `Solde : ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          display: true,
          color: isDarkMode ? '#64748b' : '#94a3b8',
          font: { size: 11 },
          maxTicksLimit: 6
        },
        border: { display: false }
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', drawBorder: false },
        ticks: { display: false }, // Hide Y labels for cleaner look
        border: { display: false }
      }
    },
    elements: {
      line: {
        tension: 0.4, // Smooth bezier curves
        borderWidth: 3,
        borderCapStyle: 'round'
      },
      point: {
        radius: 0, // Hide points by default
        hitRadius: 20,
        hoverRadius: 6,
        hoverBorderWidth: 4,
        hoverBorderColor: isDarkMode ? '#1e293b' : '#fff'
      }
    }
  };

  const balanceHistory = useMemo(() => {
    // 1. Sort transactions
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dailyMap = new Map();
    sorted.forEach(t => {
      const date = t.date;
      if (!dailyMap.has(date)) dailyMap.set(date, 0);
      dailyMap.set(date, dailyMap.get(date) + (t.type === 'income' ? t.amount : -t.amount));
    });

    const labels = Array.from(dailyMap.keys());
    const dataPoints = [];
    let currentBalance = 0;
    labels.forEach(date => {
      currentBalance += dailyMap.get(date);
      dataPoints.push(currentBalance);
    });

    return {
      labels: labels.map(d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Solde',
        data: dataPoints,
        borderColor: isDarkMode ? '#818cf8' : '#6366f1',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          if (isDarkMode) {
            gradient.addColorStop(0, 'rgba(129, 140, 248, 0)');
            gradient.addColorStop(1, 'rgba(129, 140, 248, 0.4)');
          } else {
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.4)');
          }
          return gradient;
        },
        fill: true,
      }]
    };
  }, [transactions, isDarkMode]);

  // --- NEW ANALYTICS CALCULATIONS (Phase 5) ---

  // 1. Monthly History (Bar Chart)
  const monthlyHistory = useMemo(() => {
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString(undefined, { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthLabel);

      const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
      const inc = monthTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
      const exp = monthTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
      incomeData.push(inc);
      expenseData.push(exp);
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Revenus',
          data: incomeData,
          backgroundColor: isDarkMode ? '#10b981' : '#34d399',
          borderRadius: 4,
        },
        {
          label: 'Dépenses',
          data: expenseData,
          backgroundColor: isDarkMode ? '#f43f5e' : '#fb7185',
          borderRadius: 4,
        }
      ]
    };
  }, [transactions, isDarkMode]);

  // 2. Top Expenses
  const topExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions]);

  // 3. Savings Metrics (50/30/20 Rule)
  const savingsMetrics = useMemo(() => {
    const { income, expense } = stats;
    // Heuristic: Needs = Logement + Alimentation + Transport + Santé
    // Wants = Loisirs + Shopping + Services
    // Savings = Solde + (Category 'Épargne' transactions)

    // For simplicity without complex category tagging, let's use global stats and simple estimation
    // Or better, filter by category names if we know them.

    if (income === 0) return { needs: 0, wants: 0, savings: 0, score: 0 };

    const needsCats = ['Logement', 'Alimentation', 'Transport', 'Santé', 'Factures'];
    const needsAmount = transactions
      .filter(t => t.type === 'expense' && needsCats.some(c => t.category.includes(c)))
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsAmount = transactions
      .filter(t => t.type === 'saving' || t.category.includes('Épargne'))
      .reduce((sum, t) => sum + t.amount, 0) + (stats.balance > 0 ? stats.balance : 0); // Count explicit savings + unspent

    const wantsAmount = stats.expense - needsAmount; // Remaining expenses are wants

    return {
      needs: Math.round((needsAmount / income) * 100),
      wants: Math.round((wantsAmount / income) * 100),
      savings: Math.round((savingsAmount / income) * 100),
      score: Math.min(Math.round((savingsAmount / (income * 0.2)) * 100), 100) // 100% score if you reach 20% savings
    };
  }, [transactions, stats]);

  // 4. Doughnut Data
  const doughnutData = useMemo(() => {
    return {
      labels: categoriesBreakdown.map(c => c.name),
      datasets: [{
        data: categoriesBreakdown.map(c => c.amount),
        backgroundColor: [
          '#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#f43f5e', '#ec4899', '#06b6d4', '#64748b'
        ],
        borderWidth: 0,
      }]
    };
  }, [categoriesBreakdown]);

  // --- CONSTANTS FOR MODALS ---
  const COLORS = [
    'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-pink-500', 'bg-cyan-500', 'bg-gray-500',
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500'
  ];

  const ICONS = Object.keys(ICON_MAP).map(key => ({
    id: key,
    component: ICON_MAP[key]
  }));

  // --- Handlers ---

  const openEditGoal = (goal) => {
    setInputs(prev => ({ ...prev, goalName: goal.name, goalTarget: goal.target, goalCurrent: goal.current }));
    setEditId(goal.id);
    setModalMode('goal');
    setIsModalOpen(true);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!inputs.goalName || !inputs.goalTarget) return;

    const payload = {
      name: inputs.goalName,
      target_amount: parseFloat(inputs.goalTarget),
      current_amount: parseFloat(inputs.goalCurrent) || 0,
      icon: 'wallet',
      color: 'bg-indigo-500',
      deadline: null
    };

    try {
      if (editId) {
        await authFetch(`/goals/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await authFetch(`/goals`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de l'objectif");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Supprimer cet objectif ?")) {
      try {
        await authFetch(`/goals/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Subscriptions
  const openEditSub = (sub) => {
    setInputs(prev => ({ ...prev, subName: sub.title, subAmount: sub.amount, subCategory: sub.category || 'Autre' }));
    setEditId(sub.id);
    setModalMode('subscription');
    setIsModalOpen(true);
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!inputs.subName || !inputs.subAmount) return;

    const payload = {
      title: inputs.subName,
      amount: parseFloat(inputs.subAmount),
      category: inputs.subCategory,
      renewal_date: new Date().toISOString().split('T')[0],
      icon: 'zap'
    };

    try {
      if (editId) {
        // UI edit logic mainly for local optimistic updates if needed, but here we just restart
        console.warn("Edit not fully implemented in UI inputs for all fields");
        // For now let's just create new or ignore edit specific complexities on server side if ID mismatch
      } else {
        await authFetch(`/subscriptions`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSub = async (id) => {
    if (window.confirm("Résilier cet abonnement ?")) {
      try {
        await authFetch(`/subscriptions/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) { console.error(e); }
    }
  };

  // Categories
  const openEditCategory = (cat) => {
    setInputs(prev => ({
      ...prev,
      catName: cat.name,
      catBudget: cat.budget,
      catColor: cat.color,
      catIcon: cat.icon
    }));
    setEditId(cat.id);
    setModalMode('category');
    setIsModalOpen(true);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!inputs.catName) return;

    const payload = {
      name: inputs.catName,
      budget: parseFloat(inputs.catBudget) || 0,
      color: inputs.catColor,
      icon: inputs.catIcon
    };

    try {
      if (editId) {
        await authFetch(`/categories/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await authFetch(`/categories`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Transactions
  const openEditTransaction = (t) => {
    setInputs(prev => ({
      ...prev,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date || new Date().toISOString().split('T')[0],
      isRecurring: false
    }));
    setEditId(t.id);
    setModalMode('standard');
    setIsModalOpen(true);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    // Auto-fill for Linked Savings
    let finalTitle = inputs.title;
    let finalDate = inputs.date;
    let finalCategory = inputs.category;

    if (inputs.type === 'saving' && inputs.targetGoalId) {
      const goal = goals.find(g => g.id === parseInt(inputs.targetGoalId));
      if (goal) {
        finalTitle = `Économie : ${goal.name}`;
        finalDate = new Date().toISOString().split('T')[0];
        finalCategory = 'Épargne';
      }
    }

    if ((!finalTitle && !inputs.targetGoalId) || !inputs.amount) return;

    const payload = {
      title: finalTitle,
      amount: parseFloat(inputs.amount),
      type: inputs.type,
      category: finalCategory,
      date: finalDate,
      is_recurring: inputs.isRecurring
    };

    try {
      if (editId) {
        // Update
        const res = await authFetch(`/transactions/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // Create
        const res = await authFetch(`/transactions`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
      }
      fetchData(); // Refresh all data
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Supprimer cette transaction ?")) {
      try {
        await authFetch(`/transactions/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const generateRuleBasedAdvice = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const { income, expense, balance } = stats;
      const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
      let advice = "";

      if (balance < 0) {
        advice = "⚠️ Attention : Votre solde est négatif. Essayez de réduire les dépenses non essentielles immédiatement.";
      } else if (savingsRate < 10) {
        advice = "💡 Conseil : Votre taux d'épargne est bas (<10%). Essayez de mettre de côté au moins 20% de vos revenus si possible.";
      } else if (expense > income) {
        advice = "⚠️ Alerte : Vos dépenses dépassent vos revenus ce mois-ci. Revoyez votre budget.";
      } else if (savingsRate > 40) {
        advice = "🚀 Excellent : Vous épargnez beaucoup ! Pensez à investir cet excédent pour le faire fructifier.";
      } else {
        const tips = [
          "💡 Astuce : La règle 50/30/20 est un bon point de départ : 50% besoins, 30% envies, 20% épargne.",
          "💡 Astuce : Avez-vous vérifié vos abonnements récurrents récemment ? Il y a peut-être des économies à faire.",
          "💡 Astuce : Essayez de planifier vos repas à l'avance pour réduire le gaspillage alimentaire.",
        ];
        advice = tips[Math.floor(Math.random() * tips.length)];
      }

      setAiAdvice(advice);
      setIsAiLoading(false);
    }, 800);
  };

  const generateSimplePrediction = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const today = new Date().getDate();
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const remainingDays = daysInMonth - today;

      const dailyExpense = stats.expense / (today || 1);
      const predictedExpense = dailyExpense * remainingDays;
      const endMonthBalance = stats.balance - predictedExpense;

      setAiPrediction({
        endMonthBalance: Math.round(endMonthBalance),
        status: endMonthBalance > 0 ? 'safe' : 'risk',
        message: `Basé sur vos dépenses moyennes (${Math.round(dailyExpense)}€/jour), vous finirez le mois à environ ${Math.round(endMonthBalance)}€.`
      });
      setIsAiLoading(false);
    }, 600);
  };

  const parseTransactionInput = (input) => {
    if (!input.trim()) return;
    setIsSmartLoading(true);

    setTimeout(() => {
      const amountRegex = /(\d+[.,]?\d*)/;
      const dateRegex = /(\d{4}-\d{2}-\d{2})/;

      let amount = '';
      let date = new Date().toISOString().split('T')[0];
      let category = 'Autre';
      let title = input;

      const amountMatch = input.match(amountRegex);
      if (amountMatch) {
        amount = amountMatch[0].replace(',', '.');
        title = title.replace(amountMatch[0], '').trim();
      }

      const dateMatch = input.match(dateRegex);
      if (dateMatch) {
        date = dateMatch[0];
        title = title.replace(dateMatch[0], '').trim();
      }

      for (const cat of categories) {
        if (title.toLowerCase().includes(cat.name.toLowerCase())) {
          category = cat.name;
          break;
        }
      }

      setInputs(prev => ({
        ...prev,
        title: title || 'Nouvelle dépense',
        amount: amount,
        type: 'expense', // Default to expense
        category: category,
        date: date
      }));
      setModalMode('standard');
      setIsSmartLoading(false);
    }, 500);
  };

  const handleSmartParse = parseTransactionInput;
  const generateFinancialAdvice = generateRuleBasedAdvice;
  const generatePrediction = generateSimplePrediction;

  // --- SOFT GLASS THEME ---
  const theme = getTheme(isDarkMode);

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => { setActiveTab(id); }} className={`group flex items-center w-full space-x-3 px-5 py-3 rounded-2xl transition-all duration-200 ${activeTab === id ? (isDarkMode ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600') : theme.textMuted} hover:bg-opacity-80`}>
      <Icon size={18} className={`transition-colors ${activeTab === id ? 'text-current' : 'group-hover:text-current'}`} />
      <span className="font-medium text-sm">{label}</span>
      {activeTab === id && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );


  // --- Data Management ---
  const handleExportData = () => {
    const data = {
      transactions,
      goals,
      subscriptions,
      recurringRules,
      stats,
      categories,
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.version === '1.0' || data.transactions) {
          if (window.confirm("Attention : Cette action va remplacer toutes vos données actuelles. Êtes-vous sûr ?")) {
            setTransactions(data.transactions || []);
            setGoals(data.goals || []);
            setSubscriptions(data.subscriptions || []);
            setRecurringRules(data.recurringRules || []);
            if (data.categories) setCategories(data.categories);
            alert("Données restaurées avec succès !");
          }
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${theme.bg}`}>

      {/* Mobile Sidebar Overlay */}
      {/* Mobile Sidebar Overlay Removed */}

      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 z-20 ${theme.panel}`}>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Briefcase size={18} />
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${theme.textMain}`}>Nova<span className="text-blue-500">Budget</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Général</p>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <SidebarItem id="transactions" icon={Activity} label="Transactions" />
          <SidebarItem id="calendar" icon={Calendar} label="Calendrier" />
          <SidebarItem id="analysis" icon={PieChart} label="Analyses" />
          <div className={`my-4 border-t mx-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gestion</p>
          <SidebarItem id="goals" icon={Target} label="Objectifs" />
          <SidebarItem id="subscriptions" icon={Repeat} label="Abonnements" />
          <div className={`my-4 border-t mx-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Système</p>
          <SidebarItem id="settings" icon={MoreHorizontal} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-opacity-10 border-gray-500 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-950' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>
          <button onClick={logout} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium transition-all ${isDarkMode ? 'bg-rose-900/20 text-rose-400 hover:bg-rose-900/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>
            <LogOut size={16} /> <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Interface */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className={`h-16 flex items-center justify-between px-6 z-20 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
          <div className="md:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Briefcase size={18} />
            </div>
            <h1 className={`text-lg font-bold tracking-tight ${theme.textMain}`}>Nova<span className="text-blue-500">Budget</span></h1>
          </div>
          <h2 className={`hidden md:block text-lg font-semibold ${theme.textMain} first-letter:uppercase`}>
            {activeTab === 'settings' ? 'Paramètres' : activeTab === 'calendar' ? 'Calendrier' : activeTab === 'analysis' ? 'Analyses' : activeTab === 'dashboard' ? 'Tableau de bord' : activeTab}
          </h2>

          <div className="flex items-center space-x-4">
            <button onClick={() => { resetModal(); setModalMode('standard'); }} className={`flex items-center px-4 py-2 rounded-2xl text-sm font-medium transition-colors shadow-sm ${theme.buttonPrimary}`}>
              <Plus size={16} className="mr-2" /> <span>Ajouter</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-24 md:pb-6">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
              {/* Stats Cards */}
              {/* Stats Hero Card (Central Visual) */}
              <div className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl">
                {/* Dynamic Background for Hero */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-blue-900 via-indigo-900 to-slate-900' : 'from-blue-500 via-indigo-500 to-purple-500'}`}></div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  {/* Total Balance */}
                  <div className="flex-1 text-center md:text-left space-y-2 relative">
                    <p className="text-blue-100 font-medium text-lg flex items-center gap-2 justify-center md:justify-start">
                      <Wallet size={20} className="opacity-80" /> Solde Total
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <h3 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
                        {formatCurrency(stats.balance)}
                      </h3>
                      <button onClick={() => { resetModal(); setModalMode('standard'); }} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all md:hidden">
                        <Plus size={24} className="text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Income / Expense Pills */}
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 min-w-[160px]">
                      <div className="bg-emerald-400/20 p-3 rounded-2xl text-emerald-300">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Revenus</p>
                        <p className="text-white font-bold text-xl">{formatCurrency(stats.income)}</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 min-w-[160px]">
                      <div className="bg-rose-400/20 p-3 rounded-2xl text-rose-300">
                        <TrendingDown size={24} />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Dépenses</p>
                        <p className="text-white font-bold text-xl">{formatCurrency(stats.expense)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Middle Row Left: Chart */}
                <div className={`lg:col-span-2 rounded-3xl border ${theme.glass} p-0 overflow-hidden`}>
                  <div className="flex items-center gap-2 p-6 pb-0">
                    <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Activity size={20} />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.textMain}`}>Évolution Financière</h3>
                  </div>
                  <div className="h-64 w-full px-2 pb-2">
                    <Line data={balanceHistory} options={chartOptions} />
                  </div>
                </div>

                {/* Middle Row Right: Advice Card */}
                <div className={`rounded-3xl p-5 border ${theme.glass} flex flex-col h-full min-h-[250px]`}>
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Sparkles className="text-purple-500" size={20} />
                    <h3 className={`font-bold text-base ${theme.textMain}`}>Analyses & Conseils</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
                    {aiAdvice ? (
                      <div className={`p-4 rounded-xl border-l-4 border-purple-500 animate-fade-in ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                        <p className={`text-sm leading-relaxed ${theme.textMain} whitespace-pre-line`}>{aiAdvice}</p>
                      </div>
                    ) : (
                      <p className={`text-sm ${theme.textMuted}`}>Obtenez des conseils personnalisés basés sur vos habitudes de dépenses. Cliquez ci-dessous pour lancer l'analyse.</p>
                    )}
                  </div>

                  <button onClick={generateFinancialAdvice} className={`shrink-0 w-full py-3 rounded-2xl font-medium text-sm transition-colors bg-purple-600 text-white hover:bg-purple-700`}>
                    {isAiLoading ? <Loader2 className="animate-spin mx-auto" /> : (aiAdvice ? 'Nouvelle analyse' : 'Analyser mon budget')}
                  </button>
                </div>
              </div>

              {/* Bottom Row: Recent Transactions */}
              <div className={`rounded-3xl border ${theme.glass} p-0 overflow-hidden`}>
                <div className="p-6 border-b border-opacity-10 border-gray-500 flex justify-between items-center">
                  <h3 className={`text-base font-semibold ${theme.textMain}`}>Dernières Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-blue-500 hover:text-blue-600">Voir tout</button>
                </div>
                <div className="divide-y divide-gray-500/10">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className={`p-4 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {t.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${theme.textMain}`}>{t.title}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TRANSACTIONS - Table */}
          {activeTab === 'transactions' && (
            <div className={`rounded-3xl border ${theme.glass} overflow-hidden`}>
              <div className="p-4 border-b border-opacity-10 border-gray-500 flex items-center gap-2">
                {['all', 'income', 'expense'].map(type => (
                  <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === type ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900') : theme.textMuted}`}>
                    {type === 'all' ? 'Tout' : type === 'income' ? 'Entrées' : 'Sorties'}
                  </button>
                ))}
              </div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-slate-950/30 text-slate-500' : 'bg-gray-50 text-gray-500'}`}>
                    <tr><th className="px-6 py-3 font-medium">Date</th><th className="px-6 py-3 font-medium">Libellé</th><th className="px-6 py-3 font-medium">Montant</th><th className="px-6 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500/10">
                    {transactions.filter(t => filterType === 'all' ? true : t.type === filterType).map(t => (
                      <tr key={t.id} className={`group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 text-sm ${theme.textMuted}`}>{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {t.type === 'income' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${theme.textMain}`}>{t.title}</p>
                              <span className={`text-xs ${theme.textMuted}`}>{t.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditTransaction(t)} className={`p-2 rounded-2xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className={`p-2 rounded-2xl ${isDarkMode ? 'bg-rose-900/20 text-rose-400 hover:bg-rose-900/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {transactions.filter(t => filterType === 'all' ? true : t.type === filterType).map(t => (
                  <div key={t.id} className={`p-4 rounded-2xl border ${theme.glass} flex flex-col gap-3 shadow-sm`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className={`font-bold text-base ${theme.textMain} line-clamp-1`}>{t.title}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>

                    <div className={`flex justify-end gap-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                      <button onClick={() => openEditTransaction(t)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        <Pencil size={14} /> Modifier
                      </button>
                      <button onClick={() => handleDeleteTransaction(t.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${theme.textMain}`}>Objectifs</h2>
                <button onClick={() => { resetModal(); setModalMode('goal'); }} className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${theme.buttonPrimary}`}>+ Créer</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                  <div key={goal.id} className={`p-6 rounded-3xl border ${theme.glass}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        <Target size={20} className={isDarkMode ? 'text-slate-300' : 'text-gray-600'} />
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => openEditGoal(goal)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${theme.textMain}`}>{goal.name}</h3>
                    <div className="flex justify-between items-end mb-3">
                      <span className={`text-xl font-bold ${theme.accentVar}`}>{formatCurrency(goal.current)}</span>
                      <span className={`text-xs ${theme.textMuted}`}>/ {formatCurrency(goal.target)}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div className={`h-full rounded-full ${goal.color}`} style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Section - Bottom of Dashboard */}
              <div className={`rounded-3xl border ${theme.glass} p-0 overflow-hidden`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Activity size={20} />
                  </div>
                  <h3 className={`text-lg font-bold ${theme.textMain}`}>Évolution Financière</h3>
                </div>
                <div className="h-48 w-full">
                  <Line data={balanceHistory} options={chartOptions} />
                </div>
              </div>

            </div>
          )
          }

          {/* SUBSCRIPTIONS */}
          {
            activeTab === 'subscriptions' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${theme.textMain}`}>Abonnements</h2>
                  <button onClick={() => { resetModal(); setModalMode('subscription'); }} className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${theme.buttonPrimary}`}>+ Ajouter</button>
                </div>
                <div className={`rounded-xl border ${theme.glass} overflow-hidden`}>
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-500/10">
                      {subscriptions.map(sub => (
                        <tr key={sub.id} className={`group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                          <td className={`px-6 py-4 font-medium ${theme.textMain}`}>{sub.title}</td>
                          <td className="px-6 py-4 font-medium text-blue-500">{formatCurrency(sub.amount)} <span className="text-xs text-gray-400">/mois</span></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditSub(sub)} className={`p-2 rounded-2xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}><Pencil size={14} /></button>
                              <button onClick={() => handleDeleteSub(sub.id)} className={`p-2 rounded-2xl ${isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-600'}`}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart Section - Bottom of Dashboard */}
                <div className={`rounded-3xl border ${theme.glass} p-0 overflow-hidden`}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Activity size={20} />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.textMain}`}>Évolution Financière</h3>
                  </div>
                  <div className="h-48 w-full">
                    <Line data={balanceHistory} options={chartOptions} />
                  </div>
                </div>

              </div >
            )
          }

          {/* CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <CalendarView transactions={transactions} theme={theme} isDarkMode={isDarkMode} />
            </div>
          )}

          {/* SETTINGS (NEW) */}
          {activeTab === 'settings' && (
            <div className={`animate-fade-in rounded-3xl border ${theme.glass} p-8 space-y-8 max-w-2xl mx-auto`}>
              <div className="text-center mb-8">
                <div className={`inline-flex p-4 rounded-full mb-4 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <MoreHorizontal size={32} />
                </div>
                <h2 className={`text-2xl font-bold ${theme.textMain}`}>Paramètres & Données</h2>
                <p className={theme.textMuted}>Gérez vos préférences et vos sauvegardes</p>
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><LogOut size={24} /></div>
                    <div>
                      <h3 className={`font-bold ${theme.textMain}`}>Sauvegarde</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Exportez vos données pour ne jamais les perdre</p>
                    </div>
                  </div>
                  <button onClick={handleExportData} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                    Télécharger ma sauvegarde (JSON)
                  </button>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Check size={24} /></div>
                    <div>
                      <h3 className={`font-bold ${theme.textMain}`}>Restauration</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Importez un fichier de sauvegarde précédent</p>
                    </div>
                  </div>
                  <label className={`block w-full cursor-pointer py-3 border-2 border-dashed rounded-xl text-center font-medium transition-colors ${isDarkMode ? 'border-slate-600 hover:border-slate-500 text-slate-400' : 'border-gray-300 hover:border-gray-400 text-gray-500'}`}>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    Choisir un fichier JSON
                  </label>
                </div>
              </div>

              {/* CATEGORIES MANAGEMENT */}
              <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${theme.textMain}`}>Mes Catégories</h3>
                  <button onClick={() => {
                    resetModal();
                    setModalMode('category');
                  }} className={`px-4 py-2 rounded-xl text-sm font-medium ${theme.buttonPrimary}`}>+ Créer</button>
                </div>

                <div className="space-y-3">
                  {categories.map(cat => {
                    const IconComponent = ICON_MAP[cat.icon] || Zap;
                    return (
                      <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${cat.color}`}>
                            <IconComponent size={20} />
                          </div>
                          <div>
                            <p className={`font-medium ${theme.textMain}`}>{cat.name}</p>
                            <p className={`text-xs ${theme.textMuted}`}>Budget: {formatCurrency(cat.budget)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditCategory(cat)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                            <Pencil size={16} />
                          </button>
                          {/* Prevent deleting default categories if needed, or allow all */}
                          <button onClick={() => {
                            if (window.confirm("Supprimer cette catégorie ?")) {
                              setCategories(categories.filter(c => c.id !== cat.id));
                            }
                          }} className={`p-2 rounded-lg hover:bg-red-500/10 text-red-500`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              <div className="pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
                <p className={`text-xs ${theme.textMuted}`}>NovaBudget v1.0.0</p>
              </div>
            </div >
          )
          }

          {/* ANALYSIS */}
          {
            activeTab === 'analysis' && (
              <div className="animate-fade-in flex flex-col gap-4 h-[calc(100vh-140px)] pb-4 overflow-hidden">

                {/* Main Dashboard - 3 Columns Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0 flex-1">

                  {/* Left Column: History (Bar Chart) */}
                  <div className={`rounded-3xl border ${theme.glass} p-4 order-2 xl:order-1 flex flex-col min-h-0`}>
                    <h3 className={`font-bold mb-2 text-sm ${theme.textMain}`}>Évolution (6 mois)</h3>
                    <div className="flex-1 w-full min-h-0">
                      <Bar data={monthlyHistory} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { display: false } },
                        plugins: { legend: { display: false } },
                        borderRadius: 4,
                        barThickness: 16
                      }} />
                    </div>
                  </div>

                  {/* Center Column: Doughnut (Hero) */}
                  <div className={`rounded-3xl border ${theme.glass} p-4 order-1 xl:order-2 flex flex-col items-center justify-center relative overflow-hidden min-h-0`}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none`}></div>

                    <h3 className={`font-bold mb-2 text-lg text-center ${theme.textMain}`}>Répartition</h3>
                    <div className="relative w-full h-full max-h-[200px] aspect-square flex items-center justify-center">
                      <Doughnut data={doughnutData} options={{
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: { legend: { display: false } }
                      }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-xs font-medium ${theme.textMuted}`}>Total</span>
                        <span className={`text-xl font-bold ${theme.textMain}`}>{formatCurrency(stats.expense)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Top Expenses */}
                  <div className={`rounded-3xl border ${theme.glass} p-4 order-3 xl:order-3 flex flex-col min-h-0`}>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown size={18} className="text-rose-500" />
                      <h3 className={`font-bold text-sm ${theme.textMain}`}>Top Dépenses</h3>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                      {topExpenses.length > 0 ? topExpenses.map((t, i) => (
                        <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                              {i + 1}
                            </div>
                            <div className="truncate max-w-[80px]">
                              <div className={`text-xs font-semibold truncate ${theme.textMain}`}>{t.title}</div>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-rose-500">{formatCurrency(t.amount)}</span>
                        </div>
                      )) : <p className={`text-center text-xs ${theme.textMuted} py-4`}>Rien à signaler</p>}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Savings Tracker (Compact) */}
                <div className={`rounded-3xl border ${theme.glass} p-4 shrink-0`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-sm ${theme.textMain}`}>Santé Financière (50/30/20)</h3>
                    <div className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${savingsMetrics.score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      Score: {savingsMetrics.score}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Needs */}
                    <div className="text-center">
                      <div className="flex justify-between text-[10px] mb-1 font-medium px-1">
                        <span className={theme.textMain}>Besoins</span>
                        <span className={`${savingsMetrics.needs > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>{savingsMetrics.needs}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(savingsMetrics.needs, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Wants */}
                    <div className="text-center">
                      <div className="flex justify-between text-[10px] mb-1 font-medium px-1">
                        <span className={theme.textMain}>Envies</span>
                        <span className={`${savingsMetrics.wants > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>{savingsMetrics.wants}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(savingsMetrics.wants, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Savings */}
                    <div className="text-center">
                      <div className="flex justify-between text-[10px] mb-1 font-medium px-1">
                        <span className={theme.textMain}>Épargne</span>
                        <span className={`${savingsMetrics.savings < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{savingsMetrics.savings}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(savingsMetrics.savings, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          }



        </div >

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} resetModal={resetModal} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} logout={logout} />
      </main >

      {/* MODAL */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-md p-8 rounded-3xl ${theme.modal}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`font-bold text-lg ${theme.textMain}`}>
                  {modalMode === 'goal' ? (editId ? 'Modifier Objectif' : 'Nouvel Objectif') :
                    modalMode === 'subscription' ? (editId ? 'Modifier Abonnement' : 'Nouvel Abonnement') :
                      (editId ? 'Modifier Transaction' : 'Nouvelle Transaction')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 ${theme.textMuted}`}><X size={20} /></button>
              </div>

              <form onSubmit={
                modalMode === 'goal' ? handleAddGoal :
                  modalMode === 'subscription' ? handleAddSub :
                    modalMode === 'category' ? handleAddCategory :
                      handleAddTransaction
              } className="space-y-4">

                {modalMode === 'goal' && (
                  <>
                    <input className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.goalName} onChange={e => setInputs({ ...inputs, goalName: e.target.value })} placeholder="Nom (ex: Vacances)" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.goalTarget} onChange={e => setInputs({ ...inputs, goalTarget: e.target.value })} placeholder="Cible €" />
                      <input type="number" className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.goalCurrent} onChange={e => setInputs({ ...inputs, goalCurrent: e.target.value })} placeholder="Actuel €" />
                    </div>
                  </>
                )}

                {modalMode === 'subscription' && (
                  <>
                    <input className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.subName} onChange={e => setInputs({ ...inputs, subName: e.target.value })} placeholder="Service (ex: Netflix)" />
                    <input type="number" className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.subAmount} onChange={e => setInputs({ ...inputs, subAmount: e.target.value })} placeholder="Coût Mensuel €" />
                  </>
                )}

                {modalMode === 'category' && (
                  <div className="space-y-4">
                    <input className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.catName} onChange={e => setInputs({ ...inputs, catName: e.target.value })} placeholder="Nom de la catégorie" autoFocus />
                    <input type="number" className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.catBudget} onChange={e => setInputs({ ...inputs, catBudget: e.target.value })} placeholder="Budget Mensuel Cible (€)" />

                    <div>
                      <label className={`text-xs font-medium mb-2 block ${theme.textMuted}`}>Couleur</label>
                      <div className="grid grid-cols-9 gap-2">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setInputs({ ...inputs, catColor: color })}
                            className={`w-8 h-8 rounded-full ${color} ${inputs.catColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'opacity-70 hover:opacity-100'} transition-all`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-medium mb-2 block ${theme.textMuted}`}>Icône</label>
                      <div className="grid grid-cols-7 gap-2">
                        {ICONS.map(({ id, component: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setInputs({ ...inputs, catIcon: id })}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${inputs.catIcon === id ? (isDarkMode ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-500 text-blue-600') : (isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50')}`}
                          >
                            <Icon size={20} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(modalMode === 'standard') && (
                  <>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setInputs({ ...inputs, type: 'expense' })} className={`flex-1 py-2.5 rounded-2xl border font-medium text-xs transition-all ${inputs.type === 'expense' ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-transparent bg-gray-500/5 text-gray-500'}`}>Dépense</button>
                      <button type="button" onClick={() => setInputs({ ...inputs, type: 'income' })} className={`flex-1 py-2.5 rounded-2xl border font-medium text-xs transition-all ${inputs.type === 'income' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-transparent bg-gray-500/5 text-gray-500'}`}>Revenu</button>
                      <button type="button" onClick={() => setInputs({ ...inputs, type: 'saving' })} className={`flex-1 py-2.5 rounded-2xl border font-medium text-xs transition-all ${inputs.type === 'saving' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-transparent bg-gray-500/5 text-gray-500'}`}>Économie</button>
                    </div>

                    {inputs.type === 'saving' && (
                      <div className="space-y-2">
                        <label className={`text-xs font-medium ml-1 ${theme.textMuted}`}>Lier à un objectif (optionnel)</label>
                        <select className={`w-full p-3 rounded-2xl outline-none border appearance-none ${theme.input}`} value={inputs.targetGoalId} onChange={e => setInputs({ ...inputs, targetGoalId: e.target.value })}>
                          <option value="">-- Aucun --</option>
                          {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    )}

                    {!(inputs.type === 'saving' && inputs.targetGoalId) && (
                      <>
                        <div className="flex gap-4">
                          <input type="number" className={`flex-1 p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.amount} onChange={e => setInputs({ ...inputs, amount: e.target.value })} placeholder="0.00" />
                          <input type="date" className={`flex-1 p-3 rounded-lg outline-none border ${theme.input} text-sm`} value={inputs.date} onChange={e => setInputs({ ...inputs, date: e.target.value })} />
                        </div>
                        <input type="text" className={`w-full p-3 rounded-lg outline-none border ${theme.input}`} value={inputs.title} onChange={e => setInputs({ ...inputs, title: e.target.value })} placeholder="Titre" />

                        {/* Custom Category Selector with Icons & Colors */}
                        <div className="space-y-2">
                          <label className={`text-xs font-medium ml-1 ${theme.textMuted}`}>Catégorie</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {categories.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setInputs({ ...inputs, category: c.name })}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${inputs.category === c.name ? `border-blue-500 bg-blue-500/10 ring-1 ring-blue-500` : `border-transparent ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}`}`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${c.color}`}>
                                  {getCategoryIcon(c.name)}
                                </div>
                                <span className={`text-xs font-medium truncate ${theme.textMain}`}>{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {(inputs.type === 'saving' && inputs.targetGoalId) && (
                      <div className="flex gap-4 animate-fade-in">
                        <input type="number" className={`w-full p-4 text-lg font-bold text-center rounded-2xl outline-none border ${theme.input}`} value={inputs.amount} onChange={e => setInputs({ ...inputs, amount: e.target.value })} placeholder="Montant à économiser €" autoFocus />
                      </div>
                    )}

                    {!editId && (
                      <div className={`p-3 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          <Repeat size={16} className={inputs.isRecurring ? 'text-blue-500' : theme.textMuted} />
                          <span className={`text-sm font-medium ${theme.textMain}`}>Répétition mensuelle</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInputs({ ...inputs, isRecurring: !inputs.isRecurring })}
                          className={`w-10 h-5 rounded-full relative transition-colors ${inputs.isRecurring ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${inputs.isRecurring ? 'translate-x-5' : ''}`}></div>
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button type="submit" className={`w-full py-3 rounded-2xl font-medium text-sm mt-2 transition-colors ${theme.buttonPrimary}`}>
                  {editId ? 'Sauvegarder' : 'Valider'}
                </button>
              </form>
            </div>
          </div>
        )
      }

      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div >
  );
}

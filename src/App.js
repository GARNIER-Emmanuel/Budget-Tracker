import React, { useState, useMemo } from 'react';
import ExpenseInput from './components/ExpenseInput';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseCharts from './components/ExpenseCharts';
import LanguageSelector from './components/LanguageSelector';
import PDFGenerator from './components/PDFGenerator';
import Navigation from './components/Navigation';
import BudgetComparison from './components/BudgetComparison';
import MonthSelector from './components/MonthSelector';
import Footer from './components/Footer';
import DarkModeToggle from './components/DarkModeToggle';
import { translations } from './translations';
import './App.css';

function App() {
  // State for language
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // State for current page
  const [currentPage, setCurrentPage] = useState('tracker');
  
  // State for income
  const [income, setIncome] = useState(1400);

  // State for expenses with shared cost tracking
  const [expenses, setExpenses] = useState({
    // Fixed expenses (can be shared)
    rent: 395,
    apl: 0, // Housing allowance (APL)
    electricity: 20,
    internet: 12.25,
    phone: 6.99,
    subscriptions: 15,
    insuranceHome: 11,
    insuranceCar: 52,
    gym: 30,
    
    // Variable expenses
    food: 60,
    gas: 50,
    catFood: 20,
    leisure: 100,
    shopping: 0,
    
    // Savings and emergency fund
    savings: 200,
    unforeseen: 200,
  });

  // State for tracking which expenses are shared
  const [sharedExpenses, setSharedExpenses] = useState({
    rent: true,
    apl: true, // APL can be shared
    electricity: true,
    internet: true,
    phone: false,
    subscriptions: false,
    insuranceHome: true,
    insuranceCar: false,
    gym: false,
    food: true, // Food can be shared
    gas: false,
    catFood: true, // Cat food can be shared
    leisure: false,
    shopping: false,
    savings: false,
    unforeseen: false,
  });

  // State for saved budgets
  const [savedBudgets, setSavedBudgets] = useState(() => {
    const saved = localStorage.getItem('savedBudgets');
    return saved ? JSON.parse(saved) : [];
  });

  // State for selected month
  const [selectedMonth, setSelectedMonth] = useState(null);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Load data for a specific month
  const loadMonthData = (monthKey) => {
    const budget = savedBudgets.find(budget => budget.name === monthKey);
    
    if (budget) {
      setIncome(budget.income);
      setExpenses(budget.expenses);
      setSharedExpenses(budget.sharedExpenses);
    } else {
      // Reset to default values for new month
      setIncome(1400);
      setExpenses({
        rent: 395,
        apl: 0,
        electricity: 20,
        internet: 12.25,
        phone: 6.99,
        subscriptions: 15,
        insuranceHome: 11,
        insuranceCar: 52,
        gym: 30,
        food: 60,
        gas: 50,
        catFood: 20,
        leisure: 100,
        shopping: 0,
        savings: 200,
        unforeseen: 200,
      });
      setSharedExpenses({
        rent: true,
        apl: true,
        electricity: true,
        internet: true,
        phone: false,
        subscriptions: false,
        insuranceHome: true,
        insuranceCar: false,
        gym: false,
        food: true,
        gas: false,
        catFood: true,
        leisure: false,
        shopping: false,
        savings: false,
        unforeseen: false,
      });
    }
  };

  // Load current month's data from saved budgets
  const loadCurrentMonthData = () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    const monthKey = `${month} ${year}`;
    
    loadMonthData(monthKey);
  };

  // Calculate total expenses with shared cost adjustment and APL reduction
  const totalExpenses = useMemo(() => {
    return Object.entries(expenses).reduce((total, [key, value]) => {
      const isShared = sharedExpenses[key];
      
      // Special handling for APL (housing allowance)
      if (key === 'apl') {
        // APL reduces the rent cost, and can be shared
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      
      // If shared, divide by 2 (assuming equal split)
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);
  }, [expenses, sharedExpenses]);

  // Calculate balance
  const balance = income - totalExpenses;

  // Handle expense changes
  const handleExpenseChange = (key, value) => {
    setExpenses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle shared expense toggle
  const handleSharedChange = (key, isShared) => {
    setSharedExpenses(prev => ({
      ...prev,
      [key]: isShared
    }));
  };

  // Save current budget
  const handleSaveBudget = () => {
    // Use selected month or current month
    const monthKey = selectedMonth || (() => {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('en-US', { month: 'long' });
      const year = currentDate.getFullYear();
      return `${month} ${year}`;
    })();
    
    const budgetData = {
      id: Date.now(),
      name: monthKey,
      month: monthKey.split(' ')[0],
      year: parseInt(monthKey.split(' ')[1]),
      date: new Date().toISOString(),
      income: income,
      totalExpenses: totalExpenses,
      balance: balance,
      expenses: expenses,
      sharedExpenses: sharedExpenses
    };

    // Check if a budget for this month already exists
    const existingBudgetIndex = savedBudgets.findIndex(budget => budget.name === monthKey);
    
    let updatedBudgets;
    if (existingBudgetIndex !== -1) {
      // Replace existing budget for this month
      updatedBudgets = [...savedBudgets];
      updatedBudgets[existingBudgetIndex] = budgetData;
    } else {
      // Add new budget
      updatedBudgets = [...savedBudgets, budgetData];
    }
    
    setSavedBudgets(updatedBudgets);
    localStorage.setItem('savedBudgets', JSON.stringify(updatedBudgets));
    
    // Show success message
    const message = existingBudgetIndex !== -1 
      ? (translations[currentLanguage].budgetUpdated || 'Budget updated successfully!')
      : (translations[currentLanguage].budgetSaved || 'Budget saved successfully!');
    alert(message);
  };

  // Handle month selection
  const handleMonthChange = (monthKey) => {
    setSelectedMonth(monthKey);
    loadMonthData(monthKey);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Apply dark mode class to body
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Group expenses by category
  const expenseCategories = {
    [translations[currentLanguage].fixedExpenses]: ['rent', 'apl', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'],
    [translations[currentLanguage].variableExpenses]: ['food', 'gas', 'catFood', 'leisure', 'shopping'],
    [translations[currentLanguage].savingsEmergency]: ['savings', 'unforeseen']
  };

  // Load current month data when component mounts
  React.useEffect(() => {
    loadCurrentMonthData();
  }, []);

  // Apply dark mode on mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>{translations[currentLanguage].title}</h1>
            <p>{translations[currentLanguage].subtitle}</p>
          </div>
          <div className="header-center">
            <Navigation
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              translations={translations}
              currentLanguage={currentLanguage}
            />
          </div>
          <div className="header-controls">
            <DarkModeToggle
              isDarkMode={isDarkMode}
              onToggle={handleDarkModeToggle}
              translations={translations}
              currentLanguage={currentLanguage}
            />
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              translations={translations}
            />
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {currentPage === 'tracker' ? (
            <>
              <div className="grid">
                {/* Left Column - Inputs */}
                <div>
                  {/* Month Selector */}
                  <div className="card">
                    <MonthSelector
                      selectedMonth={selectedMonth}
                      onMonthChange={handleMonthChange}
                      savedBudgets={savedBudgets}
                      translations={translations}
                      currentLanguage={currentLanguage}
                    />
                  </div>

                  {/* Income Input */}
                  <div className="card">
                    <h2>{translations[currentLanguage].monthlyIncome}</h2>
                    <div className="input-wrapper">
                      <span className="currency">€</span>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value) || 0)}
                        className="input-field"
                        placeholder="0"
                        style={{ fontSize: '1.125rem', fontWeight: '500' }}
                      />
                    </div>
                    
                    {/* Budget Action Buttons */}
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={handleSaveBudget}
                          className="save-button"
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                          💾 {translations[currentLanguage].saveBudget || 'Save Budget'}
                        </button>
                        <button 
                          onClick={loadCurrentMonthData}
                          className="load-button"
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                          title={translations[currentLanguage].loadCurrentMonth || 'Load current month data'}
                        >
                          🔄
                        </button>
                      </div>
                      
                      {/* PDF Download Button */}
                      <PDFGenerator
                        income={income}
                        expenses={expenses}
                        totalExpenses={totalExpenses}
                        balance={balance}
                        sharedExpenses={sharedExpenses}
                        translations={translations}
                        currentLanguage={currentLanguage}
                      />
                    </div>
                  </div>

                  {/* Expense Inputs */}
                  <div style={{ marginTop: '1.5rem' }}>
                    {Object.entries(expenseCategories).map(([category, expenseKeys]) => (
                      <div key={category} className="card" style={{ marginBottom: '1.5rem' }}>
                        <h3>{category}</h3>
                        <div>
                          {expenseKeys.map(key => (
                                                    <ExpenseInput
                          key={key}
                          label={key}
                          value={expenses[key]}
                          onChange={(value) => handleExpenseChange(key, value)}
                          isShared={['rent', 'apl', 'electricity', 'internet', 'insuranceHome', 'food', 'catFood'].includes(key)}
                          onSharedChange={(isShared) => handleSharedChange(key, isShared)}
                          sharedValue={sharedExpenses[key]}
                          translations={translations}
                          currentLanguage={currentLanguage}
                          isApl={key === 'apl'}
                        />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Summary and Charts */}
                <div>
                  {/* Summary */}
                  <ExpenseSummary 
                    totalExpenses={totalExpenses}
                    balance={balance}
                    income={income}
                    translations={translations}
                    currentLanguage={currentLanguage}
                  />

                  {/* Charts */}
                  <ExpenseCharts 
                    expenses={expenses}
                    balance={balance}
                    translations={translations}
                    currentLanguage={currentLanguage}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Shared Expenses Info */}
              <div className="info-box">
                <div className="info-content">
                  <svg className="info-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3>{translations[currentLanguage].sharedExpensesInfo}</h3>
                    <p>
                      {translations[currentLanguage].sharedExpensesDescription}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : currentPage === 'comparison' ? (
            <BudgetComparison
              translations={translations}
              currentLanguage={currentLanguage}
              savedBudgets={savedBudgets}
              setSavedBudgets={setSavedBudgets}
              isDarkMode={isDarkMode}
            />
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <Footer 
        translations={translations}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

export default App;

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { BudgetProvider, useBudget, BUDGET_ACTIONS } from './contexts/BudgetContext';
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
import CollapsibleExpenseCategory from './components/CollapsibleExpenseCategory';
import FinancialGoals from './components/FinancialGoals';
import NotificationSystem from './components/NotificationSystem';
import DataManager from './components/DataManager';
import { translations } from './translations';
import CustomizableDashboard from './components/CustomizableDashboard';
import './App.css';

function AppContent() {
  const { state, dispatch } = useBudget();
  
  const {
    currentLanguage,
    isDarkMode,
    currentPage,
    income,
    expenses,
    sharedExpenses,
    savedBudgets,
    selectedMonth
  } = state;

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [incomeInput, setIncomeInput] = useState(String(income === 0 ? '' : income));

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setShowHeader(true);
        lastScrollY.current = window.scrollY;
        return;
      }
      if (window.scrollY > lastScrollY.current) {
        setShowHeader(false); // scroll down
      } else {
        setShowHeader(true); // scroll up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIncomeInput(String(income === 0 ? '' : income));
  }, [income]);

  // Get previous month key
  const getPreviousMonthKey = (monthKey) => {
    const [month, year] = monthKey.split(' ');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let monthIndex = monthNames.indexOf(month);
    let yearNum = parseInt(year);
    
    if (monthIndex === 0) {
      monthIndex = 11;
      yearNum--;
    } else {
      monthIndex--;
    }
    
    return `${monthNames[monthIndex]} ${yearNum}`;
  };

  // Load data for a specific month
  const loadMonthData = (monthKey) => {
    const budget = savedBudgets.find(budget => budget.name === monthKey);
    
    if (budget) {
      dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: budget.income });
      Object.entries(budget.expenses).forEach(([key, value]) => {
        dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value } });
      });
      Object.entries(budget.sharedExpenses).forEach(([key, value]) => {
        dispatch({ type: BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE, payload: { key, value } });
      });
      
      // Load financial goals for this month if available
      if (budget.financialGoals) {
        Object.entries(budget.financialGoals).forEach(([key, value]) => {
          dispatch({
            type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
            payload: { key, value }
          });
        });
      }
    } else {
      // Try to load data from previous month
      const previousMonthKey = getPreviousMonthKey(monthKey);
      const previousBudget = savedBudgets.find(budget => budget.name === previousMonthKey);
      
      if (previousBudget) {
        // Load values from previous month
        dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: previousBudget.income });
        Object.entries(previousBudget.expenses).forEach(([key, value]) => {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value } });
        });
        Object.entries(previousBudget.sharedExpenses).forEach(([key, value]) => {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE, payload: { key, value } });
        });
        
        // Load financial goals from previous month if available
        if (previousBudget.financialGoals) {
          Object.entries(previousBudget.financialGoals).forEach(([key, value]) => {
            dispatch({
              type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
              payload: { key, value }
            });
          });
        }
        
        // Add notification
        dispatch({
          type: BUDGET_ACTIONS.ADD_NOTIFICATION,
          payload: {
            id: Date.now(),
            type: 'info',
            message: `${translations[currentLanguage].loadedFromPreviousMonth || 'Loaded values from'} ${previousMonthKey}`,
            duration: 3000
          }
        });
      } else {
        // Fallback to default values if no previous month found
        dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: 1400 });
        const defaultExpenses = {
          rent: 395, apl: 0, electricity: 20, internet: 12.25, phone: 6.99,
          subscriptions: 15, insuranceHome: 11, insuranceCar: 52, gym: 30,
          food: 60, gas: 50, catFood: 20, leisure: 100, shopping: 0,
          savings: 200, unforeseen: 200,
        };
        Object.entries(defaultExpenses).forEach(([key, value]) => {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value } });
        });
        
        const defaultShared = {
          rent: true, apl: true, electricity: true, internet: true, phone: false,
          subscriptions: false, insuranceHome: true, insuranceCar: false, gym: false,
          food: true, gas: false, catFood: true, leisure: false, shopping: false,
          savings: false, unforeseen: false,
        };
        Object.entries(defaultShared).forEach(([key, value]) => {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE, payload: { key, value } });
        });
      }
      
      // Try to load financial goals from monthly cache
      dispatch({
        type: BUDGET_ACTIONS.LOAD_MONTHLY_FINANCIAL_GOALS,
        payload: { monthKey }
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
    dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value } });
  };

  // Handle shared expense toggle
  const handleSharedChange = (key, isShared) => {
    dispatch({ type: BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE, payload: { key, isShared } });
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
    
    // Calculate goal achievements
    const currentSavings = expenses.savings || 0;
    const currentLeisure = expenses.leisure || 0;
    const totalEmergencyFund = savedBudgets.reduce((total, budget) => {
      return total + (budget.expenses?.unforeseen || 0);
    }, 0) + (expenses.unforeseen || 0);
    
    const financialGoals = state.financialGoals;
    const goalAchievements = {
      monthlySavings: {
        target: financialGoals.monthlySavings,
        current: currentSavings,
        achieved: currentSavings >= financialGoals.monthlySavings,
        progress: Math.min((currentSavings / financialGoals.monthlySavings) * 100, 100)
      },
      maxLeisureSpending: {
        target: financialGoals.maxLeisureSpending,
        current: currentLeisure,
        achieved: currentLeisure <= financialGoals.maxLeisureSpending,
        progress: Math.min((currentLeisure / financialGoals.maxLeisureSpending) * 100, 100)
      },
      emergencyFundTarget: {
        target: financialGoals.emergencyFundTarget,
        current: totalEmergencyFund,
        achieved: totalEmergencyFund >= financialGoals.emergencyFundTarget,
        progress: Math.min((totalEmergencyFund / financialGoals.emergencyFundTarget) * 100, 100)
      }
    };
    
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
      sharedExpenses: sharedExpenses,
      financialGoals: financialGoals,
      goalAchievements: goalAchievements
    };

    dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: budgetData });
    
    // Add notification
    const existingBudgetIndex = savedBudgets.findIndex(budget => budget.name === monthKey);
    const message = existingBudgetIndex !== -1 
      ? (translations[currentLanguage].budgetUpdated || 'Budget updated successfully!')
      : (translations[currentLanguage].budgetSaved || 'Budget saved successfully!');
    
    dispatch({
      type: BUDGET_ACTIONS.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        type: 'success',
        message,
        duration: 3000
      }
    });
  };

  // Handle month selection
  const handleMonthChange = (monthKey) => {
    dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
    loadMonthData(monthKey);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    dispatch({ type: BUDGET_ACTIONS.TOGGLE_DARK_MODE });
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

  return (
    <div>
      {/* Header */}
      <header className={`header${showHeader ? '' : ' header--hidden'}`}>
        <div className="header-content">
          <div className="header-left">
            <h1>{translations[currentLanguage].title}</h1>
            <p>{translations[currentLanguage].subtitle}</p>
          </div>
          <div className="header-center">
            <Navigation
              currentPage={currentPage}
              onPageChange={(page) => dispatch({ type: BUDGET_ACTIONS.SET_CURRENT_PAGE, payload: page })}
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
              onLanguageChange={(lang) => dispatch({ type: BUDGET_ACTIONS.SET_LANGUAGE, payload: lang })}
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
                        type="text"
                        inputMode="decimal"
                        value={incomeInput}
                        onChange={e => setIncomeInput(e.target.value)}
                        onBlur={() => {
                          const val = incomeInput.replace(',', '.');
                          const num = Number(val);
                          dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: isNaN(num) ? 0 : num });
                          setIncomeInput(isNaN(num) || num === 0 ? '' : String(num));
                        }}
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

                  {/* Financial Goals */}
                  <FinancialGoals
                    translations={translations}
                    currentLanguage={currentLanguage}
                  />

                  {/* Data Manager */}
                  <DataManager
                    translations={translations}
                    currentLanguage={currentLanguage}
                  />

                  {/* Expense Inputs */}
                  <div style={{ marginTop: '2rem' }}>
                    {Object.entries(expenseCategories).map(([category, expenseKeys], index) => (
                      <div key={category} style={{ marginBottom: index < Object.keys(expenseCategories).length - 1 ? '2rem' : '0' }}>
                        <CollapsibleExpenseCategory
                          category={category}
                          expenseKeys={expenseKeys}
                          expenses={expenses}
                          onExpenseChange={handleExpenseChange}
                          sharedExpenses={sharedExpenses}
                          onSharedChange={handleSharedChange}
                          translations={translations}
                          currentLanguage={currentLanguage}
                        />
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
              isDarkMode={isDarkMode}
            />
          ) : currentPage === 'dashboard' ? (
            <CustomizableDashboard
              translations={translations}
              currentLanguage={currentLanguage}
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
      
      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
}

// Main App component with Provider
function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
}

export default App;

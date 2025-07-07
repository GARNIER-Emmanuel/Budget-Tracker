import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { validateAndRepairBudget, filterValidBudgets } from '../utils/dataValidation';

// Initial state
const initialState = {
  // Language and UI
  currentLanguage: 'fr',
  isDarkMode: false,
  currentPage: 'tracker',
  
  // Budget data
  income: 1400,
  expenses: {
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
  },
  
  // Shared expenses
  sharedExpenses: {
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
  },
  
  // Saved budgets
  savedBudgets: [],
  
  // Selected month
  selectedMonth: null,
  
  // Custom categories
  customCategories: {},
  
  // Financial goals (by month)
  financialGoals: {
    monthlySavings: 200,
    maxLeisureSpending: 150,
    emergencyFundTarget: 3000,
  },
  
  // Monthly financial goals cache
  monthlyFinancialGoals: {},
  
  // UI preferences
  uiPreferences: {
    showAnimations: true,
    compactMode: false,
    autoSave: true,
  },
  
  // Notifications
  notifications: [],
  
  // Other received money
  autreArgentRecu: 0,
};

// Action types
export const BUDGET_ACTIONS = {
  SET_LANGUAGE: 'SET_LANGUAGE',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  UPDATE_INCOME: 'UPDATE_INCOME',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  UPDATE_SHARED_EXPENSE: 'UPDATE_SHARED_EXPENSE',
  SAVE_BUDGET: 'SAVE_BUDGET',
  LOAD_BUDGET: 'LOAD_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  SET_SELECTED_MONTH: 'SET_SELECTED_MONTH',
  ADD_CUSTOM_CATEGORY: 'ADD_CUSTOM_CATEGORY',
  UPDATE_FINANCIAL_GOAL: 'UPDATE_FINANCIAL_GOAL',
  SAVE_MONTHLY_FINANCIAL_GOALS: 'SAVE_MONTHLY_FINANCIAL_GOALS',
  LOAD_MONTHLY_FINANCIAL_GOALS: 'LOAD_MONTHLY_FINANCIAL_GOALS',
  LOAD_MONTHLY_FINANCIAL_GOALS_CACHE: 'LOAD_MONTHLY_FINANCIAL_GOALS_CACHE',
  RESET_FINANCIAL_GOALS: 'RESET_FINANCIAL_GOALS',
  UPDATE_UI_PREFERENCE: 'UPDATE_UI_PREFERENCE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  RESET_TO_DEFAULTS: 'RESET_TO_DEFAULTS',
  UPDATE_AUTRE_ARGENT_RECU: 'UPDATE_AUTRE_ARGENT_RECU',
};

// Reducer
const budgetReducer = (state, action) => {
  switch (action.type) {
    case BUDGET_ACTIONS.SET_LANGUAGE:
      return { ...state, currentLanguage: action.payload };
      
    case BUDGET_ACTIONS.TOGGLE_DARK_MODE:
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      return { ...state, isDarkMode: newDarkMode };
      
    case BUDGET_ACTIONS.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
      
    case BUDGET_ACTIONS.UPDATE_INCOME:
      return { ...state, income: action.payload };
      
    case BUDGET_ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.key]: action.payload.value
        }
      };
      
    case BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE:
      return {
        ...state,
        sharedExpenses: {
          ...state.sharedExpenses,
          [action.payload.key]: action.payload.value
        }
      };
      
    case BUDGET_ACTIONS.SAVE_BUDGET:
      // Validate and repair budget data before saving
      const validatedBudget = validateAndRepairBudget(action.payload);
      
      if (!validatedBudget) {
        console.error('Invalid budget data:', action.payload);
        return state;
      }
      
      const existingIndex = state.savedBudgets.findIndex(
        budget => budget.name === validatedBudget.name
      );
      
      let updatedBudgets;
      if (existingIndex !== -1) {
        updatedBudgets = [...state.savedBudgets];
        updatedBudgets[existingIndex] = validatedBudget;
      } else {
        updatedBudgets = [...state.savedBudgets, validatedBudget];
      }
      
      localStorage.setItem('savedBudgets', JSON.stringify(updatedBudgets));
      return { ...state, savedBudgets: updatedBudgets };
      
    case BUDGET_ACTIONS.LOAD_BUDGET:
      return {
        ...state,
        income: action.payload.income,
        autreArgentRecu: action.payload.autreArgentRecu || 0,
        expenses: action.payload.expenses,
        sharedExpenses: action.payload.sharedExpenses,
      };
      
    case BUDGET_ACTIONS.DELETE_BUDGET:
      const filteredBudgets = state.savedBudgets.filter(
        budget => budget.id !== action.payload
      );
      localStorage.setItem('savedBudgets', JSON.stringify(filteredBudgets));
      return { ...state, savedBudgets: filteredBudgets };
      
    case BUDGET_ACTIONS.SET_SELECTED_MONTH:
      return { ...state, selectedMonth: action.payload };
      
    case BUDGET_ACTIONS.ADD_CUSTOM_CATEGORY:
      return {
        ...state,
        customCategories: {
          ...state.customCategories,
          [action.payload.id]: action.payload
        }
      };
      
    case BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL:
      const updatedFinancialGoals = {
        ...state.financialGoals,
        [action.payload.key]: action.payload.value
      };
      // Save to localStorage
      localStorage.setItem('financialGoals', JSON.stringify(updatedFinancialGoals));
      return {
        ...state,
        financialGoals: updatedFinancialGoals
      };
      
    case BUDGET_ACTIONS.SAVE_MONTHLY_FINANCIAL_GOALS:
      const { monthKey, goals } = action.payload;
      const updatedMonthlyGoals = {
        ...state.monthlyFinancialGoals,
        [monthKey]: goals
      };
      // Save to localStorage
      localStorage.setItem('monthlyFinancialGoals', JSON.stringify(updatedMonthlyGoals));
      return {
        ...state,
        monthlyFinancialGoals: updatedMonthlyGoals
      };
      
    case BUDGET_ACTIONS.LOAD_MONTHLY_FINANCIAL_GOALS:
      const { monthKey: loadMonthKey } = action.payload;
      const monthlyGoals = state.monthlyFinancialGoals[loadMonthKey];
      if (monthlyGoals) {
        return {
          ...state,
          financialGoals: monthlyGoals
        };
      }
      return state;
      
    case BUDGET_ACTIONS.LOAD_MONTHLY_FINANCIAL_GOALS_CACHE:
      return {
        ...state,
        monthlyFinancialGoals: action.payload.monthlyFinancialGoals
      };
      
    case BUDGET_ACTIONS.RESET_FINANCIAL_GOALS:
      // Save default goals to localStorage
      localStorage.setItem('financialGoals', JSON.stringify(initialState.financialGoals));
      return {
        ...state,
        financialGoals: initialState.financialGoals
      };
      
    case BUDGET_ACTIONS.UPDATE_UI_PREFERENCE:
      return {
        ...state,
        uiPreferences: {
          ...state.uiPreferences,
          [action.payload.key]: action.payload.value
        }
      };
      
    case BUDGET_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case BUDGET_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
      
    case BUDGET_ACTIONS.RESET_TO_DEFAULTS:
      return { ...initialState, currentLanguage: state.currentLanguage };
      
    case BUDGET_ACTIONS.UPDATE_AUTRE_ARGENT_RECU:
      return { ...state, autreArgentRecu: action.payload };
      
    default:
      return state;
  }
};

// Create context
const BudgetContext = createContext();

// Provider component
export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    // Load saved budgets
    const savedBudgets = localStorage.getItem('savedBudgets');
    if (savedBudgets) {
      try {
        const parsed = JSON.parse(savedBudgets);
        
        // Validate and clean budgets before loading
        const validBudgets = filterValidBudgets(parsed);
        
        // Update localStorage with cleaned data
        if (validBudgets.length !== parsed.length) {
          console.warn(`Cleaned ${parsed.length - validBudgets.length} invalid budgets`);
          localStorage.setItem('savedBudgets', JSON.stringify(validBudgets));
        }
        
        // Update the state with all valid budgets
        validBudgets.forEach(budget => {
          dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: budget });
        });
      } catch (error) {
        console.error('Error loading saved budgets:', error);
        // Clear corrupted data
        localStorage.removeItem('savedBudgets');
      }
    }

    // Load financial goals
    const savedFinancialGoals = localStorage.getItem('financialGoals');
    if (savedFinancialGoals) {
      try {
        const parsedGoals = JSON.parse(savedFinancialGoals);
        // Validate goals structure
        if (parsedGoals && typeof parsedGoals === 'object') {
          Object.entries(parsedGoals).forEach(([key, value]) => {
            if (typeof value === 'number' && !isNaN(value) && value >= 0) {
              dispatch({
                type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
                payload: { key, value }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error loading financial goals:', error);
        // Clear corrupted data
        localStorage.removeItem('financialGoals');
      }
    } else {
      // Save default financial goals if none exist
      localStorage.setItem('financialGoals', JSON.stringify(initialState.financialGoals));
    }

    // Load monthly financial goals
    const savedMonthlyFinancialGoals = localStorage.getItem('monthlyFinancialGoals');
    if (savedMonthlyFinancialGoals) {
      try {
        const parsedMonthlyGoals = JSON.parse(savedMonthlyFinancialGoals);
        // Validate monthly goals structure
        if (parsedMonthlyGoals && typeof parsedMonthlyGoals === 'object') {
          dispatch({
            type: 'LOAD_MONTHLY_FINANCIAL_GOALS_CACHE',
            payload: { monthlyFinancialGoals: parsedMonthlyGoals }
          });
        }
      } catch (error) {
        console.error('Error loading monthly financial goals:', error);
        // Clear corrupted data
        localStorage.removeItem('monthlyFinancialGoals');
      }
    }

    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode) {
      try {
        const isDark = JSON.parse(darkMode);
        if (isDark !== state.isDarkMode) {
          dispatch({ type: BUDGET_ACTIONS.TOGGLE_DARK_MODE });
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
      }
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (state.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state.isDarkMode]);

  // Auto-save functionality
  useEffect(() => {
    if (state.uiPreferences.autoSave && state.currentPage === 'tracker') {
      const timeoutId = setTimeout(() => {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('en-US', { month: 'long' });
        const year = currentDate.getFullYear();
        const monthKey = state.selectedMonth || `${month} ${year}`;
        const monthlyGoals = state.monthlyFinancialGoals[monthKey];
        if (monthlyGoals) {
          dispatch({
            type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
            payload: { key: 'monthlySavings', value: monthlyGoals.monthlySavings }
          });
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [state.uiPreferences.autoSave, state.currentPage, state.selectedMonth, state.monthlyFinancialGoals]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
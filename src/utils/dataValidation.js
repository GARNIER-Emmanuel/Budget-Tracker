// Utility functions for data validation and cleaning

/**
 * Validates if a budget object has all required fields and valid data
 * @param {Object} budget - The budget object to validate
 * @returns {boolean} - True if budget is valid
 */
export const isValidBudget = (budget) => {
  if (!budget || typeof budget !== 'object') {
    return false;
  }

  // Check required fields
  const hasRequiredFields = 
    typeof budget.id === 'number' &&
    typeof budget.name === 'string' &&
    typeof budget.income === 'number' &&
    !isNaN(budget.income) &&
    budget.expenses &&
    typeof budget.expenses === 'object' &&
    budget.sharedExpenses &&
    typeof budget.sharedExpenses === 'object';

  if (!hasRequiredFields) {
    return false;
  }

  // Check if totalExpenses and balance are valid numbers
  const hasValidCalculatedFields = 
    typeof budget.totalExpenses === 'number' &&
    !isNaN(budget.totalExpenses) &&
    typeof budget.balance === 'number' &&
    !isNaN(budget.balance);

  return hasValidCalculatedFields;
};

/**
 * Calculates totalExpenses for a budget with shared expense adjustments
 * @param {Object} budget - The budget object
 * @returns {number} - Calculated total expenses
 */
export const calculateTotalExpenses = (budget) => {
  if (!budget.expenses || !budget.sharedExpenses) {
    return 0;
  }

  return Object.entries(budget.expenses).reduce((total, [key, value]) => {
    const isShared = budget.sharedExpenses[key];
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    // Special handling for APL (housing allowance)
    if (key === 'apl') {
      const aplReduction = isShared ? numValue / 2 : numValue;
      return total - aplReduction;
    }
    
    // If shared, divide by 2 (assuming equal split)
    const adjustedValue = isShared ? numValue / 2 : numValue;
    return total + adjustedValue;
  }, 0);
};

/**
 * Calculates balance for a budget
 * @param {Object} budget - The budget object
 * @returns {number} - Calculated balance
 */
export const calculateBalance = (budget) => {
  const income = typeof budget.income === 'number' && !isNaN(budget.income) ? budget.income : 0;
  const totalExpenses = calculateTotalExpenses(budget);
  return income - totalExpenses;
};

/**
 * Validates and repairs a budget object
 * @param {Object} budget - The budget object to validate and repair
 * @returns {Object|null} - Repaired budget object or null if invalid
 */
export const validateAndRepairBudget = (budget) => {
  if (!budget || typeof budget !== 'object') {
    return null;
  }

  // Check if budget has minimum required fields
  if (!budget.id || !budget.name || typeof budget.income !== 'number' || isNaN(budget.income)) {
    return null;
  }

  // Create a copy of the budget
  const repairedBudget = { ...budget };

  // Ensure expenses and sharedExpenses are objects
  if (!repairedBudget.expenses || typeof repairedBudget.expenses !== 'object') {
    repairedBudget.expenses = {};
  }
  if (!repairedBudget.sharedExpenses || typeof repairedBudget.sharedExpenses !== 'object') {
    repairedBudget.sharedExpenses = {};
  }

  // Calculate missing totalExpenses and balance
  if (typeof repairedBudget.totalExpenses !== 'number' || isNaN(repairedBudget.totalExpenses)) {
    repairedBudget.totalExpenses = calculateTotalExpenses(repairedBudget);
  }

  if (typeof repairedBudget.balance !== 'number' || isNaN(repairedBudget.balance)) {
    repairedBudget.balance = calculateBalance(repairedBudget);
  }

  // Ensure all expense values are numbers
  Object.keys(repairedBudget.expenses).forEach(key => {
    if (typeof repairedBudget.expenses[key] !== 'number' || isNaN(repairedBudget.expenses[key])) {
      repairedBudget.expenses[key] = 0;
    }
  });

  // Ensure all shared expense values are booleans
  Object.keys(repairedBudget.sharedExpenses).forEach(key => {
    if (typeof repairedBudget.sharedExpenses[key] !== 'boolean') {
      repairedBudget.sharedExpenses[key] = false;
    }
  });

  return repairedBudget;
};

/**
 * Filters an array of budgets to only include valid ones
 * @param {Array} budgets - Array of budget objects
 * @returns {Array} - Array of valid budget objects
 */
export const filterValidBudgets = (budgets) => {
  if (!Array.isArray(budgets)) {
    return [];
  }

  return budgets
    .map(budget => validateAndRepairBudget(budget))
    .filter(budget => budget !== null);
};

/**
 * Validates expense values to ensure they are numbers
 * @param {Object} expenses - Object containing expense values
 * @returns {Object} - Object with validated expense values
 */
export const validateExpenses = (expenses) => {
  if (!expenses || typeof expenses !== 'object') {
    return {};
  }

  const validatedExpenses = {};
  Object.entries(expenses).forEach(([key, value]) => {
    validatedExpenses[key] = typeof value === 'number' && !isNaN(value) ? value : 0;
  });

  return validatedExpenses;
};

/**
 * Validates shared expense values to ensure they are booleans
 * @param {Object} sharedExpenses - Object containing shared expense flags
 * @returns {Object} - Object with validated shared expense flags
 */
export const validateSharedExpenses = (sharedExpenses) => {
  if (!sharedExpenses || typeof sharedExpenses !== 'object') {
    return {};
  }

  const validatedSharedExpenses = {};
  Object.entries(sharedExpenses).forEach(([key, value]) => {
    validatedSharedExpenses[key] = typeof value === 'boolean' ? value : false;
  });

  return validatedSharedExpenses;
}; 
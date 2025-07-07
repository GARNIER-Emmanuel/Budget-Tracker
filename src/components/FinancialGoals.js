import React, { useState } from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import { validateFinancialGoal } from '../utils/validation';

const FinancialGoals = ({ translations, currentLanguage }) => {
  const { state, dispatch } = useBudget();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(state.financialGoals);
  const [errors, setErrors] = useState({});

  // Calculate current values
  const currentSavings = state.expenses.savings || 0;
  const currentLeisure = state.expenses.leisure || 0;
  const totalEmergencyFund = state.savedBudgets.reduce((total, budget) => {
    return total + (budget.expenses?.unforeseen || 0);
  }, 0);

  // Calculate progress percentages
  const savingsProgress = Math.min((currentSavings / state.financialGoals.monthlySavings) * 100, 100);
  const leisureProgress = Math.min((currentLeisure / state.financialGoals.maxLeisureSpending) * 100, 100);
  const emergencyProgress = Math.min((totalEmergencyFund / state.financialGoals.emergencyFundTarget) * 100, 100);

  // Check if goals are met
  const isSavingsGoalMet = currentSavings >= state.financialGoals.monthlySavings;
  const isLeisureGoalMet = currentLeisure <= state.financialGoals.maxLeisureSpending;
  const isEmergencyGoalMet = totalEmergencyFund >= state.financialGoals.emergencyFundTarget;

  const handleEdit = () => {
    setEditValues(state.financialGoals);
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors = {};
    Object.keys(editValues).forEach(key => {
      const fieldErrors = validateFinancialGoal(editValues[key]);
      if (fieldErrors.length > 0) {
        newErrors[key] = fieldErrors;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get current month key
    const selectedMonth = state.selectedMonth;
    let monthKey = selectedMonth;
    
    if (!monthKey) {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('en-US', { month: 'long' });
      const year = currentDate.getFullYear();
      monthKey = `${month} ${year}`;
    }

    // Save goals for current month
    Object.keys(editValues).forEach(key => {
      dispatch({
        type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
        payload: { key, value: editValues[key] }
      });
    });

    // Save monthly goals to cache
    dispatch({
      type: BUDGET_ACTIONS.SAVE_MONTHLY_FINANCIAL_GOALS,
      payload: { monthKey, goals: editValues }
    });

    setIsEditing(false);
    setErrors({});

    // Add notification
    const message = (translations[currentLanguage].goalsUpdatedForMonth || 'Financial goals updated for {month}!').replace('{month}', monthKey);
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

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleResetGoals = () => {
    dispatch({ type: BUDGET_ACTIONS.RESET_FINANCIAL_GOALS });
    
    // Add notification
    dispatch({
      type: BUDGET_ACTIONS.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        type: 'info',
        message: translations[currentLanguage].goalsReset || 'Financial goals reset to defaults',
        duration: 3000
      }
    });
  };

  const handleRefreshGoals = () => {
    // Get the selected month or current month
    const selectedMonth = state.selectedMonth;
    let targetMonth = selectedMonth;
    
    if (!targetMonth) {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('en-US', { month: 'long' });
      const year = currentDate.getFullYear();
      targetMonth = `${month} ${year}`;
    }
    
    // Try to load from monthly cache first
    dispatch({
      type: BUDGET_ACTIONS.LOAD_MONTHLY_FINANCIAL_GOALS,
      payload: { monthKey: targetMonth }
    });
    
    // Check if goals were loaded from cache
    const cachedGoals = state.monthlyFinancialGoals[targetMonth];
    
    if (cachedGoals) {
      // Add notification
      const message = (translations[currentLanguage].goalsLoadedFromMonth || 'Goals loaded from {month}').replace('{month}', targetMonth);
      dispatch({
        type: BUDGET_ACTIONS.ADD_NOTIFICATION,
        payload: {
          id: Date.now(),
          type: 'success',
          message,
          duration: 3000
        }
      });
    } else {
      // If no cached goals found, try to load from saved budget
      const targetBudget = state.savedBudgets.find(budget => budget.name === targetMonth);
      
      if (targetBudget && targetBudget.financialGoals) {
        // Load the financial goals from the selected month
        Object.entries(targetBudget.financialGoals).forEach(([key, value]) => {
          dispatch({
            type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
            payload: { key, value }
          });
        });
        
        // Save to monthly cache
        dispatch({
          type: BUDGET_ACTIONS.SAVE_MONTHLY_FINANCIAL_GOALS,
          payload: { monthKey: targetMonth, goals: targetBudget.financialGoals }
        });
        
        // Add notification
        const message = (translations[currentLanguage].goalsLoadedFromMonth || 'Goals loaded from {month}').replace('{month}', targetMonth);
        dispatch({
          type: BUDGET_ACTIONS.ADD_NOTIFICATION,
          payload: {
            id: Date.now(),
            type: 'success',
            message,
            duration: 3000
          }
        });
      } else {
        // If no goals found for the selected month, reset to defaults
        dispatch({ type: BUDGET_ACTIONS.RESET_FINANCIAL_GOALS });
        
        // Add notification
        const message = (translations[currentLanguage].noGoalsForMonth || 'No goals found for {month}, reset to defaults').replace('{month}', targetMonth);
        dispatch({
          type: BUDGET_ACTIONS.ADD_NOTIFICATION,
          payload: {
            id: Date.now(),
            type: 'info',
            message,
            duration: 3000
          }
        });
      }
    }
  };

  const handleInputChange = (key, value) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: [] }));
    }
  };

  const getProgressColor = (progress, isGoalMet) => {
    if (isGoalMet) return '#10b981'; // Green
    if (progress >= 80) return '#f59e0b'; // Amber
    if (progress >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getGoalStatus = (isMet, progress) => {
    if (isMet) return 'achieved';
    if (progress >= 80) return 'close';
    if (progress >= 50) return 'progress';
    return 'needs-work';
  };

  return (
    <div className="financial-goals-card">
      <div className="goals-header">
        <h3>{translations[currentLanguage].financialGoals || 'Financial Goals'}</h3>
        {!isEditing && (
          <div className="goals-actions">
            <button 
              onClick={handleEdit}
              className="edit-goals-button"
              title={translations[currentLanguage].editGoals || 'Edit Goals'}
            >
              ✏️
            </button>
            <button 
              onClick={handleRefreshGoals}
              className="refresh-goals-button"
              title={translations[currentLanguage].refreshGoalsFromMonth || 'Load goals from selected month'}
            >
              🔄
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="goals-edit-form">
          <div className="goal-input-group">
            <label>{translations[currentLanguage].monthlySavingsGoal || 'Monthly Savings Goal'}</label>
            <div className="input-wrapper">
              <span className="currency">€</span>
              <input
                type="number"
                value={editValues.monthlySavings}
                onChange={(e) => handleInputChange('monthlySavings', Number(e.target.value) || 0)}
                className={`input-field ${errors.monthlySavings ? 'error' : ''}`}
                placeholder="0"
              />
            </div>
            {errors.monthlySavings && (
              <div className="error-message">{errors.monthlySavings[0]}</div>
            )}
          </div>

          <div className="goal-input-group">
            <label>{translations[currentLanguage].maxLeisureSpending || 'Max Leisure Spending'}</label>
            <div className="input-wrapper">
              <span className="currency">€</span>
              <input
                type="number"
                value={editValues.maxLeisureSpending}
                onChange={(e) => handleInputChange('maxLeisureSpending', Number(e.target.value) || 0)}
                className={`input-field ${errors.maxLeisureSpending ? 'error' : ''}`}
                placeholder="0"
              />
            </div>
            {errors.maxLeisureSpending && (
              <div className="error-message">{errors.maxLeisureSpending[0]}</div>
            )}
          </div>

          <div className="goal-input-group">
            <label>{translations[currentLanguage].emergencyFundTarget || 'Emergency Fund Target'}</label>
            <div className="input-wrapper">
              <span className="currency">€</span>
              <input
                type="number"
                value={editValues.emergencyFundTarget}
                onChange={(e) => handleInputChange('emergencyFundTarget', Number(e.target.value) || 0)}
                className={`input-field ${errors.emergencyFundTarget ? 'error' : ''}`}
                placeholder="0"
              />
            </div>
            {errors.emergencyFundTarget && (
              <div className="error-message">{errors.emergencyFundTarget[0]}</div>
            )}
          </div>

          <div className="goals-actions">
            <button onClick={handleSave} className="save-goals-button">
              {translations[currentLanguage].saveGoals || 'Save Goals'}
            </button>
            <button onClick={handleCancel} className="cancel-goals-button">
              {translations[currentLanguage].cancel || 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        <div className="goals-display">
          {/* Monthly Savings Goal */}
          <div className={`goal-item ${getGoalStatus(isSavingsGoalMet, savingsProgress)}`}>
            <div className="goal-header">
              <span className="goal-label">
                {translations[currentLanguage].monthlySavingsGoal || 'Monthly Savings Goal'}
              </span>
              <span className="goal-status">
                {isSavingsGoalMet ? '✅' : savingsProgress >= 80 ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${savingsProgress}%`,
                    backgroundColor: getProgressColor(savingsProgress, isSavingsGoalMet)
                  }}
                />
              </div>
              <div className="goal-values">
                <span className="current-value">€{currentSavings}</span>
                <span className="separator">/</span>
                <span className="target-value">€{state.financialGoals.monthlySavings}</span>
              </div>
            </div>
          </div>

          {/* Leisure Spending Limit */}
          <div className={`goal-item ${getGoalStatus(isLeisureGoalMet, 100 - leisureProgress)}`}>
            <div className="goal-header">
              <span className="goal-label">
                {translations[currentLanguage].leisureSpendingLimit || 'Leisure Spending Limit'}
              </span>
              <span className="goal-status">
                {isLeisureGoalMet ? '✅' : leisureProgress >= 80 ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${leisureProgress}%`,
                    backgroundColor: getProgressColor(leisureProgress, isLeisureGoalMet)
                  }}
                />
              </div>
              <div className="goal-values">
                <span className="current-value">€{currentLeisure}</span>
                <span className="separator">/</span>
                <span className="target-value">€{state.financialGoals.maxLeisureSpending}</span>
              </div>
            </div>
          </div>

          {/* Emergency Fund */}
          <div className={`goal-item ${getGoalStatus(isEmergencyGoalMet, emergencyProgress)}`}>
            <div className="goal-header">
              <span className="goal-label">
                {translations[currentLanguage].emergencyFund || 'Emergency Fund'}
              </span>
              <span className="goal-status">
                {isEmergencyGoalMet ? '✅' : emergencyProgress >= 80 ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${emergencyProgress}%`,
                    backgroundColor: getProgressColor(emergencyProgress, isEmergencyGoalMet)
                  }}
                />
              </div>
              <div className="goal-values">
                <span className="current-value">€{totalEmergencyFund}</span>
                <span className="separator">/</span>
                <span className="target-value">€{state.financialGoals.emergencyFundTarget}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoals; 
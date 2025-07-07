import React from 'react';
import { useBudget } from '../contexts/BudgetContext';
import ExpenseSummary from './ExpenseSummary';
import ExpenseCharts from './ExpenseCharts';
import AIPredictions from './AIPredictions';
import FinancialGoals from './FinancialGoals';

const CustomizableDashboard = ({ translations, currentLanguage, isDarkMode }) => {
  const { state } = useBudget();
  const { income, expenses, sharedExpenses } = state;

  // Calculate totals with validation
  const totalExpenses = Object.entries(expenses).reduce((total, [key, value]) => {
    const isShared = sharedExpenses[key];
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    if (key === 'apl') {
      const aplReduction = isShared ? numValue / 2 : numValue;
      return total - aplReduction;
    }
    const adjustedValue = isShared ? numValue / 2 : numValue;
    return total + adjustedValue;
  }, 0);
  
  const balance = (typeof income === 'number' && !isNaN(income) ? income : 0) - totalExpenses;

  // Fixed widget configuration
  const widgets = [
    {
      id: 'summary',
      title: translations[currentLanguage].expenseSummary || 'Expense Summary',
      type: 'summary',
      size: 'medium'
    },
    {
      id: 'charts',
      title: translations[currentLanguage].expenseCharts || 'Expense Charts',
      type: 'charts',
      size: 'large'
    },
    {
      id: 'ai-predictions',
      title: translations[currentLanguage].aiPredictions || 'AI Predictions',
      type: 'ai-predictions',
      size: 'large'
    },
    {
      id: 'goals',
      title: translations[currentLanguage].financialGoals || 'Financial Goals',
      type: 'goals',
      size: 'medium'
    },

  ];

  // Render widget content
  const renderWidgetContent = (widget) => {
    const commonProps = {
      translations,
      currentLanguage,
      isDarkMode
    };

    switch (widget.type) {
      case 'summary':
        return (
          <ExpenseSummary 
            totalExpenses={totalExpenses}
            balance={balance}
            income={income}
            {...commonProps}
          />
        );
      case 'charts':
        return (
          <ExpenseCharts 
            expenses={expenses}
            balance={balance}
            {...commonProps}
          />
        );
      case 'ai-predictions':
        return <AIPredictions {...commonProps} />;
      case 'goals':
        return <FinancialGoals {...commonProps} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  // Get widget size classes
  const getWidgetSizeClass = (size) => {
    switch (size) {
      case 'small': return 'widget-small';
      case 'medium': return 'widget-medium';
      case 'large': return 'widget-large';
      default: return 'widget-medium';
    }
  };

  return (
    <div className="customizable-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>📊 {translations[currentLanguage].customizableDashboard || 'Customizable Dashboard'}</h2>
        <p>{translations[currentLanguage].dashboardDescription || 'Your personalized financial overview'}</p>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={`dashboard-widget ${getWidgetSizeClass(widget.size)}`}
          >
            <div className="widget-header">
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {renderWidgetContent(widget)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomizableDashboard; 
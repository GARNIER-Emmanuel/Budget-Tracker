import React, { useState } from 'react';
import { FaCalendarAlt, FaEuroSign, FaBullseye, FaListUl, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MonthSelector from './MonthSelector';
import FinancialGoals from './FinancialGoals';
import CollapsibleExpenseCategory from './CollapsibleExpenseCategory';
import { translations } from '../translations';

const BudgetInputPanel = ({
  selectedMonth,
  onMonthChange,
  savedBudgets,
  currentLanguage,
  translations,
  incomeInput,
  setIncomeInput,
  autreArgentInput,
  setAutreArgentInput,
  onIncomeBlur,
  onAutreArgentBlur,
  expenses,
  onExpenseChange,
  sharedExpenses,
  onSharedChange,
  expenseCategories
}) => {
  const [activeTab, setActiveTab] = useState('month');
  const [expandedSections, setExpandedSections] = useState({
    month: true,
    income: true,
    goals: true,
    expenses: true
  });

  const t = translations[currentLanguage] || {};

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'month', icon: <FaCalendarAlt />, label: t.selectMonth || 'Mois' },
    { id: 'income', icon: <FaEuroSign />, label: t.monthlyIncome || 'Revenus' },
    { id: 'goals', icon: <FaBullseye />, label: t.financialGoals || 'Objectifs' },
    { id: 'expenses', icon: <FaListUl />, label: t.expenses || 'Dépenses' }
  ];

  return (
    <div className="budget-input-panel">
      {/* Header avec onglets */}
      <div className="panel-header">
        <div className="panel-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="panel-content">
        {/* Onglet Mois */}
        {activeTab === 'month' && (
          <div className="tab-content">
            <div className="section-header" onClick={() => toggleSection('month')}>
              <h3>{t.selectMonth || 'Sélection du mois'}</h3>
              {expandedSections.month ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.month && (
              <div className="section-content">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onMonthChange={onMonthChange}
                  savedBudgets={savedBudgets}
                  translations={translations}
                  currentLanguage={currentLanguage}
                />
              </div>
            )}
          </div>
        )}

        {/* Onglet Revenus */}
        {activeTab === 'income' && (
          <div className="tab-content">
            <div className="section-header" onClick={() => toggleSection('income')}>
              <h3>{t.monthlyIncome || 'Monthly Income'}</h3>
              {expandedSections.income ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.income && (
              <div className="section-content">
                <div className="income-inputs">
                  <div className="income-input-card">
                    <div className="input-group">
                      <label className="input-label">{t.income || 'Revenus'}</label>
                      <div className="input-with-currency">
                        <span className="currency">€</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={incomeInput}
                          onChange={e => setIncomeInput(e.target.value)}
                          onBlur={onIncomeBlur}
                          className="form-input"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="income-input-card">
                    <div className="input-group">
                      <label className="input-label">{t.otherIncome || 'Autre argent reçu'}</label>
                      <div className="input-with-currency">
                        <span className="currency">€</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={autreArgentInput}
                          onChange={e => setAutreArgentInput(e.target.value)}
                          onBlur={onAutreArgentBlur}
                          className="form-input"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Objectifs */}
        {activeTab === 'goals' && (
          <div className="tab-content">
            <div className="section-header" onClick={() => toggleSection('goals')}>
              <h3>{t.financialGoals || 'Financial Goals'}</h3>
              {expandedSections.goals ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.goals && (
              <div className="section-content">
                <FinancialGoals
                  translations={translations}
                  currentLanguage={currentLanguage}
                />
              </div>
            )}
          </div>
        )}

        {/* Onglet Dépenses */}
        {activeTab === 'expenses' && (
          <div className="tab-content">
            <div className="section-header" onClick={() => toggleSection('expenses')}>
              <h3>{t.expenses || 'Dépenses'}</h3>
              {expandedSections.expenses ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSections.expenses && (
              <div className="section-content">
                <div className="expense-categories">
                  {Object.entries(expenseCategories).map(([category, expenseKeys], index) => (
                    <div key={category} className="category-section">
                      <CollapsibleExpenseCategory
                        category={category}
                        expenseKeys={expenseKeys}
                        expenses={expenses}
                        onExpenseChange={onExpenseChange}
                        sharedExpenses={sharedExpenses}
                        onSharedChange={onSharedChange}
                        translations={translations}
                        currentLanguage={currentLanguage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetInputPanel; 
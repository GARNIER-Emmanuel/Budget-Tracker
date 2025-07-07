import React, { useState, useRef } from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';

const DataManager = ({ translations, currentLanguage }) => {
  const { state, dispatch } = useBudget();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Export functions
  const exportToJSON = () => {
    const data = {
          savedBudgets: state.savedBudgets,
    financialGoals: state.financialGoals,
      uiPreferences: state.uiPreferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Add notification
    dispatch({
      type: BUDGET_ACTIONS.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        type: 'success',
        message: translations[currentLanguage].exportSuccess || 'Data exported successfully!',
        duration: 3000
      }
    });
  };

  const exportToCSV = () => {
    if (state.savedBudgets.length === 0) {
      dispatch({
        type: BUDGET_ACTIONS.ADD_NOTIFICATION,
        payload: {
          id: Date.now(),
          type: 'warning',
          message: translations[currentLanguage].noDataToExport || 'No data to export',
          duration: 3000
        }
      });
      return;
    }

    // Create CSV content
    const headers = ['Month', 'Year', 'Income', 'Total Expenses', 'Balance', 'Rent', 'APL', 'Electricity', 'Internet', 'Phone', 'Subscriptions', 'Home Insurance', 'Car Insurance', 'Gym', 'Food', 'Gas', 'Cat Food', 'Leisure', 'Shopping', 'Savings', 'Emergency Fund'];
    
    const csvContent = [
      headers.join(','),
      ...state.savedBudgets.map(budget => [
        budget.month,
        budget.year,
        budget.income,
        budget.totalExpenses,
        budget.balance,
        budget.expenses.rent,
        budget.expenses.apl,
        budget.expenses.electricity,
        budget.expenses.internet,
        budget.expenses.phone,
        budget.expenses.subscriptions,
        budget.expenses.insuranceHome,
        budget.expenses.insuranceCar,
        budget.expenses.gym,
        budget.expenses.food,
        budget.expenses.gas,
        budget.expenses.catFood,
        budget.expenses.leisure,
        budget.expenses.shopping,
        budget.expenses.savings,
        budget.expenses.unforeseen
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dispatch({
      type: BUDGET_ACTIONS.ADD_NOTIFICATION,
      payload: {
        id: Date.now(),
        type: 'success',
        message: translations[currentLanguage].csvExportSuccess || 'CSV exported successfully!',
        duration: 3000
      }
    });
  };

  // Import functions
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let data;

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(content);
        } else {
          throw new Error(translations[currentLanguage].unsupportedFileType || 'Unsupported file type');
        }

        // Validate and import data
        if (data.savedBudgets && Array.isArray(data.savedBudgets)) {
          // Import saved budgets
          data.savedBudgets.forEach(budget => {
            dispatch({
              type: BUDGET_ACTIONS.SAVE_BUDGET,
              payload: budget
            });
          });
          // Met à jour le budget courant avec le dernier importé
          if (data.savedBudgets.length > 0) {
            const lastBudget = data.savedBudgets[data.savedBudgets.length - 1];
            dispatch({
              type: BUDGET_ACTIONS.LOAD_BUDGET,
              payload: lastBudget
            });
            dispatch({
              type: BUDGET_ACTIONS.SET_SELECTED_MONTH,
              payload: `${lastBudget.month} ${lastBudget.year}`
            });
          }
        }

            if (data.financialGoals) {
      Object.entries(data.financialGoals).forEach(([key, value]) => {
        dispatch({
          type: BUDGET_ACTIONS.UPDATE_FINANCIAL_GOAL,
          payload: { key, value }
        });
      });
    }

        setImportSuccess(translations[currentLanguage].importSuccess || 'Data imported successfully!');
        
        dispatch({
          type: BUDGET_ACTIONS.ADD_NOTIFICATION,
          payload: {
            id: Date.now(),
            type: 'success',
            message: translations[currentLanguage].importSuccess || 'Data imported successfully!',
            duration: 3000
          }
        });

      } catch (error) {
        console.error('Import error:', error);
        setImportError(error.message || translations[currentLanguage].importError || 'Error importing data');
        
        dispatch({
          type: BUDGET_ACTIONS.ADD_NOTIFICATION,
          payload: {
            id: Date.now(),
            type: 'error',
            message: error.message || translations[currentLanguage].importError || 'Error importing data',
            duration: 5000
          }
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setImportError(translations[currentLanguage].fileReadError || 'Error reading file');
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const budgets = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const budget = {
          id: Date.now() + i,
          month: values[0],
          year: parseInt(values[1]),
          name: `${values[0]} ${values[1]}`,
          income: parseFloat(values[2]) || 0,
          autreArgentRecu: parseFloat(values[3]) || 0,
          totalExpenses: parseFloat(values[4]) || 0,
          balance: parseFloat(values[5]) || 0,
          expenses: {
            rent: parseFloat(values[6]) || 0,
            apl: parseFloat(values[7]) || 0,
            electricity: parseFloat(values[8]) || 0,
            internet: parseFloat(values[9]) || 0,
            phone: parseFloat(values[10]) || 0,
            subscriptions: parseFloat(values[11]) || 0,
            insuranceHome: parseFloat(values[12]) || 0,
            insuranceCar: parseFloat(values[13]) || 0,
            gym: parseFloat(values[14]) || 0,
            food: parseFloat(values[15]) || 0,
            gas: parseFloat(values[16]) || 0,
            catFood: parseFloat(values[17]) || 0,
            leisure: parseFloat(values[18]) || 0,
            shopping: parseFloat(values[19]) || 0,
            fraisBancaire: parseFloat(values[20]) || 0,
            imprevu: parseFloat(values[21]) || 0,
            savings: parseFloat(values[22]) || 0,
            unforeseen: parseFloat(values[23]) || 0,
          },
          sharedExpenses: {},
          date: new Date().toISOString()
        };
        budgets.push(budget);
      }
    }

    return { savedBudgets: budgets };
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="data-manager-card">
      <h3>{translations[currentLanguage].dataManagement || 'Data Management'}</h3>
      
      <div className="data-actions">
        <div className="export-section">
          <h4>{translations[currentLanguage].exportData || 'Export Data'}</h4>
          <div className="export-buttons">
            <button onClick={exportToJSON} className="export-json-button">
              📄 {translations[currentLanguage].exportJSON || 'Export JSON'}
            </button>
            <button onClick={exportToCSV} className="export-csv-button">
              📊 {translations[currentLanguage].exportCSV || 'Export CSV'}
            </button>
          </div>
        </div>

        <div className="import-section">
          <h4>{translations[currentLanguage].importData || 'Import Data'}</h4>
          <button 
            onClick={handleImportClick}
            className="import-button"
            disabled={isImporting}
          >
            {isImporting ? '⏳' : '📥'} {translations[currentLanguage].importData || 'Import Data'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <p className="import-hint">
            {translations[currentLanguage].importHint || 'Supported formats: JSON, CSV'}
          </p>
        </div>
      </div>

      {importError && (
        <div className="import-error">
          ❌ {importError}
        </div>
      )}

      {importSuccess && (
        <div className="import-success">
          ✅ {importSuccess}
        </div>
      )}

      <div className="data-info">
        <p>
          <strong>{translations[currentLanguage].savedBudgets || 'Saved Budgets'}:</strong> {state.savedBudgets.length}
        </p>
        <p>
          
        </p>
      </div>
    </div>
  );
};

export default DataManager; 
import React, { useState } from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import { FaFileImport } from 'react-icons/fa';
import { translations } from '../translations';
import DataManager from './DataManager';
import BudgetInputPanel from './BudgetInputPanel';

// Liste des catégories disponibles (à adapter si besoin)
const CATEGORY_OPTIONS = [
  { key: 'income', label: 'Salaire / Crédit' },
  { key: 'autreArgentRecu', label: 'Autre argent reçu' },
  { key: 'rent', label: 'Loyer' },
  { key: 'apl', label: 'APL' },
  { key: 'electricity', label: 'Électricité' },
  { key: 'internet', label: 'Internet' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'subscriptions', label: 'Abonnements' },
  { key: 'insuranceHome', label: 'Assurance habitation' },
  { key: 'insuranceCar', label: 'Assurance voiture' },
  { key: 'gym', label: 'Salle de sport' },
  { key: 'food', label: 'Alimentation' },
  { key: 'gas', label: 'Essence' },
  { key: 'catFood', label: 'Nourriture chat' },
  { key: 'leisure', label: 'Loisirs' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'fraisBancaire', label: 'Frais bancaire' },
  { key: 'imprevu', label: 'Imprévu' },
  { key: 'savings', label: 'Épargne' },
  { key: 'unforeseen', label: 'Fonds d\'urgence' },
  { key: 'other', label: 'Autre (non catégorisé)' },
];

// Récupère le mapping existant ou initialise
const getCategoryMapping = () => {
  try {
    return JSON.parse(localStorage.getItem('bankCategoryMapping') || '{}');
  } catch {
    return {};
  }
};

// Sauvegarde le mapping
const saveCategoryMapping = (mapping) => {
  localStorage.setItem('bankCategoryMapping', JSON.stringify(mapping));
};

// Modifie guessCategory pour utiliser le mapping
function guessCategory(label, amount) {
  const mapping = getCategoryMapping();
  if (mapping[label]) return mapping[label];
  const l = label.toLowerCase();
  if (l.includes('loyer')) return 'rent';
  if (l.includes('salaire') || (amount > 0 && l.includes('credit'))) return 'income';
  if (l.includes('monoprix') || l.includes('carrefour') || l.includes('supermarch')) return 'food';
  if (l.includes('edf') || l.includes('electric')) return 'electricity';
  if (l.includes('internet') || l.includes('box')) return 'internet';
  if (l.includes('netflix') || l.includes('spotify') || l.includes('abonnement')) return 'subscriptions';
  if (l.includes('essence') || l.includes('station')) return 'gas';
  if (l.includes('chat')) return 'catFood';
  if (l.includes('loisir')) return 'leisure';
  if (l.includes('shopping')) return 'shopping';
  if (l.includes('imprevu')) return 'imprevu';
  if (l.includes('frais') && l.includes('banc')) return 'fraisBancaire';
  if (l.includes('epargne')) return 'savings';
  if (l.includes('assurance') && l.includes('habitation')) return 'insuranceHome';
  if (l.includes('assurance') && l.includes('voiture')) return 'insuranceCar';
  if (l.includes('gym') || l.includes('sport')) return 'gym';
  return 'other';
}

const BankStatementImporter = () => {
  const { state, dispatch } = useBudget();
  const [transactions, setTransactions] = useState([]);
  const [step, setStep] = useState('import');
  const [importError, setImportError] = useState('');
  const [incomeInput, setIncomeInput] = useState(String(state.income || ''));
  const [autreArgentInput, setAutreArgentInput] = useState(String(state.autreArgentRecu || ''));
  const [quickEntry, setQuickEntry] = useState({ category: '', amount: '', description: '' });
  const [quickEntries, setQuickEntries] = useState([]);
  const fileInputRef = React.useRef();
  const currentLanguage = state?.currentLanguage || 'fr';
  const t = translations[currentLanguage] || {};

  // Update input values when state changes
  React.useEffect(() => {
    setIncomeInput(String(state.income || ''));
  }, [state.income]);

  React.useEffect(() => {
    setAutreArgentInput(String(state.autreArgentRecu || ''));
  }, [state.autreArgentRecu]);

  // Group expenses by category
  const expenseCategories = {
    [t.fixedExpenses || 'Dépenses Fixes']: ['rent', 'apl', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'],
    [t.variableExpenses || 'Dépenses Variables']: ['food', 'gas', 'catFood', 'leisure', 'shopping', 'fraisBancaire', 'imprevu'],
    [t.savingsEmergency || 'Épargne & Urgences']: ['savings', 'unforeseen']
  };

  // Handle expense changes
  const handleExpenseChange = (key, value) => {
    dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value } });
  };

  // Handle shared expense changes
  const handleSharedChange = (key, isShared) => {
    dispatch({ type: BUDGET_ACTIONS.UPDATE_SHARED_EXPENSE, payload: { key, value: isShared } });
  };

  // Handle month change
  const handleMonthChange = (monthKey) => {
    dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
    
    // Check if the selected month has saved data
    const selectedMonthBudget = state.savedBudgets.find(budget => budget.name === monthKey);
    
    if (!selectedMonthBudget) {
      // Reset non-fixed fields when selecting a month without saved data
      const fixedExpenseKeys = ['rent', 'apl', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'];
      
      // Reset income fields
      setIncomeInput('0');
      setAutreArgentInput('0');
      dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: 0 });
      dispatch({ type: BUDGET_ACTIONS.UPDATE_AUTRE_ARGENT_RECU, payload: 0 });
      
      // Reset non-fixed expenses to 0
      Object.keys(state.expenses).forEach(key => {
        if (!fixedExpenseKeys.includes(key)) {
          dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key, value: 0 } });
        }
      });
    } else {
      // Load saved data into inputs
      setIncomeInput(String(selectedMonthBudget.income - (selectedMonthBudget.autreArgentRecu || 0)));
      setAutreArgentInput(String(selectedMonthBudget.autreArgentRecu || 0));
    }
  };

  // Handle income input blur
  const handleIncomeBlur = () => {
    const val = incomeInput?.replace(',', '.');
    const num = Number(val);
    dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: isNaN(num) ? 0 : num });
  };

  // Handle autre argent input blur
  const handleAutreArgentBlur = () => {
    const val = autreArgentInput?.replace(',', '.');
    const num = Number(val);
    dispatch({ type: BUDGET_ACTIONS.UPDATE_AUTRE_ARGENT_RECU, payload: isNaN(num) ? 0 : num });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const lines = evt.target.result.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',');
        const dateIdx = headers.findIndex(h => h.toLowerCase().includes('date'));
        const labelIdx = headers.findIndex(h => h.toLowerCase().includes('libell'));
        const amountIdx = headers.findIndex(h => h.toLowerCase().includes('montant'));
        if (dateIdx === -1 || labelIdx === -1 || amountIdx === -1) throw new Error('Colonnes attendues : Date, Libellé, Montant');
        const txs = lines.slice(1).map(line => {
          const cols = line.split(',');
          const amount = parseFloat(cols[amountIdx].replace(',', '.'));
          return {
            date: cols[dateIdx],
            label: cols[labelIdx],
            amount,
            category: guessCategory(cols[labelIdx], amount)
          };
        });
        setTransactions(txs);
        setStep('categorize');
        setImportError('');
      } catch (err) {
        setImportError('Erreur import : ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCategoryChange = (idx, newCat) => {
    setTransactions(txs => txs.map((t, i) => i === idx ? { ...t, category: newCat } : t));
  };

  const handleValidate = () => {
    // Sauvegarde le mapping libellé -> catégorie
    const mapping = getCategoryMapping();
    transactions.forEach(tx => {
      if (tx.label && tx.category) {
        mapping[tx.label] = tx.category;
      }
    });
    saveCategoryMapping(mapping);

    // Sélection automatique du mois/année de la première transaction
    if (transactions.length > 0 && transactions[0].date) {
      const dateStr = transactions[0].date;
      let d = null;
      if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        d = new Date(dateStr);
      } else if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        d = new Date(`${year}-${month}-${day}`);
      }
      if (d && !isNaN(d.getTime())) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
      }
    }

    // Répartit les montants dans le budget courant (remplacement total)
    // 1. Calcule les sommes importées par catégorie
    const categorySums = {};
    let importedIncome = null;
    let importedAutreArgent = null;
    transactions.forEach(tx => {
      if (tx.category === 'income') {
        importedIncome = tx.amount;
      } else if (tx.category === 'autreArgentRecu') {
        importedAutreArgent = tx.amount;
      } else if (CATEGORY_OPTIONS.some(opt => opt.key === tx.category && tx.category !== 'other')) {
        if (!categorySums[tx.category]) categorySums[tx.category] = 0;
        categorySums[tx.category] += Math.abs(tx.amount);
      }
    });
    // 2. Remet à zéro toutes les catégories (dépenses, income, autreArgentRecu)
    dispatch({ type: BUDGET_ACTIONS.UPDATE_INCOME, payload: importedIncome !== null ? importedIncome : 0 });
    dispatch({ type: BUDGET_ACTIONS.UPDATE_AUTRE_ARGENT_RECU, payload: importedAutreArgent !== null ? importedAutreArgent : 0 });
    CATEGORY_OPTIONS.forEach(opt => {
      if (opt.key !== 'income' && opt.key !== 'autreArgentRecu' && opt.key !== 'other') {
        dispatch({ type: BUDGET_ACTIONS.UPDATE_EXPENSE, payload: { key: opt.key, value: categorySums[opt.key] || 0 } });
      }
    });
    setStep('done');
  };

  // Handle save budget
  const handleSaveBudget = () => {
    // Use selected month or current month
    let monthKey = state.selectedMonth || (() => {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('en-US', { month: 'long' });
      const year = currentDate.getFullYear();
      return `${month} ${year}`;
    })();
    
    // Calculate total expenses with shared cost adjustment and APL reduction
    const totalExpenses = Object.entries(state.expenses).reduce((total, [key, value]) => {
      const isShared = state.sharedExpenses[key];
      
      // Special handling for APL (housing allowance)
      if (key === 'apl') {
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      
      // If shared, divide by 2 (assuming equal split)
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);

    // Calculate total income
    const totalIncome = (Number(state.income) || 0) + (Number(state.autreArgentRecu) || 0);
    const balance = totalIncome - totalExpenses;
    
    const budgetData = {
      id: Date.now(),
      name: monthKey,
      month: monthKey.split(' ')[0],
      year: parseInt(monthKey.split(' ')[1]),
      date: new Date().toISOString(),
      income: totalIncome,
      autreArgentRecu: state.autreArgentRecu || 0,
      totalExpenses: totalExpenses,
      balance: balance,
      expenses: state.expenses,
      sharedExpenses: state.sharedExpenses
    };

    dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: budgetData });
    
    // Add notification
    const existingBudgetIndex = state.savedBudgets.findIndex(budget => budget.name === monthKey);
    const message = existingBudgetIndex !== -1 
      ? (t.budgetUpdated || 'Budget mis à jour avec succès !')
      : (t.budgetSaved || 'Budget sauvegardé avec succès !');
    
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

  // Calculate dynamic summary based on selected month
  const calculateSummary = () => {
    // Get selected month data
    const selectedMonthKey = state.selectedMonth;
    const selectedMonthBudget = state.savedBudgets.find(budget => budget.name === selectedMonthKey);
    
    if (selectedMonthBudget) {
      // Use saved budget data
      const totalExpenses = selectedMonthBudget.totalExpenses || 0;
      const totalIncome = selectedMonthBudget.income || 0;
      const balance = selectedMonthBudget.balance || 0;
      const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

      return {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        isSavedBudget: true,
        budget: selectedMonthBudget
      };
    } else {
      // Use current state data (for unsaved months)
      const totalExpenses = Object.entries(state.expenses).reduce((total, [key, value]) => {
        const isShared = state.sharedExpenses[key];
        
        // Special handling for APL (housing allowance)
        if (key === 'apl') {
          const aplReduction = isShared ? value / 2 : value;
          return total - aplReduction;
        }
        
        // If shared, divide by 2 (assuming equal split)
        const adjustedValue = isShared ? value / 2 : value;
        return total + adjustedValue;
      }, 0);

      const totalIncome = (Number(state.income) || 0) + (Number(state.autreArgentRecu) || 0);
      const balance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

      return {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        isSavedBudget: false,
        budget: null
      };
    }
  };

  const summary = calculateSummary();

  // Handle quick add expense
  const handleQuickAdd = () => {
    if (!quickEntry.category || !quickEntry.amount) return;
    
    const amount = parseFloat(quickEntry.amount.replace(',', '.'));
    if (isNaN(amount)) return;
    
    // Add to current expenses
    const currentAmount = state.expenses[quickEntry.category] || 0;
    dispatch({ 
      type: BUDGET_ACTIONS.UPDATE_EXPENSE, 
      payload: { key: quickEntry.category, value: currentAmount + amount } 
    });
    
    // Add to quick entries history
    const newEntry = {
      ...quickEntry,
      amount: amount.toFixed(2),
      time: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    setQuickEntries(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    
    // Reset form
    setQuickEntry({ category: '', amount: '', description: '' });
  };

  return (
    <div className="tracker-container">
      <header className="page-header">
        <h1 className="page-title">{t.trackerTitle || 'Suivi mensuel'}</h1>
        <p className="page-description">{t.trackerDesc || 'Importez vos relevés, saisissez vos dépenses et suivez votre budget en temps réel.'}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleSaveBudget}
          >
            💾 {t.saveBudget || 'Sauvegarder le budget'}
          </button>
        </div>
      </header>
      
      <div className="tracker-grid">
        {/* Colonne principale */}
        <div className="tracker-main">
          <section className="card import-section">
            <h2 className="card-title">
              <FaFileImport className="section-icon" />
              {t.importSection || 'Import de relevé bancaire'}
            </h2>
            
            <div className="import-controls">
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <FaFileImport className="btn-icon" />
                {t.importFileButton || 'Importer un fichier'}
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden-input" />
            </div>
            
            {importError && <div className="error-message">{importError}</div>}
            
            <div className="import-help">
              {t.importHelp || 'Importez un fichier CSV avec les colonnes Date, Libellé, Montant.'}
            </div>
            
            {transactions.length > 0 && (
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>{t.importDateHeader || 'Date'}</th>
                      <th>{t.importLabelHeader || 'Libellé'}</th>
                      <th>{t.importAmountHeader || 'Montant'}</th>
                      <th>{t.importCategoryHeader || 'Catégorie'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="transaction-row">
                        <td>{tx.date}</td>
                        <td>{tx.label}</td>
                        <td className={`amount ${tx.amount < 0 ? 'negative' : 'positive'}`}>
                          {tx.amount}
                          <button
                            className="btn btn-sm btn-secondary toggle-amount"
                            title={t.importToggleAmount || 'Inverser débit/crédit'}
                            onClick={() => setTransactions(txs => txs.map((t, i) => i === idx ? { ...t, amount: -t.amount } : t))}
                          >
                            ↔️
                          </button>
                        </td>
                        <td>
                          <select 
                            value={tx.category} 
                            onChange={e => handleCategoryChange(idx, e.target.value)}
                            className="form-select"
                          >
                            {CATEGORY_OPTIONS.map(opt => (
                              <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <button 
                  className="btn btn-success btn-large"
                  onClick={handleValidate}
                >
                  {t.importValidateButton || 'Valider et répartir'}
                </button>
              </div>
            )}
          </section>
          
          <section className="card quick-entry-section">
            <h2 className="card-title">⚡ {t.quickEntry || 'Saisie rapide'}</h2>
            <div className="quick-entry-form">
              <div className="quick-entry-row">
                <div className="quick-input-group">
                  <label className="quick-label">{t.expenseCategory || 'Catégorie'}</label>
                  <select 
                    className="form-select"
                    value={quickEntry.category}
                    onChange={(e) => setQuickEntry(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">{t.selectCategory || 'Sélectionner une catégorie'}</option>
                    {CATEGORY_OPTIONS.filter(opt => opt.key !== 'income' && opt.key !== 'autreArgentRecu').map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="quick-input-group">
                  <label className="quick-label">{t.amount || 'Montant'}</label>
                  <div className="input-with-currency">
                    <span className="currency">€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="form-input"
                      placeholder="0.00"
                      value={quickEntry.amount}
                      onChange={(e) => setQuickEntry(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="quick-input-group">
                  <label className="quick-label">{t.description || 'Description'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t.optionalDescription || 'Description optionnelle'}
                    value={quickEntry.description}
                    onChange={(e) => setQuickEntry(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="quick-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleQuickAdd}
                    disabled={!quickEntry.category || !quickEntry.amount}
                  >
                    ➕ {t.addExpense || 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Liste des dépenses rapides ajoutées */}
            {quickEntries.length > 0 && (
              <div className="quick-entries-list">
                <h3 className="quick-subtitle">{t.recentEntries || 'Dépenses récentes'}</h3>
                <div className="quick-entries">
                  {quickEntries.map((entry, index) => (
                    <div key={index} className="quick-entry-item">
                      <div className="quick-entry-info">
                        <div className="quick-entry-category">
                          {CATEGORY_OPTIONS.find(opt => opt.key === entry.category)?.label || entry.category}
                        </div>
                        <div className="quick-entry-description">
                          {entry.description || t.noDescription || 'Aucune description'}
                        </div>
                        <div className="quick-entry-time">
                          {entry.time}
                        </div>
                      </div>
                      <div className="quick-entry-amount">
                        €{parseFloat(entry.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          
          <section className="card summary-section">
            <h2 className="card-title">{t.monthSummary || 'Résumé du mois'}</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon success">💰</div>
                <div className="summary-content">
                  <div className="summary-label">{t.income || 'Revenus'}</div>
                  <div className="summary-value success">
                    €{summary.totalIncome.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon error">💸</div>
                <div className="summary-content">
                  <div className="summary-label">{t.expenses || 'Dépenses'}</div>
                  <div className="summary-value error">
                    €{summary.totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className={`summary-icon ${summary.balance >= 0 ? 'success' : 'error'}`}>
                  {summary.balance >= 0 ? '✅' : '❌'}
                </div>
                <div className="summary-content">
                  <div className="summary-label">{t.balance || 'Solde'}</div>
                  <div className={`summary-value ${summary.balance >= 0 ? 'success' : 'error'}`}>
                    €{summary.balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon primary">📊</div>
                <div className="summary-content">
                  <div className="summary-label">{t.savingsRate || 'Taux d\'épargne'}</div>
                  <div className={`summary-value ${summary.savingsRate >= 20 ? 'success' : summary.savingsRate >= 10 ? 'warning' : 'error'}`}>
                    {summary.savingsRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Détail des revenus */}
            <div className="summary-details">
              <h3 className="summary-subtitle">{t.incomeBreakdown || 'Détail des revenus'}</h3>
              <div className="detail-list">
                <div className="detail-item">
                  <span className="detail-label">{t.income || 'Revenus'}</span>
                  <span className="detail-value success">
                    €{summary.isSavedBudget 
                      ? (summary.budget.income - (summary.budget.autreArgentRecu || 0)).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                      : (Number(state.income) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                    }
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t.otherIncome || 'Autre argent reçu'}</span>
                  <span className="detail-value success">
                    €{summary.isSavedBudget 
                      ? (summary.budget.autreArgentRecu || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                      : (Number(state.autreArgentRecu) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Top dépenses */}
            <div className="summary-details">
              <h3 className="summary-subtitle">{t.topExpenses || 'Top dépenses'}</h3>
              <div className="detail-list">
                {(summary.isSavedBudget ? summary.budget.expenses : state.expenses) && 
                  Object.entries(summary.isSavedBudget ? summary.budget.expenses : state.expenses)
                    .filter(([key, value]) => value > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key} className="detail-item">
                        <span className="detail-label">
                          {t[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="detail-value error">
                          €{value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>
            
            {/* Indicateur de statut */}
            {summary.isSavedBudget && (
              <div className="summary-status">
                <div className="status-indicator saved">
                  💾 {t.savedBudget || 'Budget sauvegardé'}
                </div>
              </div>
            )}
          </section>
          
          <section className="card data-management-section">
            <h2 className="card-title">{t.dataManagement || 'Gestion des données'}</h2>
            <DataManager
              translations={translations}
              currentLanguage={currentLanguage}
            />
          </section>
        </div>
        
        {/* Colonne latérale avec le panneau de saisie */}
        <div className="tracker-sidebar">
          <BudgetInputPanel
            selectedMonth={state.selectedMonth}
            onMonthChange={handleMonthChange}
            savedBudgets={state.savedBudgets}
            currentLanguage={currentLanguage}
            translations={translations}
            incomeInput={incomeInput}
            setIncomeInput={setIncomeInput}
            autreArgentInput={autreArgentInput}
            setAutreArgentInput={setAutreArgentInput}
            onIncomeBlur={handleIncomeBlur}
            onAutreArgentBlur={handleAutreArgentBlur}
            expenses={state.expenses}
            onExpenseChange={handleExpenseChange}
            sharedExpenses={state.sharedExpenses}
            onSharedChange={handleSharedChange}
            expenseCategories={expenseCategories}
          />
        </div>
      </div>
    </div>
  );
};

export default BankStatementImporter; 
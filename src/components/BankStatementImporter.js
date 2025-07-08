import React, { useState } from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import { FaFileImport } from 'react-icons/fa';
import { translations } from '../translations';

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
  const fileInputRef = React.useRef();
  const currentLanguage = state?.currentLanguage || 'fr';
  const t = translations[currentLanguage] || {};

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

  return (
    <div className="tracker-root" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t.trackerTitle || 'Suivi mensuel'}</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>{t.trackerDesc || 'Importez vos relevés, saisissez vos dépenses et suivez votre budget en temps réel.'}</p>
      </header>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#2563eb', marginBottom: 12 }}>{t.importSection || 'Import de relevé bancaire'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FaFileImport style={{ color: '#2563eb', fontSize: 22 }} />
          <button
            style={{
              background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', padding: '0.75rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 4px rgba(37,99,235,0.08)' 
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <FaFileImport style={{ fontSize: 18 }} /> {t.importFileButton || 'Importer un fichier'}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
        </div>
        {importError && <div style={{ color: 'red', marginTop: '1rem' }}>{importError}</div>}
        <div style={{ color: '#64748b', fontSize: 15, marginBottom: 12 }}>{t.importHelp || 'Importez un fichier CSV avec les colonnes Date, Libellé, Montant.'}</div>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1rem' }}>{t.importDateHeader || 'Date'}</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1rem' }}>{t.importLabelHeader || 'Libellé'}</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1rem' }}>{t.importAmountHeader || 'Montant'}</th>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1rem' }}>{t.importCategoryHeader || 'Catégorie'}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx} style={{ background: idx % 2 ? '#f1f5f9' : 'white', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.5rem' }}>{tx.date}</td>
                  <td style={{ padding: '0.5rem' }}>{tx.label}</td>
                  <td style={{ padding: '0.5rem', color: tx.amount < 0 ? '#dc2626' : '#059669', fontWeight: 500 }}>
                    {tx.amount}
                    <button
                      style={{ marginLeft: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem', padding: '0.1rem 0.5rem' }}
                      title={t.importToggleAmount || 'Inverser débit/crédit'}
                      onClick={() => setTransactions(txs => txs.map((t, i) => i === idx ? { ...t, amount: -t.amount } : t))}
                    >
                      ↔️
                    </button>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <select value={tx.category} onChange={e => handleCategoryChange(idx, e.target.value)} style={{ padding: '0.4rem', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '1rem' }}>
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: '2rem', padding: '0.9rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(16,185,129,0.08)' }} onClick={handleValidate}>
            {t.importValidateButton || 'Valider et répartir'}
          </button>
        </div>
      </section>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: 12 }}>{t.quickEntry || 'Saisie rapide'}</h2>
        {/* ... inputs de revenus/dépenses ... */}
      </section>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#f59e42', marginBottom: 12 }}>{t.monthSummary || 'Résumé du mois'}</h2>
        {/* ... résumé du mois (solde, dépenses, revenus) ... */}
      </section>
    </div>
  );
};

export default BankStatementImporter; 
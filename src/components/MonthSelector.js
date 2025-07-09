import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaCircle, FaCalendarAlt } from 'react-icons/fa';

const MonthSelector = ({ 
  selectedMonth, 
  onMonthChange, 
  savedBudgets, 
  translations, 
  currentLanguage 
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthName, setSelectedMonthName] = useState(new Date().toLocaleString('en-US', { month: 'long' }));

  // Synchronise l'état local avec la prop selectedMonth
  useEffect(() => {
    if (selectedMonth) {
      const [month, year] = selectedMonth.split(' ');
      if (month && year) {
        setSelectedMonthName(month);
        setSelectedYear(Number(year));
      }
    }
  }, [selectedMonth]);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  // Available months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year ± 5 years)
  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  const years = generateYears();

  // Handle month change
  const handleMonthChange = (month) => {
    setSelectedMonthName(month);
    const monthKey = `${month} ${selectedYear}`;
    onMonthChange(monthKey);
  };

  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
    const monthKey = `${selectedMonthName} ${year}`;
    onMonthChange(monthKey);
  };

  // Check if a month has saved data
  const hasSavedData = (monthKey) => {
    return savedBudgets.some(budget => budget.name === monthKey);
  };

  // Generate all months for the selected year
  const generateAllMonths = () => {
    return months.map(month => {
      const monthKey = `${month} ${selectedYear}`;
      const hasData = hasSavedData(monthKey);
      const isCurrentMonth = month === currentMonth && selectedYear === currentYear;
      const isSelected = monthKey === selectedMonth;
      
      return {
        month,
        monthKey,
        hasData,
        isCurrentMonth,
        isSelected
      };
    });
  };

  const allMonths = generateAllMonths();

  return (
    <div className="month-selector">
      <h3 className="heading-3 mb-4">{translations[currentLanguage]?.selectMonth || 'Select Month'}</h3>
      
      {/* Sélecteur d'année */}
      <div className="year-selector mb-4">
        <h4 className="heading-2 mb-2">{translations[currentLanguage]?.selectYear || 'Select Year'}</h4>
        <select
          className="input-field"
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          style={{ maxWidth: 120 }}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      {/* Grille de tous les mois */}
      <div className="all-months-grid mb-4">
        <h4 className="heading-2 mb-2">{translations[currentLanguage]?.allMonths || 'All Months'}</h4>
        <div className="months-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 'var(--spacing-2)' 
        }}>
          {allMonths.map(({ month, monthKey, hasData, isCurrentMonth, isSelected }) => (
            <button
              key={monthKey}
              className={`month-button ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                fontSize: 'var(--font-size-sm)', 
                padding: 'var(--spacing-3) var(--spacing-4)', 
                borderRadius: 'var(--border-radius-md)', 
                fontWeight: 600, 
                borderWidth: 2, 
                borderStyle: 'solid', 
                borderColor: isSelected ? 'var(--primary-color)' : 'var(--gray-200)', 
                background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-primary)', 
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)', 
                transition: 'all var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-2)',
                position: 'relative'
              }}
              onClick={() => onMonthChange(monthKey)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                <FaCalendarAlt style={{ fontSize: 'var(--font-size-xs)' }} />
                {month}
              </span>
              
              {/* Indicateur de statut */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                {hasData ? (
                  <FaCheckCircle 
                    style={{ 
                      color: isSelected ? 'var(--text-inverse)' : 'var(--success-color)',
                      fontSize: 'var(--font-size-sm)'
                    }} 
                    title={translations[currentLanguage]?.hasData || 'Has data'}
                  />
                ) : (
                  <FaCircle 
                    style={{ 
                      color: isSelected ? 'var(--text-inverse)' : 'var(--gray-400)',
                      fontSize: 'var(--font-size-xs)'
                    }} 
                    title={translations[currentLanguage]?.noData || 'No data'}
                  />
                )}
                
                {/* Indicateur mois actuel */}
                {isCurrentMonth && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-color)',
                    border: '2px solid var(--bg-primary)'
                  }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Légende */}
      <div className="month-legend" style={{ 
        padding: 'var(--spacing-3)', 
        background: 'var(--bg-secondary)', 
        borderRadius: 'var(--border-radius-md)',
        fontSize: 'var(--font-size-sm)'
      }}>
        <h5 className="heading-3 mb-2">{translations[currentLanguage]?.legend || 'Legend'}</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <FaCheckCircle style={{ color: 'var(--success-color)' }} />
            <span>{translations[currentLanguage]?.hasData || 'Has saved data'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <FaCircle style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-xs)' }} />
            <span>{translations[currentLanguage]?.noData || 'No data'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-color)'
            }} />
            <span>{translations[currentLanguage]?.currentMonth || 'Current month'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector; 
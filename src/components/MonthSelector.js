import React, { useState } from 'react';

const MonthSelector = ({ 
  selectedMonth, 
  onMonthChange, 
  savedBudgets, 
  translations, 
  currentLanguage 
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthName, setSelectedMonthName] = useState(new Date().toLocaleString('en-US', { month: 'long' }));

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

  // Get saved months for quick access
  const getSavedMonths = () => {
    const savedMonths = new Set();
    
    // Add current month
    savedMonths.add(`${currentMonth} ${currentYear}`);
    
    // Add months from saved budgets
    savedBudgets.forEach(budget => {
      savedMonths.add(budget.name);
    });
    
    return Array.from(savedMonths).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA; // Most recent first
    });
  };

  const savedMonths = getSavedMonths();

  return (
    <div className="month-selector">
      <h3>{translations[currentLanguage]?.selectMonth || 'Select Month'}</h3>
      
      <div className="month-year-selectors">
        <select
          className="month-select"
          value={selectedMonthName}
          onChange={(e) => handleMonthChange(e.target.value)}
        >
          {months.map(month => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        
        <select
          className="year-select"
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthSelector; 
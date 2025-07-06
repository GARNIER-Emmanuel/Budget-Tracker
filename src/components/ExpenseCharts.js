import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Component for displaying expense charts
const ExpenseCharts = ({ expenses, balance, translations, currentLanguage, isDarkMode = false }) => {
  // Filter out zero expenses, APL, and add balance
  const filteredData = Object.entries(expenses)
    .filter(([key, value]) => value > 0 && key !== 'apl') // Exclude APL from charts
    .sort(([_, a], [__, b]) => b - a);

  const labels = filteredData.map(([key, _]) => 
    translations[currentLanguage][key] || key.replace(/([A-Z])/g, ' $1').trim()
  );
  const dataValues = filteredData.map(([_, value]) => value);

  // Add balance to the data if positive
  const chartLabels = balance > 0 ? [...labels, translations[currentLanguage].remainingBalance] : labels;
  const chartData = balance > 0 ? [...dataValues, balance] : dataValues;

  // Color palette for charts
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#66FF66', '#FF6666', '#6699FF', '#FFCC99',
    '#CCCCCC', '#66CCCC', '#FF66CC', '#99FF99', '#CCCCFF',
    '#10B981' // Green for balance
  ];

  // Pie chart configuration
  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: colors.slice(0, chartLabels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: isDarkMode ? '#f9fafb' : '#374151',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        titleColor: isDarkMode ? '#f9fafb' : '#374151',
        bodyColor: isDarkMode ? '#f9fafb' : '#374151',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: €${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Bar chart configuration
  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Amount (€)',
        data: chartData,
        backgroundColor: colors.slice(0, chartLabels.length).map(color => 
          color + '80' // Add transparency
        ),
        borderColor: colors.slice(0, chartLabels.length),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        titleColor: isDarkMode ? '#f9fafb' : '#374151',
        bodyColor: isDarkMode ? '#f9fafb' : '#374151',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `€${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#374151',
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#374151',
          callback: function(value) {
            return '€' + value.toFixed(0);
          },
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="charts-container">
      {/* Pie Chart */}
      <div className="chart-card">
        <h3>{translations[currentLanguage].expenseDistribution}</h3>
        <div className="chart-container">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-card">
        <h3>{translations[currentLanguage].expenseBreakdown}</h3>
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts; 
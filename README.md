# Budget Tracker

A modern, responsive React application for tracking monthly income and expenses with beautiful visualizations.

## Features

- **Income Tracking**: Input your monthly income
- **Expense Categories**: Organized into Fixed, Variable, and Savings categories
- **Shared Expenses**: Mark expenses as shared to automatically divide costs by 2
- **Real-time Calculations**: Instant updates as you modify values
- **Visual Analytics**: Interactive pie chart and bar chart using Chart.js
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, minimalist design using Tailwind CSS

## Screenshots

The application features:
- Clean, modern interface with card-based layout
- Real-time expense breakdown and balance calculation
- Interactive charts showing expense distribution
- Responsive design that adapts to different screen sizes
- Color-coded summary cards for quick overview

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd budget-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Income
- Enter your monthly income in the "Monthly Income" field at the top

### Managing Expenses
- **Fixed Expenses**: Rent, utilities, subscriptions, insurance, gym membership
- **Variable Expenses**: Food, gas, leisure, shopping, pet expenses
- **Savings & Emergency**: Monthly savings and emergency fund allocation

### Shared Expenses
- Check the "Shared" checkbox for expenses you split with a partner/roommate
- Shared expenses are automatically divided by 2 in calculations
- Default shared expenses: Rent, Electricity, Internet, Home Insurance

### Understanding the Charts
- **Pie Chart**: Shows the distribution of all expenses and remaining balance
- **Bar Chart**: Displays expense amounts in descending order
- **Summary Cards**: Quick overview of income, total expenses, and balance

## Technology Stack

- **React 19**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Chart.js**: Interactive charts and graphs
- **React Chart.js 2**: React wrapper for Chart.js

## Project Structure

```
src/
├── components/
│   ├── ExpenseInput.js      # Reusable expense input component
│   ├── ExpenseSummary.js    # Summary cards component
│   └── ExpenseCharts.js     # Charts component
├── App.js                   # Main application component
├── index.js                 # Application entry point
└── index.css               # Global styles with Tailwind
```

## Customization

### Adding New Expense Categories
1. Add the expense key to the `expenses` state in `App.js`
2. Add the expense to the appropriate category in `expenseCategories`
3. Optionally add it to the shared expenses list

### Modifying Colors
- Update the color palette in `ExpenseCharts.js`
- Modify Tailwind classes in components for different styling

### Changing Currency
- Replace all "€" symbols with your preferred currency
- Update tooltip formatting in chart options

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (not recommended)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

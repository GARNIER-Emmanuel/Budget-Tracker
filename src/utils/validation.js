import { useState } from 'react';

// Validation schemas and utilities
export const VALIDATION_RULES = {
  // Income validation
  income: {
    required: true,
    min: 0,
    max: 1000000,
    pattern: /^\d+(\.\d{1,2})?$/,
    messages: {
      required: 'Income is required',
      min: 'Income must be positive',
      max: 'Income cannot exceed €1,000,000',
      pattern: 'Income must be a valid number (max 2 decimal places)',
      invalid: 'Please enter a valid income amount'
    }
  },

  // Expense validation
  expense: {
    required: true,
    min: 0,
    max: 100000,
    pattern: /^\d+(\.\d{1,2})?$/,
    messages: {
      required: 'Amount is required',
      min: 'Amount must be positive',
      max: 'Amount cannot exceed €100,000',
      pattern: 'Amount must be a valid number (max 2 decimal places)',
      invalid: 'Please enter a valid amount'
    }
  },

  // Category name validation
  categoryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s\-_]+$/,
    messages: {
      required: 'Category name is required',
      minLength: 'Category name must be at least 2 characters',
      maxLength: 'Category name cannot exceed 50 characters',
      pattern: 'Category name can only contain letters, spaces, hyphens and underscores',
      invalid: 'Please enter a valid category name'
    }
  },

  // Tag validation
  tag: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_]+$/,
    messages: {
      required: 'Tag is required',
      minLength: 'Tag must be at least 1 character',
      maxLength: 'Tag cannot exceed 20 characters',
      pattern: 'Tag can only contain letters, numbers, spaces, hyphens and underscores',
      invalid: 'Please enter a valid tag'
    }
  },

  // Financial goal validation
  financialGoal: {
    required: true,
    min: 0,
    max: 1000000,
    pattern: /^\d+(\.\d{1,2})?$/,
    messages: {
      required: 'Goal amount is required',
      min: 'Goal amount must be positive',
      max: 'Goal amount cannot exceed €1,000,000',
      pattern: 'Goal amount must be a valid number (max 2 decimal places)',
      invalid: 'Please enter a valid goal amount'
    }
  }
};

// Validation functions
export const validateField = (value, rules) => {
  const errors = [];

  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push(rules.messages.required);
    return errors;
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return errors;
  }

  // Type conversion for numeric values
  let numericValue = value;
  if (typeof value === 'string') {
    numericValue = parseFloat(value);
  }

  // Min validation
  if (rules.min !== undefined && numericValue < rules.min) {
    errors.push(rules.messages.min);
  }

  // Max validation
  if (rules.max !== undefined && numericValue > rules.max) {
    errors.push(rules.messages.max);
  }

  // Min length validation
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.push(rules.messages.minLength);
  }

  // Max length validation
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push(rules.messages.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.messages.pattern);
  }

  return errors;
};

// Validate expense data
export const validateExpenseData = (expenses) => {
  const errors = {};
  
  Object.entries(expenses).forEach(([key, value]) => {
    const fieldErrors = validateField(value, VALIDATION_RULES.expense);
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  });

  return errors;
};

// Validate income
export const validateIncome = (income) => {
  return validateField(income, VALIDATION_RULES.income);
};

// Validate category name
export const validateCategoryName = (name) => {
  return validateField(name, VALIDATION_RULES.categoryName);
};

// Validate tag
export const validateTag = (tag) => {
  return validateField(tag, VALIDATION_RULES.tag);
};

// Validate financial goal
export const validateFinancialGoal = (goal) => {
  return validateField(goal, VALIDATION_RULES.financialGoal);
};

// Check if form is valid
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

// Get first error message
export const getFirstError = (errors) => {
  if (typeof errors === 'string') return errors;
  if (Array.isArray(errors)) return errors[0];
  if (typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    return firstKey ? errors[firstKey][0] : null;
  }
  return null;
};

// Real-time validation hook
export const useValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, rules) => {
    const fieldErrors = validateField(value, rules);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors
    }));
    return fieldErrors;
  };

  const handleChange = (name, value, rules) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value, rules);
    }
  };

  const handleBlur = (name, value, rules) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value, rules);
  };

  const validateForm = (validationSchema) => {
    const newErrors = {};
    Object.keys(validationSchema).forEach(field => {
      const fieldErrors = validateField(values[field], validationSchema[field]);
      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors;
      }
    });
    setErrors(newErrors);
    return newErrors;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setValues
  };
}; 
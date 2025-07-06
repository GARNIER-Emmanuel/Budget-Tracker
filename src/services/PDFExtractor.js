import * as pdfjsLib from 'pdfjs-dist';

// Try to configure worker, fallback to no worker if it fails
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
} catch (error) {
  console.warn('Could not configure PDF.js worker, using fallback mode');
  // Disable worker completely
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
}

export class PDFExtractor {
  static async extractBudgetData(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      return this.parseBudgetText(fullText, file.name);
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      return null;
    }
  }
  
  static parseBudgetText(text, fileName) {
    console.log('Parsing text from PDF:', text.substring(0, 500) + '...');
    
    const data = {
      name: fileName,
      month: '',
      year: 2024,
      income: 0,
      totalExpenses: 0,
      balance: 0,
      expenses: {}
    };
    
    // Extract month and year from text or filename
    const monthYearMatch = text.match(/(january|février|february|mars|march|avril|april|mai|may|juin|june|juillet|july|août|august|septembre|september|octobre|october|novembre|november|décembre|december)\s*(20\d{2})/i);
    if (monthYearMatch) {
      data.month = monthYearMatch[1];
      data.year = parseInt(monthYearMatch[2]);
    } else {
      // Try to extract from filename
      const fileNameMatch = fileName.match(/(january|février|february|mars|march|avril|april|mai|may|juin|june|juillet|july|août|august|septembre|september|octobre|october|novembre|november|décembre|december).*(20\d{2})/i);
      if (fileNameMatch) {
        data.month = fileNameMatch[1];
        data.year = parseInt(fileNameMatch[2]);
      }
    }
    
    // Extract income (look for various patterns)
    const incomePatterns = [
      /€\s*(\d+[.,]?\d*)\s*(?:monthly\s*income|revenus\s*mensuels|income|revenus)/i,
      /(?:monthly\s*income|revenus\s*mensuels|income|revenus)\s*€\s*(\d+[.,]?\d*)/i,
      /€\s*(\d+[.,]?\d*)\s*(?:total\s*income|revenus\s*totaux)/i,
      /(\d+[.,]?\d*)\s*€\s*(?:monthly\s*income|revenus\s*mensuels|income|revenus)/i
    ];
    
    for (const pattern of incomePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.income = parseFloat(match[1].replace(',', '.'));
        console.log('Found income:', data.income);
        break;
      }
    }
    
    // Extract total expenses
    const expensePatterns = [
      /€\s*(\d+[.,]?\d*)\s*(?:total\s*expenses|total\s*dépenses|expenses|dépenses)/i,
      /(?:total\s*expenses|total\s*dépenses|expenses|dépenses)\s*€\s*(\d+[.,]?\d*)/i,
      /(\d+[.,]?\d*)\s*€\s*(?:total\s*expenses|total\s*dépenses|expenses|dépenses)/i
    ];
    
    for (const pattern of expensePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.totalExpenses = parseFloat(match[1].replace(',', '.'));
        console.log('Found total expenses:', data.totalExpenses);
        break;
      }
    }
    
    // Extract balance
    const balancePatterns = [
      /€\s*(-?\d+[.,]?\d*)\s*(?:remaining\s*balance|solde\s*restant|balance|solde)/i,
      /(?:remaining\s*balance|solde\s*restant|balance|solde)\s*€\s*(-?\d+[.,]?\d*)/i,
      /€\s*(-?\d+[.,]?\d*)\s*(?:deficit|déficit)/i,
      /(-?\d+[.,]?\d*)\s*€\s*(?:remaining\s*balance|solde\s*restant|balance|solde)/i
    ];
    
    for (const pattern of balancePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.balance = parseFloat(match[1].replace(',', '.'));
        console.log('Found balance:', data.balance);
        break;
      }
    }
    
    // Extract individual expenses with more flexible patterns
    const expenseCategories = {
      rent: ['rent', 'loyer'],
      apl: ['apl', 'housing allowance', 'allocation logement'],
      electricity: ['electricity', 'électricité'],
      internet: ['internet'],
      phone: ['phone', 'téléphone'],
      subscriptions: ['subscriptions', 'abonnements'],
      insuranceHome: ['home insurance', 'assurance habitation'],
      insuranceCar: ['car insurance', 'assurance auto'],
      gym: ['gym', 'salle de sport'],
      food: ['food', 'nourriture'],
      gas: ['gas', 'essence'],
      catFood: ['cat food', 'nourriture chat'],
      leisure: ['leisure', 'loisirs'],
      shopping: ['shopping'],
      savings: ['savings', 'épargne'],
      unforeseen: ['unforeseen', 'imprévus', 'emergency fund', 'fonds urgence']
    };
    
    Object.entries(expenseCategories).forEach(([category, keywords]) => {
      for (const keyword of keywords) {
        // More flexible pattern matching
        const patterns = [
          new RegExp(`${keyword}[^€]*€\\s*(\\d+[.,]?\\d*)`, 'i'),
          new RegExp(`€\\s*(\\d+[.,]?\\d*)[^€]*${keyword}`, 'i'),
          new RegExp(`${keyword}\\s*:\\s*€\\s*(\\d+[.,]?\\d*)`, 'i'),
          new RegExp(`${keyword}\\s*€\\s*(\\d+[.,]?\\d*)`, 'i')
        ];
        
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            data.expenses[category] = parseFloat(match[1].replace(',', '.'));
            console.log(`Found ${category}:`, data.expenses[category]);
            break;
          }
        }
      }
    });
    
    // If we couldn't extract total expenses, calculate from individual expenses
    if (data.totalExpenses === 0) {
      data.totalExpenses = Object.values(data.expenses).reduce((sum, value) => sum + (value || 0), 0);
      console.log('Calculated total expenses:', data.totalExpenses);
    }
    
    // If we couldn't extract balance, calculate it
    if (data.balance === 0) {
      data.balance = data.income - data.totalExpenses;
      console.log('Calculated balance:', data.balance);
    }
    
    console.log('Final parsed data:', data);
    
    // Validate extracted data
    if (data.income === 0) {
      console.warn('Could not extract income from PDF:', fileName);
      return null;
    }
    
    return data;
  }
} 
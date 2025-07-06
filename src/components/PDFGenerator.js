import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PDFGenerator = ({ 
  income, 
  expenses, 
  totalExpenses, 
  balance, 
  sharedExpenses, 
  translations, 
  currentLanguage 
}) => {
  
  const generatePDF = async () => {
    // Create a temporary div for the PDF content
    const pdfContent = document.createElement('div');
    pdfContent.style.width = '800px';
    pdfContent.style.padding = '40px';
    pdfContent.style.backgroundColor = 'white';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.position = 'absolute';
    pdfContent.style.left = '-9999px';
    pdfContent.style.top = '0';
    pdfContent.style.lineHeight = '1.6';
    pdfContent.style.pageBreakInside = 'avoid';
    pdfContent.style.breakInside = 'avoid';
    
    // Get current date
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesFr = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const currentMonth = currentLanguage === 'fr' 
      ? monthNamesFr[now.getMonth()] 
      : monthNames[now.getMonth()];
    const currentYear = now.getFullYear();
    
    // Create PDF content
    pdfContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2563eb;">
        <h1 style="color: #2563eb; margin-bottom: 15px; font-size: 32px; font-weight: bold;">
          ${translations[currentLanguage].title}
        </h1>
        <h2 style="color: #6b7280; font-size: 20px; font-weight: normal; margin: 0;">
          ${currentMonth} ${currentYear}
        </h2>
      </div>
      
      <div style="margin-bottom: 40px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="color: #111827; font-size: 22px; margin-bottom: 25px; text-align: center; font-weight: bold;">
          ${translations[currentLanguage].monthlySummary}
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 30px;">
          <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: bold; color: #059669; margin-bottom: 8px;">€${income.toFixed(2)}</div>
            <div style="font-size: 16px; color: #047857; font-weight: 500;">${translations[currentLanguage].monthlyIncome}</div>
          </div>
          <div style="background-color: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 8px;">€${totalExpenses.toFixed(2)}</div>
            <div style="font-size: 16px; color: #b91c1c; font-weight: 500;">${translations[currentLanguage].totalExpenses}</div>
          </div>
          <div style="background-color: ${balance >= 0 ? '#eff6ff' : '#fffbeb'}; border: 2px solid ${balance >= 0 ? '#bfdbfe' : '#fed7aa'}; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 28px; font-weight: bold; color: ${balance >= 0 ? '#2563eb' : '#ea580c'}; margin-bottom: 8px;">€${balance.toFixed(2)}</div>
            <div style="font-size: 16px; color: ${balance >= 0 ? '#1d4ed8' : '#c2410c'}; font-weight: 500;">${balance >= 0 ? translations[currentLanguage].remainingBalance : translations[currentLanguage].deficit}</div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 40px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="color: #111827; font-size: 20px; margin-bottom: 20px; text-align: center; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${translations[currentLanguage].fixedExpenses}
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${Object.entries(expenses)
            .filter(([key]) => ['rent', 'apl', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'].includes(key))
            .map(([key, value]) => {
              const isShared = sharedExpenses[key];
              const adjustedValue = isShared ? value / 2 : value;
              const isApl = key === 'apl';
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: ${isApl ? '#f0fdf4' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isApl ? '#bbf7d0' : '#e5e7eb'};">
                  <span style="font-weight: 600; font-size: 15px; color: #374151;">${translations[currentLanguage][key] || key}</span>
                  <div style="text-align: right;">
                    <span style="color: ${isApl ? '#059669' : '#374151'}; font-weight: bold; font-size: 16px;">
                      ${isApl ? '-' : ''}€${adjustedValue.toFixed(2)}
                    </span>
                    ${isShared ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">(${translations[currentLanguage].shared})</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>
      
      <div style="margin-bottom: 40px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="color: #111827; font-size: 20px; margin-bottom: 20px; text-align: center; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${translations[currentLanguage].variableExpenses}
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${Object.entries(expenses)
            .filter(([key]) => ['food', 'gas', 'catFood', 'leisure', 'shopping'].includes(key))
            .map(([key, value]) => {
              const isShared = sharedExpenses[key];
              const adjustedValue = isShared ? value / 2 : value;
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; font-size: 15px; color: #374151;">${translations[currentLanguage][key] || key}</span>
                  <div style="text-align: right;">
                    <span style="color: #374151; font-weight: bold; font-size: 16px;">
                      €${adjustedValue.toFixed(2)}
                    </span>
                    ${isShared ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">(${translations[currentLanguage].shared})</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>
      
      <div style="margin-bottom: 40px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="color: #111827; font-size: 20px; margin-bottom: 20px; text-align: center; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${translations[currentLanguage].savingsEmergency}
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${Object.entries(expenses)
            .filter(([key]) => ['savings', 'unforeseen'].includes(key))
            .map(([key, value]) => {
              const isShared = sharedExpenses[key];
              const adjustedValue = isShared ? value / 2 : value;
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; font-size: 15px; color: #374151;">${translations[currentLanguage][key] || key}</span>
                  <div style="text-align: right;">
                    <span style="color: #374151; font-weight: bold; font-size: 16px;">
                      €${adjustedValue.toFixed(2)}
                    </span>
                    ${isShared ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">(${translations[currentLanguage].shared})</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>
      
      <div style="margin-top: 50px; padding: 25px; border-top: 3px solid #2563eb; text-align: center; background-color: #f8fafc; border-radius: 12px; page-break-inside: avoid; break-inside: avoid;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px; line-height: 1.6;">
          ${translations[currentLanguage].sharedExpensesDescription}
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0; font-style: italic;">
          Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}
        </p>
      </div>
    `;
    
    // Add to document temporarily
    document.body.appendChild(pdfContent);
    
    try {
      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 3, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: pdfContent.scrollHeight
      });
      
      // Create PDF with simple single-page approach to avoid cutting issues
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit content properly
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15; // Margin in mm
      
      // Calculate scaling to fit the content
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      // If content fits on one page, use it
      if (contentHeight <= pageHeight - (2 * margin)) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
        // If content is too tall, scale it down to fit on one page
        const scale = (pageHeight - (2 * margin)) / contentHeight;
        const scaledWidth = contentWidth * scale;
        const scaledHeight = contentHeight * scale;
        const xOffset = (pageWidth - scaledWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, margin, scaledWidth, scaledHeight);
      }
      
      // Download PDF
      const fileName = `budget-${currentMonth.toLowerCase()}-${currentYear}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Clean up
      document.body.removeChild(pdfContent);
    }
  };
  
  return (
    <button 
      onClick={generatePDF}
      className="pdf-button"
      title={translations[currentLanguage].downloadPDF || 'Download PDF Report'}
    >
      <svg className="pdf-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
      {translations[currentLanguage].downloadPDF || 'Download PDF'}
    </button>
  );
};

export default PDFGenerator; 
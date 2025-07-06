import React, { useState } from 'react';
import { SimplePDFExtractor } from '../services/SimplePDFExtractor';

const PDFTestComponent = () => {
  const [extractedText, setExtractedText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    console.log('Testing simple PDF extraction for:', file.name);

    try {
      // Use the simple extractor
      const data = await SimplePDFExtractor.extractBudgetData(file);
      
      if (data) {
        console.log('Extracted data:', data);
        setParsedData(data);
        setExtractedText(`File: ${file.name}\nSize: ${file.size} bytes\nGenerated realistic budget data based on file characteristics.`);
      } else {
        setExtractedText('Failed to extract data from file.');
      }
      
    } catch (error) {
      console.error('Error during PDF extraction:', error);
      setExtractedText('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Test d'Extraction PDF</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ marginBottom: '10px' }}
        />
        {loading && <div>Chargement...</div>}
      </div>

      {extractedText && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Texte extrait du PDF :</h3>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            border: '1px solid #ddd',
            maxHeight: '300px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: '12px'
          }}>
            {extractedText}
          </div>
        </div>
      )}

      {parsedData && (
        <div>
          <h3>Données parsées :</h3>
          <div style={{ 
            background: '#e8f5e8', 
            padding: '10px', 
            border: '1px solid #4caf50',
            borderRadius: '4px'
          }}>
            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTestComponent; 
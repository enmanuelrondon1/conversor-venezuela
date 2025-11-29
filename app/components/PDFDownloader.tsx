// app/components/PDFDownloader.tsx

'use client';

import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFDownloaderProps {
  darkMode: boolean;
  vesRates: {
    paralelo: number;
    oficial: number;
  };
}

export default function PDFDownloader({ darkMode, vesRates }: PDFDownloaderProps) {
  
  const generatePDF = async () => {
    // Validación de datos
    if (!vesRates || typeof vesRates.paralelo !== 'number' || typeof vesRates.oficial !== 'number') {
      alert('Esperando datos de tasas... Por favor intenta en unos segundos.');
      return;
    }

    if (vesRates.paralelo === 0 || vesRates.oficial === 0) {
      alert('Datos de tasas incompletos. Por favor intenta en unos segundos.');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text('Conversor de Divisas Venezuela', 105, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Reporte generado: ${new Date().toLocaleString('es-VE')}`, 105, 30, { align: 'center' });
      
      // Línea separadora
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Tasas actuales
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Tasas Actuales', 20, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Tipo', 'Tasa (Bs/$)', 'Fuente']],
        body: [
          [
            'Dólar Paralelo',
            `${vesRates.paralelo.toFixed(2)} Bs/$`,
            'Mercado P2P / Criptomonedas'
          ],
          [
            'Dólar Oficial BCV',
            `${vesRates.oficial.toFixed(2)} Bs/$`,
            'Banco Central de Venezuela'
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
      
      // Diferencia
      const diferencia = ((vesRates.paralelo - vesRates.oficial) / vesRates.oficial * 100).toFixed(2);
      
      const finalY = (doc as any).lastAutoTable.finalY || 80;
      
      doc.setFontSize(12);
      doc.text('Análisis', 20, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `El dólar paralelo está ${diferencia}% por encima del oficial BCV.`,
        20,
        finalY + 25
      );
      
      // Conversiones rápidas
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Conversiones Rápidas (USD a VES)', 20, finalY + 40);
      
      const amounts = [1, 5, 10, 20, 50, 100];
      const conversions = amounts.map(amount => [
        `${amount} USD`,
        `${(amount * vesRates.paralelo).toFixed(2)} Bs (Paralelo)`,
        `${(amount * vesRates.oficial).toFixed(2)} Bs (Oficial)`
      ]);
      
      autoTable(doc, {
        startY: finalY + 45,
        head: [['Monto', 'Paralelo', 'Oficial']],
        body: conversions,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 }
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          'Conversor de Divisas Venezuela - https://conversor-venezuela.vercel.app',
          105,
          290,
          { align: 'center' }
        );
      }
      
      // Descargar
      const filename = `tasas-venezuela-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    }
  };

  // Verificar si los datos están listos
  const isReady = vesRates && vesRates.paralelo > 0 && vesRates.oficial > 0;

  return (
    <button
      onClick={generatePDF}
      disabled={!isReady}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        !isReady
          ? 'bg-gray-400 cursor-not-allowed opacity-50'
          : darkMode
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      } shadow-md hover:shadow-lg`}
      title={isReady ? 'Descargar reporte PDF' : 'Cargando datos...'}
      aria-label="Descargar reporte en PDF"
    >
      <FileDown size={18} />
      <span className="hidden sm:inline">
        {isReady ? 'Descargar PDF' : 'Cargando...'}
      </span>
    </button>
  );
}
"use client";
import { DollarSign, Building2 } from 'lucide-react';

interface ComparisonTableProps {
  cardClasses: string;
  darkMode: boolean;
  vesRates: { paralelo: number; oficial: number };
  formatNumber: (num: number) => string;
}

const ComparisonTable = ({ cardClasses, darkMode, vesRates, formatNumber }: ComparisonTableProps) => {
  return (
    <div className={`${cardClasses} border rounded-2xl p-6 mb-8 transition-all duration-300`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        📊 Comparación de Tasas VES
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-lg border-2 transition-all ${
          darkMode ? 'bg-blue-900/50 border-blue-800' : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Dólar Paralelo</h3>
          </div>
          <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            {formatNumber(vesRates.paralelo)} Bs
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por cada USD</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Fuente: Yadio.io (P2P/Cripto)</p>
        </div>

        <div className={`p-6 rounded-lg border-2 transition-all ${
          darkMode ? 'bg-green-900/50 border-green-800' : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`font-bold text-lg ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Dólar BCV Oficial</h3>
          </div>
          <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-green-900'}`}>
            {formatNumber(vesRates.oficial)} Bs
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por cada USD</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Fuente: Banco Central</p>
        </div>
      </div>
      <div className={`mt-4 p-4 rounded-lg border ${
        darkMode ? 'bg-amber-900/50 border-amber-800' : 'bg-amber-50 border-amber-200'
      }`}>
        <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
          <strong>💡 Nota:</strong> El dólar paralelo es usado en el mercado P2P y operaciones con criptomonedas. 
          El dólar oficial BCV es la tasa del Banco Central de Venezuela.
        </p>
      </div>
    </div>
  );
};

export default ComparisonTable;
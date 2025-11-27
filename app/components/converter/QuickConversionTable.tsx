"use client";
import { RefreshCw } from 'lucide-react';

interface QuickConversionTableProps {
  cardClasses: string;
  darkMode: boolean;
  currencies: { code: string; name: string; flag: string; }[];
  getActiveVESRate: () => number;
  rates: { [key: string]: number };
  formatNumber: (num: number) => string;
  rateType: 'paralelo' | 'oficial';
  loading: boolean;
}

const QuickConversionTable = ({
  cardClasses, darkMode, currencies, getActiveVESRate, rates, formatNumber, rateType, loading
}: QuickConversionTableProps) => {
  return (
    <div className={`${cardClasses} border rounded-2xl p-6 transition-all duration-300`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Tasas Rápidas (Referencia USD)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {currencies.filter(c => c.code !== 'USD').map(curr => (
          <div key={curr.code} className={`p-4 rounded-lg border transition-all hover:scale-105 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="text-2xl mb-1">{curr.flag}</div>
            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{curr.code}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {curr.code === 'VES' 
                ? formatNumber(getActiveVESRate()) 
                : rates[curr.code] ? formatNumber(rates[curr.code]) : '...'}
            </div>
            {curr.code === 'VES' && (
              <div className="text-xs text-blue-500 font-semibold mt-1">
                {rateType === 'paralelo' ? 'Paralelo' : 'Oficial'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-center gap-2 text-sm mt-4 text-center ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Se actualiza automáticamente cada 5 minutos</span>
      </div>
    </div>
  );
};

export default QuickConversionTable;
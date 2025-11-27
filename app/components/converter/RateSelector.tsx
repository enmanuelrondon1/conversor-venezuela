"use client";
import { DollarSign, Building2, ChevronUp, TrendingDown } from 'lucide-react';

interface RateSelectorProps {
  fromCurrency: string;
  toCurrency: string;
  cardClasses: string;
  darkMode: boolean;
  rateType: 'paralelo' | 'oficial';
  setRateType: (type: 'paralelo' | 'oficial') => void;
  vesRates: { paralelo: number; oficial: number };
  previousVesRates: { paralelo: number; oficial: number };
  formatNumber: (num: number) => string;
  getRateChange: (current: number, previous: number) => { change: number; percentage: number };
  calculatePercentageDiff: () => number;
}

const RateSelector = ({
  fromCurrency, toCurrency, cardClasses, darkMode, rateType, setRateType,
  vesRates, previousVesRates, formatNumber, getRateChange, calculatePercentageDiff
}: RateSelectorProps) => {
  if (fromCurrency !== 'VES' && toCurrency !== 'VES') {
    return null;
  }

  return (
    <div className={`${cardClasses} border rounded-2xl p-6 mb-8 transition-all duration-300`}>
      <h3 className={`text-md font-semibold text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        🇻🇪 Selecciona el tipo de tasa para Bolívares (VES)
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => setRateType('paralelo')}
          className={`p-4 rounded-xl font-semibold transition-all border-2 transform hover:scale-105 ${
            rateType === 'paralelo'
              ? darkMode 
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/50'
                : 'bg-blue-500 text-white border-blue-600 shadow-lg'
              : darkMode
                ? 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg">Dólar Paralelo</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatNumber(vesRates.paralelo)} Bs/$
          </div>
          {previousVesRates.paralelo > 0 && (
            <div className={`text-sm flex items-center justify-center gap-1 ${
              getRateChange(vesRates.paralelo, previousVesRates.paralelo).change > 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {getRateChange(vesRates.paralelo, previousVesRates.paralelo).change > 0 ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(getRateChange(vesRates.paralelo, previousVesRates.paralelo).percentage).toFixed(2)}%
            </div>
          )}
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mercado P2P / Criptomonedas
          </div>
        </button>

        <button
          onClick={() => setRateType('oficial')}
          className={`p-4 rounded-xl font-semibold transition-all border-2 transform hover:scale-105 ${
            rateType === 'oficial'
              ? darkMode
                ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/50'
                : 'bg-green-500 text-white border-green-600 shadow-lg'
              : darkMode
                ? 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className="w-5 h-5" />
            <span className="text-lg">Dólar BCV Oficial</span>
          </div>
          <div className="text-2xl font-bold">
            {formatNumber(vesRates.oficial)} Bs/$
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Banco Central de Venezuela
          </div>
        </button>
      </div>
      
      <div className={`mt-4 p-3 rounded-lg text-center ${
        darkMode ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
          <strong>📊 Diferencia:</strong> El dólar paralelo está{' '}
          <strong className="text-lg">{Math.abs(calculatePercentageDiff()).toFixed(2)}%</strong>{' '}
          {calculatePercentageDiff() > 0 ? 'por encima' : 'por debajo'} del oficial
        </p>
      </div>
    </div>
  );
};

export default RateSelector;
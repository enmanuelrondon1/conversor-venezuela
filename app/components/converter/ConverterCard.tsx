"use client";
import { Loader2, ArrowLeftRight, RefreshCw } from 'lucide-react';

interface ConverterCardProps {
  cardClasses: string;
  loading: boolean;
  error: string;
  darkMode: boolean;
  fromCurrency: string;
  setFromCurrency: (value: string) => void;
  toCurrency: string;
  setToCurrency: (value: string) => void;
  currencies: { code: string; name: string; flag: string; }[];
  inputClasses: string;
  amount: string;
  setAmount: (value: string) => void;
  result: number;
  formatNumber: (num: number) => string;
  swapCurrencies: () => void;
  fetchRates: () => void;
  getActiveVESRate: () => number;
  rates: { [key: string]: number };
  rateType: 'paralelo' | 'oficial';
  lastUpdate: string;
}

const ConverterCard = ({
  cardClasses, loading, error, darkMode, fromCurrency, setFromCurrency, toCurrency, setToCurrency,
  currencies, inputClasses, amount, setAmount, result, formatNumber, swapCurrencies, fetchRates,
  getActiveVESRate, rates, rateType, lastUpdate
}: ConverterCardProps) => {
  return (
    <div className={`${cardClasses} rounded-2xl border p-6 md:p-8 mb-8 transition-all duration-300`}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando tasas actuales...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
              darkMode ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                De
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg transition-all ${inputClasses}`}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code} className={darkMode ? 'bg-gray-900' : 'bg-white'}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingresa el monto"
                className={`w-full px-4 py-4 border-2 rounded-lg focus:outline-none text-2xl font-semibold transition-all ${inputClasses}`}
              />
            </div>

            <div className="space-y-3">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A
              </label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg transition-all ${inputClasses}`}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code} className={darkMode ? 'bg-gray-900' : 'bg-white'}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
              <div className={`w-full px-4 py-4 rounded-lg text-2xl font-bold border-2 ${
                darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                {formatNumber(result)}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 my-6">
            <button
              onClick={swapCurrencies}
              className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
            <button
              onClick={fetchRates}
              disabled={loading}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 transform hover:scale-105 ${
                loading 
                  ? darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                  : darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar tasas
            </button>
          </div>

          <div className={`rounded-lg p-4 text-center ${
            darkMode ? 'bg-gray-900/70' : 'bg-gray-100'
          }`}>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de cambio actual</p>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              1 {fromCurrency} = {formatNumber((fromCurrency === 'VES' || toCurrency === 'VES') 
                ? (getActiveVESRate() * (toCurrency === 'VES' ? 1 : 1 / getActiveVESRate()))
                : (rates[toCurrency] / rates[fromCurrency]))} {toCurrency}
            </p>
            {(fromCurrency === 'VES' || toCurrency === 'VES') && (
              <p className="text-xs text-blue-500 font-semibold mt-1">
                Usando tasa {rateType === 'paralelo' ? 'Paralelo' : 'BCV Oficial'}
              </p>
            )}
            <p className={`text-xs mt-2 flex items-center justify-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              <RefreshCw className="w-3 h-3" />
              Actualizado: {lastUpdate}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ConverterCard;
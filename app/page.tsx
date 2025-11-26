"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, RefreshCw, Loader2, DollarSign, Building2, Sun, Moon, TrendingDown, ChevronUp } from 'lucide-react';

interface Rates {
  [key: string]: number;
}

interface VESRates {
  paralelo: number;
  oficial: number;
}

interface HistoryEntry {
  timestamp: string;
  paralelo: number;
  oficial: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VES');
  const [result, setResult] = useState(0);
  const [rates, setRates] = useState<Rates>({});
  const [vesRates, setVesRates] = useState<VESRates>({ paralelo: 0, oficial: 0 });
  const [previousVesRates, setPreviousVesRates] = useState<VESRates>({ paralelo: 0, oficial: 0 });
  const [rateType, setRateType] = useState<'paralelo' | 'oficial'>('paralelo');
  const [darkMode, setDarkMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸' },
    { code: 'VES', name: 'Bolívar Venezolano', flag: '🇻🇪' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'COP', name: 'Peso Colombiano', flag: '🇨🇴' },
    { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷' },
    { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
    { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱' },
    { code: 'PEN', name: 'Sol Peruano', flag: '🇵🇪' },
    { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' }
  ];

  // Función para obtener tasas de la API
  const fetchRates = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Guardar tasas anteriores antes de actualizar
      if (vesRates.paralelo > 0) {
        setPreviousVesRates({ ...vesRates });
      }

      // Obtener tasas paralelas de Yadio
      const yadioResponse = await fetch('https://api.yadio.io/exrates/USD');
      const yadioData = await yadioResponse.json();
      
      if (yadioData && yadioData.USD) {
        const baseRates = yadioData.USD;
        setRates(baseRates);
        
        // Guardar tasa paralela de VES
        if (baseRates.VES) {
          const newParalelo = baseRates.VES;
          setVesRates(prev => ({ ...prev, paralelo: newParalelo }));
          
          // Agregar al historial
          const newEntry: HistoryEntry = {
            timestamp: new Date().toLocaleString('es-VE', { 
              hour: '2-digit',
              minute: '2-digit'
            }),
            paralelo: newParalelo,
            oficial: vesRates.oficial || 50.50
          };
          
          setHistory(prev => [...prev.slice(-9), newEntry]);
        }
      }

      // Intentar obtener tasa oficial del BCV
      try {
        const bcvResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const bcvData = await bcvResponse.json();
        
        if (bcvData && bcvData.rates && bcvData.rates.VES) {
          setVesRates(prev => ({ ...prev, oficial: bcvData.rates.VES }));
        } else {
          setVesRates(prev => ({ ...prev, oficial: 50.50 }));
        }
      } catch {
        setVesRates(prev => ({ ...prev, oficial: 50.50 }));
      }

      setLastUpdate(new Date().toLocaleString('es-VE', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
      }));
      
    } catch (err) {
      setError('Error al obtener las tasas. Usando valores de respaldo.');
      setRates({
        USD: 1,
        VES: 76.94,
        EUR: 0.92,
        COP: 4320,
        BRL: 5.65,
        ARS: 1498.17,
        CLP: 950,
        PEN: 3.75,
        MXN: 17.20
      });
      setVesRates({ paralelo: 76.94, oficial: 50.50 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency, rates, rateType]);

  const calculateConversion = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || isNaN(numericAmount)) {
      setResult(0);
      return;
    }

    let currentRates = { ...rates };
    
    if (fromCurrency === 'VES' || toCurrency === 'VES') {
      currentRates.VES = rateType === 'paralelo' ? vesRates.paralelo : vesRates.oficial;
    }

    const amountInUSD = numericAmount / currentRates[fromCurrency];
    const convertedAmount = amountInUSD * currentRates[toCurrency];
    setResult(convertedAmount);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getActiveVESRate = () => {
    return rateType === 'paralelo' ? vesRates.paralelo : vesRates.oficial;
  };

  const calculatePercentageDiff = () => {
    if (vesRates.paralelo === 0 || vesRates.oficial === 0) return 0;
    return ((vesRates.paralelo - vesRates.oficial) / vesRates.oficial) * 100;
  };

  const getRateChange = (current: number, previous: number) => {
    if (previous === 0) return { change: 0, percentage: 0 };
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  const themeClasses = darkMode 
    ? 'bg-gray-900 text-white'
    : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900';

  const cardClasses = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClasses = darkMode
    ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white'
    : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900';

  return (
    <div className={`min-h-screen ${themeClasses} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              Conversor de Divisas Venezuela
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Tasas en tiempo real - Paralelo y Oficial
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`ml-4 p-3 rounded-full transition-all ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'
            }`}
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* VES Rate Selector */}
        {(fromCurrency === 'VES' || toCurrency === 'VES') && (
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
            
            {/* Diferencia porcentual */}
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
        )}

        {/* Main Converter Card */}
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

        {/* Comparison Table */}
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

        {/* Quick Conversion Table */}
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
      </div>
    </div>
  );
};

export default CurrencyConverter;
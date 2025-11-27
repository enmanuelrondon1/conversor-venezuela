//src/app/components/converter/useCurrencyConverter.ts
"use client";
import { useState, useEffect } from 'react';

// Interfaces
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

export const useCurrencyConverter = () => {
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

  const fetchRates = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (vesRates.paralelo > 0) {
        setPreviousVesRates({ ...vesRates });
      }

      const yadioResponse = await fetch('https://api.yadio.io/exrates/USD');
      const yadioData = await yadioResponse.json();
      
      if (yadioData && yadioData.USD) {
        const baseRates = yadioData.USD;
        setRates(baseRates);
        
        if (baseRates.VES) {
          const newParalelo = baseRates.VES;
          setVesRates(prev => ({ ...prev, paralelo: newParalelo }));
          
          const newEntry: HistoryEntry = {
            timestamp: new Date().toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' }),
            paralelo: newParalelo,
            oficial: vesRates.oficial || 50.50
          };
          
          setHistory(prev => [...prev.slice(-9), newEntry]);
        }
      }

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

      setLastUpdate(new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }));
      
    } catch (err) {
      setError('Error al obtener las tasas. Usando valores de respaldo.');
      setRates({
        USD: 1, VES: 76.94, EUR: 0.92, COP: 4320, BRL: 5.65,
        ARS: 1498.17, CLP: 950, PEN: 3.75, MXN: 17.20
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
  }, [amount, fromCurrency, toCurrency, rates, rateType, vesRates]);

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

    if (!currentRates[fromCurrency] || !currentRates[toCurrency]) return;

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

  return {
    amount, setAmount, fromCurrency, setFromCurrency, toCurrency, setToCurrency,
    result, rates, vesRates, previousVesRates, rateType, setRateType, darkMode,
    setDarkMode, lastUpdate, loading, error, history, currencies, fetchRates,
    swapCurrencies, formatNumber, getActiveVESRate, calculatePercentageDiff, getRateChange
  };
};
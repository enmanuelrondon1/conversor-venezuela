// app/components/CurrencyConverter.tsx
"use client";
import { useState } from "react";
import { useCurrencyConverter } from "./converter/useCurrencyConverter";
import Header from "./converter/Header";
import RateSelector from "./converter/RateSelector";
import ConverterCard from "./converter/ConverterCard";
import ComparisonTable from "./converter/ComparisonTable";
import QuickConversionTable from "./converter/QuickConversionTable";
import NotificationModal from "./NotificationModal";
import TelegramModal from "./TelegramModal"; // ← AGREGAR ESTO

const CurrencyConverter = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false); // ← AGREGAR ESTO

  const {
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    result,
    rates,
    vesRates,
    previousVesRates,
    rateType,
    setRateType,
    darkMode,
    setDarkMode,
    lastUpdate,
    loading,
    error,
    currencies,
    fetchRates,
    swapCurrencies,
    formatNumber,
    getActiveVESRate,
    calculatePercentageDiff,
    getRateChange,
  } = useCurrencyConverter();

  const themeClasses = darkMode
    ? "bg-gray-900 text-white"
    : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900";

  const cardClasses = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const inputClasses = darkMode
    ? "bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
    : "bg-white border-gray-300 focus:border-blue-500 text-gray-900";

  return (
    <div
      className={`min-h-screen ${themeClasses} p-4 md:p-8 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenTelegram={() => setIsTelegramModalOpen(true)} // ← AGREGAR ESTO
        />

        <RateSelector
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          cardClasses={cardClasses}
          darkMode={darkMode}
          rateType={rateType}
          setRateType={setRateType}
          vesRates={vesRates}
          previousVesRates={previousVesRates}
          formatNumber={formatNumber}
          getRateChange={getRateChange}
          calculatePercentageDiff={calculatePercentageDiff}
        />

        <ConverterCard
          cardClasses={cardClasses}
          loading={loading}
          error={error}
          darkMode={darkMode}
          fromCurrency={fromCurrency}
          setFromCurrency={setFromCurrency}
          toCurrency={toCurrency}
          setToCurrency={setToCurrency}
          currencies={currencies}
          inputClasses={inputClasses}
          amount={amount}
          setAmount={setAmount}
          result={result}
          formatNumber={formatNumber}
          swapCurrencies={swapCurrencies}
          fetchRates={fetchRates}
          getActiveVESRate={getActiveVESRate}
          rates={rates}
          rateType={rateType}
          lastUpdate={lastUpdate}
        />

        <ComparisonTable
          cardClasses={cardClasses}
          darkMode={darkMode}
          vesRates={vesRates}
          formatNumber={formatNumber}
        />

        <QuickConversionTable
          cardClasses={cardClasses}
          darkMode={darkMode}
          currencies={currencies}
          getActiveVESRate={getActiveVESRate}
          rates={rates}
          formatNumber={formatNumber}
          rateType={rateType}
          loading={loading}
        />
      </div>

      {/* Modal de WhatsApp */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Modal de Telegram - ← AGREGAR ESTO */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};

export default CurrencyConverter;
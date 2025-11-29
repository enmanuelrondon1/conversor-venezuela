// app/components/converter/Header.tsx
import { Moon, Sun, Bell, BellOff, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import PDFDownloader from '../PDFDownloader';
import AppInstaller from '../AppInstaller';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onOpenNotifications: () => void;
  onOpenTelegram: () => void;
  vesRates: any;
}

const Header = ({ 
  darkMode, 
  setDarkMode, 
  onOpenNotifications,
  onOpenTelegram,
  vesRates
}: HeaderProps) => {
  const [isWhatsAppSubscribed, setIsWhatsAppSubscribed] = useState(false);
  const [isTelegramSubscribed, setIsTelegramSubscribed] = useState(false);

  useEffect(() => {
    const whatsappSubscribed = localStorage.getItem('whatsapp_subscribed') === 'true';
    setIsWhatsAppSubscribed(whatsappSubscribed);

    const telegramSubscribed = localStorage.getItem('telegram_subscribed') === 'true';
    setIsTelegramSubscribed(telegramSubscribed);

    const handleStorageChange = () => {
      const whatsappSubscribed = localStorage.getItem('whatsapp_subscribed') === 'true';
      setIsWhatsAppSubscribed(whatsappSubscribed);
      
      const telegramSubscribed = localStorage.getItem('telegram_subscribed') === 'true';
      setIsTelegramSubscribed(telegramSubscribed);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('whatsapp-subscription-changed', handleStorageChange);
    window.addEventListener('telegram-subscription-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('whatsapp-subscription-changed', handleStorageChange);
      window.removeEventListener('telegram-subscription-changed', handleStorageChange);
    };
  }, []);

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        
        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
          <span className="text-blue-500">📈</span>
          Conversor de Divisas Venezuela
        </h1>
        
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Botón Instalar App */}
          <AppInstaller darkMode={darkMode} />
          
          {/* Botón PDF */}
          <PDFDownloader darkMode={darkMode} vesRates={vesRates} />
          
          {/* Botón WhatsApp */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-2.5 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } shadow-sm hover:shadow-md`}
            title={isWhatsAppSubscribed ? 'Notificaciones WhatsApp activas' : 'Configurar WhatsApp'}
          >
            {isWhatsAppSubscribed ? (
              <>
                <Bell size={20} className="text-green-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </>
            ) : (
              <BellOff size={20} />
            )}
          </button>

          {/* Botón Telegram */}
          <button
            onClick={onOpenTelegram}
            className={`relative p-2.5 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } shadow-sm hover:shadow-md`}
            title={isTelegramSubscribed ? 'Notificaciones Telegram activas' : 'Configurar Telegram'}
          >
            {isTelegramSubscribed ? (
              <>
                <Send size={20} className="text-blue-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </>
            ) : (
              <Send size={20} className="opacity-50" />
            )}
          </button>

          {/* Botón Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } shadow-sm hover:shadow-md`}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Tasas en tiempo real - Paralelo y Oficial
      </p>
    </div>
  );
};

export default Header;
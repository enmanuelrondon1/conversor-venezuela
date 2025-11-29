// app/components/converter/Header.tsx
import { Moon, Sun, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppInstaller from '../AppInstaller';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onOpenTelegram: () => void;
}

const Header = ({ 
  darkMode, 
  setDarkMode, 
  onOpenTelegram
}: HeaderProps) => {
  const [isTelegramSubscribed, setIsTelegramSubscribed] = useState(false);

  useEffect(() => {
    const telegramSubscribed = localStorage.getItem('telegram_subscribed') === 'true';
    setIsTelegramSubscribed(telegramSubscribed);

    const handleStorageChange = () => {
      const telegramSubscribed = localStorage.getItem('telegram_subscribed') === 'true';
      setIsTelegramSubscribed(telegramSubscribed);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('telegram-subscription-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('telegram-subscription-changed', handleStorageChange);
    };
  }, []);

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo y Título */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">💱</span>
          </div>
          <div className="text-left">
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'
            }`}>
              Conversor Venezuela
            </h1>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tasas en tiempo real
            </p>
          </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          {/* Botón Instalar App */}
          <AppInstaller darkMode={darkMode} />
          
          {/* Botón Telegram */}
          <button
            onClick={onOpenTelegram}
            className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-300 ${
              isTelegramSubscribed
                ? darkMode
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-2 border-blue-500/50'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200'
                : darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            } shadow-sm hover:shadow-md font-medium`}
            title={isTelegramSubscribed ? 'Notificaciones activas' : 'Activar notificaciones'}
          >
            <Send size={18} className={isTelegramSubscribed ? '' : 'opacity-60'} />
            <span className="hidden sm:inline text-sm">
              {isTelegramSubscribed ? 'Alertas' : 'Telegram'}
            </span>
            {isTelegramSubscribed && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
            )}
          </button>

          {/* Botón Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border-2 border-gray-700' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
            } shadow-sm hover:shadow-md`}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Indicador de suscripción */}
      {isTelegramSubscribed && (
        <div className={`mt-4 p-3 rounded-lg ${
          darkMode 
            ? 'bg-blue-500/10 border border-blue-500/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm flex items-center gap-2 ${
            darkMode ? 'text-blue-400' : 'text-blue-700'
          }`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Recibirás notificaciones cuando el dólar cambie más del 1%
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
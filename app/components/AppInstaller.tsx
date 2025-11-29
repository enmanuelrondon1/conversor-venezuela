import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Chrome } from 'lucide-react';

interface AppInstallerProps {
  darkMode?: boolean;
}

export default function AppInstaller({ darkMode = false }: AppInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si es iOS, mostrar botón para instrucciones
    if (iOS && !isInstalled) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // En iOS mostrar instrucciones manuales
      setShowInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      alert('La instalación no está disponible en este momento');
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();
    
    // Esperar la elección del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la app');
      setShowInstallButton(false);
      setIsInstalled(true);
    } else {
      console.log('Usuario rechazó instalar la app');
    }
    
    // Limpiar el prompt
    setDeferredPrompt(null);
  };

  // Si ya está instalada, no mostrar nada
  if (isInstalled) {
    return null;
  }

  // Si no debe mostrarse, no renderizar
  if (!showInstallButton) {
    return null;
  }

  return (
    <>
      {/* Botón de instalación */}
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          darkMode
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } shadow-md hover:shadow-lg`}
        title="Instalar aplicación"
        aria-label="Instalar aplicación"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Instalar App</span>
      </button>

      {/* Modal de instrucciones para iOS */}
      {showInstructions && isIOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`relative max-w-md w-full rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } p-6`}>
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Smartphone size={24} className="text-green-500" />
              <h3 className="text-xl font-bold">Instalar en iOS</h3>
            </div>

            <div className="space-y-4 text-sm">
              <p>Para instalar esta app en tu iPhone o iPad:</p>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  Toca el botón de <strong>Compartir</strong> 
                  <span className="inline-block mx-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                    📤
                  </span>
                  en la barra inferior de Safari
                </li>
                <li>
                  Desplázate y toca <strong>"Añadir a pantalla de inicio"</strong>
                  <span className="inline-block mx-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                    ➕
                  </span>
                </li>
                <li>
                  Toca <strong>"Añadir"</strong> en la esquina superior derecha
                </li>
              </ol>

              <p className="text-xs opacity-70 mt-4">
                La app aparecerá en tu pantalla de inicio como cualquier otra aplicación.
              </p>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de instrucciones para navegadores de escritorio sin soporte */}
      {showInstructions && !isIOS && !deferredPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`relative max-w-md w-full rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } p-6`}>
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Monitor size={24} className="text-blue-500" />
              <h3 className="text-xl font-bold">Instalar en PC</h3>
            </div>

            <div className="space-y-4 text-sm">
              <p>Para instalar esta app en tu computadora:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Chrome size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Chrome / Edge:</p>
                    <p className="text-xs opacity-70">
                      Haz clic en el ícono de instalar (➕) en la barra de direcciones o en el menú (⋮) → "Instalar Conversor de Divisas"
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs opacity-70 mt-4">
                La app se instalará como una aplicación independiente en tu sistema.
              </p>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
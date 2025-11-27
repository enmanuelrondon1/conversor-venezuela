// app/components/TelegramModal.tsx
"use client";
import { useState, useEffect } from "react";
import { X, Send, Check, AlertCircle, Copy } from "lucide-react";

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function TelegramModal({
  isOpen,
  onClose,
  darkMode,
}: TelegramModalProps) {
  const [chatId, setChatId] = useState("");
  const [threshold, setThreshold] = useState(1);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"instructions" | "configure">(
    "instructions"
  );

  // Cargar datos guardados
  useEffect(() => {
    if (isOpen) {
      const savedChatId = localStorage.getItem("telegram_chat_id");
      const savedThreshold = localStorage.getItem("telegram_threshold");
      const savedSubscribed = localStorage.getItem("telegram_subscribed");

      if (savedChatId) {
        setChatId(savedChatId);
        setStep("configure");
      }
      if (savedThreshold) setThreshold(Number(savedThreshold));
      if (savedSubscribed === "true") setSubscribed(true);
    }
  }, [isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("✅ Copiado al portapapeles");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, threshold }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setMessage("✅ ¡Suscrito exitosamente!");

        localStorage.setItem("telegram_chat_id", chatId);
        localStorage.setItem("telegram_threshold", threshold.toString());
        localStorage.setItem("telegram_subscribed", "true");

        window.dispatchEvent(new Event("telegram-subscription-changed"));

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/subscribe-telegram", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });

      if (response.ok) {
        setSubscribed(false);
        setMessage("🔕 Desuscrito correctamente");

        localStorage.removeItem("telegram_chat_id");
        localStorage.removeItem("telegram_threshold");
        localStorage.removeItem("telegram_subscribed");

        window.dispatchEvent(new Event("telegram-subscription-changed"));

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMessage("❌ Error al desuscribirse");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cardClasses = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const inputClasses = darkMode
    ? "bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
    : "bg-white border-gray-300 focus:border-blue-500 text-gray-900";

  // Agregar esta función dentro del componente TelegramModal, después de handleUnsubscribe

  const handleTestNotification = async () => {
    if (!chatId.trim()) {
      setMessage("❌ Por favor ingresa tu Chat ID primero");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chatId.trim(),
          message:
            `🧪 <b>Notificación de Prueba</b>\n\n` +
            `📊 <b>Dólar Oficial BCV:</b> 244,65 Bs/$\n` +
            `💱 <b>Dólar Paralelo:</b> 388,89 Bs/$\n` +
            `📈 <b>Diferencia:</b> 50.78%\n\n` +
            `✅ Tu configuración está funcionando correctamente.\n\n` +
            `⏰ ${new Date().toLocaleString("es-VE", {
              timeZone: "America/Caracas",
              dateStyle: "medium",
              timeStyle: "short",
            })}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ ¡Notificación de prueba enviada! Revisa tu Telegram.");
      } else {
        setMessage(`❌ ${data.error || "Error al enviar notificación"}`);
      }
    } catch (error) {
      setMessage("❌ Error de conexión al enviar notificación de prueba");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`${cardClasses} rounded-2xl border shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200`}
      >
        {/* Header del Modal */}
        <div
          className={`sticky top-0 ${cardClasses} border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } p-6 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Alertas Telegram</h2>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Notificaciones instantáneas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {step === "instructions" && !subscribed && (
            <>
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-blue-500/10" : "bg-blue-50"
                } border ${
                  darkMode ? "border-blue-500/20" : "border-blue-200"
                }`}
              >
                <p className="font-semibold text-sm mb-3">
                  📱 Paso 1: Abre Telegram
                </p>
                <p className="text-sm mb-3">
                  Busca y abre una conversación con:
                </p>

                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    darkMode ? "bg-gray-900" : "bg-white"
                  } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                >
                  <code className="flex-1 text-blue-500 font-mono">
                    @conversor_venezuela_bot
                  </code>
                  <button
                    onClick={() => copyToClipboard("@conversor_venezuela_bot")}
                    className="p-2 hover:bg-gray-500/10 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <p className="text-xs mt-3 opacity-70">
                  Haz clic para copiar el nombre del bot
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-green-500/10" : "bg-green-50"
                } border ${
                  darkMode ? "border-green-500/20" : "border-green-200"
                }`}
              >
                <p className="font-semibold text-sm mb-3">
                  ✉️ Paso 2: Envía un mensaje
                </p>
                <p className="text-sm mb-3">Envía este comando al bot:</p>

                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    darkMode ? "bg-gray-900" : "bg-white"
                  } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                >
                  <code className="flex-1 text-green-500 font-mono">
                    /start
                  </code>
                  <button
                    onClick={() => copyToClipboard("/start")}
                    className="p-2 hover:bg-gray-500/10 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-purple-500/10" : "bg-purple-50"
                } border ${
                  darkMode ? "border-purple-500/20" : "border-purple-200"
                }`}
              >
                <p className="font-semibold text-sm mb-3">
                  🔢 Paso 3: Obtén tu Chat ID
                </p>
                <p className="text-sm mb-2">
                  El bot te responderá con tu Chat ID. Cópialo y pégalo aquí:
                </p>

                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Ej: 123456789"
                  className={`${inputClasses} w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 mt-2`}
                />
                {/* Botón de prueba */}
                {chatId.length >= 5 && (
                  <button
                    onClick={handleTestNotification}
                    disabled={loading}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Send size={16} />
                    )}
                    {loading
                      ? "Enviando..."
                      : "🧪 Enviar Notificación de Prueba"}
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep("configure")}
                disabled={!chatId || chatId.length < 5}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continuar
              </button>
            </>
          )}

          {step === "configure" && !subscribed && (
            <>
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-green-500/10" : "bg-green-50"
                } border ${
                  darkMode ? "border-green-500/20" : "border-green-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="text-green-500" size={20} />
                  <p className="font-semibold text-sm">Chat ID configurado</p>
                </div>
                <p className="text-sm opacity-70">ID: {chatId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  📊 Umbral de notificación
                </label>
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className={`${inputClasses} w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                >
                  <option value={0.5}>0.5% - Muy sensible</option>
                  <option value={1}>1% - Recomendado ⭐</option>
                  <option value={2}>2% - Moderado</option>
                  <option value={5}>5% - Solo cambios grandes</option>
                </select>
                <p className="text-xs mt-1.5 opacity-70">
                  Te notificaremos cuando el cambio supere este porcentaje
                </p>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Send size={20} />
                )}
                {loading ? "Activando..." : "Activar Notificaciones"}
              </button>

              <button
                onClick={() => setStep("instructions")}
                className={`w-full py-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } hover:underline`}
              >
                ← Volver a instrucciones
              </button>
            </>
          )}

          {subscribed && (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Check className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="text-green-500 font-semibold">
                      ¡Notificaciones activas!
                    </p>
                    <p className="text-xs opacity-70 mt-0.5">
                      Recibirás alertas en Telegram
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } space-y-1`}
                >
                  <p>
                    🆔 Chat ID: <span className="font-medium">{chatId}</span>
                  </p>
                  <p>
                    📊 Umbral: <span className="font-medium">{threshold}%</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                Desactivar Notificaciones
              </button>
            </>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                message.includes("✅")
                  ? "bg-green-500/10 text-green-500 border border-green-500/30"
                  : "bg-red-500/10 text-red-500 border border-red-500/30"
              }`}
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div
            className={`mt-4 p-3 rounded-lg text-xs ${
              darkMode ? "bg-gray-900/50" : "bg-gray-50"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <p className="font-semibold mb-1.5">✨ Ventajas de Telegram:</p>
            <ul className="space-y-1 opacity-80 ml-5">
              <li>• Notificaciones instantáneas</li>
              <li>• 100% gratis e ilimitado</li>
              <li>• Máximo 1 alerta cada 30 minutos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

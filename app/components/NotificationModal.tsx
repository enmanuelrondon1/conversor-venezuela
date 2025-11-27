// // app/components/NotificationModal.tsx
// 'use client';
// import { useState, useEffect } from 'react';
// import { X, Bell, BellOff, Check, AlertCircle, Smartphone } from 'lucide-react';

// interface NotificationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   darkMode: boolean;
// }

// export default function NotificationModal({ 
//   isOpen, 
//   onClose, 
//   darkMode 
// }: NotificationModalProps) {
//   const [phone, setPhone] = useState('');
//   const [threshold, setThreshold] = useState(1);
//   const [subscribed, setSubscribed] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Cargar datos guardados
//   useEffect(() => {
//     if (isOpen) {
//       const savedPhone = localStorage.getItem('whatsapp_phone');
//       const savedThreshold = localStorage.getItem('whatsapp_threshold');
//       const savedSubscribed = localStorage.getItem('whatsapp_subscribed');

//       if (savedPhone) setPhone(savedPhone);
//       if (savedThreshold) setThreshold(Number(savedThreshold));
//       if (savedSubscribed === 'true') setSubscribed(true);
//     }
//   }, [isOpen]);

//   const handleSubscribe = async () => {
//     setLoading(true);
//     setMessage('');

//     try {
//       const response = await fetch('/api/subscribe-whatsapp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone, threshold })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSubscribed(true);
//         setMessage('✅ ¡Suscrito exitosamente!');
        
//         localStorage.setItem('whatsapp_phone', phone);
//         localStorage.setItem('whatsapp_threshold', threshold.toString());
//         localStorage.setItem('whatsapp_subscribed', 'true');
        
//         // Disparar evento para actualizar el header
//         window.dispatchEvent(new Event('whatsapp-subscription-changed'));
        
//         setTimeout(() => {
//           onClose();
//         }, 2000);
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch (error) {
//       setMessage('❌ Error de conexión');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUnsubscribe = async () => {
//     setLoading(true);

//     try {
//       const response = await fetch('/api/subscribe-whatsapp', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone })
//       });

//       if (response.ok) {
//         setSubscribed(false);
//         setMessage('🔕 Desuscrito correctamente');
        
//         localStorage.removeItem('whatsapp_phone');
//         localStorage.removeItem('whatsapp_threshold');
//         localStorage.removeItem('whatsapp_subscribed');
        
//         window.dispatchEvent(new Event('whatsapp-subscription-changed'));
        
//         setTimeout(() => {
//           onClose();
//         }, 2000);
//       }
//     } catch (error) {
//       setMessage('❌ Error al desuscribirse');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const cardClasses = darkMode
//     ? 'bg-gray-800 border-gray-700'
//     : 'bg-white border-gray-200';

//   const inputClasses = darkMode
//     ? 'bg-gray-900 border-gray-700 focus:border-blue-500 text-white'
//     : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900';

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
//       <div 
//         className={`${cardClasses} rounded-2xl border shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200`}
//       >
//         {/* Header del Modal */}
//         <div className={`sticky top-0 ${cardClasses} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-green-500/10">
//               <Bell className="text-green-500" size={24} />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold">Alertas WhatsApp</h2>
//               <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                 Notificaciones en tiempo real
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className={`p-2 rounded-lg transition-colors ${
//               darkMode 
//                 ? 'hover:bg-gray-700 text-gray-400' 
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Contenido */}
//         <div className="p-6 space-y-4">
//           {!subscribed ? (
//             <>
//               <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-200'}`}>
//                 <div className="flex gap-3">
//                   <Smartphone className="text-blue-500 flex-shrink-0 mt-1" size={20} />
//                   <div>
//                     <p className="font-semibold text-sm mb-1">¿Cómo funciona?</p>
//                     <ul className={`text-xs space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                       <li>• Recibe alertas instantáneas en WhatsApp</li>
//                       <li>• Solo cuando el dólar cambie significativamente</li>
//                       <li>• Configura tu propio umbral de notificación</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2 flex items-center gap-2">
//                   📱 Número de WhatsApp
//                 </label>
//                 <input
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="+58XXXXXXXXXX"
//                   className={`${inputClasses} w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
//                 />
//                 <p className="text-xs mt-1.5 opacity-70">
//                   Incluye el código de país (Ej: +58 para Venezuela)
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2 flex items-center gap-2">
//                   📊 Umbral de notificación
//                 </label>
//                 <select
//                   value={threshold}
//                   onChange={(e) => setThreshold(Number(e.target.value))}
//                   className={`${inputClasses} w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
//                 >
//                   <option value={0.5}>0.5% - Muy sensible</option>
//                   <option value={1}>1% - Recomendado ⭐</option>
//                   <option value={2}>2% - Moderado</option>
//                   <option value={5}>5% - Solo cambios grandes</option>
//                 </select>
//                 <p className="text-xs mt-1.5 opacity-70">
//                   Te notificaremos cuando el cambio supere este porcentaje
//                 </p>
//               </div>

//               <button
//                 onClick={handleSubscribe}
//                 disabled={loading || phone.length < 10}
//                 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
//               >
//                 {loading ? (
//                   <span className="animate-spin">⏳</span>
//                 ) : (
//                   <Bell size={20} />
//                 )}
//                 {loading ? 'Activando...' : 'Activar Notificaciones'}
//               </button>
//             </>
//           ) : (
//             <>
//               <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="p-2 bg-green-500/20 rounded-lg">
//                     <Check className="text-green-500" size={20} />
//                   </div>
//                   <div>
//                     <p className="text-green-500 font-semibold">
//                       ¡Notificaciones activas!
//                     </p>
//                     <p className="text-xs opacity-70 mt-0.5">
//                       Recibirás alertas en tu WhatsApp
//                     </p>
//                   </div>
//                 </div>
//                 <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
//                   <p>📱 <span className="font-medium">{phone}</span></p>
//                   <p>📊 Umbral: <span className="font-medium">{threshold}%</span></p>
//                 </div>
//               </div>

//               <button
//                 onClick={handleUnsubscribe}
//                 disabled={loading}
//                 className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
//               >
//                 <BellOff size={20} />
//                 Desactivar Notificaciones
//               </button>
//             </>
//           )}

//           {message && (
//             <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
//               message.includes('✅') 
//                 ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
//                 : 'bg-red-500/10 text-red-500 border border-red-500/30'
//             }`}>
//               <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
//               <span>{message}</span>
//             </div>
//           )}

//           <div className={`mt-4 p-3 rounded-lg text-xs ${
//             darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
//           } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <p className="font-semibold mb-1.5 flex items-center gap-1">
//               <AlertCircle size={14} />
//               Requisitos previos:
//             </p>
//             <ul className="space-y-1 opacity-80 ml-5">
//               <li>• Envía "join once-pack" al +1 415 523 8886</li>
//               <li>• Máximo 1 notificación cada 30 minutos</li>
//               <li>• Servicio gratuito en fase de prueba</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
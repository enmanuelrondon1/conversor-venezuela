// app/api/telegram-webhook/route.ts
import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📨 Webhook recibido:', JSON.stringify(body, null, 2));

    // Extraer información del mensaje
    const message = body.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username || message.from.first_name;

    console.log(`👤 Usuario: ${username} (${chatId})`);
    console.log(`💬 Mensaje: ${text}`);

    // Responder al comando /start
    if (text === '/start') {
      const responseMessage = `
🎉 <b>¡Bienvenido a Conversor Venezuela!</b>

✅ Tu Chat ID es: <code>${chatId}</code>

📋 <b>Instrucciones:</b>
1. Copia el Chat ID de arriba (haz clic en él)
2. Regresa a la aplicación web
3. Pégalo en el campo correspondiente
4. Configura tus preferencias de alertas

🔔 Recibirás notificaciones cuando el dólar cambie significativamente.

💡 <b>Comandos disponibles:</b>
/start - Ver este mensaje y tu Chat ID
/info - Información del bot
/ayuda - Obtener ayuda
      `.trim();

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseMessage,
          parse_mode: 'HTML'
        }),
      });

      console.log(`✅ Respuesta enviada a ${username}`);
    }

    // Responder al comando /info
    else if (text === '/info') {
      const infoMessage = `
ℹ️ <b>Información del Bot</b>

🤖 <b>Bot:</b> Conversor Venezuela
💱 <b>Función:</b> Alertas de cambio de dólar
📊 <b>Fuentes:</b> BCV y mercado paralelo

🆔 <b>Tu Chat ID:</b> <code>${chatId}</code>
👤 <b>Usuario:</b> ${username}
      `.trim();

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: infoMessage,
          parse_mode: 'HTML'
        }),
      });
    }

    // Responder al comando /ayuda
    else if (text === '/ayuda') {
      const helpMessage = `
❓ <b>Ayuda - Conversor Venezuela</b>

<b>Comandos disponibles:</b>
/start - Obtener tu Chat ID
/info - Ver información del bot
/ayuda - Ver esta ayuda

<b>¿Cómo funciona?</b>
1. Envía /start para obtener tu Chat ID
2. Configura alertas en la app web
3. Recibirás notificaciones automáticas

<b>¿Problemas?</b>
• Verifica que copiaste bien el Chat ID
• Prueba la notificación de prueba en la app
• Revisa tu configuración de umbral

🌐 Visita: conversor-venezuela.vercel.app
      `.trim();

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: helpMessage,
          parse_mode: 'HTML'
        }),
      });
    }

    // Respuesta genérica para otros mensajes
    else {
      const genericMessage = `
💬 Recibí tu mensaje: "${text}"

Para ver los comandos disponibles, envía:
/ayuda
      `.trim();

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: genericMessage,
          parse_mode: 'HTML'
        }),
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'Webhook activo',
    botToken: TELEGRAM_BOT_TOKEN ? 'Configurado ✅' : 'No configurado ❌',
    timestamp: new Date().toISOString()
  });
}
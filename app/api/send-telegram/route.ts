// app/api/send-telegram/route.ts
import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: Request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram no está configurado. Verifica TELEGRAM_BOT_TOKEN en .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { chatId, message } = body;

    // Si viene con el formato antiguo (paralelo, oficial, etc)
    if (body.paralelo && body.oficial) {
      const { 
        paralelo, 
        oficial, 
        previousParalelo,
        percentageChange 
      } = body;

      const direction = percentageChange > 0 ? '📈' : '📉';
      const emoji = percentageChange > 0 ? '🔴' : '🟢';
      const changeText = percentageChange > 0 ? 'SUBIÓ' : 'BAJÓ';
      
      const formattedMessage = `
${emoji} *ALERTA: Dólar ${changeText}*

${direction} *Cambio Detectado: ${Math.abs(percentageChange).toFixed(2)}%*

💵 *Dólar Paralelo:* \`${paralelo} Bs/$\`
🏦 *Dólar Oficial:* \`${oficial} Bs/$\`

📊 *Diferencia:* ${((parseFloat(paralelo) - parseFloat(oficial)) / parseFloat(oficial) * 100).toFixed(2)}% por encima del oficial

📉 *Anterior:* ${previousParalelo} Bs/$
📈 *Cambio:* ${(parseFloat(paralelo) - parseFloat(previousParalelo)).toFixed(2)} Bs

⏰ ${new Date().toLocaleString('es-VE', { 
  timeZone: 'America/Caracas',
  dateStyle: 'medium',
  timeStyle: 'short'
})}
      `.trim();

      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Error de Telegram:', data);
        return NextResponse.json(
          { error: data.description || 'Error al enviar mensaje a Telegram' },
          { status: response.status }
        );
      }

      console.log('✅ Mensaje de Telegram enviado:', data.result.message_id);

      return NextResponse.json({ 
        success: true, 
        messageId: data.result.message_id,
        sentAt: new Date().toISOString()
      });
    }

    // Si viene con mensaje directo (para el modal)
    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId y message son requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Telegram:', data);
      return NextResponse.json(
        { error: data.description || 'Error al enviar mensaje a Telegram' },
        { status: response.status }
      );
    }

    console.log('✅ Mensaje de Telegram enviado:', data.result.message_id);

    return NextResponse.json({ 
      success: true, 
      messageId: data.result.message_id
    });

  } catch (error: any) {
    console.error('❌ Error enviando a Telegram:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al enviar mensaje',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: !!TELEGRAM_BOT_TOKEN,
    apiUrl: TELEGRAM_API_URL ? 'Configurado' : 'No configurado'
  });
}
import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // formato: whatsapp:+14155238886

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { 
      phone, 
      paralelo, 
      oficial, 
      previousParalelo,
      percentageChange 
    } = await request.json();

    const direction = percentageChange > 0 ? '📈' : '📉';
    const message = `
🔔 *Alerta Dólar Venezuela*

${direction} *Cambio Detectado*

💵 Dólar Paralelo: ${paralelo} Bs/$
🏦 Dólar Oficial: ${oficial} Bs/$

📊 Cambio: ${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%
(Anterior: ${previousParalelo} Bs/$)

⏰ ${new Date().toLocaleString('es-VE', { 
  timeZone: 'America/Caracas' 
})}

Más info: https://tu-app.com
    `.trim();

    const messageResponse = await client.messages.create({
      from: twilioWhatsApp,
      to: `whatsapp:${phone}`,
      body: message
    });

    return NextResponse.json({ 
      success: true, 
      messageSid: messageResponse.sid 
    });
  } catch (error: any) {
    console.error('Error enviando WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
// app/api/subscribe-telegram/route.ts
import { NextResponse } from 'next/server';

// Almacenamiento temporal (en producción usa una base de datos)
const subscribers = new Map<string, {
  chatId: string;
  username?: string;
  threshold: number;
  lastNotified: Date;
}>();

export async function POST(request: Request) {
  try {
    const { chatId, username, threshold = 1 } = await request.json();
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID es requerido' },
        { status: 400 }
      );
    }

    subscribers.set(chatId, {
      chatId,
      username,
      threshold,
      lastNotified: new Date()
    });

    console.log(`✅ Usuario suscrito: ${username || chatId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción exitosa a notificaciones de Telegram',
      chatId,
      threshold
    });
  } catch (error) {
    console.error('Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error al suscribirse' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { chatId } = await request.json();
    
    if (subscribers.has(chatId)) {
      subscribers.delete(chatId);
      console.log(`🔕 Usuario desuscrito: ${chatId}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Desuscripción exitosa' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al desuscribirse' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    totalSubscribers: subscribers.size,
    subscribers: Array.from(subscribers.values()).map(s => ({
      chatId: s.chatId,
      username: s.username,
      threshold: s.threshold
    }))
  });
}
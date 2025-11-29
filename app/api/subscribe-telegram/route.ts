// app/api/subscribe-telegram/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const SUBSCRIBERS_KEY = 'telegram:subscribers';

export async function POST(request: Request) {
  try {
    const { chatId, username, threshold = 1 } = await request.json();
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID es requerido' },
        { status: 400 }
      );
    }

    // Obtener suscriptores actuales
    let subscribers: any[] = await kv.get(SUBSCRIBERS_KEY) || [];
    
    // Verificar si ya existe
    const existingIndex = subscribers.findIndex((s: any) => s.chatId === chatId);
    
    const subscriber = {
      chatId,
      username,
      threshold,
      subscribedAt: existingIndex >= 0 ? subscribers[existingIndex].subscribedAt : new Date().toISOString(),
      lastNotified: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = subscriber;
      console.log(`🔄 Usuario actualizado: ${username || chatId}`);
    } else {
      subscribers.push(subscriber);
      console.log(`✅ Nuevo usuario suscrito: ${username || chatId}`);
    }

    // Guardar en KV
    await kv.set(SUBSCRIBERS_KEY, subscribers);

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción exitosa a notificaciones de Telegram',
      chatId,
      threshold,
      totalSubscribers: subscribers.length
    });
  } catch (error) {
    console.error('❌ Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error al suscribirse', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { chatId } = await request.json();
    
    let subscribers: any[] = await kv.get(SUBSCRIBERS_KEY) || [];
    const filtered = subscribers.filter((s: any) => s.chatId !== chatId);
    
    if (filtered.length < subscribers.length) {
      await kv.set(SUBSCRIBERS_KEY, filtered);
      console.log(`🔕 Usuario desuscrito: ${chatId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Desuscripción exitosa',
        totalSubscribers: filtered.length
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Usuario no encontrado' 
    }, { status: 404 });
  } catch (error) {
    console.error('❌ Error al desuscribir:', error);
    return NextResponse.json(
      { error: 'Error al desuscribirse' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscribers: any[] = await kv.get(SUBSCRIBERS_KEY) || [];
    
    return NextResponse.json({
      success: true,
      totalSubscribers: subscribers.length,
      subscribers: subscribers.map((s: any) => ({
        chatId: s.chatId,
        username: s.username,
        threshold: s.threshold,
        subscribedAt: s.subscribedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo suscriptores:', error);
    return NextResponse.json({
      success: false,
      totalSubscribers: 0,
      subscribers: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
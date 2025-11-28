// app/api/check-rates/route.ts
import { NextResponse } from 'next/server';

// Forzar Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Store para mantener el estado entre ejecuciones
let lastRates = {
  paralelo: null as number | null,
  oficial: null as number | null,
  lastCheck: null as string | null
};

export async function GET(request: Request) {
  try {
    console.log('🔍 Verificando cambios en tasas...');

    // Usar API alternativa que funciona mejor con Vercel
    const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching rates: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extraer tasas (esta API retorna un array)
    // Buscar el dólar oficial (BCV) y paralelo
    const oficialData = data.find((item: any) => 
      item.fuente?.toLowerCase().includes('bcv') || 
      item.nombre?.toLowerCase().includes('oficial')
    );
    
    const paraleloData = data.find((item: any) => 
      item.fuente?.toLowerCase().includes('paralelo') ||
      item.nombre?.toLowerCase().includes('paralelo')
    );

    // Si no encuentra, usar el primero como oficial y segundo como paralelo
    const currentOficial = oficialData?.promedio || data[0]?.promedio || 244.65;
    const currentParalelo = paraleloData?.promedio || data[1]?.promedio || 368.81;

    console.log(`📊 Tasas actuales - Paralelo: ${currentParalelo}, Oficial: ${currentOficial}`);
    console.log(`📊 Fuentes - Oficial: ${oficialData?.fuente || 'default'}, Paralelo: ${paraleloData?.fuente || 'default'}`);

    // Si es la primera vez, solo guardar
    if (lastRates.paralelo === null) {
      lastRates = {
        paralelo: currentParalelo,
        oficial: currentOficial,
        lastCheck: new Date().toISOString()
      };
      
      console.log('✅ Primera ejecución, tasas guardadas');
      
      return NextResponse.json({ 
        message: 'Primera ejecución - tasas guardadas',
        currentRates: {
          paralelo: currentParalelo,
          oficial: currentOficial
        },
        sources: {
          oficial: oficialData?.fuente || 'default',
          paralelo: paraleloData?.fuente || 'default'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Calcular cambio porcentual
    const percentageChange = Math.abs(
      ((currentParalelo - lastRates.paralelo) / lastRates.paralelo) * 100
    );

    console.log(`📈 Cambio detectado: ${percentageChange.toFixed(2)}%`);

    // Si el cambio es significativo, notificar
    const threshold = 0.1; // 0.1% para testing (cambiar a 1% en producción)
    
    if (percentageChange >= threshold) {
      console.log(`🚨 ¡Cambio significativo (${percentageChange.toFixed(2)}%)! Enviando notificaciones...`);

      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (chatId) {
        try {
          const url = new URL(request.url);
          const baseUrl = `${url.protocol}//${url.host}`;
          const apiUrl = `${baseUrl}/api/send-telegram`;

          console.log(`📤 Enviando notificación a: ${apiUrl}`);

          const notificationResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: chatId,
              paralelo: currentParalelo.toFixed(2),
              oficial: currentOficial.toFixed(2),
              previousParalelo: lastRates.paralelo.toFixed(2),
              percentageChange: percentageChange
            })
          });

          const notificationData = await notificationResponse.json();
          
          if (notificationData.success) {
            console.log('✅ Notificación enviada exitosamente');
          } else {
            console.error('❌ Error al enviar notificación:', notificationData.error);
          }
        } catch (notifError) {
          console.error('❌ Error en notificación:', notifError);
        }
      } else {
        console.log('⚠️ No hay TELEGRAM_CHAT_ID configurado en .env');
      }

      // Actualizar últimas tasas conocidas
      lastRates = {
        paralelo: currentParalelo,
        oficial: currentOficial,
        lastCheck: new Date().toISOString()
      };
    } else {
      console.log(`✅ Cambio menor al umbral (${threshold}%). No se envía notificación.`);
    }

    return NextResponse.json({ 
      success: true,
      currentRates: {
        paralelo: currentParalelo,
        oficial: currentOficial
      },
      lastKnownRates: lastRates,
      percentageChange: percentageChange.toFixed(2),
      threshold: threshold,
      notificationSent: percentageChange >= threshold,
      sources: {
        oficial: oficialData?.fuente || 'default',
        paralelo: paraleloData?.fuente || 'default'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al verificar tasas:', error);
    return NextResponse.json({ 
      error: 'Error al verificar tasas',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
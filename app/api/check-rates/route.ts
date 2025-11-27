// app/api/check-rates/route.ts
import { NextResponse } from 'next/server';

// Store para mantener el estado entre ejecuciones
let lastRates = {
  paralelo: null as number | null,
  oficial: null as number | null,
  lastCheck: null as string | null
};

export async function GET(request: Request) {
  try {
    console.log('🔍 Verificando cambios en tasas...');

    // 1. Obtener tasa paralelo (P2P/Criptomonedas)
    const paraleloRes = await fetch('https://pydolarve.org/api/v1/dollar?page=enparalelovzla', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!paraleloRes.ok) {
      throw new Error(`Error fetching paralelo: ${paraleloRes.status}`);
    }

    const paraleloData = await paraleloRes.json();
    
    // 2. Obtener tasa oficial BCV
    const oficialRes = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!oficialRes.ok) {
      throw new Error(`Error fetching oficial: ${oficialRes.status}`);
    }

    const oficialData = await oficialRes.json();

    // Extraer precios
    const currentParalelo = parseFloat(paraleloData.monitors.enparalelovzla.price);
    const currentOficial = parseFloat(oficialData.monitors.usd.price);

    console.log(`📊 Tasas actuales - Paralelo: ${currentParalelo}, Oficial: ${currentOficial}`);

    // 2. Si es la primera vez, solo guardar
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
        timestamp: new Date().toISOString()
      });
    }

    // 3. Calcular cambio porcentual
    const percentageChange = Math.abs(
      ((currentParalelo - lastRates.paralelo) / lastRates.paralelo) * 100
    );

    console.log(`📈 Cambio detectado: ${percentageChange.toFixed(2)}%`);

    // 4. Si el cambio es significativo, notificar
    const threshold = 0.1; // 0.1% para testing (luego cambiar a 1%)
    
    if (percentageChange >= threshold) {
      console.log(`🚨 ¡Cambio significativo (${percentageChange.toFixed(2)}%)! Enviando notificaciones...`);

      // Obtener tu Chat ID desde .env
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (chatId) {
        try {
          // Construir URL base
          const baseUrl = request.headers.get('host');
          const protocol = request.headers.get('x-forwarded-proto') || 'http';
          const apiUrl = `${protocol}://${baseUrl}/api/send-telegram`;

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
        console.log('⚠️ No hay TELEGRAM_CHAT_ID configurado');
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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al verificar tasas:', error);
    return NextResponse.json({ 
      error: 'Error al verificar tasas',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
// app/api/check-rates/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Store para mantener el estado
let lastRates = {
  paralelo: null as number | null,
  oficial: null as number | null,
  lastCheck: null as string | null
};

// Importar los suscriptores desde el endpoint de suscripción
// (necesitamos hacer esto más elegante con una DB, pero por ahora funciona)

export async function GET(request: Request) {
  try {
    console.log('🔍 Verificando cambios en tasas...');

    // Obtener tasas actuales
    const response = await fetch('https://ve.dolarapi.com/v1/dolares', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching rates: ${response.status}`);
    }

    const data = await response.json();
    
    const oficialData = data.find((item: any) => 
      item.fuente?.toLowerCase().includes('bcv') || 
      item.nombre?.toLowerCase().includes('oficial')
    );
    
    const paraleloData = data.find((item: any) => 
      item.fuente?.toLowerCase().includes('paralelo') ||
      item.nombre?.toLowerCase().includes('paralelo')
    );

    const currentOficial = oficialData?.promedio || data[0]?.promedio || 244.65;
    const currentParalelo = paraleloData?.promedio || data[1]?.promedio || 368.81;

    console.log(`📊 Tasas actuales - Paralelo: ${currentParalelo}, Oficial: ${currentOficial}`);

    // Primera ejecución
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

    // Calcular cambio porcentual
    const percentageChange = Math.abs(
      ((currentParalelo - lastRates.paralelo) / lastRates.paralelo) * 100
    );

    console.log(`📈 Cambio detectado: ${percentageChange.toFixed(2)}%`);

    // Si el cambio es significativo, notificar a TODOS los suscritos
    const threshold = 1; // 1% para producción
    
    if (percentageChange >= threshold) {
      console.log(`🚨 ¡Cambio significativo (${percentageChange.toFixed(2)}%)! Enviando notificaciones...`);

      try {
        // Obtener lista de suscriptores
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        
        const subscribersResponse = await fetch(`${baseUrl}/api/subscribe-telegram`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const subscribersData = await subscribersResponse.json();
        const subscribers = subscribersData.subscribers || [];

        console.log(`📢 Enviando notificaciones a ${subscribers.length} suscriptores...`);

        let successCount = 0;
        let failCount = 0;

        // Enviar notificación a cada suscriptor
        for (const subscriber of subscribers) {
          try {
            // Verificar si el cambio supera el umbral del usuario
            if (percentageChange >= subscriber.threshold) {
              const notificationResponse = await fetch(`${baseUrl}/api/send-telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chatId: subscriber.chatId,
                  paralelo: currentParalelo.toFixed(2),
                  oficial: currentOficial.toFixed(2),
                  previousParalelo: lastRates.paralelo.toFixed(2),
                  percentageChange: percentageChange
                })
              });

              const notificationData = await notificationResponse.json();
              
              if (notificationData.success) {
                successCount++;
                console.log(`✅ Notificación enviada a ${subscriber.chatId}`);
              } else {
                failCount++;
                console.error(`❌ Error enviando a ${subscriber.chatId}:`, notificationData.error);
              }
            } else {
              console.log(`⏭️ Suscriptor ${subscriber.chatId} tiene umbral ${subscriber.threshold}% > cambio ${percentageChange.toFixed(2)}%`);
            }

            // Pequeña pausa entre notificaciones para no saturar Telegram
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (notifError) {
            failCount++;
            console.error(`❌ Error en notificación para ${subscriber.chatId}:`, notifError);
          }
        }

        console.log(`📊 Resumen: ${successCount} enviadas, ${failCount} fallidas de ${subscribers.length} total`);

      } catch (subscriberError) {
        console.error('❌ Error obteniendo suscriptores:', subscriberError);
      }

      // Actualizar últimas tasas conocidas
      lastRates = {
        paralelo: currentParalelo,
        oficial: currentOficial,
        lastCheck: new Date().toISOString()
      };
    } else {
      console.log(`✅ Cambio menor al umbral (${threshold}%). No se envían notificaciones.`);
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
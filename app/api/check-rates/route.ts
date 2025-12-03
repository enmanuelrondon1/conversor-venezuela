// app/api/check-rates/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LAST_RATES_KEY = 'rates:last_check';
const SUBSCRIBERS_KEY = 'telegram:subscribers';

interface LastRates {
  paralelo: number;
  oficial: number;
  lastCheck: string;
}

export async function GET(request: Request) {
  try {
    console.log('🔍 [' + new Date().toISOString() + '] Verificando cambios en tasas...');

    // Obtener tasas actuales desde la API
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

    const currentOficial = oficialData?.promedio || data[0]?.promedio || 0;
    const currentParalelo = paraleloData?.promedio || data[1]?.promedio || 0;

    console.log(`📊 Tasas actuales - Paralelo: ${currentParalelo}, Oficial: ${currentOficial}`);

    // Obtener las últimas tasas conocidas desde KV
    let lastRates: LastRates | null = null;
    
    try {
      lastRates = await kv.get(LAST_RATES_KEY);
      console.log('📦 Tasas desde KV:', lastRates);
    } catch (kvError) {
      console.error('⚠️ Error leyendo KV:', kvError);
    }

    // Primera ejecución o no hay datos previos
    if (!lastRates || typeof lastRates.paralelo !== 'number') {
      const newRates: LastRates = {
        paralelo: currentParalelo,
        oficial: currentOficial,
        lastCheck: new Date().toISOString()
      };
      
      try {
        await kv.set(LAST_RATES_KEY, newRates);
        console.log('✅ Primera ejecución - tasas guardadas en KV:', newRates);
      } catch (kvError) {
        console.error('❌ Error guardando en KV:', kvError);
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Primera ejecución - tasas guardadas',
        currentRates: {
          paralelo: currentParalelo,
          oficial: currentOficial
        },
        timestamp: new Date().toISOString()
      });
    }

    // Calcular cambio porcentual
    const percentageChange = ((currentParalelo - lastRates.paralelo) / lastRates.paralelo) * 100;
    const absoluteChange = Math.abs(percentageChange);

    console.log(`📈 Cambio detectado: ${percentageChange.toFixed(2)}% (${absoluteChange.toFixed(2)}% absoluto)`);
    console.log(`   Anterior: ${lastRates.paralelo} → Actual: ${currentParalelo}`);

    const threshold = 1; // 1% para producción
    
    // Si el cambio es significativo, notificar
    if (absoluteChange >= threshold) {
      console.log(`🚨 ¡Cambio significativo (${absoluteChange.toFixed(2)}%)! Enviando notificaciones...`);

      try {
        // Obtener suscriptores desde KV
        const subscribers: any[] = await kv.get(SUBSCRIBERS_KEY) || [];
        
        console.log(`📢 Total de suscriptores: ${subscribers.length}`);

        if (subscribers.length === 0) {
          console.log('⚠️ No hay suscriptores registrados');
          
          // Actualizar tasas aunque no haya suscriptores
          await kv.set(LAST_RATES_KEY, {
            paralelo: currentParalelo,
            oficial: currentOficial,
            lastCheck: new Date().toISOString()
          });
          
          return NextResponse.json({ 
            success: true,
            message: 'Cambio detectado pero no hay suscriptores',
            currentRates: { paralelo: currentParalelo, oficial: currentOficial },
            previousRates: lastRates,
            percentageChange: percentageChange.toFixed(2),
            absoluteChange: absoluteChange.toFixed(2),
            timestamp: new Date().toISOString()
          });
        }

        let successCount = 0;
        let failCount = 0;
        const results: any[] = [];

        // Obtener base URL
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Enviar notificación a cada suscriptor
        for (const subscriber of subscribers) {
          try {
            // Verificar si el cambio supera el umbral del usuario
            if (absoluteChange >= (subscriber.threshold || 1)) {
              console.log(`📤 Enviando a ${subscriber.username || subscriber.chatId} (umbral: ${subscriber.threshold}%)`);
              
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
                results.push({
                  chatId: subscriber.chatId,
                  status: 'success',
                  messageId: notificationData.messageId
                });
                console.log(`✅ Enviado a ${subscriber.username || subscriber.chatId}`);
              } else {
                failCount++;
                results.push({
                  chatId: subscriber.chatId,
                  status: 'failed',
                  error: notificationData.error
                });
                console.error(`❌ Error enviando a ${subscriber.chatId}:`, notificationData.error);
              }
            } else {
              console.log(`⏭️ Suscriptor ${subscriber.chatId} tiene umbral ${subscriber.threshold}% > cambio ${absoluteChange.toFixed(2)}%`);
            }

            // Pequeña pausa entre notificaciones
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (notifError) {
            failCount++;
            results.push({
              chatId: subscriber.chatId,
              status: 'error',
              error: notifError instanceof Error ? notifError.message : 'Unknown error'
            });
            console.error(`❌ Error en notificación para ${subscriber.chatId}:`, notifError);
          }
        }

        console.log(`📊 Resumen: ${successCount} enviadas, ${failCount} fallidas de ${subscribers.length} total`);

        // Actualizar últimas tasas conocidas en KV
        await kv.set(LAST_RATES_KEY, {
          paralelo: currentParalelo,
          oficial: currentOficial,
          lastCheck: new Date().toISOString()
        });

        return NextResponse.json({ 
          success: true,
          notificationsSent: successCount,
          notificationsFailed: failCount,
          totalSubscribers: subscribers.length,
          currentRates: {
            paralelo: currentParalelo,
            oficial: currentOficial
          },
          previousRates: lastRates,
          percentageChange: percentageChange.toFixed(2),
          absoluteChange: absoluteChange.toFixed(2),
          threshold: threshold,
          results,
          timestamp: new Date().toISOString()
        });

      } catch (subscriberError) {
        console.error('❌ Error obteniendo/notificando suscriptores:', subscriberError);
        throw subscriberError;
      }
    } else {
      console.log(`✅ Cambio menor al umbral (${threshold}%). No se envían notificaciones.`);
      
      return NextResponse.json({ 
        success: true,
        message: 'Cambio no significativo',
        currentRates: {
          paralelo: currentParalelo,
          oficial: currentOficial
        },
        lastKnownRates: lastRates,
        percentageChange: percentageChange.toFixed(2),
        absoluteChange: absoluteChange.toFixed(2),
        threshold: threshold,
        notificationSent: false,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar tasas:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error al verificar tasas',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Endpoint adicional para forzar reset de tasas (útil para debugging)
export async function DELETE() {
  try {
    await kv.del(LAST_RATES_KEY);
    console.log('🗑️ Tasas reseteadas desde KV');
    
    return NextResponse.json({
      success: true,
      message: 'Tasas reseteadas. La próxima ejecución será considerada como primera vez.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al resetear:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al resetear tasas'
    }, { status: 500 });
  }
}
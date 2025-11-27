import { NextResponse } from 'next/server';

// Almacenamiento temporal (en producción usa una base de datos)
const subscribers = new Map<string, {
  phone: string;
  threshold: number; // Porcentaje de cambio para notificar
  lastNotified: Date;
}>();

export async function POST(request: Request) {
  try {
    const { phone, threshold = 1 } = await request.json();
    
    // Validar formato de teléfono (debe incluir código de país)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido. Use +58XXXXXXXXXX' },
        { status: 400 }
      );
    }

    subscribers.set(phone, {
      phone,
      threshold,
      lastNotified: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción exitosa',
      phone 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al suscribirse' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { phone } = await request.json();
    subscribers.delete(phone);
    
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


import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, business, message } = body;

    // Validación básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Por favor completa todos los campos requeridos.' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Por favor ingresa un email válido.' },
        { status: 400 }
      );
    }

    // Enviar al endpoint de WordPress
    const wordpressUrl = process.env.WORDPRESS_API_URL || 'https://endpoint.playfulagency.com/wp-json';
    const contactEndpoint = `${wordpressUrl}/playful/v1/contact`;

    const response = await fetch(contactEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || '',
        business: business || '',
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error from WordPress:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.' 
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.',
    });

  } catch (error) {
    console.error('Error en el endpoint de contacto:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.' 
      },
      { status: 500 }
    );
  }
}

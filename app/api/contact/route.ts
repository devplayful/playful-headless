import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, business, message, recaptchaToken } = body;

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

    // Validar reCAPTCHA v2 de forma obligatoria y cerrada ante fallos.
    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: 'Por favor, completa la verificación de seguridad.' },
        { status: 400 }
      );
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY no está configurada.');
      return NextResponse.json(
        { success: false, message: 'La verificación de seguridad no está disponible temporalmente.' },
        { status: 503 }
      );
    }

    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptchaToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!recaptchaResponse.ok) {
      console.error('Google reCAPTCHA no respondió correctamente:', recaptchaResponse.status);
      return NextResponse.json(
        { success: false, message: 'No pudimos completar la verificación de seguridad.' },
        { status: 502 }
      );
    }

    const recaptchaData = await recaptchaResponse.json();

    if (recaptchaData.success !== true) {
      return NextResponse.json(
        { success: false, message: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.' },
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
      signal: AbortSignal.timeout(10_000),
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

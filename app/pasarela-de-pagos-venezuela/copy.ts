import type { AgencyLandingCopy } from '@/lib/agency-copy-landing';

export const PASARELA_META = {
  title: 'Pasarela de pagos Venezuela para tu ecommerce | Playful',
  description:
    'Integramos en tu e-commerce los métodos de pago de Venezuela: SiTef, Instapago, Pago Móvil, Cashea, Banesco y Zelle. Reserva 30 a 40 minutos con Playful.',
  path: '/pasarela-de-pagos-venezuela',
  serviceName: 'Pasarela de pagos Venezuela',
} as const;

export const CTA_LABEL = 'Agenda tu reunión de diagnóstico';

export const PASARELA_COPY: AgencyLandingCopy = {
  meta: PASARELA_META,
  ctaLabel: CTA_LABEL,
  hero: {
    h1: 'Pasarela de pagos en Venezuela: integra los cobros de tu e-commerce',
    paragraphs: [
      'Tu tienda ya vende, y cobrar en Venezuela depende de lo que cada proveedor ofrece, de cómo se conecta con tu plataforma y de lo que pasa con tu dinero después de que el cliente paga. En Playful integramos esos métodos de pago en tu tienda para que el checkout funcione y la conciliación no quede en el aire.',
    ],
  },
  sections: [
    {
      h2: 'Qué es una pasarela de pagos en el e-commerce venezolano',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Una pasarela de pagos es el puente entre tu tienda y el banco o procesador que autoriza la transacción. En Venezuela conviven el bolívar y el dólar en una misma operación, y la liquidación depende del método. Recibir la notificación de pago aprobado y tener el monto vinculado al pedido correcto son dos momentos distintos.',
        },
      ],
    },
    {
      h2: 'Qué necesita tu marca si ya vende en Venezuela',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'Tu tienda ya está activa y ya genera ventas. Lo que hace falta es un checkout que acepte los métodos de pago que tus clientes usan, y un flujo para saber qué pedidos están pagados, cuáles están pendientes y en qué moneda se liquidó cada transacción. Eso implica tres capas. La primera es la integración técnica, que conecta tu plataforma con la pasarela o el botón de pago que elijas. La segunda es la verificación, para que tu sistema reciba la confirmación del pago y pueda marcar el pedido como cobrado. La tercera es la conciliación, para cruzar lo que el banco o el procesador reporta con la orden que registró la tienda. Si una capa falla o se queda manual, dedicas horas a cuadrar pagos en lugar de vender.',
        },
      ],
    },
    {
      h2: 'Qué hace Playful y qué no',
      variant: 'mint',
      blocks: [
        {
          type: 'p',
          text: 'Playful es una agencia de desarrollo e integración de e-commerce. Conectamos tu tienda con las pasarelas y los métodos de pago disponibles en Venezuela. El procesamiento y el dinero del cliente se quedan en el proveedor y en el banco. Playful hace la integración en la tienda. Evaluamos contigo qué combinación de métodos se ajusta a tu negocio, los integramos en tu plataforma y el checkout funciona para tus compradores. En WooCommerce integramos métodos de pago locales venezolanos. En Shopify el trabajo es e-commerce internacional, con los procesadores que la plataforma soporta de forma nativa. También hacemos [desarrollo de tiendas en Shopify](https://playfulagency.com/agencia-shopify) y [proyectos de e-commerce completos](https://playfulagency.com/agencia-e-commerce). La integración de pagos entra en esa tienda, de la estructura al checkout.',
        },
      ],
    },
    {
      h2: 'Métodos de pago que integramos en e-commerce en Venezuela',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'Estos son los métodos de pago con los que Playful tiene experiencia de integración en tiendas WooCommerce para el mercado venezolano. Cada caso depende de tu operación, de tu banco y del perfil de tus compradores.',
        },
        {
          type: 'h3',
          text: 'SiTef de Venezuela',
        },
        {
          type: 'p',
          text: 'SiTef ofrece un botón de pago web que acepta pagos con tarjetas de crédito y débito nacional, permite procesar tarjetas de crédito y débito internacionales (como Visa y MasterCard). También permite verificación de Pago Móvil con respuesta de aprobado o no aprobado. Playful integra SiTef en tiendas WooCommerce para habilitar estos métodos en el checkout venezolano. La moneda de procesamiento y las condiciones de liquidación dependen del acuerdo entre tu comercio y SiTef. En la ficha del proveedor este botón también aparece como E-SiTef.',
        },
        {
          type: 'h3',
          text: 'Instapago y Pago Móvil',
        },
        {
          type: 'p',
          text: 'Instapago es un procesador venezolano que permite cobrar con tarjetas nacionales y Pago Móvil en la tienda. Pago Móvil es uno de los métodos más extendidos entre compradores en Venezuela. Playful conecta Instapago con WooCommerce para que la tienda reciba y verifique estos pagos sin un proceso manual por cada pedido.',
        },
        {
          type: 'h3',
          text: 'Cashea',
        },
        {
          type: 'p',
          text: 'Cashea ofrece pagos en cuotas para compradores venezolanos. Integrar Cashea permite que tus clientes dividan el pago en plazos, y tu comercio recibe el monto según los términos del acuerdo con el proveedor. Playful integra Cashea como opción de pago en WooCommerce para tiendas que quieren ofrecer ese financiamiento a través de su tienda en línea.',
        },
        {
          type: 'h3',
          text: 'Banesco Panamá',
        },
        {
          type: 'p',
          text: 'Banesco Panamá permite procesar pagos con tarjetas internacionales (Visa, Mastercard) para comercios que operan desde Venezuela. Sirve a tiendas que necesitan aceptar tarjetas emitidas fuera de Venezuela o que operan parte de su facturación en dólares. Playful integra esta pasarela en WooCommerce para habilitar ese cobro en el checkout, es requisito indispensable que tu comercio tenga una cuenta en Banesco Panamá para poder realizar esta integración.',
        },
        {
          type: 'h3',
          text: 'Botón de pago BDV',
        },
        {
          type: 'p',
          text: 'El Banco de Venezuela ofrece un botón de pago para integrar en sitios web. El servicio permite débito directo desde cuentas BDV y opera con cierre automático al final del día, según su ficha oficial. Para usarlo necesitas una cuenta en el Banco de Venezuela y afiliación como punto de venta. Playful puede integrar este botón en tu tienda WooCommerce si tu operación cumple los requisitos del banco.',
        },
        {
          type: 'h3',
          text: 'Zelle automatizado',
        },
        {
          type: 'p',
          text: 'Zelle funciona como método de pago en dólares para tiendas de marcas que ya operan con una cuenta bancaria en Estados Unidos elegible. La integración en el checkout permite que la tienda registre y verifique pagos Zelle sin un proceso manual por cada transacción. Playful integra Zelle automatizado en WooCommerce para marcas que ya tienen la cuenta habilitada. No abrimos cuentas Zelle ni asesoramos sobre elegibilidad bancaria. Si quieres ver cómo funciona Zelle como método de pago para una tienda, y qué implica para la operación, lee [Zelle en Venezuela: un método de pago para tu e-commerce](https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce).',
        },
      ],
    },
    {
      h2: 'Moneda y liquidación en el checkout',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Un error frecuente al evaluar métodos de pago en Venezuela es dar por hecho que, si el checkout muestra un monto en dólares, el comercio cobra y liquida en dólares. En una transacción hay al menos cuatro momentos donde la moneda puede cambiar. El precio que ve el comprador, la moneda que se envía al procesador, la moneda en la que se debita al cliente y la moneda en la que se abona al comercio. Hay procesadores que permiten crear órdenes en dólares y convierten a bolívares antes de ejecutar el cobro. El comprador puede ver un precio en dólares, y el débito y la liquidación pueden operar en bolívares. Sin confirmar con el proveedor los términos de liquidación, tomar la moneda de la orden como cobro en dólares afecta la contabilidad y el flujo de caja. Antes de elegir un método conviene verificar cada eslabón por separado. Qué moneda muestra la tienda, qué moneda recibe el procesador, en qué moneda se debita al comprador y en qué moneda y plazo se liquida en la cuenta de tu comercio. Con eso se decide qué método integrar.',
        },
      ],
    },
    {
      h2: 'WooCommerce y Shopify cubren mercados distintos',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'La plataforma condiciona qué métodos de pago puedes integrar y cómo. No todas ofrecen la misma flexibilidad para conectar con procesadores locales.',
        },
        {
          type: 'h3',
          text: 'WooCommerce para el mercado venezolano',
        },
        {
          type: 'p',
          text: 'En WooCommerce, Playful ha integrado SiTef, Instapago con Pago Móvil, Cashea, Banesco Panamá, Zelle automatizado y BDV. La plataforma permite plugins y conexiones por API, y eso abre opciones con los procesadores y bancos que operan en Venezuela. [SoyTechno](https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela) es una tienda WooCommerce en Venezuela donde Playful integró métodos de pago locales para que el checkout usara los métodos del mercado local. Si tu tienda ya está en WooCommerce o en un desarrollo a medida y necesitas métodos de pago venezolanos, Playful puede evaluar contigo cuáles se ajustan a tu operación.',
        },
        {
          type: 'h3',
          text: 'Shopify para e-commerce internacional',
        },
        {
          type: 'p',
          text: 'En Shopify, nuestro trabajo es e-commerce internacional. La plataforma soporta de forma nativa procesadores como PayPal, Shop Pay y Mercado Pago (México), que permiten cobrar fuera de Venezuela con el checkout de la plataforma. [Jumex](https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce) y [Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce) son casos de desarrollo de e-commerce en Shopify, centrados en catálogo, navegación y experiencia de compra para mercados internacionales. No son prueba de pagos en Venezuela. Si tu marca necesita una tienda Shopify para mercados internacionales, Playful puede encargarse del [desarrollo y la configuración de tu tienda](https://playfulagency.com/agencia-shopify). Para cobros con métodos locales venezolanos, WooCommerce es la vía que esa integración usa en nuestro trabajo.',
        },
      ],
    },
  ],
  faq: {
    h2: 'Preguntas frecuentes sobre pasarelas de pago en Venezuela',
    items: [
      {
        question: '¿Playful es una pasarela de pagos?',
        answer:
          'No. Playful es una agencia de desarrollo e integración de ecommerce. Conectamos tu tienda online con las pasarelas y métodos de pago que necesitas, pero no procesamos transacciones, no manejamos fondos y no operamos como intermediario financiero. Nuestro trabajo es la integración técnica en tu plataforma para que el checkout funcione y puedas conciliar tus cobros.',
      },
      {
        question: '¿Qué métodos de pago integra Playful en tiendas online en Venezuela?',
        answer:
          'En WooCommerce, Playful tiene experiencia integrando SiTef, Instapago con Pago Móvil, Cashea, Banesco Panamá, Zelle automatizado y BDV. Cada método tiene alcances y requisitos diferentes en cuanto a moneda, liquidación y conciliación, así que la combinación adecuada depende de tu operación y del perfil de tus compradores.',
      },
      {
        question: '¿Qué es una pasarela de pagos y cómo funciona en una tienda online?',
        answer:
          'Una pasarela de pagos es la tecnología que conecta tu tienda con el banco o procesador que autoriza y ejecuta el cobro. Cuando un comprador completa el checkout, la pasarela envía los datos de pago, recibe la respuesta de aprobación o rechazo, y notifica a tu tienda el resultado. Pero que la pasarela confirme un pago no significa que el dinero ya esté disponible en tu cuenta, porque la liquidación y la conciliación son pasos separados que dependen del proveedor, del banco y del método elegido.',
      },
      {
        question: '¿Puedo aceptar pagos en bolívares y dólares en mi tienda online en Venezuela?',
        answer:
          'Sí, siempre que integres los métodos adecuados. En WooCommerce, Playful conecta tu tienda con procesadores que operan en bolívares (como Instapago, SiTef o BDV) y con opciones que permiten cobrar en dólares (como Zelle o Banesco Panamá para tarjetas internacionales). Lo importante es verificar con cada proveedor en qué moneda se debita al comprador y en qué moneda se liquida en tu cuenta, porque el precio que se muestra en la tienda no siempre coincide con la moneda de procesamiento o de liquidación.',
      },
      {
        question: '¿Shopify permite cobrar con métodos de pago locales en Venezuela?',
        answer:
          'La fortaleza de Shopify está en ecommerce internacional. La plataforma soporta procesadores globales como PayPal, Shop Pay y Mercado Pago, que funcionan para cobrar en mercados fuera de Venezuela. Para métodos de pago locales venezolanos como Pago Móvil, débito bancario nacional o pasarelas específicas del mercado, WooCommerce ofrece la flexibilidad técnica necesaria para esas integraciones. Si necesitas una tienda para vender internacionalmente, Playful trabaja con Shopify en esa línea. Si necesitas cobrar con métodos locales, la conversación empieza por WooCommerce.',
      },
      {
        question: '¿Zelle es una pasarela de pagos venezolana?',
        answer:
          'No. Zelle es un sistema de transferencias en dólares entre cuentas bancarias de Estados Unidos. No opera como pasarela de pagos en Venezuela y no se integra directamente como gateway nativo en plataformas de ecommerce. Puede funcionar como método de pago en tu tienda si ya tienes una cuenta bancaria estadounidense habilitada, pero la integración requiere desarrollo a medida y el abono no genera conciliación automática con tus pedidos por defecto. Playful integra Zelle automatizado en el checkout de marcas que ya pueden operar con él, pero no abrimos cuentas. Puedes leer más en nuestro artículo: [Zelle en Venezuela: un método de pago para tu ecommerce](https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce).',
      },
      {
        question: '¿Stripe o PayPal resuelven los cobros de mi tienda en Venezuela?',
        answer:
          'No como solución para cobros locales en Venezuela. Stripe no opera en el país, y PayPal tiene restricciones significativas para cuentas venezolanas. Aunque ambos son procesadores de pago ampliamente usados a nivel global, no constituyen una vía viable para cobrar a clientes con métodos de pago venezolanos ni a través de la banca local. Si tu operación necesita aceptar bolívares, Pago Móvil o débito bancario venezolano, la integración tiene que ser con proveedores que operen en ese mercado.',
      },
    ],
  },
  closing: {
    h2: 'Integra pagos en tu tienda con una reunión de diagnóstico',
    body: 'Integrar pagos en tu tienda en Venezuela pide saber qué ofrece cada proveedor, cómo encaja con tu plataforma y qué pasa con el dinero después de que el cliente paga. Si tu marca ya vende y necesitas el cobro y la conciliación en la tienda, evaluamos contigo la combinación de tu caso.',
  },
};

export { SERVICE_BOOKING_HREF } from '../../utils/booking.ts';

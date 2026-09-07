<?php
/**
 * Código para agregar al archivo functions.php de tu tema de WordPress
 * o crear como plugin personalizado
 * 
 * Este endpoint funcionará con WP Mail SMTP automáticamente
 * ya que usa la función wp_mail() nativa de WordPress
 */

// Registrar el endpoint REST API personalizado
add_action('rest_api_init', function () {
    register_rest_route('playful/v1', '/contact', array(
        'methods' => 'POST',
        'callback' => 'playful_handle_contact_form',
        'permission_callback' => '__return_true', // Permite acceso público
        'args' => array(
            'name' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'email' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_email',
                'validate_callback' => function($param) {
                    return is_email($param);
                }
            ),
            'phone' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'business' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'message' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
            ),
            // Versioned qualification data is optional so integrations using
            // the legacy contact contract continue to work. Gate 1.1
            // validates its allowed values before this callback runs.
            'qualification' => array(
                'required' => false,
                'type' => 'object',
                'validate_callback' => function($param) {
                    return is_array($param);
                }
            ),
            // Optional for the Playful Contact Gate receipt protocol. The
            // endpoint callback remains legacy-compatible and does not own
            // idempotency state; version 1.1.0+ of the gate does.
            'submission_id' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => function($param) {
                    return preg_match('/\A[A-Za-z0-9_-]{20,100}\z/', $param) === 1;
                }
            ),
        ),
    ));
});

function playful_contact_qualification_labels() {
    return array(
        'decisionRole' => array(
            'label' => 'Papel en el proyecto',
            'values' => array(
                'owner' => 'Dueño/a, socio/a o cofundador/a',
                'decision_lead' => 'Lidera e-commerce, marketing u operaciones y participa en la decisión',
                'researching_for_other' => 'Investiga para otra persona o equipo',
            ),
        ),
        'salesModel' => array(
            'label' => 'Modelo de venta principal',
            'values' => array(
                'd2c' => 'D2C desde tienda online propia',
                'd2c_b2b' => 'D2C y B2B',
                'amazon' => 'Amazon',
                'mercado_libre' => 'Mercado Libre',
                'marketplaces_other' => 'Otros marketplaces',
                'marketplace_to_d2c' => 'Marketplace con intención de dar el salto a D2C',
                'pre_d2c' => 'Preparando primera venta directa D2C',
                'not_online_or_unsure' => 'No vende online todavía o no está seguro',
            ),
        ),
        'monthlyRevenue' => array(
            'label' => 'Facturación mensual online aproximada',
            'values' => array(
                'over_100k' => 'Más de US$100.000',
                '50k_100k' => 'US$50.000–100.000',
                '10k_50k' => 'US$10.000–50.000',
                'under_10k' => 'Menos de US$10.000',
                'prefer_not_to_say' => 'Prefiere no compartirlo',
            ),
        ),
        'projectTiming' => array(
            'label' => 'Momento del proyecto',
            'values' => array(
                '0_30_days' => 'Quiere iniciar en los próximos 30 días',
                '1_3_months' => 'Preparando proyecto para los próximos 1–3 meses',
                'evaluating' => 'Está evaluando opciones',
                'researching' => 'Solo está investigando',
            ),
        ),
    );
}

function playful_contact_qualification_summary($qualification) {
    if (!is_array($qualification)) {
        return '';
    }

    $lines = array();
    foreach (playful_contact_qualification_labels() as $field => $definition) {
        $value = isset($qualification[$field]) ? (string) $qualification[$field] : '';
        $other_field = $field . 'Other';

        if ($value === 'other') {
            $display = isset($qualification[$other_field])
                ? sanitize_text_field((string) $qualification[$other_field])
                : '';
            if ($display === '') {
                return '';
            }
            $display = 'Otro: ' . $display;
        } elseif (isset($definition['values'][$value])) {
            $display = $definition['values'][$value];
        } else {
            // Do not render a partial or unknown qualification in the email.
            return '';
        }

        $lines[] = '• ' . $definition['label'] . ': ' . $display;
    }

    $marketplaces = isset($qualification['secondaryMarketplaces'])
        ? sanitize_text_field((string) $qualification['secondaryMarketplaces'])
        : '';
    if ($marketplaces !== '') {
        $lines[] = '• Otros marketplaces: ' . $marketplaces;
    }

    return implode("\n\n", $lines);
}

/**
 * Maneja el envío del formulario de contacto
 */
function playful_handle_contact_form($request) {
    // Obtener y sanitizar los parámetros
    $name = $request->get_param('name');
    $email = $request->get_param('email');
    $phone = $request->get_param('phone');
    $business = $request->get_param('business');
    $message = $request->get_param('message');
    $qualification = playful_contact_qualification_summary($request->get_param('qualification'));

    // Configurar el destinatario
    $to = 'hello@playfulagency.com';
    
    // Asunto del correo
    $subject = 'Nuevo contacto desde el sitio web - ' . $name;
    
    // Construir el cuerpo del mensaje con la estructura solicitada
    $body = "Has recibido un nuevo mensaje de contacto desde el sitio web.\n\n";
    $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $body .= "INFORMACIÓN DEL CONTACTO\n";
    $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $body .= "• Nombre: " . $name . "\n\n";
    $body .= "• Correo electrónico: " . $email . "\n\n";
    
    if (!empty($phone)) {
        $body .= "• Número de teléfono: " . $phone . "\n\n";
    }
    
    if (!empty($business)) {
        $body .= "• Nombre del negocio: " . $business . "\n\n";
    }

    if ($qualification !== '') {
        $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $body .= "CUALIFICACIÓN DEL PROYECTO\n";
        $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $body .= $qualification . "\n\n";
    }

    $body .= "• Mensaje del campo '¿Cómo podemos ayudarte?':\n";
    $body .= $message . "\n\n";
    
    $body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $body .= "Esto garantizará que la información sea clara y completa para el equipo de Playful Agency.\n\n";
    $body .= "Enviado desde: " . get_site_url() . "\n";
    $body .= "Fecha: " . date('d/m/Y H:i:s') . "\n";
    
    // Configurar headers
    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . get_bloginfo('name') . ' <noreply@' . parse_url(get_site_url(), PHP_URL_HOST) . '>',
        'Reply-To: ' . $name . ' <' . $email . '>',
    );
    
    // Intentar enviar el correo usando wp_mail (que usará WP Mail SMTP automáticamente)
    $sent = wp_mail($to, $subject, $body, $headers);
    
    // Registrar en logs para debugging (opcional)
    if (!$sent) {
        error_log('Error al enviar email de contacto.');
    }
    
    // Responder al cliente
    if ($sent) {
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Mensaje enviado correctamente',
            'replayed' => false,
        ), 200);
    } else {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Error al enviar el mensaje',
        ), 500);
    }
}

/**
 * Agregar CORS headers para permitir peticiones desde tu dominio Next.js
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        
        // Lista de dominios permitidos (AGREGAR TU DOMINIO DE PRODUCCIÓN)
        $allowed_origins = array(
            'http://localhost:3000',
            'http://localhost:3001',
            'https://playfulagency.com',
            'https://www.playfulagency.com',
            // Agregar más dominios según sea necesario
        );
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        }
        
        return $value;
    });
}, 15);

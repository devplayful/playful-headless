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
        ),
    ));
});

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
        error_log('Error al enviar email de contacto para: ' . $email);
    }
    
    // Responder al cliente
    if ($sent) {
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Mensaje enviado correctamente',
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

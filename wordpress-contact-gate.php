<?php
/**
 * Plugin Name: Playful Contact Gate
 * Description: Protege el endpoint de contacto de Playful con un secreto servidor a servidor.
 * Version: 1.0.0
 * Author: Playful Agency
 */

defined('ABSPATH') || exit;

const PLAYFUL_CONTACT_GATE_TOKEN_OPTION = 'playful_contact_gate_token';
const PLAYFUL_CONTACT_GATE_ENFORCE_OPTION = 'playful_contact_gate_enforce';

register_activation_hook(__FILE__, function () {
    add_option(PLAYFUL_CONTACT_GATE_ENFORCE_OPTION, '0');
});

add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if ($request->get_route() !== '/playful/v1/contact' || $request->get_method() !== 'POST') {
        return $result;
    }

    if (get_option(PLAYFUL_CONTACT_GATE_ENFORCE_OPTION, '0') !== '1') {
        return $result;
    }

    $expected = (string) get_option(PLAYFUL_CONTACT_GATE_TOKEN_OPTION, '');
    if ($expected === '') {
        return new WP_Error(
            'playful_contact_gate_not_configured',
            'Contact endpoint protection is not configured.',
            array('status' => 503)
        );
    }

    $provided = (string) $request->get_header('x-playful-contact-token');
    if ($provided === '' || !hash_equals($expected, $provided)) {
        return new WP_Error(
            'playful_contact_gate_forbidden',
            'Invalid contact endpoint credentials.',
            array('status' => 403)
        );
    }

    return $result;
}, 5, 3);

add_action('admin_init', function () {
    register_setting('playful_contact_gate', PLAYFUL_CONTACT_GATE_TOKEN_OPTION, array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => function ($value) {
            $value = trim((string) $value);
            if ($value === '') {
                return (string) get_option(PLAYFUL_CONTACT_GATE_TOKEN_OPTION, '');
            }

            if (!preg_match('/\\A[A-Za-z0-9_-]{32,128}\\z/', $value)) {
                add_settings_error(
                    PLAYFUL_CONTACT_GATE_TOKEN_OPTION,
                    'playful_contact_gate_invalid_token',
                    'El secreto debe tener entre 32 y 128 caracteres seguros.'
                );
                return (string) get_option(PLAYFUL_CONTACT_GATE_TOKEN_OPTION, '');
            }

            return $value;
        },
    ));

    register_setting('playful_contact_gate', PLAYFUL_CONTACT_GATE_ENFORCE_OPTION, array(
        'type' => 'string',
        'default' => '0',
        'sanitize_callback' => function ($value) {
            return $value === '1' ? '1' : '0';
        },
    ));
});

add_action('admin_menu', function () {
    add_options_page(
        'Playful Contact Gate',
        'Playful Contact Gate',
        'manage_options',
        'playful-contact-gate',
        'playful_contact_gate_render_settings'
    );
});

function playful_contact_gate_render_settings() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $has_token = get_option(PLAYFUL_CONTACT_GATE_TOKEN_OPTION, '') !== '';
    $enforced = get_option(PLAYFUL_CONTACT_GATE_ENFORCE_OPTION, '0') === '1';
    ?>
    <div class="wrap">
        <h1>Playful Contact Gate</h1>
        <p>Protege <code>/playful/v1/contact</code> con un secreto enviado únicamente por el servidor de Playful.</p>
        <p><strong>Secreto configurado:</strong> <?php echo $has_token ? 'Sí' : 'No'; ?></p>
        <form method="post" action="options.php">
            <?php settings_fields('playful_contact_gate'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="playful-contact-gate-token">Nuevo secreto</label></th>
                    <td>
                        <input
                            id="playful-contact-gate-token"
                            name="<?php echo esc_attr(PLAYFUL_CONTACT_GATE_TOKEN_OPTION); ?>"
                            type="password"
                            value=""
                            class="regular-text"
                            minlength="32"
                            maxlength="128"
                            autocomplete="new-password"
                        />
                        <p class="description">Déjalo vacío para conservar el secreto actual.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Aplicar protección</th>
                    <td>
                        <input type="hidden" name="<?php echo esc_attr(PLAYFUL_CONTACT_GATE_ENFORCE_OPTION); ?>" value="0" />
                        <label>
                            <input
                                name="<?php echo esc_attr(PLAYFUL_CONTACT_GATE_ENFORCE_OPTION); ?>"
                                type="checkbox"
                                value="1"
                                <?php checked($enforced); ?>
                            />
                            Rechazar solicitudes que no incluyan el secreto correcto
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

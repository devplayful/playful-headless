<?php
/**
 * Plugin Name: Playful Related Blog Posts
 * Description: Campo «Artículos relacionados» (hasta 3 IDs de post) en REST.
 * Version: 1.0.0
 * Author: Playful Agency
 *
 * INSTALACIÓN (hace falta un admin de WordPress — este repo no tiene
 * Application Password ni usuario con `edit_posts` / `manage_options`):
 *
 * 1) mu-plugin (recomendado): copiar este archivo a
 *    wp-content/mu-plugins/playful-related-posts.php
 * 2) Plugin: copiar a wp-content/plugins/playful-related-posts/playful-related-posts.php
 *    y activarlo.
 * 3) Code Snippets: pegar el cuerpo (sin el header del plugin) como snippet PHP
 *    de solo ejecución (el sitio ya tiene el plugin Code Snippets).
 *
 * NO rellena IDs. Eso lo hace la card de SEO / un editor en el admin.
 * ACF ya está activo en endpoint.playfulagency.com (casos-de-exito, equipo).
 * ACF-to-REST (namespace acf/v3) NO está instalado; este snippet usa
 * register_post_meta + ACF nativo (show_in_rest) para no depender de ese plugin.
 *
 * REST (GET público, sin auth):
 *   GET https://endpoint.playfulagency.com/wp-json/wp/v2/posts/{id}
 *   GET https://endpoint.playfulagency.com/wp-json/wp/v2/posts?slug={slug}
 *
 * JSON esperado cuando el campo tiene valores:
 * {
 *   "id": 86152,
 *   "acf": { "articulos_relacionados": [123, 456, 789] },
 *   "meta": { "articulos_relacionados": [123, 456, 789] }
 * }
 *
 * Hoy, sin este snippet, los posts públicos responden `"acf": []` y `meta`
 * no incluye `articulos_relacionados`. El front trata eso como campo vacío
 * y usa el respaldo (categoría → recientes).
 */

if (!defined('ABSPATH')) {
    exit;
}

const PLAYFUL_RELATED_META_KEY = 'articulos_relacionados';
const PLAYFUL_RELATED_META_MAX = 3;

function playful_sanitize_related_post_ids($value): array
{
    if ($value instanceof WP_Post) {
        $value = array($value->ID);
    } elseif (!is_array($value)) {
        $value = array($value);
    }

    $ids = array();
    foreach ($value as $item) {
        if ($item instanceof WP_Post) {
            $id = (int) $item->ID;
        } elseif (is_array($item) && isset($item['ID'])) {
            $id = (int) $item['ID'];
        } elseif (is_array($item) && isset($item['id'])) {
            $id = (int) $item['id'];
        } elseif (is_object($item) && isset($item->ID)) {
            $id = (int) $item->ID;
        } else {
            $id = absint($item);
        }
        if ($id <= 0 || in_array($id, $ids, true)) {
            continue;
        }
        $ids[] = $id;
        if (count($ids) >= PLAYFUL_RELATED_META_MAX) {
            break;
        }
    }

    return $ids;
}

add_action('init', function () {
    register_post_meta('post', PLAYFUL_RELATED_META_KEY, array(
        'type' => 'array',
        'single' => true,
        'default' => array(),
        'show_in_rest' => array(
            'schema' => array(
                'type' => 'array',
                'items' => array('type' => 'integer'),
                'maxItems' => PLAYFUL_RELATED_META_MAX,
            ),
        ),
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
        'sanitize_callback' => 'playful_sanitize_related_post_ids',
    ));
});

add_action('acf/include_fields', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group(array(
        'key' => 'group_playful_articulos_relacionados',
        'title' => 'Artículos relacionados',
        'fields' => array(
            array(
                'key' => 'field_playful_articulos_relacionados',
                'label' => 'Artículos relacionados',
                'name' => PLAYFUL_RELATED_META_KEY,
                'type' => 'relationship',
                'instructions' => 'Hasta 3 posts, en el orden en que deben aparecer. El front completa el carrusel con la misma categoría y luego los más recientes.',
                'required' => 0,
                'post_type' => array('post'),
                'taxonomy' => array(),
                'filters' => array('search', 'post_type', 'taxonomy'),
                'return_format' => 'id',
                'min' => 0,
                'max' => PLAYFUL_RELATED_META_MAX,
                'elements' => array('featured_image'),
                'bidirectional' => 0,
                'show_in_rest' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
        'show_in_rest' => 1,
    ));
});

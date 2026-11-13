# Migración off WordPress (snapshot)

- **Exportar de nuevo:** `npm run export:wp-snapshot` (GET público a la API REST de WP; requiere red solo en export).
- **Datos:** `data/wp-snapshot/collections/*.json`, media en `public/wp-media/` y estáticos Elementor en `public/wp-static/`.
- **Runtime:** `services/wordpress-request.mjs` enruta a `lib/wp-snapshot/rest-router.mjs` salvo `WORDPRESS_LIVE_FETCH=1` (solo export/diagnóstico).
- **Contacto:** ya no se llama a `/wp-json/playful/v1/contact`. El envío queda en el pipeline GHL/atribución; WP antes hacía `wp_mail` a `hello@playfulagency.com` (ver `wordpress-contact-endpoint.php` en el repo WP).
- **Auditoría HTML:** `npm run build:direct && npm run audit:rendered-wp-urls`

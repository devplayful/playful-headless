# 📧 Instrucciones para Conectar el Formulario de Contacto con WordPress

## ✅ Lo que ya está hecho en Next.js

He configurado todo el código necesario en tu proyecto Next.js:

1. ✅ **API Route creada**: `/app/api/contact/route.ts`
2. ✅ **Formulario actualizado**: El formulario de contacto ahora envía datos a la API
3. ✅ **Variables de entorno**: Archivo `.env.example` creado como referencia

---

## 🔧 Lo que necesitas hacer en WordPress

### Paso 1: Agregar el código PHP a WordPress

Tienes **dos opciones** para agregar el código PHP:

#### **Opción A: Agregar al archivo functions.php (Más rápido)**

1. Ve a tu panel de WordPress
2. Navega a: **Apariencia → Editor de archivos del tema**
3. Selecciona el archivo `functions.php`
4. Copia todo el contenido del archivo `wordpress-contact-endpoint.php` (que está en la raíz de tu proyecto)
5. Pégalo al final del archivo `functions.php`
6. **⚠️ IMPORTANTE**: Cambia el email en la línea que dice:
   ```php
   $to = 'contacto@playfulagency.com'; // ⚠️ CAMBIAR ESTE EMAIL
   ```
   Por tu email real donde quieres recibir los mensajes.
7. Guarda los cambios

#### **Opción B: Crear un plugin personalizado (Más profesional)**

1. Crea una carpeta en `wp-content/plugins/playful-contact-form/`
2. Crea un archivo `playful-contact-form.php` dentro de esa carpeta
3. Agrega este header al inicio:
   ```php
   <?php
   /**
    * Plugin Name: Playful Contact Form API
    * Description: Endpoint REST API para el formulario de contacto
    * Version: 1.0
    * Author: Playful Agency
    */
   ```
4. Copia el resto del código del archivo `wordpress-contact-endpoint.php`
5. **⚠️ IMPORTANTE**: Cambia el email de destino
6. Activa el plugin desde el panel de WordPress

---

### Paso 2: Configurar WP Mail SMTP

Si aún no lo has hecho:

1. Ve a **Plugins → WP Mail SMTP**
2. Configura tu proveedor de email (Gmail, SendGrid, etc.)
3. Completa las credenciales necesarias
4. Guarda y prueba el envío

---

### Paso 3: Crear el archivo .env.local

En la raíz de tu proyecto Next.js, crea un archivo `.env.local` con:

```env
WORDPRESS_API_URL=https://endpoint.playfulagency.com/wp-json
```

**Nota**: Este archivo ya está en `.gitignore` para proteger tus credenciales.

---

## 🧪 Cómo probar que funciona

### 1. Verifica que el endpoint de WordPress esté activo

Abre en tu navegador:
```
https://endpoint.playfulagency.com/wp-json/playful/v1/contact
```

Deberías ver un error que dice algo como "No route was found matching the URL and request method" o similar. Esto es normal y significa que el endpoint existe (solo acepta POST, no GET).

### 2. Prueba el formulario

1. Inicia tu servidor de desarrollo: `npm run dev`
2. Ve a la página de contacto: `http://localhost:3000/contactar-agencia-de-marketing-digital`
3. Completa el formulario con datos de prueba
4. Haz clic en "¡Quiero que conozcan mi caso!"
5. Deberías ver un mensaje de éxito
6. Revisa tu email para confirmar que llegó el mensaje

---

## 🔍 Solución de problemas

### Error: "CORS policy"
- Verifica que tu dominio esté en la lista de `$allowed_origins` en el código PHP
- Agrega tu dominio de producción cuando lo despliegues

### Error: "Error al enviar el mensaje"
- Verifica que WP Mail SMTP esté configurado correctamente
- Revisa los logs de WordPress en: **Herramientas → Site Health → Info → Server**
- Verifica que el email de destino sea válido

### El formulario no envía nada
- Abre la consola del navegador (F12) y busca errores
- Verifica que el servidor de Next.js esté corriendo
- Confirma que el archivo `.env.local` existe y tiene la URL correcta

---

## 📝 Estructura de archivos creados

```
Proyecto-play/
├── app/
│   └── api/
│       └── contact/
│           └── route.ts          ← API Route de Next.js
├── wordpress-contact-endpoint.php ← Código para WordPress
├── .env.example                   ← Ejemplo de variables de entorno
└── INSTRUCCIONES-WORDPRESS.md     ← Este archivo
```

---

## 🎯 Flujo de datos

```
Usuario llena formulario
        ↓
Formulario envía a /api/contact (Next.js)
        ↓
API Route valida datos
        ↓
Envía a WordPress: /wp-json/playful/v1/contact
        ↓
WordPress procesa con wp_mail()
        ↓
WP Mail SMTP envía el email
        ↓
Email llega a tu bandeja de entrada
```

---

## ✨ Características implementadas

- ✅ Validación de campos requeridos
- ✅ Validación de formato de email
- ✅ Sanitización de datos en WordPress
- ✅ Mensajes de error descriptivos
- ✅ Limpieza del formulario después de envío exitoso
- ✅ Estados de carga (botón "Enviando...")
- ✅ Compatibilidad con WP Mail SMTP
- ✅ CORS configurado para desarrollo y producción
- ✅ Headers de respuesta automática configurados

---

## 🚀 Próximos pasos opcionales

1. **Agregar reCAPTCHA**: Para prevenir spam
2. **Notificaciones**: Enviar copia del mensaje al usuario
3. **Base de datos**: Guardar mensajes en WordPress para respaldo
4. **Analytics**: Trackear envíos exitosos con Google Analytics

---

¿Necesitas ayuda con algún paso? ¡Avísame! 🎉

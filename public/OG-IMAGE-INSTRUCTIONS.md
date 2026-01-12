# Instrucciones para Imagen Open Graph (og.jpg)

## Ubicación requerida
`/public/og.jpg`

## Especificaciones técnicas
- **Dimensiones:** 1200 x 630 píxeles (formato recomendado por Facebook/WhatsApp/Twitter)
- **Formato:** JPG o PNG
- **Peso recomendado:** Máximo 8 MB (idealmente menos de 300 KB para carga rápida)
- **Relación de aspecto:** 1.91:1

## Contenido sugerido para la imagen

La imagen debe representar visualmente la propuesta de valor de Playful Agency:

### Elementos a incluir:
1. **Logo de Playful Agency** (prominente, preferiblemente en la parte superior)
2. **Texto principal:** "Agencia de E-commerce | Marketing Digital"
3. **Tagline:** "Transformamos plataformas mediocres en máquinas de conversión"
4. **Elementos visuales:** 
   - Colores de marca (morado, turquesa, rosa)
   - Gráficos modernos/minimalistas
   - Elementos que sugieran crecimiento, conversión o e-commerce

### Zonas seguras:
- **Evitar contenido importante en los bordes:** Algunos servicios recortan la imagen
- **Centrar el mensaje principal:** Para que sea visible en todos los formatos

## Herramientas sugeridas para crear la imagen
- Canva (plantillas para OG images)
- Figma
- Adobe Photoshop/Illustrator
- Online: www.canva.com/create/open-graph/

## URL final
Una vez creada y colocada en `/public/og.jpg`, estará disponible en:
`https://playfulagency.com/og.jpg`

## Validación
Después de desplegar, puedes validar la imagen OG usando:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

## Caché de WhatsApp
Si WhatsApp sigue mostrando la imagen antigua después de actualizar:
1. Usa el Facebook Sharing Debugger para limpiar la caché
2. Espera 24-48 horas para propagación completa
3. Considera renombrar temporalmente (og-v2.jpg) si es urgente

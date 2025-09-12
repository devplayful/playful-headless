# 🚀 Playful Agency - Next.js Blog

Una moderna página web para agencia de marketing digital construida con Next.js 14, React 18 y Tailwind CSS.

## ✨ Características

- **🎨 Diseño Moderno**: Interfaz atractiva con efectos glassmorphism y animaciones suaves
- **📱 Responsive**: Optimizado para todos los dispositivos
- **⚡ Rendimiento**: Optimización de imágenes con Next.js Image
- **🎭 Animaciones**: Botones animados con Lottie React
- **🎯 SEO Friendly**: Estructura optimizada para motores de búsqueda
- **🛠️ TypeScript**: Tipado estático para mejor desarrollo

## 🏗️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Lottie React
- **Optimización**: Next.js Image
- **Iconos**: Heroicons

## 📁 Estructura del Proyecto

```
headless/
├── app/                    # App Router de Next.js
│   ├── nosotros/          # Página "Acerca de"
│   ├── servicios/         # Página de servicios
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
│   ├── AnimatedButton.tsx # Botones con animaciones Lottie
│   ├── ChatWidget.tsx     # Widget de chat
│   ├── Footer.tsx         # Pie de página
│   └── Header.tsx         # Cabecera con navegación
├── public/               # Archivos estáticos
│   ├── images/          # Imágenes del proyecto
│   │   ├── logos/       # Logos de la marca
│   │   ├── services/    # Ilustraciones de servicios
│   │   ├── team/        # Fotos del equipo
│   │   └── blog/        # Imágenes para blog
│   └── icons/           # Iconos
└── ...
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/playful-agency.git
   cd playful-agency
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📦 Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en producción
- `npm run lint` - Ejecuta el linter

## 🎨 Páginas Incluidas

- **🏠 Home**: Página principal con hero section y llamadas a la acción
- **👥 Nosotros**: Información sobre la agencia y valores
- **🛠️ Servicios**: Catálogo completo de servicios con precios
- **📝 Blog**: (En desarrollo) Listado de artículos
- **💬 Chat Widget**: Widget de chat integrado

## 🎭 Características Especiales

### Botones Animados
Los botones utilizan animaciones Lottie para una experiencia interactiva:
- Animación al hover
- Diferentes variantes (primary, secondary, success, rocket)
- Optimizados para rendimiento

### Optimización de Imágenes
- Uso de Next.js Image para carga optimizada
- Formatos SVG para logos escalables
- Lazy loading automático

### Diseño Responsive
- Mobile-first approach
- Breakpoints optimizados
- Navegación móvil con menú hamburguesa

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir la carpeta 'out' a Netlify
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Bruno** - Playful Agency

## 🙏 Agradecimientos

- Next.js team por el excelente framework
- Tailwind CSS por el sistema de diseño
- Lottie por las animaciones
- Comunidad open source

---

⭐ ¡No olvides dar una estrella al proyecto si te ha sido útil!

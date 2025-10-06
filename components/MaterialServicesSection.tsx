'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Chip,
  Fab
} from '@mui/material';
import { 
  ShoppingCart, 
  TrendingUp, 
  Palette, 
  Speed,
  ArrowForward,
  Star
} from '@mui/icons-material';

const services = [
  {
    title: 'E-commerce Development',
    description: 'Creamos tiendas online que convierten visitantes en clientes. Diseño moderno, SEO optimizado y métodos de pago integrados.',
    icon: <ShoppingCart sx={{ fontSize: 40 }} />,
    color: 'primary',
    features: ['Diseño responsive', 'SEO Friendly', 'Pagos seguros']
  },
  {
    title: 'Marketing Digital',
    description: 'Estrategias de marketing que hacen crecer tu negocio. Desde redes sociales hasta campañas de Google Ads.',
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    color: 'secondary',
    features: ['Google Ads', 'Social Media', 'Analytics']
  },
  {
    title: 'Diseño UX/UI',
    description: 'Interfaces que enamoran y experiencias que convierten. Diseño centrado en el usuario para máxima conversión.',
    icon: <Palette sx={{ fontSize: 40 }} />,
    color: 'tertiary',
    features: ['Prototipado', 'Testing', 'Wireframes']
  },
  {
    title: 'Optimización Web',
    description: 'Sitios web súper rápidos que Google ama. Mejoramos la velocidad y el rendimiento de tu sitio web.',
    icon: <Speed sx={{ fontSize: 40 }} />,
    color: 'primary',
    features: ['Core Web Vitals', 'Performance', 'SEO Técnico']
  }
];

export default function MaterialServicesSection() {
  return (
    <div>
      
    </div>
  );
}

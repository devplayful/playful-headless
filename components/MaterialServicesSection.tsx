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
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #6750A4 30%, #9A82DB 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nuestros Servicios
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}
          >
            Soluciones digitales que impulsan tu negocio hacia el éxito. 
            Cada servicio está diseñado con Material Design 3 para una experiencia excepcional.
          </Typography>
        </Box>

        {/* Services Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 6
          }}
        >
          {services.map((service, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(103, 80, 164, 0.15)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Icon */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    color: `${service.color}.main`
                  }}
                >
                  {service.icon}
                  <Typography variant="h4" component="h3" sx={{ ml: 2 }}>
                    {service.title}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  {service.description}
                </Typography>

                {/* Features */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {service.features.map((feature, featureIndex) => (
                    <Chip
                      key={featureIndex}
                      label={feature}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: `${service.color}.main`,
                        color: `${service.color}.main`,
                        '&:hover': {
                          backgroundColor: `${service.color}.main`,
                          color: 'white',
                        }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  color={service.color as any}
                  endIcon={<ArrowForward />}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Conocer más
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6750A4 0%, #9A82DB 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          <Typography variant="h3" component="h2" sx={{ mb: 2, position: 'relative' }}>
            ¿Listo para hacer magia digital?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, position: 'relative' }}>
            Hablemos sobre tu proyecto y descubre cómo podemos ayudarte a alcanzar tus objetivos.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Solicitar Cotización
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Ver Portfolio
            </Button>
          </Box>
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Star />
        </Fab>
      </Container>
    </Box>
  );
}

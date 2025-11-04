'use client';

import { 
  Box, 
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

const cardData = [
  {
    icon: '❌', // Puedes usar un componente de ícono real o una imagen
    title: 'Diseño obsoleto o confuso:',
    description:
      'Un sitio web que se ve viejo o es difícil de navegar ahuyenta a los clientes. Piensa en tu web como tu tienda física: si la entrada es un laberinto, nadie va a entrar.',
  },
  {
    icon: '🚀',
    title: 'Velocidad de carga lenta:',
    description:
      'Cada segundo que tu web tarda en cargar es un cliente que se va. Un sitio lento genera frustración y poca confianza.',
  },
  {
    icon: '🐞',
    title: 'Errores técnicos y bugs:',
    description:
      '¿Tu checkout falla? ¿Los botones no funcionan? Estos pequeños fallos hacen que tus clientes abandonen el carrito y que nunca más regresen.',
  },
];

export default function MaterialServicesSection({ className }: { className?: string }) {
  return (
   <section className={className}>
    <div className='playful-contenedor playful-contenedor-FFEFD1'>
      <h2 className='playful-h2'>Lo que realmente está matando tus conversiones</h2>
      <p className='playful-contenido-p'>
      El problema no es tu producto. Es la <b>mala experiencia</b> que le das a tus clientes.
      </p>


 {/* Contenedor principal con el scroll horizontal en mobile */}
 <div className="conversion-cards-wrapper">
        {cardData.map((card, index) => (
          <div key={index} className="conversion-card">
            <div className="card-icon">{card.icon}</div>
            <h3 className="playful-h3">{card.title}</h3>
            <p className="playful-contenido-p">{card.description}</p>
          </div>
        ))}
      </div>

      <button className="playful-boton">
        <span role="img" aria-label="emoji-star">
          ✨
        </span>{' '}
        ¡Crece como ellos!
      </button>


    </div>
   </section>
  );
}

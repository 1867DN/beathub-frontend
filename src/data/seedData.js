/**
 * seedData.js - Datos de ejemplo para BeatHub
 * Productos y categorías para llenar la tienda
 */

export const CATEGORIES = [
  { id: 1, name: 'Guitarras' },
  { id: 2, name: 'Bajos' },
  { id: 3, name: 'Teclados' },
  { id: 4, name: 'Drums' },
  { id: 5, name: 'Microfonos' },
  { id: 6, name: 'Accesorios' },
]

export const PRODUCTS = [
  // Guitarras
  {
    name: 'Fender Stratocaster',
    price: 1299.99,
    stock: 5,
    category_id: 1,
    description: 'Guitarra eléctrica clásica con 3 pastillas single-coil. Sonido versátil y construcción de calidad.',
    brand: 'Fender',
  },
  {
    name: 'Gibson Les Paul',
    price: 1899.99,
    stock: 3,
    category_id: 1,
    description: 'Legendaria guitarra de crema con cuerpo sólido. Tono cálido y profundo, ideal para rock y blues.',
    brand: 'Gibson',
  },
  {
    name: 'Yamaha Pacifica',
    price: 599.99,
    stock: 8,
    category_id: 1,
    description: 'Guitarra versátil con excelente relación precio-calidad. Perfecta para principiantes y profesionales.',
    brand: 'Yamaha',
  },

  // Bajos
  {
    name: 'Fender Precision Bass',
    price: 1199.99,
    stock: 4,
    category_id: 2,
    description: 'Bajo eléctrico de 4 cuerdas con sonido grueso y profundo. Estándar de la industria.',
    brand: 'Fender',
  },
  {
    name: 'Ibanez SR500',
    price: 799.99,
    stock: 6,
    category_id: 2,
    description: 'Bajo moderno con cuerpo ergonómico y sonido brillante. Ideal para géneros contemporáneos.',
    brand: 'Ibanez',
  },

  // Teclados
  {
    name: 'Yamaha PSR-E373',
    price: 449.99,
    stock: 7,
    category_id: 3,
    description: 'Teclado portátil con 61 teclas sensibles y 758 sonidos. Perfecto para aprender y tocar.',
    brand: 'Yamaha',
  },
  {
    name: 'Casio CTK-2550',
    price: 199.99,
    stock: 10,
    category_id: 3,
    description: 'Teclado compacto con 61 teclas. Ideal para principiantes con presupuesto limitado.',
    brand: 'Casio',
  },

  // Drums
  {
    name: 'Yamaha Drum Set 5-Piece',
    price: 599.99,
    stock: 2,
    category_id: 4,
    description: 'Set de batería completo con platillos. Construcción robusta y sonido profesional.',
    brand: 'Yamaha',
  },
  {
    name: 'Pearl Export EXL 5-Piece',
    price: 799.99,
    stock: 3,
    category_id: 4,
    description: 'Batería de calidad profesional con acabados premium. Sonido cálido y resonante.',
    brand: 'Pearl',
  },

  // Microfonos
  {
    name: 'Shure SM58',
    price: 99.99,
    stock: 15,
    category_id: 5,
    description: 'Micrófono dinámico versátil. Estándar en estudios y en vivo durante décadas.',
    brand: 'Shure',
  },
  {
    name: 'Audio-Technica AT2020',
    price: 149.99,
    stock: 12,
    category_id: 5,
    description: 'Micrófono de condensador cardioide. Excelente para grabación en estudio.',
    brand: 'Audio-Technica',
  },
]

export default { CATEGORIES, PRODUCTS }

export const site = {
  name: 'LÚMINA',
  legalName: 'LÚMINA Residencias (marca ficticia)',
  tagline: 'Arriendos residenciales curados en Medellín y el Valle de Aburrá',
  description:
    'Portafolio demostrativo de arriendos residenciales en Medellín, Envigado, Sabaneta e Itagüí: apartamentos, apartaestudios, casas y lofts seleccionados por su arquitectura, su luz y su barrio.',
  email: 'hola@lumina.example',
  city: 'Medellín, Antioquia',
  hours: 'Lunes a sábado, 8:00 a 18:00',
  locale: 'es_CO',
} as const;

export const primaryNavigation = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/#ubicaciones', label: 'Ubicaciones' },
  { href: '/contacto', label: 'Contacto' },
] as const;

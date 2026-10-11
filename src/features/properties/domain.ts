export const PROPERTY_TYPES = ['apartamento', 'apartaestudio', 'casa', 'loft'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: 'Apartamento',
  apartaestudio: 'Apartaestudio',
  casa: 'Casa',
  loft: 'Loft',
};

export const MUNICIPALITIES = ['medellin', 'envigado', 'sabaneta', 'itagui'] as const;
export type Municipality = (typeof MUNICIPALITIES)[number];

export const MUNICIPALITY_LABELS: Record<Municipality, string> = {
  medellin: 'Medellín',
  envigado: 'Envigado',
  sabaneta: 'Sabaneta',
  itagui: 'Itagüí',
};

export const ZONES = ['el-poblado', 'laureles', 'belen', 'envigado', 'sabaneta', 'itagui'] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_LABELS: Record<Zone, string> = {
  'el-poblado': 'El Poblado',
  laureles: 'Laureles',
  belen: 'Belén',
  envigado: 'Envigado',
  sabaneta: 'Sabaneta',
  itagui: 'Itagüí',
};

export const ZONE_MUNICIPALITY: Record<Zone, Municipality> = {
  'el-poblado': 'medellin',
  laureles: 'medellin',
  belen: 'medellin',
  envigado: 'envigado',
  sabaneta: 'sabaneta',
  itagui: 'itagui',
};

export const AVAILABILITY = ['disponible', 'proximamente', 'reservado'] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  disponible: 'Disponible',
  proximamente: 'Disponible pronto',
  reservado: 'Reservado',
};

export type PropertyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
};

export type Property = {
  id: string;
  slug: string;
  name: string;
  type: PropertyType;
  municipality: Municipality;
  zone: Zone;
  neighborhood: string;
  layout: string;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  stratum: number;
  floor: number | null;
  monthlyRent: number;
  administrationFee: number | null;
  furnished: boolean;
  petsAllowed: boolean;
  availability: Availability;
  amenities: string[];
  images: PropertyImage[];
  summary: string;
  description: string;
  featured: boolean;
  published: boolean;
  publishedAt: string;
};

export type PropertyCardData = Pick<
  Property,
  | 'id'
  | 'slug'
  | 'name'
  | 'type'
  | 'municipality'
  | 'zone'
  | 'neighborhood'
  | 'areaM2'
  | 'bedrooms'
  | 'bathrooms'
  | 'parking'
  | 'monthlyRent'
  | 'administrationFee'
  | 'availability'
  | 'summary'
> & {
  cover: PropertyImage;
  secondary: PropertyImage | null;
};

export const DEMO_NOTICE =
  'Ficha ficticia con fines demostrativos. El inmueble, su precio, su disponibilidad y sus fotografías son ilustrativos y no constituyen una oferta real.';

export const toCardData = (property: Property): PropertyCardData => {
  const [cover, secondary] = property.images;
  if (!cover) throw new Error(`La propiedad ${property.slug} no tiene imágenes`);
  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    type: property.type,
    municipality: property.municipality,
    zone: property.zone,
    neighborhood: property.neighborhood,
    areaM2: property.areaM2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parking: property.parking,
    monthlyRent: property.monthlyRent,
    administrationFee: property.administrationFee,
    availability: property.availability,
    summary: property.summary,
    cover,
    secondary: secondary ?? null,
  };
};

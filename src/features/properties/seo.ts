import { DEMO_NOTICE, MUNICIPALITY_LABELS, type Property } from './domain';

const absolute = (base: URL, path: string) => new URL(path, base).toString();

/**
 * RealEstateListing describing what the page shows: a fictional rental with
 * its rent, size and rooms. No ratings, reviews or availability claims.
 */
export const propertyJsonLd = (property: Property, siteUrl: URL) => {
  const url = absolute(siteUrl, `/propiedades/${property.slug}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        '@id': `${url}#ficha`,
        url,
        name: property.name,
        description: `${property.summary} ${DEMO_NOTICE}`,
        datePosted: property.publishedAt,
        image: property.images.map((image) => absolute(siteUrl, image.src)),
        offers: {
          '@type': 'Offer',
          businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: property.monthlyRent,
            priceCurrency: 'COP',
            unitCode: 'MON',
          },
        },
        about: {
          '@type': property.type === 'casa' ? 'House' : 'Apartment',
          name: property.name,
          floorSize: { '@type': 'QuantitativeValue', value: property.areaM2, unitCode: 'MTK' },
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          petsAllowed: property.petsAllowed,
          address: {
            '@type': 'PostalAddress',
            addressLocality: MUNICIPALITY_LABELS[property.municipality],
            addressRegion: 'Antioquia',
            addressCountry: 'CO',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: absolute(siteUrl, '/') },
          { '@type': 'ListItem', position: 2, name: 'Propiedades', item: absolute(siteUrl, '/propiedades') },
          { '@type': 'ListItem', position: 3, name: property.name, item: url },
        ],
      },
    ],
  };
};

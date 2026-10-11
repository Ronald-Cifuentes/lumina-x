/**
 * Photographic sources for the demo portfolio.
 *
 * Every photo comes from Unsplash and is used under the Unsplash License
 * (https://unsplash.com/license). The photos are illustrative: they do not
 * depict the fictional listings they accompany. `scripts/fetch-images.ts`
 * downloads, re-encodes and measures them into `public/images`.
 */

export type ImageGroup = 'site' | 'covers' | 'gallery';

export type GalleryRoom = 'kitchen' | 'bedroom' | 'bathroom' | 'living';

export type CatalogImage = {
  key: string;
  unsplashId: string;
  group: ImageGroup;
  alt: string;
  width: number;
};

const site = (key: string, unsplashId: string, alt: string, width = 1600): CatalogImage => ({
  key,
  unsplashId,
  group: 'site',
  alt,
  width,
});

const cover = (key: string, unsplashId: string, alt: string): CatalogImage => ({
  key,
  unsplashId,
  group: 'covers',
  alt,
  width: 1600,
});

const gallery = (key: string, unsplashId: string, alt: string): CatalogImage => ({
  key,
  unsplashId,
  group: 'gallery',
  alt,
  width: 1400,
});

export const siteImages = [
  site('hero', '1600585154340-be6161a56a0c', 'Casa contemporánea de dos niveles iluminada al anochecer bajo un gran árbol', 2400),
  site('fragment', '1600573472592-401b489a3cdc', 'Detalle de fachada con celosía perforada y revestimiento de madera', 1200),
  site('story-luz', '1600210492493-0946911123ea', 'Sala con ventanales y cielo de madera bañada por luz natural', 1400),
  site('story-materia', '1600573472556-e636c2acda88', 'Fachada con celosía perforada, escalera interior y piscina al anochecer', 1400),
  site('story-entorno', '1600566753151-384129cf4e3e', 'Sala abierta hacia una terraza con piscina', 1400),
  site('zona-el-poblado', '1597047084993-bf337e09ede0', 'Torres residenciales rodeadas de vegetación'),
  site('zona-laureles', '1574362848149-11496d93a7c7', 'Edificio de ladrillo con balcones entre árboles'),
  site('zona-envigado', '1600607688969-a5bfcd646154', 'Casa contemporánea con jardín y un árbol de gran porte'),
  site('zona-sabaneta', '1580041065738-e72023775cdc', 'Conjunto residencial con piscina y jardines'),
] as const satisfies readonly CatalogImage[];

export const houseCovers = [
  cover('casa-01', '1600596542815-ffad4c1539a9', 'Casa contemporánea blanca de dos niveles con piscina frontal'),
  cover('casa-02', '1512917774080-9991f1c4c750', 'Casa blanca de líneas rectas con piscina y vegetación tropical'),
  cover('casa-03', '1613490493576-7fde63acd811', 'Villa contemporánea con aleros de madera y piscina alargada'),
  cover('casa-04', '1613977257363-707ba9348227', 'Casa de volúmenes blancos con piscina y jardín'),
  cover('casa-05', '1580587771525-78b9dba3b914', 'Casa moderna con piscina, ventanales amplios y detalles en ladrillo'),
  cover('casa-06', '1582268611958-ebfd161ef9cf', 'Casa con fachada de vidrio abierta hacia una piscina'),
  cover('casa-07', '1591474200742-8e512e6f98f8', 'Casa de cubiertas inclinadas y grandes ventanales'),
  cover('casa-08', '1564013799919-ab600027ffc6', 'Casa blanca con balcón, piscina y palmeras'),
  cover('casa-09', '1600585153490-76fb20a32601', 'Casa de volumen oscuro con ventanas iluminadas al anochecer'),
  cover('casa-10', '1600566753190-17f0baa2a6c3', 'Casa contemporánea de madera y metal negro con acceso peatonal'),
] as const satisfies readonly CatalogImage[];

export const apartmentCovers = [
  cover('apto-01', '1605283176568-9b41fde3672e', 'Edificio residencial de ladrillo con balcones y ventanales'),
  cover('apto-02', '1624204386084-dd8c05e32226', 'Torre residencial con balcones al atardecer'),
  cover('apto-03', '1515263487990-61b07816b324', 'Edificio de apartamentos con fachada blanca y marcos negros'),
  cover('apto-04', '1460317442991-0ec209397118', 'Fachada de edificio con balcones en serie'),
  cover('apto-05', '1545324418-cc1a3fa10c00', 'Edificio residencial de fachada oscura con balcones'),
  cover('apto-06', '1594484208280-efa00f96fc21', 'Conjunto residencial con piscina iluminada al anochecer'),
  cover('apto-07', '1448630360428-65456885c650', 'Esquina de edificio con fachada de ladrillo gris'),
  cover('apto-08', '1479839672679-a46483c0e7c8', 'Fachada blanca de edificio con volúmenes en voladizo'),
  cover('apto-09', '1600210492486-724fe5c67fb0', 'Sala con sofá de cuero, plantas y ventanal'),
  cover('apto-10', '1600585152915-d208bec867a1', 'Sala abierta con piso de madera y puertas de vidrio hacia la terraza'),
  cover('apto-11', '1600210491892-03d54c0aaf87', 'Sala con ventanas en arco, chimenea y vigas de madera'),
  cover('apto-12', '1600607687939-ce8a6c25118c', 'Sala luminosa con muro en madera y ventanería de piso a techo'),
  cover('apto-13', '1604014237800-1c9102c219da', 'Sala comedor integrada con terraza y muro en madera'),
  cover('apto-14', '1503174971373-b1f69850bded', 'Sala amplia rodeada de ventanales y vegetación'),
  cover('apto-15', '1560448204-e02f11c3d0e2', 'Sala con sofás claros y ventanales hacia la ciudad'),
  cover('apto-16', '1600121848594-d8644e57abab', 'Sala en tonos grises con biblioteca empotrada'),
  cover('apto-17', '1493809842364-78817add7ffb', 'Sala con sofá azul y piso de madera en espina de pez'),
  cover('apto-18', '1600566753086-00f18fb6b3ea', 'Sala de doble altura con escalera abierta y un perro descansando'),
  cover('apto-19', '1600566753104-685f4f24cb4d', 'Sala con chimenea lineal y revestimiento de madera'),
  cover('apto-20', '1638885930125-85350348d266', 'Espacio social blanco de doble altura con cocina abierta'),
  cover('apto-21', '1633505899118-4ca6bd143043', 'Sala blanca con sofás claros y mesa de madera'),
  cover('apto-22', '1611094016919-36b65678f3d6', 'Sala con sofá azul oscuro y mueble empotrado'),
  cover('apto-23', '1598928506311-c55ded91a20c', 'Sala con cielo raso artesonado y estanterías simétricas'),
  cover('apto-24', '1600210491369-e753d80a41f3', 'Sala blanca con obras gráficas y sofá claro'),
] as const satisfies readonly CatalogImage[];

export const studioCovers = [
  cover('estudio-01', '1522708323590-d24dbb6b0267', 'Apartaestudio con cocina lineal y sala integrada'),
  cover('estudio-02', '1620332372374-f108c53d2e03', 'Habitación compacta con ventana hacia la ciudad'),
  cover('estudio-03', '1513694203232-719a280e022f', 'Espacio minimalista con sofá negro y cómoda blanca'),
  cover('estudio-04', '1550581190-9c1c48d21d6c', 'Sala acogedora con muro de madera y sofá oscuro'),
  cover('estudio-05', '1583847268964-b28dc8f51f92', 'Rincón de estar con sofá claro y manta tejida'),
  cover('estudio-06', '1594026112284-02bb6f3352fe', 'Muro con repisas de madera y luz cálida'),
  cover('estudio-07', '1519643381401-22c77e60520e', 'Comedor junto a la ventana con lámparas colgantes'),
  cover('estudio-08', '1484101403633-562f891dc89a', 'Sala pequeña con sofá azul claro y lámpara de pie'),
  cover('estudio-09', '1502672260266-1c1ef2d93688', 'Sala con plantas colgantes y estantería abierta'),
] as const satisfies readonly CatalogImage[];

export const loftCovers = [
  cover('loft-01', '1538688525198-9b88f6f53126', 'Loft con muros de ladrillo a la vista y barra de cocina'),
  cover('loft-02', '1497366811353-6870744d04b2', 'Loft de concreto con ventanales perimetrales'),
  cover('loft-03', '1649083048337-4aeb6dda80bb', 'Planta abierta con viga de madera y cocina integrada'),
  cover('loft-04', '1501183638710-841dd1904471', 'Loft con cerchas a la vista y chimenea'),
  cover('loft-05', '1524758631624-e2822e304c36', 'Espacio con divisiones de vidrio y sillas de diseño'),
  cover('loft-06', '1600047508788-786f3865b4b9', 'Sala con escalera flotante de madera'),
  cover('loft-07', '1578683010236-d716f9a3f461', 'Habitación abierta con baño en vidrio y ventanales'),
] as const satisfies readonly CatalogImage[];

export const galleryImages = {
  kitchen: [
    gallery('cocina-01', '1484154218962-a197022b5858', 'Cocina blanca con isla y lámparas negras'),
    gallery('cocina-02', '1502005097973-6a7082348e28', 'Cocina alargada con mesón claro y luz natural'),
    gallery('cocina-03', '1507089947368-19c1da9775ae', 'Cocina blanca con isla y lámparas de cristal'),
    gallery('cocina-04', '1556911220-bff31c812dba', 'Cocina con mesón de mármol y estufa a gas'),
    gallery('cocina-05', '1556912173-3bb406ef7e77', 'Cocina blanca con estufa de seis puestos y mármol'),
    gallery('cocina-06', '1588854337236-6889d631faa8', 'Cocina de gabinetes oscuros y mesón de cuarzo'),
    gallery('cocina-07', '1600489000022-c2086d79f9d4', 'Cocina en L con gabinetes oscuros y repisas abiertas'),
    gallery('cocina-08', '1600566752229-250ed79470f8', 'Cocina minimalista blanca con barra'),
  ],
  bedroom: [
    gallery('habitacion-01', '1512918728675-ed5a9ecdebfd', 'Habitación principal con cabecero tapizado'),
    gallery('habitacion-02', '1540518614846-7eded433c457', 'Habitación con cama doble y obra de arte'),
    gallery('habitacion-03', '1560185893-a55cbc8c57e8', 'Habitación amplia con alfombra y ventanas'),
    gallery('habitacion-04', '1571508601891-ca5e7a713859', 'Habitación con plantas y textiles cálidos'),
    gallery('habitacion-05', '1595526114035-0d45ed16cfbf', 'Habitación blanca con mesas de noche'),
    gallery('habitacion-06', '1600566753051-f0b89df2dd90', 'Habitación con celosía perforada y piso de madera'),
    gallery('habitacion-07', '1600573472591-ee6b68d14c68', 'Habitación con balcón y vista a la vegetación'),
    gallery('habitacion-08', '1600607687644-c7171b42498f', 'Habitación serena en tonos blancos'),
    gallery('habitacion-09', '1609766857041-ed402ea8069a', 'Habitación luminosa con espejo redondo'),
    gallery('habitacion-10', '1617098900591-3f90928e8c54', 'Habitación con cabecero claro y lámpara de cristal'),
    gallery('habitacion-11', '1659720879195-d5a108231648', 'Habitación con ventanales hacia los árboles'),
    gallery('habitacion-12', '1617104678098-de229db51175', 'Habitación de muro oscuro con ventanal'),
  ],
  bathroom: [
    gallery('bano-01', '1552321554-5fefe8c9ef14', 'Baño blanco con plantas'),
    gallery('bano-02', '1584622650111-993a426fbf0a', 'Baño con ducha en vidrio y doble lavamanos'),
    gallery('bano-03', '1600566752355-35792bedcfea', 'Baño con tina exenta y acabados oscuros'),
    gallery('bano-04', '1600607688066-890987f18a86', 'Baño con mueble flotante de madera'),
    gallery('bano-05', '1604709177225-055f99402ea3', 'Baño en piedra gris con tina'),
    gallery('bano-06', '1620626011761-996317b8d101', 'Baño con tina blanca y plantas'),
  ],
  living: [
    gallery('estar-01', '1516455590571-18256e5bb9ff', 'Comedor con lámpara de cristal y ventanales'),
    gallery('estar-02', '1560185007-cde436f6a4d0', 'Comedor y sala con piso de madera'),
    gallery('estar-03', '1560185127-6ed189bf02f4', 'Sala con sofá beige y cuadro'),
    gallery('estar-04', '1567767292278-a4f21aa2d36e', 'Sala blanca con planta de interior'),
    gallery('estar-05', '1554995207-c18c203602cb', 'Sala con sofá de cuero color coñac'),
    gallery('estar-06', '1600573472550-8090b5e0745e', 'Estar con escalera y vista a la piscina'),
    gallery('estar-07', '1613545325278-f24b0cae1224', 'Sala blanca de doble altura con chimenea'),
    gallery('estar-08', '1616137466211-f939a420be84', 'Sala gris con chimenea y ventanas'),
    gallery('estar-09', '1617103996702-96ff29b1c467', 'Sala con tapete y mesa redonda'),
    gallery('estar-10', '1622866306950-81d17097d458', 'Sala con sofá gris y mesa de centro negra'),
  ],
} as const satisfies Record<GalleryRoom, readonly CatalogImage[]>;

export const allCatalogImages: readonly CatalogImage[] = [
  ...siteImages,
  ...houseCovers,
  ...apartmentCovers,
  ...studioCovers,
  ...loftCovers,
  ...Object.values(galleryImages).flat(),
];

export const unsplashSourceUrl = (unsplashId: string): string =>
  `https://images.unsplash.com/photo-${unsplashId}`;

import { allCatalogImages, unsplashSourceUrl } from '@/content/images/catalog';
import { pageMetadata } from '@/shared/seo/metadata';
import { PageIntro } from '@/shared/ui/PageIntro';

export const metadata = pageMetadata({
  title: 'Créditos fotográficos',
  description: 'Origen y licencia de las fotografías ilustrativas usadas en el portafolio demostrativo de LÚMINA.',
  path: '/creditos',
});

export default function CreditsPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Créditos fotográficos">
        <p>
          Todas las fotografías provienen de{' '}
          <a href="https://unsplash.com" className="underline underline-offset-4">
            Unsplash
          </a>{' '}
          y se usan bajo la{' '}
          <a href="https://unsplash.com/license" className="underline underline-offset-4">
            licencia de Unsplash
          </a>
          . Son ilustrativas: no muestran los inmuebles ficticios del catálogo.
        </p>
      </PageIntro>
      <div className="shell py-16">
        <p className="text-sm text-ink-muted">{allCatalogImages.length} fotografías, con su descripción y su fuente original.</p>
        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {allCatalogImages.map((image) => (
            <li key={image.key} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[0.875rem]">
              <span className="text-charcoal">{image.alt}</span>
              <a
                href={unsplashSourceUrl(image.unsplashId)}
                className="shrink-0 text-xs text-bronze-deep underline underline-offset-4"
                rel="noopener noreferrer"
                target="_blank"
              >
                Fuente<span className="sr-only">: {image.alt} (se abre en una pestaña nueva)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

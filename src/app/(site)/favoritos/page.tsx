import { FavoritesView } from '@/features/favorites/FavoritesView';
import { pageMetadata } from '@/shared/seo/metadata';
import { PageIntro } from '@/shared/ui/PageIntro';

export const metadata = pageMetadata({
  title: 'Mis favoritas',
  description: 'Residencias guardadas en este navegador.',
  path: '/favoritos',
  noIndex: true,
});

export default function FavoritesPage() {
  return (
    <>
      <PageIntro eyebrow="Favoritas" title="Tus residencias guardadas">
        <p>Se guardan solo en este navegador. Compáralas con calma y solicita una visita desde cada ficha.</p>
      </PageIntro>
      <section className="shell py-14 pb-28" aria-label="Favoritas">
        <FavoritesView />
      </section>
    </>
  );
}

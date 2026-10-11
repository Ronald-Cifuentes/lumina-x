'use client';

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center pb-20 pt-36">
      <p className="eyebrow text-bronze-deep">Algo salió mal</p>
      <h1 className="display mt-6 max-w-3xl text-[clamp(2.5rem,6vw,5rem)] font-light">No pudimos cargar esta página.</h1>
      <p className="mt-5 max-w-xl text-ink-muted">
        Es un error temporal de nuestro lado. Puedes intentarlo de nuevo; si persiste, escríbenos.
        {error.digest ? ` Código: ${error.digest}.` : ''}
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-8 inline-flex h-12 w-fit items-center bg-charcoal px-6 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ivory"
      >
        Reintentar
      </button>
    </div>
  );
}

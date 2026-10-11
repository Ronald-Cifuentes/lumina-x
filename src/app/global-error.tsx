'use client';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es-CO">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f6f2eb', color: '#20231f', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '2.5rem' }}>No pudimos cargar LÚMINA.</h1>
        <p>Intenta de nuevo en unos segundos.</p>
        <button type="button" onClick={retry} style={{ marginTop: '1.5rem', padding: '0.9rem 1.4rem', background: '#20231f', color: '#f6f2eb', border: 0 }}>
          Reintentar
        </button>
      </body>
    </html>
  );
}

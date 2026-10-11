import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { MotionProvider } from '@/features/motion/MotionProvider';
import { getSiteUrl } from '@/shared/config/env.server';
import { site } from '@/shared/config/site';
import { DEFAULT_OG_IMAGE } from '@/shared/seo/metadata';
import { cormorant, manrope } from './fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${site.name} · Arriendos residenciales en Medellín y el Valle de Aburrá`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: site.name,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#f6f2eb',
  colorScheme: 'light',
};

const NO_SCRIPT_REVEAL = '[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Every page is rendered per request: the proxy issues a CSP nonce for each response.
  await connection();
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <noscript>
          <style>{NO_SCRIPT_REVEAL}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

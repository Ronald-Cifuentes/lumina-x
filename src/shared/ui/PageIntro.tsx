import type { ReactNode } from 'react';

type PageIntroProps = { eyebrow: string; title: ReactNode; children?: ReactNode };

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <header className="shell pt-32 sm:pt-40">
      <div className="grid gap-8 border-b border-line pb-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow text-bronze-deep">{eyebrow}</p>
          <h1 className="display mt-5 text-[clamp(2.9rem,6.8vw,6.5rem)] font-light">{title}</h1>
        </div>
        {children && <div className="text-[1.0625rem] leading-relaxed text-ink-muted lg:col-span-4">{children}</div>}
      </div>
    </header>
  );
}

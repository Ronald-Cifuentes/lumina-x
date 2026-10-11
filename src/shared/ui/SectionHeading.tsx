import { cn } from '@/shared/lib/cn';

type SectionHeadingProps = {
  number: string;
  eyebrow: string;
  tone?: 'light' | 'dark';
  className?: string;
};

/** Large editorial numeral paired with a small caps label. */
export function SectionHeading({ number, eyebrow, tone = 'light', className }: SectionHeadingProps) {
  return (
    <div className={cn('flex items-baseline gap-5 border-t pt-5', tone === 'dark' ? 'border-ivory/20' : 'border-line', className)}>
      <span
        aria-hidden="true"
        className={cn('display text-[3.5rem] font-light leading-none sm:text-[4.5rem]', tone === 'dark' ? 'text-bronze-light' : 'text-bronze')}
      >
        {number}
      </span>
      <span className={cn('eyebrow', tone === 'dark' ? 'text-ivory/75' : 'text-bronze-deep')}>{eyebrow}</span>
    </div>
  );
}

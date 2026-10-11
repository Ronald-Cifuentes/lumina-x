'use client';

import { motion } from 'motion/react';
import { Fragment } from 'react';
import { EDITORIAL_EASE } from './easing';

type RevealTextProps = {
  text: string;
  id?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

/**
 * Word-by-word rise for editorial headings. Words stay in the DOM as plain
 * text for assistive technology; only opacity and transform animate.
 */
export function RevealText({ text, id, as = 'h2', className, delay = 0 }: RevealTextProps) {
  const Tag = tags[as];
  const words = text.split(' ');
  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-top">
            <motion.span
              data-reveal
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: '0.55em' },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EDITORIAL_EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

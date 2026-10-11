'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { EDITORIAL_EASE } from './easing';

type AnimatedFilterPanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  id: string;
  children: ReactNode;
  footer?: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Modal filter drawer built on the native <dialog>: the page behind becomes
 * inert, Escape closes it and focus returns to the trigger. The panel slides
 * in from the side; with reduced motion it simply appears.
 */
export function AnimatedFilterPanel({ open, onClose, title, id, children, footer, returnFocusRef }: AnimatedFilterPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  const finishClose = () => {
    dialogRef.current?.close();
    returnFocusRef?.current?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md overflow-visible bg-transparent p-0 backdrop:bg-charcoal/45"
    >
      <AnimatePresence onExitComplete={finishClose}>
        {open && (
          <motion.div
            key="panel"
            initial={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 }}
            transition={{ duration: reduce ? 0.01 : 0.42, ease: EDITORIAL_EASE }}
            className="flex h-full flex-col bg-ivory text-charcoal shadow-[-24px_0_60px_-30px_rgb(32_35_31/0.5)]"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 id={`${id}-title`} className="font-serif text-3xl">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong hover:border-charcoal"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={1.6} />
                <span className="sr-only">Cerrar filtros</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">{children}</div>
            {footer && <div className="border-t border-line bg-surface px-6 py-4">{footer}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

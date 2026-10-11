import { SectionHeading } from '@/shared/ui/SectionHeading';

const STEPS = [
  {
    title: 'Explora y guarda',
    text: 'Filtra por zona, presupuesto, tipo y condiciones. Guarda tus favoritas en este navegador para compararlas con calma.',
  },
  {
    title: 'Solicita una visita',
    text: 'Elige fecha y franja horaria. Un asesor confirma la cita por teléfono o correo: la solicitud no reserva el inmueble.',
  },
  {
    title: 'Estudio del arrendamiento',
    text: 'Presentas los documentos del arrendatario y del respaldo (codeudor o póliza). Te explicamos cada requisito antes de empezar.',
  },
  {
    title: 'Contrato y entrega',
    text: 'Firmas el contrato, revisamos juntos el inventario del inmueble y recibes las llaves el día acordado.',
  },
] as const;

export function RentalProcess() {
  return (
    <section aria-labelledby="proceso-title" className="bg-ivory py-28 sm:py-36">
      <div className="shell">
        <SectionHeading number="04" eyebrow="Cómo se arrienda" />
        <h2 id="proceso-title" className="display mt-10 max-w-4xl text-[clamp(2.5rem,5.4vw,5.25rem)] font-light">
          Un proceso claro, sin letra pequeña.
        </h2>
        <ol className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bg-ivory p-0 pb-10 pt-8 sm:pr-8 lg:pb-0">
              <span aria-hidden="true" className="display text-[2.75rem] font-light text-bronze">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 font-serif text-[1.65rem] leading-tight">{step.title}</h3>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

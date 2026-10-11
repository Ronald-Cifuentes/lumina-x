export const whatsappLink = (number: string, message: string): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

const swatchClasses: Record<string, string> = {
  Negro: "color-black",
  Blanco: "color-white",
  Marrón: "color-brown",
  Crema: "color-cream",
  Dorado: "color-gold",
  Gris: "color-gray",
};

export function ColorSwatch({ color }: { color: string }) {
  return <span className={`color-swatch ${swatchClasses[color]}`} aria-hidden="true" />;
}

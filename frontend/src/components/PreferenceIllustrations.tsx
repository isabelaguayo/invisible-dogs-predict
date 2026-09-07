const swatchClasses: Record<string, string> = {
  Negro: "color-black",
  Blanco: "color-white",
  Marrón: "color-brown",
  Crema: "color-cream",
  Dorado: "color-gold",
  Gris: "color-gray",
};

export function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className={`color-swatch ${swatchClasses[color] ?? ""}`}
      style={color === "Amarillo" ? { background: "#d8b52f" } : undefined}
      aria-hidden="true"
    />
  );
}

"""Generate the two static word-cloud assets used by Protectora.

The terms, weights, palettes, layout settings and seeds come directly from
the approved source snippet. SHA-256 replaces Python's process-randomized
``hash()`` so the intended per-term colour assignment is reproducible.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from matplotlib import get_data_path
from wordcloud import WordCloud


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY = PROJECT_ROOT / "frontend/public/images/text-mining"
FONT_PATH = Path(get_data_path()) / "fonts/ttf/DejaVuSans.ttf"

LEFT_TERMS = [
    "Sociable con personas", "Juguetón", "Cariñoso", "Confiado", "Desparasitado",
    "Independiente", "Curioso", "Buen comportamiento", "Fácil adaptación", "Amigable",
    "Esterilizado", "Adaptable", "Sociable", "Saludable", "Microchip", "Tranquilo",
    "Activo", "Buen estado de salud", "Equilibrado", "Fácil manejo",
    "Acostumbrado al hogar", "Educado", "Dócil", "Sociable con perros",
    "Vacunado", "Alegre", "Paseo con correa",
]

RIGHT_TERMS = [
    "Timidez", "Baja sociabilidad", "Encadenado", "Sin hogar", "Tratamiento",
    "Maltrato", "Reactividad", "Historial complejo", "Inseguridad",
    "Necesidades especiales", "Mayor", "Enfermedad", "Movilidad reducida",
    "Miedo", "Recuperación", "Discapacidad", "Agresividad", "Abandono",
    "Medicación", "Adaptación", "Estrés", "Trauma", "Cirugía",
    "Problemas de conducta", "Cuidados especiales", "Herido", "Ansiedad",
    "Paciencia", "Desconfianza", "Socialización",
]

LEFT_WEIGHTS = {
    # Ajuste fino: los 6 términos principales se refuerzan muy ligeramente
    # (Sociable ya estaba al máximo) para equilibrar la presencia visual
    # frente a la nube naranja. Los 6 términos más pequeños se refuerzan
    # ~12% para mejorar su legibilidad sin llegar a competir con los
    # términos principales. El resto queda exactamente igual.
    "Sociable": 100, "Cariñoso": 99, "Juguetón": 96, "Curioso": 93,
    "Activo": 90, "Alegre": 88, "Dócil": 82, "Saludable": 80,
    "Confiado": 77, "Adaptable": 75, "Amigable": 72, "Tranquilo": 70,
    "Educado": 68, "Esterilizado": 64, "Independiente": 61, "Microchip": 58,
    "Equilibrado": 56, "Fácil adaptación": 54, "Fácil manejo": 52,
    "Acostumbrado al hogar": 49, "Buen comportamiento": 47,
    "Buen estado de salud": 50, "Sociable con personas": 48,
    "Sociable con perros": 46, "Vacunado": 44, "Desparasitado": 41,
    "Paseo con correa": 39,
}

RIGHT_WEIGHTS = {
    # Ajuste fino: los 8 términos más pequeños se refuerzan ~12% (mismo
    # criterio que en la nube morada) para mejorar su legibilidad. El
    # resto, incluidos los términos principales, queda exactamente igual.
    "Miedo": 100, "Maltrato": 97, "Trauma": 94, "Herido": 91,
    "Ansiedad": 88, "Mayor": 86, "Estrés": 83, "Discapacidad": 80,
    "Agresividad": 77, "Enfermedad": 75, "Timidez": 72, "Reactividad": 70,
    "Inseguridad": 68, "Recuperación": 66, "Abandono": 64, "Cirugía": 61,
    "Medicación": 59, "Adaptación": 57, "Desconfianza": 55,
    "Socialización": 53, "Tratamiento": 51, "Encadenado": 49,
    "Baja sociabilidad": 53, "Sin hogar": 50, "Historial complejo": 48,
    "Necesidades especiales": 46, "Movilidad reducida": 44,
    "Problemas de conducta": 41, "Cuidados especiales": 39, "Paciencia": 37,
}

PURPLE_PALETTE = ["#2F166D", "#44239A", "#5A38B5", "#7357C6", "#8A73D4", "#A08BE0"]
ORANGE_PALETTE = ["#B93A00", "#D54A00", "#EB5B00", "#F56A00", "#F47C20", "#FF9248"]


def stable_palette_index(word: str, palette_size: int) -> int:
    digest = hashlib.sha256(word.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") % palette_size


def make_cloud(
    frequencies: dict[str, int],
    palette: list[str],
    seed: int,
    output_path: Path,
) -> None:
    def color_func(word: str, *_args: object, **_kwargs: object) -> str:
        return palette[stable_palette_index(word, len(palette))]

    cloud = WordCloud(
        width=1500,
        height=900,
        background_color=None,
        mode="RGBA",
        font_path=str(FONT_PATH),
        prefer_horizontal=1.0,
        max_words=len(frequencies),
        relative_scaling=0.55,
        min_font_size=18,
        max_font_size=126,
        margin=10,
        random_state=seed,
        collocations=False,
        regexp=r"\w[\wáéíóúüñÁÉÍÓÚÜÑ ]+",
        color_func=color_func,
        contour_width=0,
    ).generate_from_frequencies(frequencies)

    if set(cloud.words_) != set(frequencies):
        missing = sorted(set(frequencies) - set(cloud.words_))
        raise RuntimeError(f"Not every approved term was placed: {missing}")

    cloud.to_image().save(output_path)


def main() -> None:
    if set(LEFT_TERMS) != set(LEFT_WEIGHTS):
        raise ValueError("The simple-adoption terms and weights differ")
    if set(RIGHT_TERMS) != set(RIGHT_WEIGHTS):
        raise ValueError("The slow-adoption terms and weights differ")
    if not FONT_PATH.is_file():
        raise FileNotFoundError(f"DejaVu Sans was not found at {FONT_PATH}")

    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    outputs = (
        (LEFT_WEIGHTS, PURPLE_PALETTE, 27, OUTPUT_DIRECTORY / "adopcion-sencilla.png"),
        (RIGHT_WEIGHTS, ORANGE_PALETTE, 42, OUTPUT_DIRECTORY / "adopcion-lenta.png"),
    )
    for frequencies, palette, seed, output_path in outputs:
        make_cloud(frequencies, palette, seed, output_path)
        print(output_path)


if __name__ == "__main__":
    main()

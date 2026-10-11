"""Génère les icônes PWA (public/icons) à partir du logo du site.

Usage : npm run icons   (nécessite Python 3 + Pillow)
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT.parent / "site" / "public" / "img" / "Logo_EMTW.webp"
OUT = ROOT / "public" / "icons"
BACKGROUND = (20, 17, 13, 255)  # même teinte que --bg dans src/styles/main.css


def square(img: Image.Image, size: int, padding: float, background=None) -> Image.Image:
    """Centre le logo dans un carré de `size` px avec une marge relative `padding`."""
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    inner = int(size * (1 - 2 * padding))
    logo = img.copy()
    logo.thumbnail((inner, inner), Image.LANCZOS)
    canvas.paste(logo, ((size - logo.width) // 2, (size - logo.height) // 2), logo)
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo = Image.open(SOURCE).convert("RGBA")

    square(logo, 192, 0.04).save(OUT / "icon-192.png", optimize=True)
    square(logo, 512, 0.04).save(OUT / "icon-512.png", optimize=True)
    # Icône "maskable" : zone de sécurité de 10 % + fond opaque (Android)
    square(logo, 512, 0.14, BACKGROUND).save(OUT / "maskable-512.png", optimize=True)
    # iOS ignore la transparence : fond opaque
    square(logo, 180, 0.08, BACKGROUND).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    print(f"Icônes générées dans {OUT}")


if __name__ == "__main__":
    main()

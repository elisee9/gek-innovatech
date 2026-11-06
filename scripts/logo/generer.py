# Logo GEK INNOVATECH (chevrons < > en losange, point rouge) : génère toutes ses versions à partir de sa géométrie.
# Depuis la racine du projet : python -I scripts/logo/generer.py
# Nécessite Python avec fontTools et Pillow, Node et Google Chrome (rendu des PNG à fond transparent, voir rendu.mjs).
# Écrit : src/components/Logo.jsx, public/logo.svg, favicon.svg, favicon.ico, apple-touch-icon.png, og-image.svg et .jpeg,
# et le dossier logo-gek-innovatech/ (logo, symbole, icônes, réseaux sociaux).
import datetime
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..")).replace(os.sep, "/")
WORK = tempfile.mkdtemp(prefix="gek-logo-").replace(os.sep, "/")
KIT = ROOT + "/logo-gek-innovatech"
FILES = ROOT + "/node_modules/@fontsource/barlow/files/"
FONTS = {w: TTFont(FILES + f"barlow-latin-{w}-normal.woff") for w in (500, 600, 800)}
fmt = lambda v: ("%.2f" % v).rstrip("0").rstrip(".")

NAVY, NIGHT, RED, RED_DARK_BG, MUTED, MUTED_DARK = "#1D467B", "#00182F", "#D42A1C", "#FF5A45", "#456189", "#C9D5E8"
COLOR = dict(primary=NAVY, accent=RED, sub=MUTED)
WHITE = dict(primary="#FFFFFF", accent=RED_DARK_BG, sub=MUTED_DARK)
MONO = {
    "marine": dict(primary=NAVY, accent=NAVY, sub=NAVY),
    "noir": dict(primary="#000000", accent="#000000", sub="#000000"),
    "blanc-uni": dict(primary="#FFFFFF", accent="#FFFFFF", sub="#FFFFFF"),
}


# ---------- Texte Barlow converti en tracés ----------
def run(weight, text, size, track):
    font = FONTS[weight]
    gs, cmap, k = font.getGlyphSet(), font.getBestCmap(), size / 1000
    items, x = [], 0.0
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        items.append((g, x))
        x += gs[g].width * k + (track if i < len(text) - 1 else 0)
    return gs, k, items


def ink(weight, text, size, track=0.0):
    gs, k, items = run(weight, text, size, track)
    pen = BoundsPen(gs)
    for g, x in items:
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, 0)))
    return pen.bounds


def text_path(weight, text, size, left, baseline, track=0.0):
    xmin = ink(weight, text, size, track)[0]
    gs, k, items = run(weight, text, size, track)
    pen = SVGPathPen(gs, ntos=fmt)
    for g, x in items:
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, left - xmin + x, baseline)))
    return pen.getCommands()


# ---------- Symbole : deux chevrons pleins et un point, dans un carré de 100 ----------
def chevron(vx, reach, w):
    """Chevron « < » : sommet en (vx, 50), branches de longueur `reach` à 45°, épaisseur w, coupes perpendiculaires."""
    h = w / 2
    s = math.sqrt(0.5)
    top, bot = (vx + reach, 50 - reach), (vx + reach, 50 + reach)
    pts = [
        (top[0] - h * s, top[1] - h * s),
        (vx - h * math.sqrt(2), 50),
        (bot[0] - h * s, bot[1] + h * s),
        (bot[0] + h * s, bot[1] - h * s),
        (vx + h * math.sqrt(2), 50),
        (top[0] + h * s, top[1] + h * s),
    ]
    return pts


def poly(pts):
    return "M" + " L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + " Z"


# Version courante, et version épaissie pour les très petites tailles (onglet du navigateur).
REGULAR = dict(vx=12, reach=31.5, w=13, r=10)
SMALL = dict(vx=10, reach=33, w=16, r=12)


def mark_shapes(g=REGULAR):
    left = chevron(g["vx"], g["reach"], g["w"])
    right = [(100 - x, y) for x, y in left]
    return poly(left) + " " + poly(right), g["r"]


def mark_svg(c, g=REGULAR):
    d, r = mark_shapes(g)
    return f'<path fill="{c["primary"]}" d="{d}"/><circle fill="{c["accent"]}" cx="50" cy="50" r="{r}"/>'


# ---------- Lettrage : GEK au-dessus de INNOVATECH, justifiés ----------
CAP_G, GAP, CAP_S = 19.0, 5.0, 5.2
SIZE_G, SIZE_S = CAP_G / 0.7, CAP_S / 0.7
TRACK_G = 1.2
BLOCK_H = CAP_G + GAP + CAP_S
MARK_BOX = BLOCK_H * 1.07          # le losange paraît plus petit qu'un carré : léger agrandissement optique
MARK_Y = (BLOCK_H - MARK_BOX) / 2
SPACE = 6.6                        # entre le symbole et le texte


def lockup_parts():
    gx0, _, gx1, _ = ink(800, "GEK", SIZE_G, TRACK_G)
    width = gx1 - gx0
    sx0, _, sx1, _ = ink(600, "INNOVATECH", SIZE_S)
    track = (width - (sx1 - sx0)) / 9
    left = MARK_BOX + SPACE
    k = MARK_BOX / 100
    mark_d, r = mark_shapes()
    return dict(
        transform=f"translate(0 {fmt(MARK_Y)}) scale({fmt(k)})",
        mark=mark_d, r=r,
        gek=text_path(800, "GEK", SIZE_G, left, CAP_G, TRACK_G),
        sub=text_path(600, "INNOVATECH", SIZE_S, left, BLOCK_H, track),
        width=left + width, track=track,
    )


P = lockup_parts()
VB_Y, VB_H = MARK_Y, MARK_BOX
VIEWBOX = f"0 {fmt(VB_Y)} {fmt(P['width'])} {fmt(VB_H)}"


def lockup_svg(c, pad=0.0):
    x, y, w, h = -pad, VB_Y - pad, P["width"] + 2 * pad, VB_H + 2 * pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(x)} {fmt(y)} {fmt(w)} {fmt(h)}" role="img" aria-label="GEK INNOVATECH">'
            f'<g transform="{P["transform"]}"><path fill="{c["primary"]}" d="{P["mark"]}"/>'
            f'<circle fill="{c["accent"]}" cx="50" cy="50" r="{P["r"]}"/></g>'
            f'<path fill="{c["primary"]}" d="{P["gek"]}"/><path fill="{c["sub"]}" d="{P["sub"]}"/></svg>')


def symbol_svg(c, pad=3):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {100 + 2 * pad} {100 + 2 * pad}" role="img" aria-label="GEK INNOVATECH">'
            f'{mark_svg(c)}</svg>')


def icon_svg(small=False, radius=22):
    g, scale = (SMALL, 0.76) if small else (REGULAR, 0.64)
    off = (100 - 100 * scale) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="GEK INNOVATECH">'
            f'<rect width="100" height="100" rx="{radius}" fill="{NAVY}"/>'
            f'<g transform="translate({fmt(off)} {fmt(off)}) scale({scale})">{mark_svg(WHITE, g)}</g></svg>')


def profile_svg(bg, c):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="{bg}"/>'
            f'<g transform="translate(25 25) scale(0.5)">{mark_svg(c)}</g></svg>')


def cover_svg(w, h, tagline):
    lw = w * 0.36
    k = lw / P["width"]
    x0, y0 = (w - lw) / 2, h * 0.43 - (VB_H * k) / 2 - VB_Y * k
    tsize = h * 0.052
    tx0, _, tx1, _ = ink(500, tagline, tsize)
    tag = text_path(500, tagline, tsize, (w - (tx1 - tx0)) / 2, y0 + (VB_Y + VB_H) * k + h * 0.15)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
            f'<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{NIGHT}"/><stop offset="1" stop-color="{NAVY}"/></linearGradient></defs>'
            f'<rect width="{w}" height="{h}" fill="url(#bg)"/>'
            f'<g transform="translate({fmt(x0)} {fmt(y0)}) scale({fmt(k)})">{inner_lockup(WHITE)}</g>'
            f'<path fill="{MUTED_DARK}" d="{tag}"/></svg>')


def inner_lockup(c):
    return (f'<g transform="{P["transform"]}"><path fill="{c["primary"]}" d="{P["mark"]}"/>'
            f'<circle fill="{c["accent"]}" cx="50" cy="50" r="{P["r"]}"/></g>'
            f'<path fill="{c["primary"]}" d="{P["gek"]}"/><path fill="{c["sub"]}" d="{P["sub"]}"/>')


# ---------- Écriture ----------
jobs = []


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content + "\n")


def raster(svg, out, w, h):
    jobs.append(dict(svg=svg, out=out, w=int(w), h=int(h)))


ratio = (P["width"] + 2 * 1.2) / (VB_H + 2 * 1.2)
logo_versions = {"couleur": COLOR, "blanc": WHITE, **MONO}
for name, c in logo_versions.items():
    svg = lockup_svg(c, pad=1.2)
    write(f"{KIT}/logo/gek-logo-{name}.svg", svg)
    raster(svg, f"{KIT}/logo/gek-logo-{name}-2000.png", 2000, round(2000 / ratio))
    if name in ("couleur", "blanc"):
        raster(svg, f"{KIT}/logo/gek-logo-{name}-600.png", 600, round(600 / ratio))

for name, c in {"couleur": COLOR, "blanc": WHITE, "marine": MONO["marine"], "noir": MONO["noir"]}.items():
    svg = symbol_svg(c)
    write(f"{KIT}/symbole/gek-symbole-{name}.svg", svg)
    raster(svg, f"{KIT}/symbole/gek-symbole-{name}-1024.png", 1024, 1024)

icon = icon_svg()
small_icon = icon_svg(small=True)
write(f"{KIT}/icones/gek-icone.svg", icon)
write(f"{KIT}/icones/favicon.svg", small_icon)
for s in (1024, 512, 192):
    raster(icon, f"{KIT}/icones/gek-icone-{s}.png", s, s)
apple = icon_svg(radius=0)
raster(apple, f"{KIT}/icones/apple-touch-icon.png", 180, 180)
for s in (48, 32, 16):
    raster(small_icon, f"{WORK}/ico-{s}.png", s, s)
raster(small_icon, f"{KIT}/icones/favicon-32.png", 32, 32)
raster(small_icon, f"{KIT}/icones/favicon-16.png", 16, 16)

raster(profile_svg(NAVY, WHITE), f"{KIT}/reseaux-sociaux/gek-photo-profil-marine-1080.png", 1080, 1080)
raster(profile_svg("#FFFFFF", COLOR), f"{KIT}/reseaux-sociaux/gek-photo-profil-blanc-1080.png", 1080, 1080)
raster(cover_svg(1640, 624, "Sites web et applications mobiles"), f"{KIT}/reseaux-sociaux/gek-couverture-facebook-1640x624.png", 1640, 624)

# ---------- Fichiers du site ----------
write(ROOT + "/public/logo.svg", lockup_svg(COLOR, pad=1.2))
write(ROOT + "/public/favicon.svg", small_icon)
raster(apple, ROOT + "/public/apple-touch-icon.png", 180, 180)

og = open(ROOT + "/public/og-image.svg", encoding="utf-8").read()
# Relançable : le logo remplace l'ancien bloc ou celui d'un passage précédent.
cut = next(og.index(m) for m in ("  <!--\n    Logo", "  <!-- Logo (symbole") if m in og)
lw = 640
k = lw / P["width"]
x0, y0 = (1200 - lw) / 2, 268 - (VB_H * k) / 2 - VB_Y * k
tagline = "Sites web et applications mobiles"
tsize = 32
tx0, _, tx1, _ = ink(500, tagline, tsize)
tag = text_path(500, tagline, tsize, (1200 - (tx1 - tx0)) / 2, y0 + (VB_Y + VB_H) * k + 78)
og = (og[:cut] + "  <!-- Logo (symbole en chevrons, lettrage Barlow converti en tracés), centré -->\n"
      f'  <g transform="translate({fmt(x0)} {fmt(y0)}) scale({fmt(k)})">{inner_lockup(WHITE)}</g>\n'
      f'  <!-- Accroche -->\n  <path fill="{MUTED_DARK}" d="{tag}"/>\n</svg>')
write(ROOT + "/public/og-image.svg", og)
raster(og, f"{WORK}/og-image.png", 1200, 630)

# ---------- Composant du site ----------
W, H = P["width"], VB_H
jsx = f'''// Logo GEK INNOVATECH : deux chevrons du code (< >) forment un losange, avec le point rouge du site au centre.
// Lettrage en Barlow converti en tracés : il s'affiche pareil sur tous les appareils, sans dépendre d'une police.
// Les couleurs suivent le contexte : marine sur fond clair, blanc dans le bandeau marine (.on-dark, .band-dark).
// Fichier généré par scripts/logo/generer.py : modifier le dessin là, puis relancer le script. Versions à télécharger : logo-gek-innovatech/.
const VIEW = {{ x: 0, y: {fmt(VB_Y)}, w: {fmt(W)}, h: {fmt(H)} }};

const Logo = ({{ width = 116, className = "" }}) => (
   <svg
      viewBox={{`${{VIEW.x}} ${{VIEW.y}} ${{VIEW.w}} ${{VIEW.h}}`}}
      width={{width}}
      height={{Math.round((width * VIEW.h) / VIEW.w)}}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GEK INNOVATECH"
      className={{className}}
   >
      <g transform="{P["transform"]}">
         <path className="fill-fg" d="{P["mark"]}" />
         <circle className="fill-signal" cx="50" cy="50" r="{P["r"]}" />
      </g>
      <path className="fill-fg" d="{P["gek"]}" />
      <path className="fill-muted" d="{P["sub"]}" />
   </svg>
);

export default Logo;
'''
write(ROOT + "/src/components/Logo.jsx", jsx.rstrip("\n"))

with open(WORK + "/rendu.json", "w", encoding="utf-8") as f:
    json.dump(jobs, f)
print("viewBox", VIEWBOX, "| ratio", fmt(P["width"] / VB_H), "| espacement INNOVATECH", fmt(P["track"]), "| PNG a rendre", len(jobs))

# ---------- Rendu des PNG, icône .ico et image de partage .jpeg ----------
subprocess.run(["node", os.path.join(HERE, "rendu.mjs"), WORK + "/rendu.json"], check=True)
from PIL import Image  # noqa: E402

ico = [Image.open(f"{WORK}/ico-{s}.png").convert("RGBA") for s in (48, 32, 16)]
for dest in (ROOT + "/public/favicon.ico", KIT + "/icones/favicon.ico"):
    ico[0].save(dest, format="ICO", sizes=[(48, 48), (32, 32), (16, 16)], append_images=ico[1:])
note = ("impeccable:prompt\x00Origin: rendered on " + datetime.date.today().isoformat() +
        " from public/og-image.svg (the site's own vector share card) with the chevron logo and Barlow lettering"
        " converted to outlines, navy/red/white palette, 1200x630. Not an AI-generated image.").encode()
Image.open(f"{WORK}/og-image.png").convert("RGB").save(
    ROOT + "/public/og-image.jpeg", "JPEG", quality=88, progressive=True, optimize=True, comment=note)
shutil.rmtree(WORK, ignore_errors=True)
print("termine : site, image de partage et dossier logo-gek-innovatech a jour")

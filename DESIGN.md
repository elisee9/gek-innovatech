---
name: GEK INNOVATECH
description: Light fixed-price agency site; every page opens on a navy band with a live point terrain (a real delivered site on the home page, breadcrumbs elsewhere), then published prices on white sheets in blue text, one red path to WhatsApp.
colors:
  ink: "#f4f6fa"
  ink-2: "#ffffff"
  ink-3: "#edf1f7"
  line: "rgb(29 70 123 / 0.12)"
  line-strong: "rgb(29 70 123 / 0.22)"
  shade: "rgb(18 48 92)"
  fg: "#1d467b"
  fg-hover: "#143560"
  muted: "#456189"
  dim: "#526c92"
  subtle: "#526c92"
  brand: "#1d467b"
  brand-deep: "#00182f"
  brand-band: "#1d467b"
  brand-text: "#1d467b"
  signal: "#cc2219"
  signal-fill: "#d42a1c"
  signal-fill-hover: "#b81e15"
  on-signal: "#ffffff"
  danger: "#b42318"
typography:
  display:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 8.3vw, 2.25rem) below 640px, clamp(2.25rem, 3.9vw, 3.5rem) above"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline-page:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  row-title:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  field: "12px"
  bubble: "16px"
  frame: "18px"
  panel: "24px"
  card: "28px"
  pill: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter: "32px"
  section-mobile: "56px"
  section: "80px"
  card-pad: "32px"
  row-pad: "20px"
components:
  button-lit:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "56px"
  button-lit-hover:
    backgroundColor: "{colors.signal-fill-hover}"
  button-light:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "56px"
  button-ghost:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.ink-3}"
  card:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  input:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "48px"
  chip-included:
    textColor: "{colors.signal}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    typography: "{typography.label}"
  nav-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  nav-link-active:
    textColor: "{colors.fg}"
---

# Design System: GEK INNOVATECH

## Overview

**Creative North Star: "The Clear Sheet"**

The site is a clear, pale sheet with white cards and blue text, and every page opens on a deep navy band over a live terrain of points receding to a horizon. On the home page the band is tall and holds a large plain headline whose second line is red, beside a real site the agency delivered (on a desktop and a phone); on every other page it is shorter and holds the breadcrumbs, the page title and its subtitle. Below it come dense, hairline-ruled sheets of real facts (prices, delivery times, what each plan includes). Nothing is decorated for its own sake; depth comes from tonal steps between the ground, white cards and soft navy-tinted shadows, never from texture or imagery.

Density is deliberate. Pricing, services and commitments carry their full content in ruled rows with tabular figures, so the page reads like a spec sheet rather than a carousel of claims. Every control is a quiet pill with a small leading dot, except the single filled red WhatsApp action, which repeats wherever the path to a conversation appears. A solid navy pill is reserved for confirmations.

Barlow, self-hosted, sets every word: display at 600 with tight negative tracking, body at 400. The hero headline is set large and alone, with nothing above it.

Motion is light moving across the page, and it never makes the visitor wait. In the navy band, a terrain of points recedes in perspective, steel blue in the distance and red up close; on a computer, swells roll toward the visitor, scrolling walks across it and the pointer shifts the point of view slightly; on a phone it is drawn once after the page appears and breathes through a slow compositor-only scale. Every surface is lit where the pointer stands: cards, rows and the form carry a soft navy halo and a red-to-navy edge that follow the mouse, and on a phone the light sweeps across each card once as it arrives. Each role has its own gesture: headings rise and turn word by word from behind a clip line, paragraphs come out of a blur as one block, figures roll like a counter, hairlines are drawn by a travelling point of light, icons draw their own stroke, the services table unrolls. Everything plays on the same hard-decelerating curve, never with a bounce. The first screen settles in about a second and the page never fades in on arrival. Under reduced motion every movement is dropped and only fades remain; the terrain stands still and the loops stop.

**Key Characteristics:**
- Pale ground, white cards and a raised tint, with 12% and 22% blue hairlines; a navy band opens every page.
- A very soft navy veil behind each section heading.
- One live canvas layer (the point terrain, in the band of each page); no photography: the only images are real screenshots of delivered sites.
- Pill controls with a leading dot; only WhatsApp is filled red.
- Ruled, tabular information rows instead of icon-card grids.
- Large rounded containers (28px cards, 24px panels).
- Light that follows the visitor: pointer-lit cards and rows, an orbiting light on the recommended plan, a terrain of points the visitor walks across by scrolling.

## Colors

Navy, red and white on a pale ground (owner's choice, 2026-11-04, after a light template they liked). Blue is the brand and the default text colour in place of black (owner's request, 2026-11-04, the same #1d467b as the band): logo, all text, links, line icons, focus, confirmation pills and the opening band of each page. Red is the action and the emphasis: the WhatsApp fill, checks, live dots and the second line of the hero headline. Roughly 70% light, 25% navy, 5% red: red stays scarce, so the WhatsApp path still stands out.

All colours live in `@theme` in `src/index.css`. Effects derive from those tokens through `color-mix()` and theme shadows (`--shadow-card`, `--shadow-float`, `--shadow-frame`, `--shadow-lit`, `--shadow-lit-hover`, `--shadow-lit-bar`, `--shadow-spark`, `--shadow-featured`, `--shadow-featured-hover`, `--shadow-chat`); the point terrain and the logo read the tokens too. `.band-dark` redefines the same token names for the navy bands, and `.on-dark` does so without the background for the header resting on it, so any component works in both without a second set of classes. A palette change is an edit of those two blocks, plus the three static files that cannot read CSS: `public/favicon.svg`, `public/logo.svg` and `public/og-image.svg` (the share image `og-image.jpeg` is rendered from the last one).

### Primary
- **Action Red** (signal-fill): the fill of the lit WhatsApp pill and of text selection, with white text (**On-Signal**, on-signal, 5.1:1). Its hover darkens to **Deep Red** (signal-fill-hover, 6.5:1).
- **Signal Red** (signal): the red as small marks and text on light (5.5:1 on white): check marks, "included" chips, live-status dots, the active-route dot, the WhatsApp panel's tint and the WhatsApp link in the send-failure alert, the lit pill's underglow, the head of a light-drawn rule, half the marquee dots and the caret. In the band it brightens to #ff5a45 for the headline's second line, the checks and the near side of the terrain.
- **Brand Navy** (brand): the brand as a surface: the recommended plan's top wash, chip and glow, the visitor's chat bubbles (white text, 9.5:1), the start of the logo gradient and the soft veils behind headings. In the band it lifts to #3f78c9 for the showcase halo, the horizon glow and the chat button, which wears the band's colours on every page.
- **Band Navy** (brand-deep to brand-band): the 160-degree gradient of the opening band of each page, #00182f to #1d467b.

### Secondary
- **Readable Navy** (brand-text): inline links ("visit the site", "request this site", legal links), line icons in service, contact and footer rows, the delivery clock, the recommended-plan border, the browser frame's hover edge, the pointer halo of ruled rows and the global focus outline (9.5:1 on white). In the band it lifts to #9dbbea.

### Neutral
- **Pale Ground** (ink): page ground, scrollbar track, marquee edge fade.
- **Card White** (ink-2): cards, panels, form shell and fields, dropdown list, chat window, header bar, ghost pill fill.
- **Raised Tint** (ink-3): hover rows, the active dropdown option, ghost pill hover, browser/phone frame body, chat bubbles.
- **Hairline** (line): every rule, divider and card border.
- **Strong Hairline** (line-strong): pill borders, field borders, frame borders.
- **Brand Ink** (fg): primary text and headings, the solid confirmation pill, the chat send button, the active language chip, half the marquee dots (9.5:1 on white, 8.8:1 on the ground). It is the band's own blue. Its hover, **Deep Ink** (fg-hover, #143560), darkens pills and text links. In the band it is pure white.
- **Slate** (muted): lead paragraphs, descriptions, inactive nav, tinted from the brand blue (6.3:1 on white, 5.8:1 on the ground). In the band: #c9d5e8.
- **Steel** (dim): on light, same value as Ash. In the band (#8fa3c0) it is the far side of the point terrain.
- **Ash** (subtle): captions, column labels, placeholders, footnotes (5.4:1 on white, 5:1 on the ground). In the band: #a9b7cc.
- **Alert Red** (danger): field error borders, error text, the send-failure alert tint; darker than Signal Red and always paired with an icon, so an error never reads as a check or an action.

### Named Rules
**The One Lit Path Rule.** Only WhatsApp actions are filled red. Every other control is a quiet pill; confirmations (form submit, cookie accept) use the solid navy pill. If a second filled red control appears that does not open WhatsApp, it is wrong.

**The Scarce Red Rule.** Red is the accent, so it stays scarce: a full red fill belongs to WhatsApp alone; everywhere else red is a small mark (check, dot), one emphasised headline line or a tint of 12% or less. Focus is navy, never red, so it cannot be mistaken for an error.

**The Opening Band Rule.** Every page opens on one navy band, and only the band is navy; all other sections stay light. Components in the band take their colours from the redefined tokens (`.band-dark`), never from a second set of classes.

**The Blue First Rule.** Text is Brand Ink or a tint of it by default. The owner allows black on specific text where it is truly needed (2026-11-04), a case-by-case exception; no text needs it today. No surface is black: the band's darkest stop (#00182f) exists only as the start of its gradient.

## Typography

**Display Font:** Barlow (self-hosted via @fontsource, weights 400/500/600; fallback ui-sans-serif, system-ui)
**Body Font:** Barlow
**Label/Mono Font:** Barlow; numbers use tabular figures (`.tabular`) wherever a price, phone number or delivery time appears.

**Character:** One grotesque family carrying everything; the voice changes through weight and tracking, not through a second face. Tight negative tracking at 600 makes headlines feel engineered; open 400 body keeps long feature lists easy on a phone.

### Hierarchy
- **Display** (600, clamp 1.6–2.25rem on phones, 2.25–3.5rem above, 1.04, -0.035em): the home hero headline only, sized to fit three lines, in two tones (white, then a red last line).
- **Page Headline** (600, clamp 2.4–4rem, 1.04, -0.03em): the h1 of every page except home, in white in its band (`PageBanner`).
- **Headline** (600, clamp 2–3rem, 1.08, -0.025em): section titles via the shared section heading. The contact title sits between (clamp 2.2–3.5rem, 1.04, -0.03em).
- **Figure** (600, 52px, 1, -0.03em, tabular): plan prices. Commitment values use the same voice at 26–30px.
- **Title** (600, 22–28px, -0.015 to -0.02em): plan names, form title, featured-project title, success state.
- **Row Title** (500, 17px, -0.01em): service and example-site row names.
- **Lead** (400, 17–18px, 1.625, max 54–60ch): hero lead and section subtitles, in Slate.
- **Body** (400, 15–16px, 1.6): descriptions, feature rows, form text. Base body is 16px / 1.6.
- **Label** (500, 13px, 0.08em, uppercase): column labels of ruled tables, commitment row labels (desktop), footer column titles. Labels name a column or a row; they never sit above a heading.

### Named Rules
**The Headline Alone Rule.** Headings stand on their own: no badge, kicker or eyebrow above them. The breadcrumbs above a page title are navigation, not a label. Uppercase small labels exist only as table column or row labels.

**The Tabular Figures Rule.** Any price, phone number or delivery time is set with tabular numerals.

## Layout

A single centred container of 1200px max width, with 20px gutters on mobile and 32px from the small breakpoint. Sections breathe at 56px vertical padding on mobile and 80px from md. The hero is an asymmetric two-column grid at lg (1.08fr text / 0.92fr showcase) inside the full-bleed navy band, stacking to text-then-showcase below; the showcase caps at 440px and 540px on small screens and on large screens takes 112% of its column, bleeding into the right margin so it weighs as much as the headline. Section headings center by default and align left when a CTA or a ruled table sits beside them.

Information is laid out as ruled rows: services use a three-column grid (name up to 260px / description / 200px inclusion chip) from md; commitments use 180px label / up to 300px value / description; example sites use name / description / link. On mobile every row collapses to a stack, with the label moved under the value as a caption. Pricing is three equal cards at lg, stacked below. The contact block is 0.85fr info / 1.15fr form at lg.

The header floats 12–16px from the top as a 64px rounded bar. On every page it rests transparent on the navy band, in light colours; after 12px of scroll it is a solid white bar with a hairline and a soft shadow. Primary nav shows from lg; below, a 44px round menu button opens a 28px-cornered sheet with large 22px links over a soft navy veil.

## Elevation & Depth

Depth is tonal first: pale ground, white cards and a raised tint, with hairlines drawing every edge. Shadows are long, soft and negative-spread, tinted with navy ink (`--color-shade`, near-black inside the band), so they read as soft shade under a sheet; none of them is hard or offset. A very soft navy veil lies behind section headings (`.stage`, 4% brand, 560px tall, centred at 38% so it fades before the section edge). Coloured glows are reserved for brand moments: the showcase's blue-and-red halo in the band, the contact section's faint navy and red haze, the recommended plan's navy glow, the lit pill's red underglow.

### Shadow Vocabulary
- **Card** (`--shadow-card`): plan cards, the services table and the solid pill.
- **Float** (`--shadow-float`): quote form, chat window, scrolled header, mobile sheet, cookie bar, dropdown list and live chip.
- **Frame** (`--shadow-frame`): browser and phone frames.
- **Lit underglow** (`--shadow-lit`: `inset 0 1px 0 rgb(255 255 255 / 0.3), 0 12px 28px -14px` Signal Red at 60%): the lit pill only; hover deepens it (`--shadow-lit-hover`) and the mobile bar carries a longer one (`--shadow-lit-bar`).
- **Recommended glow** (`--shadow-featured`: `0 40px 90px -50px` Brand Navy at 60%): the recommended plan card only.
- **Spark** (`--shadow-spark`: `0 0 10px 2px` Signal Red at 40%): the active-route dot and the head of a light-drawn rule.

### Named Rules
**The Pooled Shadow Rule.** Shadows always carry a large negative spread and a blur at least twice the offset, apart from a 1px contact shadow on cards. No hard, offset or coloured-outline shadows.

## Shapes

Generous, consistent rounding: 28px for cards, the services table, the form and mobile menu sheet; 24px for secondary panels (custom-quote strip, WhatsApp panel, chat window, empty states); 18px for the browser frame and 22px with a 5px tinted bezel for the phone frame; 12px for fields; 16px for the dropdown list and chat bubbles, with the tail corner reduced to 6px. Every control, chip, tag, nav link, language switch and status dot is fully round. Edges are drawn with 1px hairlines rather than fills; the 6px leading dot is the recurring small mark of the system.

## Components

### Buttons
Calm pills that turn red only for WhatsApp.
- **Shape:** fully round (9999px), 500 weight, 10px gap, no wrap.
- **Sizes:** small 40px tall / 16px sides / 14px; medium 48px / 24px / 15px; large 56px / 28px / 16px.
- **Leading mark:** a 6px dot in the pill's text colour when there is no icon; WhatsApp pills carry the 18px WhatsApp glyph instead. Cookie choices drop the dot.
- **Lit (WhatsApp only):** Action Red fill, white text and dot, Signal Red underglow; hover to Deep Red.
- **Solid (confirmations, `light` variant):** Navy Ink fill, white text and dot, card shadow; hover to Brand Navy.
- **Ghost (everything else):** Card White at 80% with a Strong Hairline border; hover to Raised Tint and a 30% ink border. In the band, the same tokens make it a dark translucent pill.
- **Hover / Focus / Active:** 200ms ease-out colour transitions; press scales to 0.97; focus is the global 2px Readable Navy outline at 3px offset; disabled drops to 60% opacity.
- **Text links:** Readable Navy (Signal Red for a WhatsApp link), 500 weight, with a trailing arrow icon; underline on hover (1px, 0.22em offset).

### Chips
- **Included:** Signal Red text on a 12% red tint, fully round, 12–13px / 500.
- **On quote:** Slate text, Strong Hairline border, no fill.
- **Recommended:** white text on a solid Brand Navy pill.

### Cards / Containers
- **Corner Style:** 28px (cards), 24px (panels).
- **Background:** Card White; the recommended plan adds a navy-16% top wash fading to white at 55%; the WhatsApp panel uses a 6% red tint with a 25% red border.
- **Shadow Strategy:** plan cards carry the card shadow and lift to the float shadow on hover; the form shell floats; the recommended plan has its navy glow (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 28px mobile, 32px from sm (form 24px / 36px).
- **Plan card anatomy:** name and description, a 52px tabular price with period, a delivery line ruled top and bottom with a navy clock, then a hairline-divided feature list with red checks, ending in a full-width pill.

### Inputs / Fields
- **Style:** 48px tall, Card White fill, 1px Strong Hairline border, 12px corners, 16px text, Ash placeholder, labels 14px / 500 above the field. The browser's autofill keeps the site's colours. The message area grows with its text up to 360px, with no resize handle.
- **Hover:** border to 30% ink.
- **Focus:** border to Brand Navy plus a 4px navy ring at 15% (never red, so focus cannot be mistaken for an error).
- **Validation:** a filled field is checked when the visitor leaves it, an empty one at submit; a shown error disappears as soon as the value is valid.
- **Error:** Alert Red border at 70%, red ring on focus, 14px message with a 16px alert icon below; a failed send shows a tinted 16px-corner alert offering WhatsApp.
- **Success:** the form is replaced by a status panel with a 40px red check, a 28px title and a text link to send again.

### Select (dropdown)
`Select` replaces the native `<select>`, whose open list keeps the system's look. It is a select-only combobox built like the text field, with a chevron that turns when open. Its list is a white 16px-cornered panel with the float shadow, at least as wide as the field and wider if needed to keep each option on one line, opening upward when there is no room below. Options are 48px tall with a red check on the selected one, a Raised Tint background on the active one and an optional tabular detail on the right (price and delivery time for plans). Arrows, Home, End, Enter, Space, Escape, Tab and first-letter search all work; a click or tap outside closes it. It arrives in 0.2s with a 6px shift.

### Navigation
- **Header bar:** 64px floating rounded bar, logo at 116px, links 15px Slate turning Navy Ink on hover; the active route is Navy Ink with a 6px red dot before it (the dot keeps its space when hidden, so links never shift). The logo's colours follow its context through the tokens.
- **Language switch:** a hairline-ringed pill group; the active language is a Navy Ink chip with white text (white with navy text on the band), 13px uppercase.
- **Mobile:** a solid white sheet below the bar, over a 40% navy veil, with 22px / 500 links on hairline rules, the same active dot, then the lit WhatsApp pill and a ghost quote pill at large size. A tap outside, a link or Escape closes it (Escape returns focus to the menu button); it scrolls inside itself on short screens.
- **Footer:** light and hairline-topped, four columns at lg with uppercase column labels, 15px Slate links, and a small lit WhatsApp pill under the tagline.

### Page Banner and Breadcrumbs
Every page except home opens on `PageBanner`: the same navy gradient and point terrain as the home band, at least 320px tall (420px from md), with its text set at the bottom on the 1200px container, so content starts at the same place from page to page unless a title wraps further. From top to bottom: the breadcrumbs (15px, "Accueil" in Slate with a tap area of about 40px, a small red chevron, the current page at 500 in white with `aria-current`), the h1, and the subtitle where the page has one. `MainLayout` renders it from each route's `handle` (translation keys for crumb, title and subtitle), so it stays mounted between pages: its title appears before the page's file has loaded, the terrain never restarts, and the light header always has navy behind it. Only the title words replay, and the current crumb slides in. The trail is also declared to search engines as a `BreadcrumbList`. The standalone pages (404, site in preparation, payment soon) render their own band with the logo in it, without the `BreadcrumbList`. Status pages left-align their message and actions under the band.

### Point Terrain (signature)
A canvas at the back of each band (`ParticleField`, sized to the band): a terrain of square points seen in perspective, its rows receding geometrically from just below the band to a horizon at 30% of its height (34% on phones). Columns sit 56px apart up close (40px on phones) and tighten toward the horizon, where every other column is dropped so points stay at least 9px apart (12px on touch). Colour runs in ten steps from the band's Steel in the distance to its Signal Red up close, lifted 20% toward white so small points still read on navy, with near-white highlights on the closest crests; a fog fades the far rows and a flattened CSS glow (`.terrain-glow`) lies along the horizon. Blue recedes and red advances, so the palette itself carries the depth. With a fine pointer, three crossing swells roll toward the visitor, scrolling walks forward across the terrain and briefly deepens the swells, and the pointer shifts the point of view a little (near rows move more than far ones) and softly brightens the points under it, without pushing them; the terrain unrolls from the horizon in 2.2s once the page is displayed. On touch screens it is drawn once at standard resolution, after the page is displayed, and only a slow compositor-only scale moves it (`.terrain-drift`, 14s): redrawing a canvas this tall on every frame blocked phones for nearly two seconds at load. From md, in every band, it fades to 22% behind the text on the left and returns at full strength on the right (`.terrain-fade`), so points never compete with the words. The colours are read from the CSS tokens when the canvas starts. It stops off-screen and in a hidden tab; under reduced motion it renders one still frame.

### Device Frames (signature)
Real screenshots of delivered sites only, in two places that share the same frames (`BrowserScreen`, `PhoneScreen`, `BROWSER_FRAME`, `PHONE_FRAME`): a browser frame (18px corners, Raised Tint chrome with three 15%-ink dots and a rounded host chip) and a phone frame (22px corners, 5px tinted bezel). Each holds a full-page capture of the live site that scrolls slowly from top to bottom and back (20s desktop, 16s phone, offset), only while on screen; hover turns the browser edge Readable Navy.
- **Hero showcase** (`HeroShowcase`): in the band, beside the headline, the phone overlaps the browser's bottom-left corner, tilted -4 degrees, over a soft radial halo (no blur filter) that blooms from 0.6 scale over 1.6s; a live chip (Signal Red pulsing dot, "En ligne · Plan Pro") sits under the browser's right edge. On large screens the showcase takes 112% of its column and bleeds into the right margin. The project shown is the one marked `hero: true` in `src/data/portfolioData.js`, or the first one with screenshots.
- **Featured project** (Réalisations): the phone overlaps the browser's bottom-right corner and, on scroll, drifts faster than the browser and turns slightly.

### Ruled Rows (signature)
Services, commitments, example sites, the About fact sheet and contact details are lists divided by 1px hairlines. Rows hover to Raised Tint where they are inside a card and carry a pointer-following navy halo; their title nudges right and the description brightens. This replaces icon-card grids across the system. Animated rows draw their own hairline (top on the first row, bottom on each row, or top on every row after the first) instead of carrying a static border.

### Lit Surface (signature)
Cards, the custom-quote strip, the WhatsApp panel and the quote form are lit surfaces (`.lit-card`, `useLight`): an inner navy 6% radial halo (480px) and a 1px edge light (Signal Red to Readable Navy, 320px) both centred on the pointer through CSS variables, fading in over 0.5s on hover. Plan cards also tilt toward the mouse (up to 5 degrees, 3.5 for the recommended plan) on a damped spring. Without a mouse, the light sweeps once across the surface from left to right (1.9s) when it is 35% in view. Ruled rows use the soft variant: a Readable Navy 10% halo, no edge light.

### Orbit Ring (signature)
The recommended plan carries a light that circles its border: a conic arc (Readable Navy to Signal Red over a third of the turn) rotates once every 7s behind a cover inset 1px, so it reads on a 2px edge; on large screens a blurred copy (14px) glows outside the card. It runs only while the card is on screen and disappears under reduced motion.

### Marquee
A full-bleed band under the hero lists the kinds of businesses served (beauty salons, restaurants, coaches, online shops, photographers, associations, shopkeepers) at 26-42px, separated by alternating red and navy dots, with edges fading into the ground. It drifts on its own, speeds up with the scroll velocity (up to 7x) and reverses when the visitor scrolls back up; it stops off-screen and becomes a static, wrapped list under reduced motion. Screen readers read the list once.

### Chat Button
A 64px round button at the bottom right of every page, in the band's colours (`.on-dark`): a #3f78c9 fill with a white 2px border and icon (4.4:1), and a deep shadow. A navy fill would vanish on the band, where the contrast is 1:1; this one stands out on the band and on the light pages. It grows 5% on hover and calls three times after arrival (`.chat-call`, a ring widening to 1.45 over 2.2s), never during a conversation or under reduced motion. The phone WhatsApp bar and cookie bar keep 92px clear for it.

### Mobile WhatsApp Bar
Below 640px, where the header hides its WhatsApp pill, a full-width lit pill slides up from the bottom (next to the chat launcher) once the first screen is passed and the cookie choice is made, and slides away in front of the contact block and the footer.

### Load Order
The first screen never waits. `Home` renders the band and the marquee alone, then mounts the other sections one per task; `MainLayout` loads the chat, cookie bar and mobile WhatsApp bar after paint (`afterPaint`), each behind a `QuietBoundary`, so one that fails to arrive is simply absent and never takes the page down; the terrain starts after paint and stops off-screen; Barlow 400 and 600 (latin) are preloaded from the HTML (`vite.config.js`) so the headline does not change height when the font arrives; hashed build files are cached for a year (`public/_headers`). After the build, `scripts/prerender.mjs` renders the real components into one HTML file per page, with its SEO tags and a hidden, simplified copy of its text for link previews and crawlers that do not run JavaScript; the app replaces that copy when it starts, so visitors see no difference, and a failed render falls back to the empty page without breaking the build. Unknown addresses return a real 404 (`public/_redirects`). No `backdrop-filter`, and no blur filter on large glows: radial gradients are already soft.

### Motion
One shared curve (`cubic-bezier(0.16, 1, 0.3, 1)`, token `--ease-expo`, a firm deceleration with no overshoot). Entrances play once, when an element is about 5% inside the viewport; ambient loops (point terrain, marquee, orbit ring, site scroll, shine) run only while on screen.
- **Word rise (headings):** every heading is split into words; each word rises from 115% and turns from 6 degrees inside a clipped line box while fading in (0.75s, 0.045s between words). Page h1s play on load, h2s on entry.
- **Blur wash (paragraphs):** lead paragraphs and subtitles come out of a 6px blur as one block, rising 12px (0.6s), 0.3s after their heading: one animated element per paragraph, never one per word. The filter is removed when the entrance ends, so it never softens the text afterward. The hero lead is visible from its first frame and only sharpens.
- **Slot counter (figures):** each digit of a price or a delivery value rolls through two full turns of 0-9 before settling (1.2s, 0.09s between digits); the real text is kept for screen readers. Commitment values without digits use the word rise.
- **Light-drawn rule:** in a ruled list, each 1px hairline slides in from the left (0.9s) led by a red head with a soft glow that fades out once the line is drawn; rows rise 22px and fade in sequence (0.6s; 0.045-0.1s apart).
- **Icon draw:** line icons (services, contact rows, hero checks, form success) draw their own stroke on entry (1.1s, staggered).
- **Unroll:** the services table opens from top to bottom through a rounded clip (1s).
- **Plan cards:** cards rise 90px from the depth while straightening from 16 degrees (0.8s, 0.14s apart, 1400px perspective); feature checks pop from 0 with a quarter turn; the clock makes three-quarters of a turn.
- **Hero opening sequence (on load):** header slides down (0.6s), headline words, lead sharpens (0.05s), actions (0.3s), price line with rolling figure (0.38s), the rule above the checks (0.45s), then the checks draw (from 0.55s). The showcase arrives alongside (browser 0.2s, phone 0.4s, live chip 0.7s). The visitor can act before it ends. On scroll the hero text rises 110px and fades while the browser frame drops 120px and the phone 40px, so the desktop seems further away.
- **Lit pill shine:** a diagonal white reflection crosses the main WhatsApp pills every 6s (hero, recommended plan, contact panel, mobile bar). Hover tilts the WhatsApp glyph and enlarges the leading dot; the hero pills are magnetic (they follow the mouse by 28% of its offset).
- **Stage lights:** each section's relight fades and grows in from 60% when the section enters (1.4-1.8s).
- **Navigation:** a soft white pill follows the hovered nav link and the red active dot glides to the open page (shared layout, 0.35-0.5s); the language chip slides between FR and EN; mobile menu links arrive in sequence.
- **Language switch:** only the chip slides; every text swaps in place at once and no entrance replays. Lists are keyed by position, never by translated text, so changing language recreates nothing.
- **Return to top:** every internal link returns the page to its top, even a link to the page already open, where it is a visible smooth scroll (instant under reduced motion); a new page simply opens at its top; a link with an anchor goes to that anchor.
- **Route change:** the band stays in place while page content rises 16px and fades in beneath it over 0.55s, never on arrival on the site; returning home shows its band at once; overlays use 0.22-0.5s fade-and-shift; controls transition colour in 200ms, press scales to 0.97.
- **Reduced motion:** the whole app honours the user preference; rises, turns, rolls, parallax, tilt, magnetism, marquee drift and every loop are removed; opacity fades remain and the point terrain renders a single still frame.

**The Moving Light Rule.** Motion is light and matter answering the visitor. Entrances run once; only the point terrain, the marquee, the orbit ring, the scrolling screenshots and the pill shine loop, each paused off-screen. Nothing replays on scroll back.

## Do's and Don'ts

### Do:
- **Do** keep pages light under their band and build depth only with Pale Ground, Card White and Raised Tint plus 12% / 22% hairlines and soft navy shadows.
- **Do** open every page with its band and breadcrumbs, declared in the route's `handle`.
- **Do** derive every glow, halo and tint from the colour tokens; never write a colour value outside `@theme`.
- **Do** give every control the pill shape with a 6px leading dot, or the WhatsApp glyph for WhatsApp actions.
- **Do** reserve the lit red pill for actions that open WhatsApp, and the solid navy pill for confirmations.
- **Do** set prices, phone numbers and delivery times with tabular figures.
- **Do** present lists of facts as hairline-ruled rows with full real content.
- **Do** use Readable Navy for links, line icons and focus, and Signal Red for checks and live dots.
- **Do** give each role its own gesture on the shared curve: words rise and turn, paragraphs leave a blur, figures roll, hairlines are drawn by light, icons draw their stroke.
- **Do** let light follow the pointer on surfaces (halo and edge), with a one-time sweep on touch screens.
- **Do** honour reduced motion: drop every movement and loop, keep only fades, and keep the point terrain still.
- **Do** keep the first screen independent: whatever sits below it or is secondary mounts after paint.

### Don't:
- **Don't** put a badge, kicker or eyebrow above a headline; uppercase 13px labels are for table columns and row labels only.
- **Don't** add a second family; Barlow 400/500/600 carries everything.
- **Don't** use hard, offset or tight shadows; shadows pool with large negative spread.
- **Don't** use stock photography or illustrative imagery; the point terrain and real screenshots of delivered sites are the only visuals.
- **Don't** fill a non-WhatsApp control with red.
- **Don't** add another hue: no orange, green or bright blue accents; the palette is navy, red and white.
- **Don't** make any section dark other than a page's opening band.
- **Don't** set text in black by habit; text is the band's blue or a tint of it, unless a specific text truly needs black.
- **Don't** use `backdrop-filter`, blur filters on large areas or one filter animation per word: they are what made phones slow.
- **Don't** use bouncing or overshooting motion, replay reveals on scroll back, or run a loop while it is off-screen.

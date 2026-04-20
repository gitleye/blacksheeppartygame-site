# Black Sheep Party Game — Site Plan & Change Log

## Original scope

The site was scaffolded as a static Astro marketing site with:

- CSS-only flip cards in the showcase (no real artwork yet)
- Hero card stack using CSS-coloured placeholder cards
- All logos using low-resolution `logo-small.webp`
- No promo video
- `@astrojs/cloudflare` adapter installed (unnecessary for static output)

---

## What was built / changed

### Real card artwork wired up

- **Card images** uploaded as `.webp` to `public/images/cards/front/` and `back/`
- JSON content files created for 6 cards: `028`, `032`, `102`, `113`, `126`, `146`
- `CardsShowcase.astro` updated to render `<img>` tags instead of CSS-only faces
- `Hero.astro` card stack updated to use real front-face images (`object-fit: contain`, `drop-shadow`)
- **Answer + nominate images** placed in `public/images/cards/answer/` and `nominate/`

### CardsShowcase — grid → auto-scrolling carousel

- Changed from a static 6-column grid to an infinite horizontal CSS marquee
- Cards duplicated in DOM for seamless looping (`[...cards, ...cards]`)
- Speed: 60s per loop
- Hover over any card pauses the carousel (CSS `:has()`)
- Click/tap a card flips it AND pauses the carousel; click again unflips and resumes

### Promo video section

- New `VideoSection.astro` component — full viewport-width YouTube embed
- YouTube URL: `https://youtu.be/ox9uyaNCHLo`
- Autoplay + muted + loop via query params
- Uses `width: 100vw` + `left: 50%; transform: translateX(-50%)` breakout technique

### Page order (homepage)

```
Hero
Marquee (cyan)
WhyPlay
HowToPlay
VideoSection       ← new
CardsShowcase      ← now a carousel
Testimonials (3)   ← trimmed from 6
FAQ                ← all items start collapsed
CTABand
```

Removed: second (pink) Marquee strip between HowToPlay and CardsShowcase.

### Logo quality — retina upgrade

All three logo instances swapped from `logo-small.webp` (100px) to `logo-original.png` (1092×1092):

| Location | Component |
|---|---|
| Hero floating mascot | `Hero.astro` |
| Nav bar | `Nav.astro` |
| Footer | `Footer.astro` |

### Typography — font size pass

Established a consistent scale across the whole site:

| Role | Size |
|---|---|
| Lede / intro paragraphs | 22px |
| Body copy (rules, topics, cards) | 18–19px |
| Step / feature body | 19–21px |
| Nav links | 15px |
| Eyebrow labels | 16px |
| Metadata / footnotes | 13px |
| Footer (intentionally smaller) | 13–15px |

Files updated: `global.css`, `HowToPlay.astro`, `WhyPlay.astro`, `FAQ.astro`, `Nav.astro`, `how-to-play.astro`, `contact.astro`, `downloads.astro`, `support.astro`, `faq.astro`, `Hero.astro`

### Section spacing

`--space-2xl` reduced from `120px` → `88px` in `global.css` — tightens all section-to-section padding site-wide.

### Dependency cleanup

- **Removed** `@astrojs/cloudflare` adapter — not needed for `output: 'static'`
- Removed the adapter import and `adapter: cloudflare()` from `astro.config.mjs`

---

## Current file additions

| File | Purpose |
|---|---|
| `src/components/VideoSection.astro` | Full-width YouTube promo embed |
| `public/images/cards/front/*.webp` | Real card front artwork (7 cards) |
| `public/images/cards/back/*.webp` | Real card back artwork (7 cards) |
| `public/images/cards/answer/a-yes.png` | Answer card A/Yes |
| `public/images/cards/answer/b-no.png` | Answer card B/No |
| `public/images/cards/nominate/nominate-a.png` | Nominate A standee |
| `public/images/cards/nominate/nominate-b.png` | Nominate B standee |

---

## Still to do

- [ ] Add remaining card images when artwork is ready (up to 150 cards)
- [ ] Export logo as SVG for true infinite scalability
- [ ] Add card JSON files for any new cards added to `front/`/`back/`
- [ ] Review testimonials content — currently showing 3, expand when more reviews collected
- [ ] OG image for social sharing (`public/images/og/default.png`)

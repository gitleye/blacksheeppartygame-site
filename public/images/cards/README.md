# Card Art Directory

Organized dropzone for all card artwork. Filename convention matters — the
code reads these paths directly. Get the names right and everything just
works.

## Directory layout

```
public/images/cards/
├── front/        # Question card FRONTS (the full card art)
│   ├── 001.png
│   ├── 002.png
│   └── ...
├── back/         # Card BACKS
│   ├── 001.png
│   ├── 002.png
│   └── ...
├── answer/       # A/Yes + B/No answer cards
│   ├── a-yes.png
│   └── b-no.png
└── nominate/     # Nominate A + B standee cards
    ├── nominate-a.png
    └── nominate-b.png
```

## Naming convention

### Question cards (front/ and back/)

**Format:** `{three-digit-number}.png`

Use zero-padded 3-digit numbers so filenames sort correctly in the
filesystem:

- ✅ `001.png`, `028.png`, `102.png`, `150.png`
- ❌ `1.png`, `28.png`, `card_28.png`

The number must match the `number` field in the corresponding card
data file at `src/content/cards/{number}.json`. That's the glue between
the image and the rendered card.

### Answer cards (answer/)

Fixed filenames — these don't change:

- `a-yes.png`
- `b-no.png`

### Nominate cards (nominate/)

Fixed filenames:

- `nominate-a.png`
- `nominate-b.png`

## Image format & size

- **Format:** PNG preferred (transparency) or WebP (smaller files).
- **Recommended dimensions:** 750 × 1050 px (standard playing card ratio
  2:3 at print resolution). Larger is fine; Astro will handle scaling.
- **Max file size:** aim for under 500 KB per card. Use
  [squoosh.app](https://squoosh.app) if you need to compress.

## Showing a card on the site

The home page's "Inside the box" section renders from JSON files in
`src/content/cards/`. To add a new demo card on the site:

1. Drop the image at `public/images/cards/front/142.png`
2. Create `src/content/cards/142.json`:

   ```json
   {
     "number": "142",
     "type": "yes-no",
     "question": "Have you ever been caught snooping on someone's phone?",
     "palette": "pink",
     "order": 7
   }
   ```

3. Commit and push. Cloudflare Pages builds and deploys.

## What's currently rendering

The site right now shows 6 demo cards with **no images yet** — the cards are
fully CSS-rendered using the brand palette so they work out of the box.

To swap in real artwork, update `src/components/CardsShowcase.astro` to use
`<img src="/images/cards/front/{number}.png">` instead of the CSS-only
flip faces. I've left this as the next step because we need the real
images first.

## Question: "Can I just dump all 150 cards in here?"

Yes — drop them all in `public/images/cards/front/` and `back/`. Only the
ones referenced by a matching `.json` file in `src/content/cards/` will
appear on the home page showcase. The rest sit on the CDN ready to be
linked wherever we want (e.g. a future "browse all cards" page).

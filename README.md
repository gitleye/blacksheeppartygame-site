# blacksheeppartygame-site

The marketing site for [Black Sheep Party Game](https://blacksheeppartygame.com).
Built with [Astro](https://astro.build) and deployed to
[Cloudflare Pages](https://pages.cloudflare.com).

## 🎯 What this is (and isn't)

- ✅ This repo: the **marketing site** — home, how to play, FAQ, contact, support, downloads.
- ❌ Not in this repo: the **shop** — that lives on Shopify at `shop.blacksheeppartygame.com`.

All "Shop Now" buttons link to the Shopify store. That stays untouched.

---

## 🚀 Quick start (local dev)

```bash
# Node 20+ required (see .nvmrc)
npm install
npm run dev
```

Open <http://localhost:4321>.

### Build + preview the production output

```bash
npm run build        # outputs to ./dist
npm run preview      # serves ./dist locally
```

---

## 📁 Project structure

```
blacksheeppartygame-site/
├── astro.config.mjs          # Astro config
├── package.json
├── tsconfig.json
│
├── public/                   # Static files — served as-is
│   ├── _headers              # Cloudflare Pages cache headers
│   ├── _redirects            # Cloudflare Pages redirects (legacy URL handling)
│   ├── robots.txt
│   ├── fonts/                # Self-hosted brand fonts (WOFF2)
│   │   ├── dimbo-regular.woff2
│   │   ├── dimbo-italic.woff2
│   │   ├── glacial-regular.woff2
│   │   ├── glacial-bold.woff2
│   │   └── OFL.txt           # Font license
│   └── images/
│       ├── logos/            # All logo variants
│       ├── cards/            # Card artwork (see cards/README.md)
│       ├── product/          # Box shots, tokens, product photography
│       └── og/               # Open Graph / social share images
│
└── src/
    ├── styles/
    │   └── global.css        # Design tokens, brand fonts, base styles
    ├── content/
    │   ├── config.ts         # Schema definitions for content collections
    │   ├── faqs/             # One markdown file per FAQ
    │   ├── testimonials/     # One markdown file per review
    │   └── cards/            # One JSON file per card shown on the home page
    ├── layouts/
    │   └── BaseLayout.astro  # Shared meta, fonts, nav, footer
    ├── components/           # Reusable section components
│   ├── Announce.astro    # Top marquee bar
│   ├── Nav.astro         # Sticky nav + mobile menu
│   ├── Hero.astro        # Home hero with real card image stack
│   ├── Marquee.astro     # Reusable scrolling strip
│   ├── WhyPlay.astro     # 3-up feature band
│   ├── HowToPlay.astro   # 4-step how-to
│   ├── VideoSection.astro   # Full-width YouTube promo embed
│   ├── CardsShowcase.astro  # Auto-scrolling carousel (reads from content/cards/)
│   ├── Testimonials.astro   # Reviews grid (reads from content/testimonials/)
│   ├── FAQ.astro         # Accordion (reads from content/faqs/)
│   ├── CTABand.astro     # Reusable pink CTA section
│   └── Footer.astro      # Global footer with socials
    └── pages/                # File-based routing
        ├── index.astro       # /
        ├── how-to-play.astro # /how-to-play/
        ├── faq.astro         # /faq/
        ├── contact.astro     # /contact/
        ├── support.astro     # /support/
        ├── downloads.astro   # /downloads/
        └── 404.astro         # Not found page
```

---

## ✏️ Editing content (the Adam-friendly guide)

All copy lives in `src/content/` as plain markdown. You can edit directly
in GitHub's web UI — no code editor needed.

### To edit an FAQ

1. Navigate to `src/content/faqs/` on GitHub.
2. Click the file you want to edit (e.g. `02-cards-in-box.md`).
3. Click the ✏️ pencil icon.
4. Edit the text. The part at the top between `---` lines is the question,
   everything below is the answer. Markdown supported.
5. Scroll down, write a short commit message, click **Commit changes**.
6. Cloudflare Pages automatically builds and deploys within ~90 seconds.

### To add a new FAQ

In `src/content/faqs/`, create a new file like `08-my-new-question.md`:

```markdown
---
question: "Your new question goes here?"
order: 8
---

Your answer. Markdown formatting works — **bold**, *italic*, [links](https://example.com), etc.
```

The `order` field controls sort order on the FAQ page — lower numbers show first.

### To add a testimonial

In `src/content/testimonials/`, create a new file like `jane-doe.md`:

```markdown
---
author: "Jane Doe"
rating: 5
order: 10
featured: false
---

The actual review text here.
```

Set `featured: true` to push it to the top of the home page testimonials.

### To add/change a demo card on the home page

See [`public/images/cards/README.md`](./public/images/cards/README.md) for the
full guide. The showcase reads from both `src/content/cards/` (JSON) and
`public/images/cards/front|back/` (`.webp` images). Both must exist with
matching numbers for a card to appear.

Short version — drop a JSON file in `src/content/cards/`:

```json
{
  "number": "142",
  "type": "yes-no",
  "question": "Have you ever been caught snooping on someone's phone?",
  "palette": "cyan",
  "order": 7
}
```

And place matching images at:
- `public/images/cards/front/142.webp`
- `public/images/cards/back/142.webp`

The showcase is an **auto-scrolling carousel** — cards loop infinitely.
Hover to pause. Click/tap a card to flip it and see the back.

---

## ☁️ Deploying to Cloudflare Pages

### First-time setup

1. Create the repo on GitHub (recommended name: `blacksheeppartygame-site`).
2. Push this project to the repo:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Astro scaffold"
   git branch -M main
   git remote add origin git@github.com:<your-user>/blacksheeppartygame-site.git
   git push -u origin main
   ```

3. Log into the **Cloudflare dashboard** → **Workers & Pages** → **Create
   application** → **Pages** → **Connect to Git**.
4. Select the `blacksheeppartygame-site` repo.
5. Configure the build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20 (set via the `NODE_VERSION` environment variable if
     needed — Cloudflare reads `.nvmrc` by default)
6. Click **Save and deploy**. First build takes ~2 minutes.

### Preview URLs

Every branch and every pull request gets its own preview URL automatically.
This is the workflow for safe iteration: create a branch, push changes,
review the preview URL before merging to `main`.

### Custom domain cutover

Once you've verified the site on the `*.pages.dev` URL and staged it on
something like `preview.blacksheeppartygame.com`:

1. In Cloudflare Pages → your project → **Custom domains**
2. Add `blacksheeppartygame.com` and `www.blacksheeppartygame.com`
3. Cloudflare handles the DNS automatically since the domain is already
   on Cloudflare. It'll issue the cert and route traffic within a few
   minutes.
4. **Then** you can shut down the EC2 instance. Save the monthly cost.

---

## 🎨 Design system

Design tokens live in `src/styles/global.css`. The core palette:

| Token          | Value     | Usage                            |
|----------------|-----------|----------------------------------|
| `--bsp-black`  | `#0a0a0a` | Background                       |
| `--bsp-ink`    | `#121212` | Section bands                    |
| `--bsp-cyan`   | `#00B4FF` | Primary accent                   |
| `--bsp-pink`   | `#FF1F8E` | Secondary accent / CTA           |
| `--bsp-white`  | `#ffffff` | Text, borders                    |
| `--bsp-cream`  | `#f5f1e8` | Card palette variant             |

**Typography:**

- **Display:** Dimbo (self-hosted, SIL Open Font License)
- **Body:** Glacial Indifference (self-hosted, SIL Open Font License)
- **Marker/sticker:** Permanent Marker (Google Fonts)

---

## 🧰 Useful commands

```bash
npm run dev         # Dev server with hot reload
npm run build       # Production build to ./dist
npm run preview     # Preview the production build
npm run astro -- ?  # Astro CLI help
```

---

## 🔒 Licensing notes

- Brand fonts (Dimbo, Glacial Indifference) are licensed under the
  [SIL Open Font License](./public/fonts/OFL.txt) — free to embed, redistribute,
  and use commercially as long as the license file is included.
- Site code: private to Black Sheep Games.

---

## 🤖 Working with Claude Code / Cursor

The repo is structured to be agent-friendly. Drop into Claude Code and say
something like:

> "Add a new section to the home page that shows a carousel of the most
> recent Instagram posts."

The agent will know to:
- Add/modify a component in `src/components/`
- Wire it into `src/pages/index.astro`
- Keep design tokens consistent with `src/styles/global.css`
- Match the existing code style

Push to a branch → Cloudflare Pages gives you a preview URL → you review
visually → merge to main.

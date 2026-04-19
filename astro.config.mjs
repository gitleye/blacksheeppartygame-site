// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://blacksheeppartygame.com',
  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  compressHTML: true,

  image: {
    // Let Astro optimize local images
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  adapter: cloudflare()
});
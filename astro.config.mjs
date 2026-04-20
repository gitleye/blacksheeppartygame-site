// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://blacksheeppartygame.com',
  output: 'static',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],

  build: {
    inlineStylesheets: 'auto',
  },

  compressHTML: true,

  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
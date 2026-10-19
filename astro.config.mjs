import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cutefish.org',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});

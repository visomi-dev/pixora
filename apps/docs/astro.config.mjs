import { defineConfig } from 'astro/config';

const base = process.env.BASE_URL ?? '/';

export default defineConfig({
  base,
  compressHTML: true,
  output: 'static',
  publicDir: './static',
  trailingSlash: 'always',
});

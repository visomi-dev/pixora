import { defineConfig } from 'astro/config';

export default defineConfig({
  compressHTML: true,
  output: 'static',
  publicDir: './static',
  trailingSlash: 'always',
});

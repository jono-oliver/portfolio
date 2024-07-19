import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), sanity({
    projectId: '8d98wy85',
    dataset: 'production',
    // Set useCdn to false if you're building statically.
    useCdn: false
  }), react(), vue()],
  vite: {
    ssr: {
      // See: https://github.com/withastro/astro/issues/9192#issuecomment-1834192321
      external: ['prismjs'],
    },
  },
});
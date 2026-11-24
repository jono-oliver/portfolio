import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://jonooliver.dev",
  integrations: [
    tailwind(),
    sanity({
      projectId: "8d98wy85",
      dataset: "production",
      // Set useCdn to false if you're building statically.
      useCdn: false,
      // Embedded Studio. Hash routing keeps the route prerendered, so no adapter is needed.
      studioBasePath: "/admin",
      studioRouterHistory: "hash",
    }),
    react(),
    vue(),
    sitemap({
      // Leave out the Studio route only, not pages whose slug starts with "admin"
      filter: (page) => !/^\/admin(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  vite: {
    ssr: {
      // See: https://github.com/withastro/astro/issues/9192#issuecomment-1834192321
      external: ["prismjs"],
    },
  },
});

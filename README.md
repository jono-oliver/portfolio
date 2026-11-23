# Jonathan Oliver — Portfolio

My personal site, live at **[jonooliver.dev](https://jonooliver.dev)**.

I'm a Front End Software Engineer based in Stockton-on-Tees. This is where I share the projects I've worked on, write the occasional blog post and keep an up-to-date CV.

## What's on the site

- **Home**: an intro, my skills and a few featured projects
- **Work**: case studies for individual projects
- **Blog**: articles, with syntax-highlighted code
- **Recruiter view**: the whole site condensed into one screen. Open it from the navbar or share a link ending in `#at-a-glance`.

The site also has two extras for anyone curious about how it's built:

- **X-ray mode** (`Shift + X`): overlays the layout grid, labels each component and lets you inspect any element's spacing and size
- **Design system panel** (`Shift + D` or `#design-system`): the colours, type, layout and motion the site uses, shown with the real tokens

## For agents and crawlers

Everything below is generated at build time from the same Sanity content as the site:

- **`/llms.txt`**: an index of the site in the [llms.txt](https://llmstxt.org) format
- **`/llms-full.txt`**: the profile, every project and every article in one markdown file
- **`/portfolio/<slug>.md`** and **`/blog/<slug>.md`**: a markdown version of each page, linked from its HTML with `<link rel="alternate">`
- **`/api/profile.json`**: structured CV data (skills, contact, CV link, projects, articles)
- **JSON-LD** on every page: `Person` and `WebSite` on the home page, `BlogPosting` and `CreativeWork` on detail pages, and breadcrumbs
- **`/sitemap-index.xml`** and **`/robots.txt`**, which allow all crawlers

## Built with

- [Astro](https://astro.build): pages, layouts and view transitions
- [Tailwind CSS](https://tailwindcss.com): styling
- [Sanity](https://www.sanity.io): content for the profile, projects and blog posts
- A few React and Vue components where they're useful
- [Prism](https://prismjs.com): code highlighting in blog posts

## Running it locally

```sh
npm install
npm run dev
```

The site runs at `http://localhost:4321`. Content is pulled from Sanity's public dataset, so you don't need any keys.

| Command           | What it does                         |
| :---------------- | :----------------------------------- |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Build the site to `./dist/`          |
| `npm run preview` | Serve the built site to check it     |

## Where things live

```text
src/
├── pages/        Home, blog and portfolio routes
├── components/   Page sections, plus X-ray, design panel and recruiter view
├── layouts/      The shared page shell, meta tags and global styles
├── data/         Hard-coded copy (profile highlights, site URL, design-system panel)
├── lib/          Structured data (JSON-LD) and markdown builders for agents
├── js/           Scroll reveals and the hero's folded-paper effect
├── sanity/       Helpers for fetching content from Sanity
└── assets/       Images that Astro optimises, like the hero portrait
public/           Files served as-is: favicon, share image, robots.txt
```

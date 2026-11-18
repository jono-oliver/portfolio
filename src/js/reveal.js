// Lightweight scroll reveal. Elements opt in with data-reveal="up|mask|image"
// and optionally style="--reveal-delay: 120ms". Styles live in Layout.astro.
let observer;

export function initReveal() {
  observer?.disconnect();

  const items = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );

  items.forEach((el) => observer.observe(el));
}

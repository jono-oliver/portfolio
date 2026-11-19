// Lightweight scroll reveal. Elements opt in with data-reveal="up|mask|image"
// and optionally style="--reveal-delay: 120ms". Styles live in Layout.astro.
//
// Content starts hidden, so this must never leave anything stuck invisible.
// IntersectionObserver drives the animation, and a scroll check backs it up
// (iOS Safari has been seen to drop observer callbacks, e.g. around view
// transitions and tab restores).
let observer;
let cleanup = () => {};

const reveal = (el) => {
  el.classList.add("is-visible");
  observer?.unobserve(el);
};

export function initReveal() {
  observer?.disconnect();
  cleanup();

  const items = [
    ...document.querySelectorAll("[data-reveal]:not(.is-visible)"),
  ];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(reveal);
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );
  items.forEach((el) => observer.observe(el));

  // Backup: reveal anything whose top has entered the viewport
  let ticking = false;
  const check = () => {
    ticking = false;
    const limit = window.innerHeight * 0.9;
    let pending = false;
    items.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      if (el.getBoundingClientRect().top < limit) reveal(el);
      else pending = true;
    });
    if (!pending) cleanup();
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("pageshow", onScroll);
  cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("pageshow", onScroll);
    cleanup = () => {};
  };

  // Catch anything already on screen once layout has settled
  setTimeout(onScroll, 300);
}

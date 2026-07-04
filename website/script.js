// ---------- mobile nav toggle ----------
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});

// close menu after tapping a link
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);


const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- current year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- sticky slider navigation ----------
(() => {
  const navBar = document.querySelector(".nav");
  const navLinks = document.querySelector(".nav__links");
  const slider = document.querySelector(".nav__slider");
  if (!navBar || !navLinks || !slider) return;

  const anchors = Array.from(navLinks.querySelectorAll("a"));
  const sections = anchors
    .map((a) => {
      const id = a.getAttribute("href");
      const el = id && id.startsWith("#") ? document.querySelector(id) : null;
      return el ? { a, el } : null;
    })
    .filter(Boolean);

  let activeAnchor = null;

  const moveTo = (a) => {
    if (!a) { slider.classList.remove("is-on"); return; }
    slider.style.left = a.offsetLeft + "px";
    slider.style.width = a.offsetWidth + "px";
    slider.classList.add("is-on");
  };

  const setActive = (a) => {
    activeAnchor = a;
    anchors.forEach((x) => x.classList.toggle("is-active", x === a));
    moveTo(a);
  };


  anchors.forEach((a) => a.addEventListener("mouseenter", () => moveTo(a)));
  navLinks.addEventListener("mouseleave", () => moveTo(activeAnchor));

  // scrollspy: highlight the section currently in view
  const spy = () => {
    const y = window.scrollY + 130;
    let current = null;
    for (const { a, el } of sections) {
      if (el.getBoundingClientRect().top + window.scrollY <= y) current = a;
    }
    if (current !== activeAnchor) setActive(current);
  };

  const onScroll = () => {
    navBar.classList.toggle("is-scrolled", window.scrollY > 8);
    spy();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => moveTo(activeAnchor));
  onScroll(); // initial state
})();

(() => {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ink = document.querySelector(".ink");
  if (!ink || !fine || reduce) return; // keep native cursor on touch / reduced-motion

  document.documentElement.classList.add("has-custom-cursor");

  const COUNT = 16;
  const dots = [];
  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    el.className = "ink__dot";
    const size = 30 - i * 1.4; // 30px head -> ~9px tail
    el.style.width = el.style.height = size + "px";
    ink.appendChild(el);
    dots.push({ el, x: innerWidth / 2, y: innerHeight / 2 });
  }

  let mx = innerWidth / 2, my = innerHeight / 2;
  let scale = 1, tScale = 1;
  let shown = false;

  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (!shown) { shown = true; ink.classList.add("is-visible"); }
  });
  addEventListener("mouseleave", () => ink.classList.remove("is-visible"));
  addEventListener("mouseenter", () => { if (shown) ink.classList.add("is-visible"); });

  const loop = (now) => {
    scale += (tScale - scale) * 0.15;
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      const lead = i === 0 ? { x: mx, y: my } : dots[i - 1];
      dot.x += (lead.x - dot.x) * 0.36;
      dot.y += (lead.y - dot.y) * 0.36;
      const k = i / (dots.length - 1);
      const wx = Math.sin(now * 0.0016 + i * 0.9) * 8 * k;
      const wy = Math.cos(now * 0.0021 + i * 0.9) * 8 * k;
      dot.el.style.transform =
        `translate(${dot.x + wx}px, ${dot.y + wy}px) translate(-50%, -50%) scale(${scale})`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // clickable things: swell the ink and flip it from green to orange
  const interactive =
    "a, button, .card, .project, .writing__list li, .about__media, .hero__media, .contact__email, .clipping";
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener("mouseenter", () => { tScale = 1.8; ink.classList.add("is-hover"); });
    el.addEventListener("mouseleave", () => { tScale = 1; ink.classList.remove("is-hover"); });
  });
})();

(() => {
  const buddy = document.querySelector(".buddy");
  if (!buddy || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const looks = buddy.querySelectorAll(".cat__look");

  let idle;
  const wake = () => {
    buddy.classList.remove("buddy--sleep");
    clearTimeout(idle);
    idle = setTimeout(() => buddy.classList.add("buddy--sleep"), 5000);
  };

  // pupils follow the cursor
  addEventListener("mousemove", (e) => {
    wake();
    const r = buddy.getBoundingClientRect();
    const eyeY = r.top + r.height * 0.4;
    looks.forEach((look, i) => {
      const eyeX = r.left + r.width * (i === 0 ? 0.4 : 0.6);
      const ang = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const d = Math.min(2.8, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 45);
      look.style.transform = `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px)`;
    });
  });
  wake();

  // wave a paw while the contact section is on screen
  const contact = document.querySelector("#contact");
  if (contact && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((en) => buddy.classList.toggle("buddy--wave", en.isIntersecting)),
      { threshold: 0.35 }
    ).observe(contact);
  }
})();

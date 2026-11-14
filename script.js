/*
 * Kam se posílají poptávky z formuláře.
 * Prázdné  -> formulář otevře e-mailového klienta s předvyplněnou zprávou.
 * Vyplněné -> např. "https://formspree.io/f/xxxxxxx" (zdarma), zprávy pak chodí přímo na e-mail.
 */
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "konecny.rob@gmail.com";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("year").textContent = new Date().getFullYear();

/* Hlavička: po odscrollování z úvodu dostane pozadí */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.6);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Mobilní menu */
const nav = document.getElementById("nav");
const toggle = document.querySelector(".menu-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* Úvodní fotky se pomalu prolínají */
const slides = [...document.querySelectorAll(".slide")];
const capEl = document.getElementById("slide-caption");
const countEl = document.getElementById("slide-count");
let slideIdx = 0;
const showSlide = (i) => {
  slides[slideIdx].classList.remove("is-active");
  slideIdx = i % slides.length;
  slides[slideIdx].classList.add("is-active");
  capEl.textContent = slides[slideIdx].dataset.caption;
  countEl.textContent = `${slideIdx + 1} / ${slides.length}`;
};
if (!reduceMotion && slides.length > 1) {
  setInterval(() => { if (!document.hidden) showSlide(slideIdx + 1); }, 6500);
}

/* Služby: vybraná služba ukáže svou fotku */
const services = [...document.querySelectorAll(".service")];
const servicePhoto = document.querySelector(".service-photo img");
services.forEach((btn) => {
  const pre = new Image();
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    services.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    servicePhoto.classList.add("fading");
    pre.onload = () => {
      servicePhoto.src = btn.dataset.img;
      requestAnimationFrame(() => servicePhoto.classList.remove("fading"));
    };
    pre.src = btn.dataset.img;
  });
});

/* Tlačítka v ceníku předvyplní balíček ve formuláři */
const planSelect = document.getElementById("f-plan");
document.querySelectorAll("[data-plan]").forEach((el) =>
  el.addEventListener("click", () => {
    const want = el.dataset.plan.toLowerCase();
    const opt = [...planSelect.options].find((o) => o.text.toLowerCase().startsWith(want));
    if (opt) planSelect.value = opt.value;
  })
);

/* Plovoucí tlačítko na mobilu – jen když není vidět úvod ani kontakt */
const mobileCta = document.querySelector(".mobile-cta");
const visible = new Set();
mobileCta.classList.add("hide");
const ctaObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    mobileCta.classList.toggle("hide", visible.size > 0);
  },
  { threshold: 0.05 }
);
[document.querySelector(".hero"), document.getElementById("kontakt")].forEach((el) => ctaObserver.observe(el));

/* Matterport se načte až po kliknutí (rychlejší web) */
const facade = document.querySelector(".mp-facade");
facade.addEventListener("click", () => {
  const iframe = document.createElement("iframe");
  iframe.src = facade.dataset.src;
  iframe.title = "3D prohlídka Matterport";
  iframe.allow = "xr-spatial-tracking; fullscreen";
  iframe.allowFullscreen = true;
  facade.replaceWith(iframe);
});

/* Lightbox galerie */
const items = [...document.querySelectorAll(".g-item")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let current = 0;
const show = (i) => {
  current = (i + items.length) % items.length;
  lbImg.src = items[current].dataset.full;
  lbImg.alt = items[current].querySelector("img").alt;
};
items.forEach((it, i) => it.addEventListener("click", () => { show(i); lb.showModal(); }));
lb.querySelector(".lb-close").addEventListener("click", () => lb.close());
lb.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
lb.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
let touchX = null;
lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* Formulář */
const form = document.getElementById("form");
const status = document.getElementById("form-status");
const setStatus = (msg, cls) => {
  status.textContent = msg;
  status.className = "form-status" + (cls ? " " + cls : "");
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data._gotcha) return;

  let valid = true;
  const check = (name, ok) => {
    const field = form.elements[name].closest(".field");
    field.classList.toggle("invalid", !ok);
    if (!ok && valid) form.elements[name].focus();
    valid = valid && ok;
  };
  check("name", data.name.trim().length > 1);
  check("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()));
  check("message", data.message.trim().length > 2);
  if (!valid) return setStatus("Vyplňte jméno, platný e-mail a zprávu.", "err");

  if (!FORM_ENDPOINT) {
    const body =
      `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone || "-"}\n` +
      `Služba: ${data.plan}\nLokalita: ${data.place || "-"}\n\n${data.message}`;
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Poptávka z webu – " + data.plan)}` +
      `&body=${encodeURIComponent(body)}`;
    return setStatus("Otevírám e-mail s připravenou poptávkou. Stačí ji odeslat.", "ok");
  }

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  setStatus("Odesílám…");
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, _subject: "Poptávka z webu – " + data.plan }),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    setStatus("Poptávka odeslána. Ozvu se co nejdříve.", "ok");
  } catch {
    setStatus(`Poptávku se nepodařilo odeslat. Napište přímo na ${CONTACT_EMAIL}.`, "err");
  } finally {
    btn.disabled = false;
  }
});

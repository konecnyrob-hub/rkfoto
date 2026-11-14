/*
 * Kam se posílají poptávky z formuláře.
 * Prázdné  -> formulář otevře e-mailového klienta s předvyplněnou zprávou.
 * Vyplněné -> např. "https://formspree.io/f/xxxxxxx" (zdarma), zprávy pak chodí přímo na e-mail bez otevírání pošty.
 */
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "konecny.rob@gmail.com";

/* Rok v patičce */
document.getElementById("year").textContent = new Date().getFullYear();

/* Hlavička: stín po scrollu + mobilní menu */
const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const toggle = document.querySelector(".menu-toggle");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

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

/* Tlačítka v ceníku předvyplní balíček ve formuláři */
const planSelect = document.getElementById("f-plan");
document.querySelectorAll("[data-plan]").forEach((el) =>
  el.addEventListener("click", () => {
    const want = el.dataset.plan.toLowerCase();
    const opt = [...planSelect.options].find((o) => o.text.toLowerCase().startsWith(want));
    if (opt) planSelect.value = opt.value;
  })
);

/* Plovoucí CTA na mobilu – schovat, když je vidět úvodní tlačítko nebo kontakt */
const mobileCta = document.querySelector(".mobile-cta");
const ctaWatch = [document.querySelector(".hero-cta"), document.getElementById("kontakt")];
const visible = new Set();
mobileCta.classList.add("hide");
const ctaObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    mobileCta.classList.toggle("hide", visible.size > 0);
  },
  { threshold: 0.05 }
);
ctaWatch.forEach((el) => ctaObserver.observe(el));

/* Jemné objevování sekcí */
const revealEls = document.querySelectorAll(
  ".section-head, .service, .why-list li, .steps li, .plan, .matterport, .faq, .form, .contact-copy"
);
const ro = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        ro.unobserve(e.target);
      }
    }),
  { rootMargin: "0px 0px -8% 0px" }
);
revealEls.forEach((el) => {
  el.classList.add("reveal");
  ro.observe(el);
});

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
  const it = items[current];
  lbImg.src = it.dataset.full;
  lbImg.alt = it.querySelector("img").alt;
};
items.forEach((it, i) =>
  it.addEventListener("click", () => {
    show(i);
    lb.showModal();
  })
);
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
  if (data._gotcha) return; // spam bot

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
  if (!valid) return setStatus("Vyplňte prosím jméno, platný e-mail a zprávu.", "err");

  if (!FORM_ENDPOINT) {
    const body =
      `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone || "-"}\n` +
      `Služba: ${data.plan}\nLokalita: ${data.place || "-"}\n\n${data.message}`;
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Poptávka z webu – " + data.plan)}` +
      `&body=${encodeURIComponent(body)}`;
    return setStatus("Otevírám e-mail s připravenou zprávou – stačí ji odeslat.", "ok");
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
    setStatus("Děkuji! Poptávka dorazila, ozvu se co nejdříve.", "ok");
  } catch {
    setStatus(`Odeslání se nepovedlo. Napište prosím přímo na ${CONTACT_EMAIL}.`, "err");
  } finally {
    btn.disabled = false;
  }
});

# RKfoto – web

Statický web (HTML + CSS + JS), žádný build, žádná databáze. Běží na jakémkoli hostingu.

## Úpravy
- **Texty a ceny**: `index.html`
- **Barvy a vzhled**: proměnné nahoře v `styles.css` (`--accent` = hlavní akcentová barva)
- **Fotky v galerii**: vložte do `img/` dvě verze – velkou (max ~2000 px, např. `foto-13.jpg`)
  a náhled (~900 px, `foto-13-sm.jpg`) – a přidejte řádek `<button class="g-item" ...>` v sekci Ukázky.
  Třída `g-wide` udělá z fotky velkou dlaždici.
- **Formulář**: v `script.js` nastavte `FORM_ENDPOINT` (např. zdarma přes formspree.io).
  Dokud je prázdný, formulář otevře e-mail s předvyplněnou poptávkou.
- **Telefon**: v sekci Kontakt je připravený zakomentovaný řádek – doplňte číslo a odkomentujte.

## Nasazení
Web běží na GitHub Pages: https://konecnyrob-hub.github.io/rkfoto/
Každý `git push` do větve `main` web automaticky aktualizuje (za 1–2 minuty).

### Vlastní doména (později)
1. Kupte doménu (pozor: rkfoto.cz patří jinému fotografovi).
2. V repozitáři: Settings → Pages → Custom domain → zadejte doménu.
3. U registrátora nastavte DNS: záznamy A na 185.199.108.153, 185.199.109.153,
   185.199.110.153, 185.199.111.153 a CNAME `www` na `konecnyrob-hub.github.io`.
4. V `index.html`, `robots.txt`, `sitemap.xml` a `404.html` nahraďte adresu
   `https://konecnyrob-hub.github.io/rkfoto` novou doménou (a v 404.html `/rkfoto/` za `/`).
5. V Google Search Console přidejte doménu a odešlete sitemap.xml.

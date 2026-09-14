# littleflow.cz — web Mateřské školy Little FLOW

Statický web, stejný design systém jako skolaflow.cz (`assets/css/flow.css` je 1:1 kopie, needitovat).
Vše specifické pro školku je v `assets/css/little-flow.css`.

## Struktura

```
index.html            Domů
jak-ucime.html        Jak učíme (6 pilířů + příklad projektu)
den-ve-skolce.html    Den ve školce (denní program + prostory)
skolne.html           Školné (ceník + co je zahrnuto)
prijimani.html        Přijímání (3 kroky + adaptace + formulář)
kontakt.html          Kontakt (adresa, doprava, mapa, formulář)
gdpr.html             Zásady GDPR
404.html              Stránka nenalezena (Cloudflare Pages ji servíruje automaticky)
en/…                  anglické zrcadlo všech stránek (stejné slugy)
assets/css|js         flow.css + flow.js (kopie ze skolaflow.cz), cmp.* (cookie lišta), little-flow.css
images/               obrázky (vizualizace tříd, kampus, loga, OG obrázek)
_redirects            .html → clean URL (301)
_headers              bezpečnostní hlavičky + cache
sitemap.xml, robots.txt
_templates/ + sync.py hromadná změna nav/footeru (viz níže)
```

## Deploy (Cloudflare Pages)

1. GitHub: nový repo `marvflow/littleflow-web`, větev `main`, obsah = tato složka.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → repo `littleflow-web`.
   Build command: *(prázdné)* · Build output directory: `/` · Framework preset: None.
3. Po prvním deployi: Custom domains → přidat `littleflow.cz` a `www.littleflow.cz`.
4. Doména littleflow.cz: u registrátora (Thinline / Český hosting) přepnout nameservery na ty, které ukáže Cloudflare po přidání zóny (Add a site → littleflow.cz → Free).
5. Každý další `git push` do `main` = deploy (~2 min).

## Nav / footer napříč stránkami

Hlavička a patička jsou inline v každé stránce mezi značkami
`<!-- LF-NAV-START -->…<!-- LF-NAV-END -->` a `<!-- LF-FOOTER-START -->…<!-- LF-FOOTER-END -->`.

Hromadná změna: uprav `_templates/nav-cs.html`, `nav-en.html`, `footer-cs.html`, `footer-en.html`
a spusť `python3 sync.py` — propíše bloky do všech stránek (CS i EN). Skript vypíše počty.
Pozor: v šablonách je `{{SLUG}}` (pro `aria-current` a přepínač jazyka) — sync ho doplní sám.

## Formulář

Všechny formuláře posílají na stejný Apps Script endpoint jako skolaflow.cz,
`source=little-flow-form` (+ `lang`, `page`). Leady padají do tabu **Registrace** ve sdíleném Sheetu,
sloupec Zdroj = `little-flow-form`. Backend není potřeba měnit.

## Den otevřených dveří v hero

Řádek „Nejbližší den otevřených dveří" (Domů, Přijímání, Kontakt) se plní z **Eventy** sheetu
(řádek `type=ms-od`, `active≠FALSE`, nejbližší budoucí datum). Bez aktivního termínu je skrytý.

## Měření

GTM `GTM-KQS7FP5W` + Meta Pixel `1250403810500269` — stejné jako skolaflow.cz, consent-gated přes cookie lištu.
V GTM/GA4 je potřeba přidat doménu `littleflow.cz` do cross-domain nastavení (nebo založit vlastní GA4 stream).

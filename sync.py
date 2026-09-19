#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Propíše _templates/nav-*.html a footer-*.html do všech stránek mezi značky LF-NAV / LF-FOOTER.
Spouštět z kořene repa: python3 sync.py
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
T = os.path.join(ROOT, "_templates")


def load(name):
    with open(os.path.join(T, name), encoding="utf-8") as f:
        return f.read().strip("\n")


def slug_of(path):
    base = os.path.splitext(os.path.basename(path))[0]
    return base


def apply(path, lang):
    slug = slug_of(path)
    nav = load(f"nav-{lang}.html").replace("{{SLUG}}", "" if slug == "index" else slug)
    foot = load(f"footer-{lang}.html").replace("{{SLUG}}", "" if slug == "index" else slug)
    # aria-current pro aktivní stránku
    nav = nav.replace(f'href="{slug}" class="site-nav__link"', f'href="{slug}" class="site-nav__link" aria-current="page"')
    # CTA odkaz: na stránkách s formulářem #form, jinde navsteva#form
    cta = "#form" if slug in ("index", "kontakt") else "./#form"
    nav = nav.replace("{{CTA}}", cta)
    foot = foot.replace("{{CTA}}", cta)
    with open(path, encoding="utf-8") as f:
        s = f.read()
    n1 = len(re.findall(r"<!-- LF-NAV-START -->.*?<!-- LF-NAV-END -->", s, flags=re.S))
    n2 = len(re.findall(r"<!-- LF-FOOTER-START -->.*?<!-- LF-FOOTER-END -->", s, flags=re.S))
    if n1 != 1 or n2 != 1:
        print(f"  ! {path}: nav={n1} footer={n2} — přeskočeno")
        return False
    s = re.sub(r"<!-- LF-NAV-START -->.*?<!-- LF-NAV-END -->", lambda m: nav, s, flags=re.S)
    s = re.sub(r"<!-- LF-FOOTER-START -->.*?<!-- LF-FOOTER-END -->", lambda m: foot, s, flags=re.S)
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    return True


if __name__ == "__main__":
    cs = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    en = sorted(glob.glob(os.path.join(ROOT, "en", "*.html")))
    ok = sum(apply(p, "cs") for p in cs) + sum(apply(p, "en") for p in en)
    print(f"Hotovo: {ok} stránek ({len(cs)} CS + {len(en)} EN).")

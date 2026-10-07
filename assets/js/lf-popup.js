/* ============================================================
   Little FLOW — vyskakovací okno s Founding Family Rate
   Markup generuje web (id="lf-promo"), tady je jen chování.

   - ukáže se hned po načtení stránky (prodleva v data-delay, ms)
   - při každé návštěvě znovu, ale jen jednou za návštěvu:
     při přechodu na další stránku už nevyskočí
     (návštěva = otevřená záložka prohlížeče, sessionStorage)
   - po datu v data-until se už neukáže nikdy
   - neukáže se, když má návštěvník otevřené menu, píše do
     formuláře nebo přišel rovnou na #form
   - test: přidat k adrese ?promo=1 (ukáže se vždy)
   ============================================================ */
(function () {
  'use strict';

  var el = document.getElementById('lf-promo');
  if (!el) return;

  var KEY = 'lf-ffr-popup-seen';
  var box = el.querySelector('.lf-promo__box');
  var forced = /[?&]promo=1(&|$)/.test(location.search);
  var lastFocus = null;
  var isOpen = false;

  function track(name) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name });
    } catch (e) {}
  }

  function markSeen() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function seen() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function expired() {
    var until = el.getAttribute('data-until');
    if (!until) return false;
    var end = new Date(until + 'T23:59:59');
    return !isNaN(end) && new Date() > end;
  }

  function busy() {
    var a = document.activeElement;
    var typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
    return typing ||
      !!document.querySelector('.mobile-drawer.is-open') ||
      !!document.querySelector('.flow-cmp-modal');
  }

  function focusables() {
    return Array.prototype.slice.call(
      box.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (n) { return n.offsetParent !== null; });
  }

  function onKey(e) {
    if (e.key === 'Escape') { close('lf_popup_close'); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    if (!forced) markSeen();
    lastFocus = document.activeElement;
    el.hidden = false;
    document.documentElement.classList.add('lf-promo-lock');
    // další snímek, ať proběhne přechod
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-open'); });
    });
    var cta = el.querySelector('[data-promo-cta]');
    if (cta) { try { cta.focus({ preventScroll: true }); } catch (e) { cta.focus(); } }
    document.addEventListener('keydown', onKey);
    track('lf_popup_view');
  }

  function close(eventName) {
    if (!isOpen) return;
    isOpen = false;
    el.classList.remove('is-open');
    document.documentElement.classList.remove('lf-promo-lock');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { el.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    if (eventName) track(eventName);
  }

  el.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('[data-promo-cta]')) { close('lf_popup_cta'); return; }
    if (t.closest && t.closest('.lf-promo__note a')) { close('lf_popup_pricing'); return; }
    if (t.closest && t.closest('[data-promo-close]')) { close('lf_popup_close'); }
  });

  if (forced) { open(); return; }
  if (expired() || seen() || location.hash === '#form') return;

  var delay = Number(el.getAttribute('data-delay'));
  if (isNaN(delay) || delay < 0) delay = 0;
  var waited = 0;

  function tryOpen() {
    if (seen()) return;
    if (busy()) {
      waited += 1500;
      if (waited > 90000) return;
      setTimeout(tryOpen, 1500);
      return;
    }
    open();
  }

  if (delay === 0) tryOpen(); else setTimeout(tryOpen, delay);
})();

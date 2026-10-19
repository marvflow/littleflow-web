/* ============================================================
   Little FLOW — návštěvníci z reklam + mobilní lišta
   1) ?zajem=experience | kava → pruh nahoře s tím, kvůli čemu
      rodič přišel, a tlačítko „Domluvit návštěvu“ na #form
      (volbu „Mám zájem o“ předvybírá lf-utm.js)
   2) mobil (do 768 px): trvalá lišta dole „Domluvit návštěvu“
      + „Zavolat“; schová se, když je vidět formulář nebo
      cookie lišta
   Na formulář, odesílání ani měření nesahá.
   ============================================================ */
(function () {
  'use strict';

  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var TEL = '+420770673828';
  var hasForm = !!document.getElementById('form');
  var FORM_HREF = hasForm ? '#form' : './#form';

  var T = EN ? {
    experience: '<strong>Experience Morning</strong> · Thursday 8:30–10:30 · come and try a morning with your child',
    kava: '<strong>Coffee with Management</strong> · Monday 10:00–11:30',
    book: 'Arrange a visit', call: 'Call'
  } : {
    experience: '<strong>Experience Morning</strong> · čtvrtek 8:30–10:30 · přijďte si s dítětem vyzkoušet dopoledne',
    kava: '<strong>Káva s ředitelkou</strong> · pondělí 10:00–11:30',
    book: 'Domluvit návštěvu', call: 'Zavolat'
  };

  function track(name) {
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: name }); } catch (e) {}
  }

  // ── 1) Pruh pro návštěvníky z reklamy (podle zajem v adrese)
  function adBar() {
    var z = '';
    try { z = (new URLSearchParams(location.search).get('zajem') || '').toLowerCase(); } catch (e) {}
    var key = (z === 'experience' || z === 'em' || z === 'experience-morning') ? 'experience'
            : (z === 'kava' || z === 'coffee') ? 'kava' : '';
    if (!key) return;
    var main = document.querySelector('main') || document.body;
    var bar = document.createElement('div');
    bar.className = 'lf-adbar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', EN ? 'Your visit' : 'Vaše návštěva');
    bar.innerHTML =
      '<div class="lf-adbar__inner">' +
        '<p class="lf-adbar__text">' + T[key] + '</p>' +
        '<a class="btn btn-primary lf-adbar__btn" href="' + FORM_HREF + '" data-lf-cta="adbar">' + T.book + ' →</a>' +
      '</div>';
    main.insertBefore(bar, main.firstChild);
    track('lf_adbar_view');
  }

  // ── 2) Mobilní lišta dole
  function stickyBar() {
    var bar = document.createElement('div');
    bar.className = 'lf-mbar';
    bar.innerHTML =
      '<a class="lf-mbar__btn lf-mbar__btn--primary" href="' + FORM_HREF + '" data-lf-cta="mbar-form">' + T.book + '</a>' +
      '<a class="lf-mbar__btn lf-mbar__btn--call" href="tel:' + TEL + '" data-lf-cta="mbar-call">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>' +
        T.call + '</a>';
    document.body.appendChild(bar);

    var formVisible = false;
    var mq = window.matchMedia('(max-width: 768px)');

    function update() {
      var cookie = !!document.querySelector('.flow-cmp-banner, .flow-cmp-modal');
      var promo = document.documentElement.classList.contains('lf-promo-lock');
      var drawer = !!document.querySelector('.mobile-drawer.is-open');
      var show = mq.matches && !formVisible && !cookie && !promo && !drawer;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('lf-mbar-on', show);
    }

    var formEl = document.getElementById('form');
    if (formEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        formVisible = entries[0].isIntersecting;
        update();
      }, { rootMargin: '0px 0px -10% 0px' }).observe(formEl);
    }
    // cookie lišta, menu a okno se objevují a mizí → hlídat změny v DOM
    if ('MutationObserver' in window) {
      new MutationObserver(update).observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
      new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      var drawerEl = document.querySelector('.mobile-drawer');
      if (drawerEl) new MutationObserver(update).observe(drawerEl, { attributes: true, attributeFilter: ['class'] });
    }
    if (mq.addEventListener) mq.addEventListener('change', update); else if (mq.addListener) mq.addListener(update);
    update();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-lf-cta]');
    if (a) track('lf_cta_' + a.getAttribute('data-lf-cta').replace(/-/g, '_'));
  });

  function init() { adBar(); stickyBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

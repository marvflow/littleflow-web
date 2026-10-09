/* ============================================================
   Little FLOW — UTM z reklam → formulář
   - při příchodu uloží utm_* (a zajem) do sessionStorage, takže
     přežijí přechod na jinou stránku, kde rodič vyplní formulář
   - do každého formuláře přidá skrytá pole utm_* (odešlou se s ním)
   - ?zajem=… předvybere volbu v „Mám zájem o“:
       experience / em → Experience Morning
       kava / coffee   → Káva s vedením
       schuzka / meeting → Individuální schůzka
       info            → Zatím jen informace
     (zajem=skolka nic nepředvybírá — na littleflow.cz je všechno školka)
   - nic z toho nejsou cookies ani osobní údaje; sessionStorage zmizí
     se zavřením záložky
   ============================================================ */
(function () {
  'use strict';

  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'zajem'];
  var ZAJEM = {
    experience: 'experience_morning', em: 'experience_morning', 'experience-morning': 'experience_morning',
    kava: 'kava_s_vedenim', coffee: 'kava_s_vedenim',
    schuzka: 'individualni_schuzka', meeting: 'individualni_schuzka',
    info: 'informace', informace: 'informace'
  };

  function get(k) { try { return sessionStorage.getItem('lf_' + k); } catch (e) { return null; } }

  // 1) uložit při příchodu (novější kampaň přepíše starší)
  try {
    var p = new URLSearchParams(location.search);
    if (p.get('utm_source') || p.get('utm_campaign')) {
      KEYS.forEach(function (k) { try { sessionStorage.removeItem('lf_' + k); } catch (e) {} });
    }
    KEYS.forEach(function (k) {
      var v = p.get(k);
      if (v) sessionStorage.setItem('lf_' + k, v.slice(0, 120));
    });
  } catch (e) {}

  // veřejné API pro flow.js (připsání do zprávy)
  window.LFUtm = {
    get: get,
    summary: function () {
      var parts = [];
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
        var v = get(k);
        if (v) parts.push(k + '=' + v);
      });
      return parts.join(', ');
    }
  };

  function apply() {
    var forms = document.querySelectorAll('form');
    Array.prototype.forEach.call(forms, function (form) {
      // 2) skrytá pole
      KEYS.forEach(function (k) {
        var v = get(k);
        if (!v || form.querySelector('[name="' + k + '"]')) return;
        var i = document.createElement('input');
        i.type = 'hidden'; i.name = k; i.value = v;
        form.appendChild(i);
      });
      // 3) předvýběr „Mám zájem o“
      var z = (get('zajem') || '').toLowerCase();
      var key = ZAJEM[z];
      var sel = form.querySelector('select[name="zajem"]');
      if (key && sel && !sel.value) {
        Array.prototype.forEach.call(sel.options, function (o, idx) {
          if (o.getAttribute('data-lead') === key) sel.selectedIndex = idx;
        });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();

// consent.js — Google Analytics 4, loaded only after the visitor agrees.
//
// Analytics cookies need prior consent under the ePrivacy Regulations (S.I. 336/2011, Reg. 5)
// and GDPR Art. 6(1)(a). This uses Google's "basic" consent mode: gtag.js is not requested at
// all until the visitor taps Accept, so nothing reaches Google before consent. "Reject" is as
// prominent as "Accept", and the footer "Cookie settings" link reopens the choice at any time.
//
// Each page defines a gtag() stub before loading this file, so onclick event calls queue
// harmlessly in dataLayer when analytics is off.

(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-10NP71J9SE';
  var STORAGE_KEY = 'granted-analytics-consent'; // 'granted' | 'denied'
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Denied until the visitor says otherwise.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode: ask again next visit */ }
  }

  function loadAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);
  }

  // Withdrawing consent must be as easy as giving it (GDPR Art. 7(3)): stop collection
  // and delete the cookies GA4 set.
  function stopAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var STYLE = [
    '#gc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:640px;margin:0 auto;',
    'background:#fff;color:#1C1C1E;border:1px solid #D6F0E4;border-radius:16px;padding:20px;',
    'box-shadow:0 8px 32px rgba(2,30,18,.18);font-family:"DM Sans",system-ui,sans-serif;font-size:15px;line-height:1.5}',
    '#gc-banner h2{font-size:17px;margin:0 0 6px;font-weight:700}',
    '#gc-banner p{margin:0 0 14px;color:#48484A}',
    '#gc-banner a{color:#0A5C38;text-decoration:underline}',
    '#gc-banner .gc-actions{display:flex;gap:10px;flex-wrap:wrap}',
    '#gc-banner button{flex:1 1 140px;min-height:44px;border-radius:999px;font:inherit;font-weight:600;cursor:pointer;',
    'border:2px solid #0A5C38;padding:10px 18px}',
    '#gc-banner .gc-accept{background:#0A5C38;color:#fff}',
    '#gc-banner .gc-reject{background:#fff;color:#0A5C38}',
    '#gc-banner button:focus-visible{outline:3px solid #FF9500;outline-offset:2px}',
    '@media (prefers-color-scheme:dark){#gc-banner{background:#1C1C1E;color:#F2F2F7;border-color:#0A5C38}',
    '#gc-banner p{color:#C7C7CC}#gc-banner a{color:#6EC4A5}#gc-banner .gc-reject{background:#1C1C1E;color:#6EC4A5;border-color:#6EC4A5}',
    '#gc-banner .gc-accept{background:#169B62;border-color:#169B62}}'
  ].join('');

  function closeBanner() {
    var el = document.getElementById('gc-banner');
    if (el) el.parentNode.removeChild(el);
  }

  function showBanner() {
    if (document.getElementById('gc-banner')) return;
    if (!document.getElementById('gc-style')) {
      var st = document.createElement('style');
      st.id = 'gc-style';
      st.textContent = STYLE;
      document.head.appendChild(st);
    }
    var el = document.createElement('section');
    el.id = 'gc-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<h2>Can we use analytics cookies?</h2>' +
      '<p>With your permission, this website uses Google Analytics cookies to count visits and see ' +
      'which pages are useful. Nothing is set until you choose. The Granted app itself has no analytics. ' +
      '<a href="/privacy.html#website-analytics">How we use them</a></p>' +
      '<div class="gc-actions">' +
      '<button type="button" class="gc-reject">Reject</button>' +
      '<button type="button" class="gc-accept">Accept analytics</button>' +
      '</div>';
    el.querySelector('.gc-accept').addEventListener('click', function () {
      saveChoice('granted');
      loadAnalytics();
      closeBanner();
    });
    el.querySelector('.gc-reject').addEventListener('click', function () {
      saveChoice('denied');
      stopAnalytics();
      closeBanner();
    });
    document.body.appendChild(el);
  }

  function init() {
    var choice = readChoice();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') showBanner();

    document.querySelectorAll('[data-cookie-settings]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner();
        var first = document.querySelector('#gc-banner button');
        if (first) first.focus();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

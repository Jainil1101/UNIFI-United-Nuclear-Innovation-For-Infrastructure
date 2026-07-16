/* Mounts the UNIFI Stats React dashboard into #unifiStatsRoot.
   Loaded deferred, after react / react-dom / recharts / unifi-i18n / unifi-data / unifi-stats. */
(function () {
  var root = null;
  window.__renderUnifi = function (loc) {
    var el = document.getElementById('unifiStatsRoot');
    if (!el || !window.UnifiStats || !window.UNIFI_DATA || !window.React || !window.ReactDOM) return;
    try {
      if (!root) root = window.ReactDOM.createRoot(el);
      root.render(window.React.createElement(window.UnifiStats, {
        data: window.UNIFI_DATA,
        locale: (loc === 'id' || loc === 'ru') ? loc : 'en',
        defaultCountry: 'Indonesia',
        defaultYear: 2036
      }));
      var l = document.getElementById('unifiLoading');
      if (l) l.style.display = 'none';
    } catch (e) {
      console.error('UNIFI Stats render failed:', e);
      var l2 = document.getElementById('unifiLoading');
      if (l2) l2.textContent = 'Analytics failed to load — check the console.';
    }
  };
  // initial render (site starts in English; setLang() re-renders on language change)
  window.__renderUnifi('en');
})();

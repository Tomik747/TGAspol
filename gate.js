// Web only (aplikace.tgaservice.cz): shows Servisní štítky only to people signed in to
// Průběžné zisky (same Supabase account, same browser). Otherwise sends them to the login
// at /zisky/ and back here afterwards. The exe build does not include this file.
// Note: this hides the page from casual visitors; the label app holds no stored data.
(function () {
  var hide = document.createElement("style");
  hide.textContent = "html{visibility:hidden!important}";
  document.head.appendChild(hide);

  function login() {
    location.replace("/zisky/?dalsi=" + encodeURIComponent(location.pathname + location.search));
  }
  function load(src, next) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = next;
    s.onerror = login;
    document.head.appendChild(s);
  }

  load("/zisky/vendor/supabase.js", function () {
    load("/zisky/config.js", function () {
      var cfg = window.ZISKY_CONFIG || {};
      if (!window.supabase || !cfg.url || !cfg.anonKey) return login();
      window.supabase
        .createClient(cfg.url, cfg.anonKey)
        .auth.getSession()
        .then(function (r) {
          if (r && r.data && r.data.session) hide.remove();
          else login();
        }, login);
    });
  });
})();

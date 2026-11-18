// Záloha všech dat do jednoho Excelu (Zakázky · Příjmy a výdaje · Pravidelné platby).
// Použití: TGA_ZALOHA.mount(elementId, supabaseClient). Knihovna xlsx se načte až po kliknutí.
(function () {
  var base = document.currentScript ? document.currentScript.src.replace(/[^/]*$/, "") : "";
  var KEY = "tga-posledni-zaloha"; // jen pro připomínku na tomto zařízení
  var MONTH = 30 * 24 * 3600 * 1000;

  function lastBackup() { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } }
  function setLastBackup(t) { try { localStorage.setItem(KEY, String(t)); } catch (e) {} }
  function fmtDate(t) { var d = new Date(t); return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear(); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve();
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = base + "xlsx.full.min.js"; s.onload = ok; s.onerror = function () { fail(new Error("Nepodařilo se načíst knihovnu pro Excel.")); };
      document.head.appendChild(s);
    });
  }
  async function all(db, table, order) {
    var out = [];
    for (var from = 0; ; from += 1000) {
      var r = await db.from(table).select("*").order(order, { ascending: true }).range(from, from + 999);
      if (r.error) {
        // Tabulka ještě neexistuje → list zůstane prázdný, záloha ostatního proběhne.
        if (/does not exist|schema cache/i.test(r.error.message)) return out;
        throw r.error;
      }
      out.push.apply(out, r.data);
      if (r.data.length < 1000) break;
    }
    return out;
  }
  function sheet(rows, cols) {
    var data = [cols.map(function (c) { return c[0]; })].concat(rows.map(function (r) { return cols.map(function (c) { return c[1](r); }); }));
    var ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = cols.map(function (c) { return { wch: c[2] || 14 }; });
    return ws;
  }
  var num = function (k) { return function (r) { return +r[k] || 0; }; };
  var txt = function (k) { return function (r) { return r[k] == null ? "" : r[k]; }; };

  async function backup(db) {
    await loadXlsx();
    var z = await all(db, "zakazky", "datum");
    var p = await all(db, "pohyby", "datum");
    var pr = await all(db, "pravidelne_platby", "den");
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet(z, [
      ["Datum", txt("datum"), 12], ["Kdo", txt("kdo"), 26], ["Auto", txt("auto"), 26],
      ["Stálo nás", num("naklady")], ["Zaplatil", num("zaplaceno")],
      ["Zisk", function (r) { return (+r.zaplaceno || 0) - (+r.naklady || 0); }], ["Ukázková", function (r) { return r.demo ? "ano" : ""; }, 10],
    ]), "Zakázky");
    XLSX.utils.book_append_sheet(wb, sheet(p, [
      ["Datum", txt("datum"), 12], ["Druh", function (r) { return r.typ === "prijem" ? "Příjem" : "Výdaj"; }, 10],
      ["Kategorie", txt("kategorie"), 20], ["Částka", num("castka")], ["Poznámka", txt("poznamka"), 34],
    ]), "Příjmy a výdaje");
    XLSX.utils.book_append_sheet(wb, sheet(pr, [
      ["Den", num("den"), 6], ["Druh", function (r) { return r.typ === "prijem" ? "Příjem" : "Výdaj"; }, 10],
      ["Kategorie", txt("kategorie"), 20], ["Částka", num("castka")], ["Poznámka", txt("poznamka"), 30],
    ]), "Pravidelné platby");
    var d = new Date();
    XLSX.writeFile(wb, "tga-zaloha-" + d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + ".xlsx");
    setLastBackup(Date.now());
    return { zakazky: z.length, pohyby: p.length, pravidelne: pr.length };
  }

  function mount(id, getDb) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML =
      '<div class="backup-card"><div><b>Záloha všech dat</b><div class="hint" style="margin:3px 0 0">' +
      'Zakázky, příjmy a výdaje, pravidelné platby · <span class="backup-last"></span></div></div>' +
      '<button type="button" class="backup-btn">Stáhnout zálohu všeho</button></div>';
    var btn = el.querySelector(".backup-btn"), last = el.querySelector(".backup-last");
    function paint() {
      var t = lastBackup();
      last.textContent = t ? "poslední záloha na tomto zařízení: " + fmtDate(t) : "na tomto zařízení zatím žádná záloha";
      btn.classList.toggle("primary", !t || Date.now() - t > MONTH);
    }
    btn.addEventListener("click", async function () {
      btn.disabled = true; var label = btn.textContent; btn.textContent = "Připravuji…";
      try { await backup(getDb()); }
      catch (e) { console.error(e); alert("Zálohu se nepodařilo vytvořit.\n\n" + (e && e.message ? e.message : e)); }
      btn.disabled = false; btn.textContent = label; paint();
    });
    paint();
  }

  window.TGA_ZALOHA = { mount: mount, backup: backup };
})();

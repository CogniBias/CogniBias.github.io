/* CogniBias — interface bilingue (FR/EN). Données : window.COGNIBIAS (data/data.js).
   Trois vues dans la page : « random » (biais tiré au hasard, vue par défaut), « list » (résultats filtrés), « bias » (fiche choisie). */
(function () {
  "use strict";
  var DATA = window.COGNIBIAS;
  var I18N = {
    fr: {
      htmlTitle: "CogniBias · 101 biais cognitifs",
      heading: "Les biais qui façonnent nos jugements.",
      fProcess: "Processus", fRob: "Robustesse", fBenson: "Codex Benson", searchLabel: "Recherche",
      search: "Nom ou mot-clé…", all: "Tous", allRob: "Toutes",
      rob: { replicated: "Répliqué", debated: "Débattu", fragile: "Fragile" },
      robPl: { replicated: "répliqués", debated: "débattus", fragile: "fragiles" },
      count: function (n) { return n + (n > 1 ? " biais correspondent" : " biais correspond"); },
      empty: "Aucun biais ne correspond. Essayez un autre mot ou réinitialisez les filtres.",
      randomTitle: "Un biais au hasard", another: "Un autre biais au hasard", browse: "Parcourir les 101 biais",
      randomHere: "Un biais au hasard", reset: "Réinitialiser", back: "Retour aux résultats",
      prev: "Précédent", next: "Suivant",
      mechanism: "Mécanisme", codex: "Codex Benson", definition: "Définition", example: "Exemple",
      reference: "Étude fondatrice", robustness: "Robustesse des preuves", counter: "Parades", related: "Biais voisins",
      otherName: "En anglais : ", aka: "aussi", proposed: "rattachement proposé, absent de la liste de Benson",
      langLabel: "Langue"
    },
    en: {
      htmlTitle: "CogniBias · 101 cognitive biases",
      heading: "The biases that shape our judgements.",
      fProcess: "Process", fRob: "Robustness", fBenson: "Benson codex", searchLabel: "Search",
      search: "Name or keyword…", all: "All", allRob: "All",
      rob: { replicated: "Replicated", debated: "Debated", fragile: "Fragile" },
      robPl: { replicated: "replicated", debated: "debated", fragile: "fragile" },
      count: function (n) { return n + (n === 1 ? " bias matches" : " biases match"); },
      empty: "No bias matches. Try another word or reset the filters.",
      randomTitle: "A random bias", another: "Another random bias", browse: "Browse all 101 biases",
      randomHere: "A random bias", reset: "Reset", back: "Back to results",
      prev: "Previous", next: "Next",
      mechanism: "Mechanism", codex: "Benson codex", definition: "Definition", example: "Example",
      reference: "Founding study", robustness: "Strength of evidence", counter: "Countermeasures", related: "Related biases",
      otherName: "In French: ", aka: "also", proposed: "proposed mapping, not in Benson's list",
      langLabel: "Language"
    }
  };
  var ROBS = ["replicated", "debated", "fragile"];
  var byId = {}; DATA.biases.forEach(function (b) { byId[b.id] = b; });
  var procById = {}; DATA.processes.forEach(function (p) { procById[p.id] = p; });
  var bProb = {}, bStrat = {};
  DATA.benson.problems.forEach(function (p) { bProb[p.id] = p; });
  DATA.benson.strategies.forEach(function (p) { bStrat[p.id] = p; });

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function browserLang() {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return l.toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }
  function parseHash() {
    var m = /^#?(fr|en)(?:-(B\d{3}))?$/i.exec(location.hash || "");
    return m ? { lang: m[1].toLowerCase(), id: m[2] ? m[2].toUpperCase() : null } : null;
  }
  function pickRandom(pool, avoid) {
    if (!pool.length) pool = DATA.biases;
    var c = pool.filter(function (b) { return b.id !== avoid; });
    if (!c.length) c = pool;
    return c[Math.floor(Math.random() * c.length)].id;
  }

  var h = parseHash();
  var state = {
    lang: h ? h.lang : (store("cognibias-lang") || browserLang()),
    q: "", proc: "", rob: "", ben: "",
    view: h && byId[h.id] ? "bias" : "random",
    open: h && byId[h.id] ? h.id : null,
    randomId: null
  };
  state.randomId = pickRandom(DATA.biases);

  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function t() { return I18N[state.lang]; }
  function pc(code) { return "var(--" + code.toLowerCase() + ")"; }
  function filtersActive() { return !!(state.q || state.proc || state.rob || state.ben); }

  function syncHash() {
    var v = "#" + state.lang + (state.view === "bias" && state.open ? "-" + state.open : "");
    if (location.hash !== v) { try { history.replaceState(null, "", v); } catch (e) { /* aperçu sandboxé */ } }
  }

  function matches(b) {
    if (state.proc && b.process !== state.proc) return false;
    if (state.rob && b.robustness !== state.rob) return false;
    if (state.ben && b.benson.problem !== state.ben) return false;
    if (!state.q) return true;
    var L = b[state.lang], hay = norm([b.fr.name, b.en.name, b.en.aka, L.definition].join(" "));
    return norm(state.q).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function results() { return DATA.biases.filter(matches); }

  /* ---------- en-tête, filtres ---------- */
  function renderStatic() {
    var T = t();
    document.documentElement.lang = state.lang;
    document.title = T.htmlTitle;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = T[el.getAttribute("data-i18n")]; });
    $("#q").placeholder = T.search;
    $(".lang").setAttribute("aria-label", T.langLabel);
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)); });
    var tot = DATA.biases.length, cnt = { replicated: 0, debated: 0, fragile: 0 };
    DATA.biases.forEach(function (b) { cnt[b.robustness]++; });
    var col = { replicated: "var(--ok-fg)", debated: "var(--mid-fg)", fragile: "var(--bad-fg)" };
    $("#tallybar").innerHTML = ROBS.map(function (r) { return '<span style="width:' + (cnt[r] / tot * 100) + "%;background:" + col[r] + '"></span>'; }).join("");
    $("#tallylist").innerHTML = ROBS.map(function (r) { return '<li><span class="sw" style="background:' + col[r] + '"></span><b>' + cnt[r] + "</b> " + T.robPl[r] + "</li>"; }).join("");
  }

  function options(list, current) {
    return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === current ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("");
  }
  function renderFilters() {
    var T = t(), L = state.lang;
    function n(f) { return DATA.biases.filter(f).length; }
    $("#sProc").innerHTML = options([["", T.all + " (" + DATA.biases.length + ")"]].concat(DATA.processes.map(function (p) {
      return [p.id, p[L].name + " (" + n(function (b) { return b.process === p.id; }) + ")"];
    })), state.proc);
    $("#sRob").innerHTML = options([["", T.allRob]].concat(ROBS.map(function (r) {
      return [r, T.rob[r] + " (" + n(function (b) { return b.robustness === r; }) + ")"];
    })), state.rob);
    $("#sBen").innerHTML = options([["", T.all]].concat(DATA.benson.problems.map(function (p) {
      return [p.id, p[L] + " (" + n(function (b) { return b.benson.problem === p.id; }) + ")"];
    })), state.ben);
    if ($("#q").value !== state.q) $("#q").value = state.q;
  }

  /* ---------- vues ---------- */
  var ICON = {
    dice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" class="f"/><circle cx="15.5" cy="15.5" r="1.2" class="f"/><circle cx="15.5" cy="8.5" r="1.2" class="f"/><circle cx="8.5" cy="15.5" r="1.2" class="f"/><circle cx="12" cy="12" r="1.2" class="f"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>'
  };
  function btn(action, label, icon, cls) {
    return '<button class="btn' + (cls ? " " + cls : "") + '" data-action="' + action + '">' + (icon ? ICON[icon] : "") + "<span>" + esc(label) + "</span></button>";
  }

  function fiche(b) {
    var T = t(), L = state.lang, O = L === "fr" ? "en" : "fr", d = b[L];
    var alt = T.otherName + "<i>" + esc(b[O].name) + "</i>" + (b.en.aka ? " · " + T.aka + " <i>" + esc(b.en.aka) + "</i>" : "");
    var ref = b.reference + (b.doi ? ' <a href="https://doi.org/' + esc(b.doi) + '" target="_blank" rel="noopener">https://doi.org/' + esc(b.doi) + "</a>" : "");
    return '<article class="fiche" style="--pc:' + pc(b.process) + '">' +
      '<div class="fhead">' +
        '<div class="tags"><span class="pill ' + b.robustness + '">' + T.rob[b.robustness] + "</span></div>" +
        '<h2 id="fiche-title" tabindex="-1">' + esc(d.name) + "</h2>" +
        '<p class="alt">' + alt + "</p>" +
        '<dl class="meta">' +
          "<div><dt>" + T.codex + "</dt><dd>" + esc(bProb[b.benson.problem][L]) + ' <span class="sep">›</span> ' + esc(bStrat[b.benson.strategy][L]) +
            (b.benson.listed ? "" : ' <span class="note">(' + T.proposed + ")</span>") + "</dd></div>" +
          "<div><dt>" + T.fProcess + '</dt><dd class="proc">' + esc(procById[b.process][L].name) + "</dd></div>" +
          "<div><dt>" + T.mechanism + "</dt><dd>" + esc(d.mechanism) + "</dd></div>" +
        "</dl>" +
      "</div>" +
      '<p class="def"><span class="sr">' + T.definition + " : </span>" + esc(d.definition) + "</p>" +
      '<div class="blocks">' +
        '<section class="ex"><h3>' + T.example + "</h3><p>" + esc(d.example) + "</p></section>" +
        "<section><h3>" + T.reference + '</h3><p class="ref">' + ref + "</p></section>" +
        "<section><h3>" + T.robustness + "</h3><p>" + esc(d.robustness_note) + "</p></section>" +
        "<section><h3>" + T.counter + "</h3><p>" + esc(d.countermeasures) + "</p></section>" +
        "<section><h3>" + T.related + '</h3><div class="rel">' + b.related.map(function (r) {
          var x = byId[r]; return '<button data-id="' + r + '" style="--pc:' + pc(x.process) + '">' + esc(x[L].name) + "</button>";
        }).join("") + "</div></section>" +
      "</div></article>";
  }

  function listHTML(items) {
    var T = t(), L = state.lang, html = "";
    DATA.processes.forEach(function (p) {
      var g = items.filter(function (b) { return b.process === p.id; });
      if (!g.length) return;
      html += '<section class="group" style="--pc:' + pc(p.id) + '"><div class="ghead"><span class="gdot"></span><div><h2>' + esc(p[L].name) + "</h2><p>" + esc(p[L].scope) + '</p></div></div><div class="grid">' +
        g.map(function (b) {
          return '<button class="card" data-id="' + b.id + '"><span class="pill ' + b.robustness + '">' + T.rob[b.robustness] + "</span><h4>" + esc(b[L].name) + "</h4><p>" + esc(b[L].definition) + "</p></button>";
        }).join("") + "</div></section>";
    });
    return html || '<p class="empty">' + T.empty + "</p>";
  }

  function neighbours() {
    var pool = results();
    var i = pool.findIndex(function (b) { return b.id === state.open; });
    if (i === -1) { pool = DATA.biases; i = pool.findIndex(function (b) { return b.id === state.open; }); }
    return { prev: pool[i - 1], next: pool[i + 1] };
  }

  function renderView() {
    var T = t(), tb = "", body = "";
    if (state.view === "random") {
      tb = '<p class="eyebrow">' + T.randomTitle + '</p><div class="actions">' + btn("random", T.another, "dice", "primary") + btn("browse", T.browse, "grid") + "</div>";
      body = fiche(byId[state.randomId]);
    } else if (state.view === "list") {
      var items = results();
      tb = '<p class="eyebrow">' + T.count(items.length) + '</p><div class="actions">' + (filtersActive() ? btn("reset", T.reset) : "") + btn("random", T.randomHere, "dice") + "</div>";
      body = listHTML(items);
    } else {
      var nb = neighbours();
      tb = '<div class="actions">' + btn("back", T.back, "back") + "</div>" +
        '<div class="actions">' +
        (nb.prev ? '<button class="btn ghost" data-id="' + nb.prev.id + '" aria-label="' + T.prev + '">' + ICON.back + "<span>" + esc(nb.prev[state.lang].name) + "</span></button>" : "") +
        (nb.next ? '<button class="btn ghost" data-id="' + nb.next.id + '" aria-label="' + T.next + '"><span>' + esc(nb.next[state.lang].name) + "</span>" + ICON.next + "</button>" : "") + "</div>";
      body = fiche(byId[state.open]);
    }
    $("#toolbar").innerHTML = tb;
    $("#toolbar").className = "toolbar " + state.view;
    $("#view").innerHTML = body;
  }

  function render() { renderStatic(); renderFilters(); renderView(); syncHash(); }
  function go(view, opts) {
    state.view = view;
    if (opts && opts.id) state.open = opts.id;
    renderView(); syncHash();
    if (opts && opts.scroll) {
      var top = $("#filters").getBoundingClientRect().top + window.scrollY - 12;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      var h2 = $("#fiche-title"); if (h2) h2.focus({ preventScroll: true });
    }
  }

  /* ---------- interactions ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("button"); if (!el) return;
    if (el.dataset.lang) { if (el.dataset.lang !== state.lang) { state.lang = el.dataset.lang; store("cognibias-lang", state.lang); render(); } return; }
    if (el.dataset.id) return go("bias", { id: el.dataset.id, scroll: true });
    var a = el.dataset.action;
    if (a === "random") { state.randomId = pickRandom(state.view === "list" ? results() : DATA.biases, state.view === "random" ? state.randomId : null); return go("random", { scroll: true }); }
    if (a === "browse") return go("list");
    if (a === "back") return go("list", { scroll: true });
    if (a === "reset") { state.q = state.proc = state.rob = state.ben = ""; renderFilters(); return go("list"); }
  });
  [["#sProc", "proc"], ["#sRob", "rob"], ["#sBen", "ben"]].forEach(function (p) {
    $(p[0]).addEventListener("change", function (e) { state[p[1]] = e.target.value; go("list"); });
  });
  $("#q").addEventListener("input", function (e) { state.q = e.target.value.trim(); go("list"); });
  document.addEventListener("keydown", function (e) {
    if (state.view !== "bias" || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    var nb = neighbours();
    if (e.key === "Escape") go("list", { scroll: true });
    if (e.key === "ArrowRight" && nb.next) go("bias", { id: nb.next.id });
    if (e.key === "ArrowLeft" && nb.prev) go("bias", { id: nb.prev.id });
  });
  window.addEventListener("hashchange", function () {
    var p = parseHash(); if (!p) return;
    var changed = p.lang !== state.lang; state.lang = p.lang;
    if (p.id && byId[p.id]) { state.view = "bias"; state.open = p.id; }
    if (changed) render(); else { renderView(); }
  });

  render();
})();

/* =========================================================================
   COURSE ENGINE — state, navigation, gating, time, quizzes, certificate, PDF
   ========================================================================= */
(function () {
  const RAW = window.COURSE;
  const { h } = window.ACT;
  const KEY = RAW.id;

  /* ---------------- storage (all reads/writes guarded) ---------------- */
  let store;
  try { store = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { store = null; }
  if (!store || store.v !== 1) store = { v: 1, name: "", role: null, fn: null, paths: {} };
  let saveTimer = null;
  function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode / full: keep working in memory */ } }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 150); }
  window.addEventListener("pagehide", saveNow);

  const pathKey = () => (store.role && store.fn ? store.role + "_" + store.fn : null);
  function P() {
    const k = pathKey(); if (!k) return null;
    if (!store.paths[k]) store.paths[k] = { cur: null, done: {}, act: {}, quiz: {}, refl: {}, scale: {}, choice: {}, checks: {}, final: {}, secs: 0 };
    return store.paths[k];
  }

  /* ---------------- variant + token resolution ---------------- */
  function pick(v, role, fn) {
    for (const k of [role + "_" + fn, role, fn, "_"]) if (Object.prototype.hasOwnProperty.call(v, k)) return v[k];
    return undefined;
  }
  function resolve(x, role, fn, tokens) {
    if (Array.isArray(x)) return x.map((y) => resolve(y, role, fn, tokens));
    if (x && typeof x === "object") {
      if (x.$v) return resolve(pick(x, role, fn), role, fn, tokens);
      if (x.$j) return x.$j.map((y) => resolve(y, role, fn, tokens)).join("");
      const o = {}; for (const k in x) o[k] = resolve(x[k], role, fn, tokens); return o;
    }
    if (typeof x === "string" && tokens) return x.replace(/\{(\w+)\}/g, (m, t) => (t in tokens ? tokens[t] : m));
    return x;
  }
  let C, STEPS;
  function build() {
    const role = store.role || "tl", fn = store.fn || "ops";
    const tokens = resolve(RAW.tokens, role, fn, null);
    C = resolve(Object.assign({}, RAW, { tokens: undefined }), role, fn, tokens);
    C.tokens = tokens;
    STEPS = [];
    C.modules.forEach((m, mi) => m.steps.forEach((s) => STEPS.push({ m, mi, s })));
  }
  const roleLabel = () => (RAW.roles.find((r) => r.id === store.role) || {}).label || "";
  const fnLabel = () => (RAW.functions.find((r) => r.id === store.fn) || {}).label || "";

  /* ---------------- gating ---------------- */
  function blockDone(b, p) {
    switch (b.t) {
      case "track": return !!pathKey();
      case "activity": return !!(p.act[b.a.id] && p.act[b.a.id].complete);
      case "reflect": { const r = p.refl[b.id]; return !!(r && r.submitted); }
      case "scale": return p.scale[b.id] != null;
      case "choice": return p.choice[b.id] != null;
      case "quiz": { const q = p.quiz[b.id]; return !!q && b.questions.every((_, i) => q.checked && q.checked[i]); }
      case "final": return !!(p.final && p.final.passed);
      default: return true;
    }
  }
  function stepDone(s) { const p = P(); return !!p && s.blocks.every((b) => blockDone(b, p)); }
  function refreshDone() {
    const p = P(); if (!p) return;
    // steps are marked done in gate() only when viewed; drop stale ids from an older data version
    Object.keys(p.done).forEach((id) => { if (!STEPS.some(({ s }) => s.id === id)) delete p.done[id]; });
    if (!p.completedAt && STEPS.every(({ s }) => p.done[s.id] || s.id === "cert")) p.completedAt = Date.now();
    save();
  }
  function unlocked(i) { const p = P(); if (i === 0) return true; if (!p) return false; for (let k = 0; k < i; k++) if (!p.done[STEPS[k].s.id]) return false; return true; }
  function curIndex() { const p = P(); if (!p || !p.cur) return 0; const i = STEPS.findIndex((x) => x.s.id === p.cur); return i < 0 ? 0 : i; }

  /* ---------------- time tracking (visible + active only, gaps ignored) ---------------- */
  let lastTick = Date.now(), lastInput = Date.now();
  ["pointerdown", "keydown", "scroll", "input", "touchstart"].forEach((ev) => window.addEventListener(ev, () => (lastInput = Date.now()), { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { lastTick = Date.now(); if (document.visibilityState === "hidden") saveNow(); });
  let secsSinceSave = 0;
  setInterval(() => {
    const now = Date.now(), d = now - lastTick; lastTick = now;
    const p = P(); if (!p) return;
    if (document.visibilityState !== "visible") return;   // backgrounded tab
    if (d > 5000) return;                                  // throttled timer / sleep / huge gap
    if (now - lastInput > 5 * 60 * 1000) return;           // idle > 5 min
    p.secs += d / 1000; secsSinceSave += d / 1000;
    if (secsSinceSave > 10) { secsSinceSave = 0; save(); }
    updateMeter();
  }, 1000);
  const fmtTime = (s) => { s = Math.round(s || 0); const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60); return hh ? `${hh}h ${String(mm).padStart(2, "0")}m` : `${mm} min`; };

  /* ---------------- layout ---------------- */
  const app = document.getElementById("app");
  let sidebar, mainEl, ringVal, meterTime, meterSub, trackTxt;
  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHEV = '<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const RING_C = 2 * Math.PI * 14;
  const openMods = new Set();          // sections the learner expanded (current one is always open)
  function shell() {
    app.innerHTML = "";
    const menu = h("button", { class: "menu-btn", text: "Contents", "aria-label": "Open course contents", onclick: () => { setHdr(); document.body.classList.toggle("nav-open"); } });
    meterTime = h("b"); meterSub = h("span"); trackTxt = h("span", { class: "trk" });
    const ring = h("span", { html: `<svg class="ring" viewBox="0 0 34 34" aria-hidden="true"><circle class="trk-c" cx="17" cy="17" r="14"/><circle class="val-c" cx="17" cy="17" r="14" stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}" transform="rotate(-90 17 17)"/></svg>` });
    ringVal = ring.querySelector(".val-c");
    app.append(
      h("header", { class: "topbar" },
        menu,
        h("div", { class: "brand" }, h("span", { class: "prog", text: RAW.program }), h("span", { class: "ttl", text: RAW.title }), trackTxt),
        h("div", { class: "spacer" }),
        h("div", { class: "meter", role: "progressbar", "aria-label": "Course progress", "aria-valuemin": "0", "aria-valuemax": "100" }, ring, h("span", { class: "mtxt" }, meterTime, meterSub))),
      h("div", { class: "layout" }, (sidebar = h("nav", { class: "sidebar", "aria-label": "Course content" })), (mainEl = h("main", { id: "main", tabindex: "-1" }))));
    if (window.ResizeObserver) new ResizeObserver(setHdr).observe(app.querySelector(".topbar"));
    window.addEventListener("resize", setHdr);
    document.addEventListener("click", (e) => { if (document.body.classList.contains("nav-open") && !e.target.closest(".sidebar") && !e.target.closest(".menu-btn")) document.body.classList.remove("nav-open"); });
  }
  // mobile drawer sits under the header
  function setHdr() { const t = app.querySelector(".topbar"); if (t) document.documentElement.style.setProperty("--hdr", t.offsetHeight + "px"); }
  const pctDone = () => { const p = P(); return p ? Math.round((STEPS.filter(({ s }) => p.done[s.id]).length / STEPS.length) * 100) : 0; };
  function updateMeter() {
    const p = P(); const pct = pctDone();
    ringVal.setAttribute("stroke-dashoffset", RING_C * (1 - pct / 100));
    ringVal.closest(".meter").setAttribute("aria-valuenow", pct);
    meterTime.textContent = `${pct}% complete`;
    meterSub.textContent = p ? `${fmtTime(p.secs)} invested` : "Your progress";
    const t = pathKey() ? `${roleLabel()} · ${fnLabel()}` : "";
    if (trackTxt.textContent !== t) { trackTxt.textContent = t; setHdr(); }
    const ss = sidebar && sidebar.querySelector(".side-h .ss"); if (ss) ss.textContent = `${pct}% complete · ${p ? fmtTime(p.secs) : "0 min"} invested`;
    const sb = sidebar && sidebar.querySelector(".side-h .sbar i"); if (sb) sb.style.width = pct + "%";
  }
  // what kind of lesson a step is, shown under its title (like "Video · 4 min" on course platforms)
  function lessonType(s) {
    const t = s.blocks.map((b) => (b.t === "activity" ? "activity:" + b.a.type : b.t));
    if (t.includes("final")) return "Graded knowledge check";
    if (t.includes("cert")) return "Certificate";
    if (t.includes("quiz")) return "Quiz";
    if (t.includes("activity:sim")) return "Simulation";
    if (t.some((x) => x.startsWith("activity:"))) return "Activity";
    if (t.includes("reflect") || t.includes("scale")) return "Exercise";
    return "Reading";
  }
  function renderSidebar() {
    const p = P(); const ci = curIndex(); const pct = pctDone();
    sidebar.innerHTML = "";
    sidebar.append(h("div", { class: "side-h" },
      h("div", { class: "st", text: "Course content" }),
      h("div", { class: "ss", text: `${pct}% complete · ${p ? fmtTime(p.secs) : "0 min"} invested` }),
      h("div", { class: "sbar", "aria-hidden": "true" }, h("i", { style: `width:${pct}%` }))));
    const list = h("ol", { class: "mods" });
    let gi = 0;
    C.modules.forEach((m) => {
      const first = gi, idxs = m.steps.map(() => gi++);
      const doneN = p ? m.steps.filter((s) => p.done[s.id]).length : 0;
      const isCur = idxs.includes(ci);
      const open = isCur || openMods.has(m.id);
      const li = h("li", { class: "mod" + (isCur ? " cur" : "") + (open ? " open" : "") });
      const row = h("button", { class: "mod-row", "aria-expanded": open ? "true" : "false", onclick: () => { if (isCur) return; openMods.has(m.id) ? openMods.delete(m.id) : openMods.add(m.id); renderSidebar(); } },
        h("span", { class: "mod-num" + (m.num ? "" : " blank"), "aria-hidden": "true", text: m.num }),
        h("span", { class: "mod-t" }, h("span", { class: "mt", text: m.num ? m.title : m.title }), h("span", { class: "ms", text: `${doneN} / ${m.steps.length} · ${m.minutes} min` })),
        h("span", { html: CHEV }));
      if (isCur) row.disabled = false;
      li.append(row);
      if (open) {
        const ol = h("ol", { class: "steps" });
        m.steps.forEach((s, k) => {
          const i = idxs[k], ok = unlocked(i), dn = p && p.done[s.id];
          ol.append(h("li", {}, h("button", { class: "step" + (dn ? " done" : "") + (i === ci ? " cur" : ""), disabled: !ok, "aria-current": i === ci ? "step" : null, onclick: () => go(i) },
            h("span", { class: "dot", "aria-hidden": "true", html: dn ? CHECK : "" }),
            h("span", { class: "stx" }, h("span", { text: s.title }), h("span", { class: "stype", text: lessonType(s) })),
            dn ? h("span", { class: "sr-only", text: " (completed)" }) : null)));
        });
        li.append(ol);
      }
      list.append(li);
    });
    sidebar.append(list);
    const foot = h("div", { class: "side-foot" });
    if (pathKey()) {
      const sc = scores();
      foot.append(h("div", { class: "kv" },
        h("div", {}, h("span", { text: "Time invested" }), h("b", { text: fmtTime(p.secs) })),
        h("div", {}, h("span", { text: "Knowledge check" }), h("b", { text: sc.final != null ? sc.final + "%" : "—" }))));
      foot.append(h("div", {}, "Path: ", h("strong", { text: `${roleLabel()} · ${fnLabel()}` }), " · ", h("button", { class: "linkbtn", text: "Change", onclick: () => go(0) })));
      foot.append(h("button", { class: "linkbtn", text: "Download PDF of my answers", onclick: downloadPDF }));
      foot.append(h("button", { class: "linkbtn", text: "Reset progress on this path", onclick: () => {
        if (!confirm(`Reset all progress, answers and time for the ${roleLabel()} · ${fnLabel()} path? This can't be undone.`)) return;
        delete store.paths[pathKey()]; saveNow(); go(0);
      } }));
    }
    foot.append(h("div", { class: "note", style: "font-size:11.5px;margin-top:6px", text: RAW.copyright }));
    sidebar.append(foot);
  }

  function go(i) {
    const p = P();
    if (!unlocked(i)) return;
    if (p) { p.cur = STEPS[i].s.id; save(); }
    document.body.classList.remove("nav-open");
    render(); window.scrollTo(0, 0); mainEl.focus({ preventScroll: true });
  }

  /* ---------------- step rendering ---------------- */
  let gateEl, nextBtn;
  function render() {
    build(); refreshDone();
    const i = curIndex(); const { m, s } = STEPS[i];
    renderSidebar(); updateMeter();
    mainEl.innerHTML = "";
    const page = h("div", { class: "page" });
    if (!(s.blocks[0] && s.blocks[0].t === "hero")) {
      const k = m.steps.indexOf(s);
      page.append(h("div", { class: "crumb" },
        h("b", { text: m.num ? `Module ${m.num}` : m.title }), m.num ? h("span", { text: m.title.split(":")[0] }) : null,
        h("span", { class: "sep", text: "•" }), h("span", { text: `Lesson ${k + 1} of ${m.steps.length}` })),
        h("h1", { class: "step-title", html: s.title }));
    }
    s.blocks.forEach((b, bi) => { const el = renderBlock(b, s.blocks[bi + 1]); if (el) page.append(h("div", { class: "block" }, el)); });
    const prev = h("button", { class: "btn ghost", text: "← Previous", disabled: i === 0, onclick: () => go(i - 1) });
    gateEl = h("span", { class: "gate" });
    const last = i === STEPS.length - 1;
    nextBtn = h("button", { class: "btn", text: "Next →", onclick: () => { if (!last) go(i + 1); } });
    const nextWrap = h("div", { class: "next-wrap" });
    if (!last) nextWrap.append(h("div", { class: "upnext" }, h("span", { text: "Up next" }), h("b", { text: STEPS[i + 1].s.title })), nextBtn);
    mainEl.append(page, h("div", { class: "step-nav" }, prev, gateEl, nextWrap));
    gate();
  }
  function gate() {
    const i = curIndex(); const { s } = STEPS[i]; const p = P();
    const done = stepDone(s);
    if (done && p && !p.done[s.id]) { p.done[s.id] = true; save(); renderSidebar(); updateMeter(); }
    nextBtn.disabled = !done;
    if (done) gateEl.textContent = "";
    else {
      const b = s.blocks.find((b) => !blockDone(b, p || {}));
      const why = { track: "Choose your role and function to begin.", activity: "Complete the activity to continue.", reflect: "Submit your answer to continue.", scale: "Pick a number on the scale to continue.", choice: "Make a choice to continue.", quiz: "Check each answer to continue.", final: "Pass the Knowledge Check to continue." };
      gateEl.textContent = why[b && b.t] || "";
    }
  }
  function onChange() { save(); gate(); }

  function renderBlock(b, next) {
    const p = P();
    switch (b.t) {
      case "p": return h("p", { html: b.html });
      case "lead": return h("p", { class: "lead", html: b.html });
      case "h3": return h("h3", { html: b.text });
      case "quote": return h("div", { class: "quote", html: "“" + b.text + "”" });
      case "flow": return h("div", { class: "flow" }, b.items.flatMap((t, i) => (i ? [h("span", { class: "arr", text: "→" }), h("span", { text: t })] : [h("span", { text: t })])));
      case "callout": return h("div", { class: "callout " + (b.kind || "") }, b.title ? h("div", { class: "ct", html: b.title }) : null, h("div", { html: b.html }));
      case "cards": return h("div", { class: "cards", style: `--cols: ${b.cols || 3}` }, b.items.map((c) => h("div", { class: "card" + (c.tone ? " tone-" + c.tone : "") }, b.numbered && c.k ? h("div", { class: "num", text: c.k }) : null, h("h4", { html: c.title }), h("div", { class: "t", html: c.text }))));
      case "compare": return h("div", { class: "compare" }, h("div", { class: "row hd" }, h("div", { html: b.left }), h("div", { html: b.right })), b.rows.map((r) => h("div", { class: "row" }, h("div", { html: r[0] }), h("div", { html: r[1] }))));
      case "example": return h("div", { class: "example" }, b.rows.map((r) => h("div", { class: "er" }, h("div", { class: "lab", text: r[0] }), h("div", { class: "tx", html: r[1] }))));
      case "warnlist": return h("div", { class: "warnlist" }, b.items.map((t) => h("div", { html: t })));
      case "reveal": { const box = h("div", { class: "callout key", style: "display:none", html: b.html }); const btn = h("button", { class: "btn secondary", text: b.button, onclick: () => { box.style.display = ""; btn.remove(); } }); return h("div", {}, btn, box); }
      case "checklist": {
        p.checks.list = p.checks.list || {};
        return h("div", {}, h("div", { class: "checklist" }, b.items.map((t, i) => { const cb = h("input", { type: "checkbox" }); cb.checked = !!p.checks.list[i]; cb.addEventListener("change", () => { p.checks.list[i] = cb.checked; save(); }); return h("label", {}, cb, h("span", { text: t })); })),
          h("div", { class: "btn-row" }, h("button", { class: "btn secondary", text: "Print this checklist", onclick: () => window.print() })));
      }
      case "track": return trackPicker();
      case "hero": return hero();
      case "panelStart": return null;
      case "name": return nameField();
      case "scale": return scale(b);
      case "choice": return choice(b);
      case "reflect": return reflect(b);
      case "decide": return decide();
      case "activity": return activity(b.a, next && next.t === "coachSim" ? next.items : null);
      case "coachSim": return null;
      case "quiz": return quiz(b);
      case "final": return finalCheck(b);
      case "closing": return closing();
      case "cert": return certificate();
    }
    return null;
  }

  function hero() {
    const audience = pathKey() ? `${roleLabel()}s · ${fnLabel()}` : "Team Leaders and Managers · RCM Operations and Non-Ops";
    const meta = (k, v) => h("div", { class: "hm" }, h("span", { text: k }), h("b", { text: v }));
    return h("section", { class: "hero" },
      h("div", { class: "hk", text: "Self-paced course · " + RAW.program }),
      h("h1", { class: "ht", text: RAW.title }),
      h("p", { class: "hs", text: RAW.subtitle }),
      h("div", { class: "hmeta" }, meta("Audience", audience), meta("Seat time", "About 60 minutes"), meta("Modules", `${C.modules.filter((m) => m.num).length} + certificate`), meta("Pass mark", `${C.passMark}% knowledge check`)));
  }
  function trackPicker() {
    const box = h("div", { class: "panel" }, h("div", { class: "pt", text: "Choose your path" }),
      h("div", { class: "pi", text: "The examples, scenarios, simulation and quiz questions are written for your role and function. Your progress is saved separately for each path, so you can switch later without losing anything." }));
    const grid = h("div", { class: "track-grid" });
    const group = (title, list, keyName) => h("div", { role: "group", "aria-label": title }, h("div", { class: "grp-t", text: title }),
      list.map((o) => h("button", { class: "opt-card", "aria-pressed": store[keyName] === o.id ? "true" : "false", onclick: () => {
        store[keyName] = o.id; saveNow();
        const p = P(); if (p && !p.cur) p.cur = STEPS[0].s.id;
        render();
      } }, h("b", { text: o.label }), h("span", { text: o.desc }))));
    grid.append(group("My role", RAW.roles, "role"), group("My function", RAW.functions, "fn"));
    box.append(grid);
    if (pathKey()) box.append(h("div", { class: "msg ok", text: `You're on the ${roleLabel()} · ${fnLabel()} path.` }));
    return box;
  }
  function nameField() {
    const inp = h("input", { type: "text", id: "learner-name", autocomplete: "name", placeholder: "e.g. Alex Morgan", maxlength: "60" }); inp.value = store.name || "";
    inp.addEventListener("input", () => { store.name = inp.value; save(); });
    return h("div", { class: "field" }, h("label", { for: "learner-name", text: "Your name (for your certificate — you can add it later)" }), inp);
  }
  function scale(b) {
    const p = P();
    const wrap = h("div", { class: "panel" }, h("div", { class: "pt", html: b.prompt }));
    const row = h("div", { class: "scale", role: "radiogroup", "aria-label": "Confidence 1 to 5" });
    const cmp = h("div");
    const paint = () => {
      row.querySelectorAll("button").forEach((btn, i) => btn.setAttribute("aria-pressed", p.scale[b.id] === i + 1 ? "true" : "false"));
      cmp.innerHTML = "";
      if (b.compare && p.scale[b.id] != null && p.scale[b.compare] != null) {
        const d = p.scale[b.id] - p.scale[b.compare];
        cmp.append(h("div", { class: "msg ok", text: `At the start you chose ${p.scale[b.compare]}. Now: ${p.scale[b.id]} (${d > 0 ? "+" + d : d === 0 ? "no change" : d}). That gap — or lack of one — is useful information either way.` }));
      }
    };
    b.labels.forEach((l, i) => row.append(h("button", { onclick: () => { p.scale[b.id] = i + 1; paint(); onChange(); } }, h("b", { text: String(i + 1) }), h("span", { text: l }))));
    wrap.append(row, cmp); paint();
    return wrap;
  }
  function choice(b) {
    const p = P();
    const wrap = h("div", { class: "panel" }, h("div", { class: "pt", html: b.prompt }));
    const row = h("div", { class: "cards", style: `--cols:${b.options.length}` });
    b.options.forEach((o) => row.append(h("button", { class: "opt-card", "aria-pressed": p.choice[b.id] === o ? "true" : "false", onclick: (e) => { p.choice[b.id] = o; row.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === e.currentTarget ? "true" : "false")); onChange(); } }, h("b", { text: o }))));
    wrap.append(row);
    return wrap;
  }
  // Answers must be the learner's own words: block paste / drag-drop into answer boxes.
  function noPaste(ta, msg) {
    const stop = (e) => { e.preventDefault(); msg.className = "msg err"; msg.textContent = "Pasting is turned off here — please type your answer in your own words."; };
    ta.addEventListener("paste", stop);
    ta.addEventListener("drop", stop);
    ta.addEventListener("beforeinput", (e) => { if (/^insertFrom(Paste|Drop|Yank)/.test(e.inputType || "")) stop(e); });
    ta.setAttribute("autocomplete", "off"); ta.setAttribute("spellcheck", "true");
  }
  function reflect(b) {
    const p = P();
    const r = (p.refl[b.id] = p.refl[b.id] || { v: {}, sc: {} });
    const wrap = h("div", { class: "panel" }, h("div", { class: "pt", html: b.title || "Your answer" }));
    if (b.intro) wrap.append(h("div", { class: "pi", html: b.intro }));
    const msg = h("div", { class: "msg", role: "status", "aria-live": "polite" });
    const fields = b.fields.map((fd) => {
      const id = `f_${b.id}_${fd.id}`;
      const ta = h("textarea", { id, rows: fd.rows || 3, placeholder: fd.placeholder || "" }); ta.value = r.v[fd.id] || "";
      const box = h("div", { class: "field" }, h("label", { for: id, html: fd.label }), ta);
      ta.addEventListener("input", () => { r.v[fd.id] = ta.value; box.classList.remove("err"); save(); });
      noPaste(ta, msg);
      wrap.append(box); return { fd, ta, box };
    });
    if (b.note) wrap.append(h("p", { class: "note", html: b.note }));
    const after = h("div");
    const showAfter = () => {
      after.innerHTML = "";
      if (!r.submitted) return;
      if (b.selfcheck) after.append(h("div", { class: "selfcheck" }, h("div", { class: "ct", text: "Self-check" }), b.selfcheck.map((t, i) => { const cb = h("input", { type: "checkbox" }); cb.checked = !!r.sc[i]; cb.addEventListener("change", () => { r.sc[i] = cb.checked; save(); }); return h("label", {}, cb, h("span", { html: t })); })));
      if (b.model) after.append(h("div", { class: "model" }, h("div", { class: "ct", html: b.model.title }), h("div", { html: b.model.html })));
    };
    const submit = h("button", { class: "btn", text: r.submitted ? "Update my answer" : "Submit my answer" });
    submit.addEventListener("click", () => {
      const thin = (v) => v.trim().length < 10 || v.trim().split(/\s+/).length < 3;   // needs a real sentence, not "ok"
      const empty = fields.filter(({ ta }) => thin(ta.value));
      if (empty.length) {
        empty.forEach(({ box }) => box.classList.add("err"));
        msg.className = "msg err"; msg.textContent = `✕ Add a sentence or two in your own words to ${empty.length === 1 ? "the highlighted box" : "each highlighted box"} before continuing.`;
        empty[0].ta.focus(); return;
      }
      fields.forEach(({ fd, ta }) => (r.v[fd.id] = ta.value));
      r.submitted = true; submit.textContent = "Update my answer";
      msg.className = "msg ok"; msg.textContent = "✓ Saved. " + (b.model ? "Compare yours with the example below." : "");
      showAfter(); onChange();
    });
    wrap.append(h("div", { class: "btn-row" }, submit), msg, after);
    showAfter();
    return wrap;
  }
  function decide() {
    const d = C.decide; if (!d) return null;
    return h("div", { class: "panel" }, h("div", { class: "pt", html: d.title }),
      h("div", { class: "cards", style: "--cols:2;margin-top:10px" },
        h("div", { class: "card tone-good" }, h("h4", { text: "Yours to decide — then inform" }), h("ul", { style: "margin:0;padding-left:18px" }, d.own.map((t) => h("li", { html: t })))),
        h("div", { class: "card" }, h("h4", { text: "Escalate — with a recommendation" }), h("ul", { style: "margin:0;padding-left:18px" }, d.up.map((t) => h("li", { html: t }))))),
      h("p", { class: "note", style: "margin:12px 0 0", html: d.tip }));
  }
  function activity(a, coachExtra) {
    const p = P();
    if (coachExtra && !a.coach) a = Object.assign({}, a, { coach: coachExtra });
    const st = (p.act[a.id] = p.act[a.id] || {});
    const root = h("section", { class: "act", "aria-label": a.title.replace(/<[^>]+>/g, "") });
    const api = { save: () => save(), complete: () => { st.complete = true; st.completedAt = Date.now(); onChange(); }, isDone: () => !!st.complete };
    window.ACT[a.type](root, a, st, api);
    return root;
  }

  /* ---------------- quizzes ---------------- */
  const letters = "ABCD";
  // option order is shuffled once per learner and saved (answers are stored as original indexes)
  function optOrder(key, n, fresh) {
    const p = P(); p.qord = p.qord || {};
    let o = p.qord[key];
    if (fresh || !o || o.length !== n) { o = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } p.qord[key] = o; save(); }
    return o;
  }
  function quiz(b) {
    const p = P();
    const q = (p.quiz[b.id] = p.quiz[b.id] || { ans: {}, checked: {} });
    const wrap = h("div");
    const summary = h("div");
    const paintSummary = () => {
      summary.innerHTML = "";
      if (b.questions.every((_, i) => q.checked[i])) {
        const n = b.questions.filter((qq, i) => q.ans[i] === qq.a).length;
        summary.append(h("div", { class: "score" + (n === b.questions.length ? " pass" : "") }, h("div", { class: "pct", text: `${n}/${b.questions.length}` }), h("div", {}, h("strong", { text: "Check for Understanding complete. " }), "This score counts toward your course summary. Explanations for each question are above.")));
      }
    };
    b.questions.forEach((qq, i) => {
      const box = h("div", { class: "q" + (q.checked[i] ? " locked" : "") });
      box.append(h("div", { class: "qn", text: `Question ${i + 1} of ${b.questions.length}` }), h("div", { class: "qt", html: qq.q }));
      const opts = h("div", { class: "opts", role: "radiogroup" });
      const fb = h("div");
      const btn = h("button", { class: "btn", text: "Check answer" });
      const paint = () => {
        opts.querySelectorAll(".opt").forEach((o) => {
          const oi = +o.dataset.oi;
          o.className = "opt" + (q.checked[i] ? (oi === qq.a ? " right" : oi === q.ans[i] ? " wrongpick" : "") : q.ans[i] === oi ? " picked" : "");
          o.querySelector("input").checked = q.ans[i] === oi; o.querySelector("input").disabled = !!q.checked[i];
        });
        btn.style.display = q.checked[i] ? "none" : ""; btn.disabled = q.ans[i] == null;
        fb.innerHTML = "";
        if (q.checked[i]) { const ok = q.ans[i] === qq.a; fb.append(h("div", { class: "fb " + (ok ? "good" : "bad") }, h("b", { text: ok ? "✓ Correct" : `✕ Not quite — the answer is ${letters[ord.indexOf(qq.a)]}` }), h("span", { html: qq.why }))); }
      };
      const ord = optOrder(`${b.id}_${i}`, qq.o.length);
      ord.forEach((oi, pos) => {
        const o = qq.o[oi];
        const inp = h("input", { type: "radio", name: `${b.id}_${i}` });
        const lab = h("label", { class: "opt", "data-oi": oi }, inp, h("span", {}, h("strong", { text: letters[pos] + ". " }), h("span", { html: o })));
        inp.addEventListener("change", () => { if (q.checked[i]) return; q.ans[i] = oi; save(); paint(); });
        opts.append(lab);
      });
      btn.addEventListener("click", () => { if (q.ans[i] == null) return; q.checked[i] = true; box.classList.add("locked"); paint(); paintSummary(); onChange(); });
      box.append(opts, h("div", { class: "btn-row" }, btn), fb);
      wrap.append(box); paint();
    });
    wrap.append(summary); paintSummary();
    return wrap;
  }
  function finalCheck(b) {
    const p = P();
    const F = p.final; F.ans = F.ans || {}; F.attempts = F.attempts || 0;
    const wrap = h("div");
    const qs = []; const msg = h("div", { class: "msg", role: "status", "aria-live": "polite" });
    const result = h("div");
    const submitted = () => F.last != null && F.reviewing;
    b.questions.forEach((qq, i) => {
      const box = h("div", { class: "q" }, h("div", { class: "qn", text: `Question ${i + 1} of ${b.questions.length}` }), h("div", { class: "qt", html: qq.q }));
      const opts = h("div", { class: "opts" }); const fb = h("div");
      optOrder(`final_${i}`, qq.o.length).forEach((oi, pos) => {
        const o = qq.o[oi];
        const inp = h("input", { type: "radio", name: `fin_${i}` });
        const lab = h("label", { class: "opt", "data-oi": oi }, inp, h("span", {}, h("strong", { text: letters[pos] + ". " }), h("span", { html: o })));
        inp.addEventListener("change", () => { if (submitted()) return; F.ans[i] = oi; box.classList.remove("unans"); save(); paint(); });
        opts.append(lab);
      });
      box.append(opts, fb); wrap.append(box); qs.push({ box, opts, fb, qq });
    });
    const submit = h("button", { class: "btn", text: "Submit Knowledge Check" });
    const retake = h("button", { class: "btn secondary", text: "Retake the Knowledge Check" });
    function paint() {
      const rev = submitted();
      qs.forEach(({ box, opts, fb, qq }, i) => {
        box.classList.toggle("locked", rev);
        opts.querySelectorAll(".opt").forEach((o) => {
          const oi = +o.dataset.oi;
          const inp = o.querySelector("input"); inp.checked = F.ans[i] === oi; inp.disabled = rev;
          let c = "opt";
          if (rev) { if (F.ans[i] === oi) c += F.ans[i] === qq.a ? " right" : " wrongpick"; else if (F.passed && oi === qq.a) c += " right"; }
          else if (F.ans[i] === oi) c += " picked";
          o.className = c;
        });
        fb.innerHTML = "";
        if (rev) { const ok = F.ans[i] === qq.a; fb.append(h("div", { class: "fb " + (ok ? "good" : "bad") }, h("b", { text: ok ? "✓ Correct" : "✕ Incorrect" }), h("span", { html: ok || F.passed ? qq.why : "Review the related module before retaking." }))); }
      });
      submit.style.display = rev ? "none" : ""; retake.style.display = rev && !F.passed ? "" : "none";
      result.innerHTML = "";
      if (F.last != null) {
        result.append(h("div", { class: "score" + (F.passed ? " pass" : "") }, h("div", { class: "pct", text: F.last + "%" }),
          h("div", {}, h("strong", { text: F.passed ? "Passed — well done. " : `Not yet — you need ${C.passMark}%. ` }),
            `Attempt ${F.attempts}. Best score: ${F.best}%.` + (F.passed ? " Your certificate is unlocked." : " Incorrect answers are marked below; the correct answers are revealed once you pass."))));
      }
    }
    submit.addEventListener("click", () => {
      const missing = b.questions.map((_, i) => i).filter((i) => F.ans[i] == null);
      if (missing.length) {
        msg.className = "msg err"; msg.textContent = `✕ ${missing.length} question${missing.length > 1 ? "s are" : " is"} unanswered (${missing.map((i) => "Q" + (i + 1)).join(", ")}). Answer every question before submitting.`;
        missing.forEach((i) => qs[i].box.classList.add("unans")); qs[missing[0]].box.scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
      msg.textContent = ""; msg.className = "msg";
      const n = b.questions.filter((qq, i) => F.ans[i] === qq.a).length;
      F.attempts++; F.last = Math.round((n / b.questions.length) * 100); F.best = Math.max(F.best || 0, F.last);
      if (F.last >= C.passMark) { F.passed = true; F.passedAt = F.passedAt || Date.now(); }
      F.reviewing = true; F.history = (F.history || []).concat({ at: Date.now(), score: F.last });
      paint(); onChange(); result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    retake.addEventListener("click", () => { F.ans = {}; F.reviewing = false; b.questions.forEach((qq, i) => optOrder(`final_${i}`, qq.o.length, true)); saveNow(); render(); window.scrollTo(0, 0); });
    if (F.passed) F.reviewing = true;
    wrap.prepend(result);
    wrap.append(msg, h("div", { class: "btn-row" }, submit, retake));
    paint();
    return wrap;
  }

  function closing() {
    return h("div", { class: "closing" }, h("h3", { text: "Communication is leadership" }),
      h("div", { class: "ln" },
        h("span", { text: "Don't just report the situation." }), h("b", { text: "FRAME IT." }),
        h("span", { text: "Don't just share the information." }), h("b", { text: "INTERPRET IT." }),
        h("span", { text: "Don't avoid the difficult conversation." }), h("b", { text: "STRUCTURE IT." })),
      h("p", { style: "margin:0", text: "The goal isn't to communicate more. It's to communicate with more intention. Lead the conversation — don't just participate in it." }));
  }

  /* ---------------- scores roll-up ---------------- */
  function scores() {
    const p = P(); const rows = []; let got = 0, tot = 0;
    C.modules.forEach((m) => m.steps.forEach((s) => s.blocks.forEach((b) => {
      if (b.t !== "quiz") return;
      const q = p.quiz[b.id] || { ans: {}, checked: {} };
      const answered = b.questions.every((_, i) => q.checked && q.checked[i]);
      const n = b.questions.filter((qq, i) => q.checked && q.checked[i] && q.ans[i] === qq.a).length;
      rows.push({ label: `Module ${m.num} · Check for Understanding`, n, t: b.questions.length, answered }); got += n; tot += b.questions.length;
    })));
    return { rows, got, tot, cfuPct: tot ? Math.round((got / tot) * 100) : 0, final: p.final && p.final.best != null ? p.final.best : null, passed: !!(p.final && p.final.passed) };
  }

  /* ---------------- certificate ---------------- */
  function certificate() {
    const p = P(); const sc = scores();
    const wrap = h("div");
    wrap.append(h("div", { class: "stats" },
      h("div", { class: "stat" }, h("div", { class: "sv", text: fmtTime(p.secs) }), h("div", { class: "sl", text: "Time invested" })),
      h("div", { class: "stat" }, h("div", { class: "sv", text: sc.final != null ? sc.final + "%" : "—" }), h("div", { class: "sl", text: "Knowledge Check (best)" })),
      h("div", { class: "stat" }, h("div", { class: "sv", text: sc.cfuPct + "%" }), h("div", { class: "sl", text: `Checks for Understanding (${sc.got}/${sc.tot})` }))));
    const tbl = h("table", { class: "rollup" }, h("thead", {}, h("tr", {}, h("th", { text: "Assessment" }), h("th", { text: "Score" }))),
      h("tbody", {}, sc.rows.map((r) => h("tr", {}, h("td", { text: r.label }), h("td", { text: r.answered ? `${r.n}/${r.t}` : "Not completed" }))),
        h("tr", {}, h("td", {}, h("strong", { text: "Final Knowledge Check (graded)" })), h("td", {}, h("strong", { text: sc.final != null ? `${sc.final}%${sc.passed ? " · Passed" : ""}` : "Not attempted" })))));
    wrap.append(tbl);
    const panel = h("div", { class: "panel", style: "margin-top:20px" });
    const inp = h("input", { type: "text", id: "cert-name", autocomplete: "name", maxlength: "60", placeholder: "Your full name" }); inp.value = store.name || "";
    const fieldBox = h("div", { class: "field" }, h("label", { for: "cert-name", text: "Name as it should appear on your certificate" }), inp);
    const msg = h("div", { class: "msg", role: "status", "aria-live": "polite" });
    const canvas = h("canvas", { width: 2000, height: 1414, "aria-label": "Certificate preview" });
    const dl = h("button", { class: "btn", text: "Download certificate (PNG)" });
    const pdfBtn = h("button", { class: "btn secondary", text: "Download PDF of my answers" });
    pdfBtn.addEventListener("click", downloadPDF);
    panel.append(h("div", { class: "pt", text: "Your certificate" }));
    if (!sc.passed) {
      panel.append(h("p", { class: "note", text: `Your certificate unlocks when you pass the Final Knowledge Check (${C.passMark}%).` }), h("div", { class: "btn-row" }, pdfBtn));
      wrap.append(panel); return wrap;
    }
    let t = null;
    inp.addEventListener("input", () => { store.name = inp.value; save(); fieldBox.classList.remove("err"); clearTimeout(t); t = setTimeout(() => drawCert(canvas), 200); });
    dl.addEventListener("click", async () => {
      if (!(store.name || "").trim()) { fieldBox.classList.add("err"); msg.className = "msg err"; msg.textContent = "✕ Enter your name first — it's printed on the certificate."; inp.focus(); return; }
      msg.className = "msg"; msg.textContent = "";
      await drawCert(canvas);
      canvas.toBlob((blob) => {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = `Certificate - ${RAW.title} - ${store.name.trim()}.png`.replace(/[\\/:*?"<>|]/g, "");
        document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        msg.className = "msg ok"; msg.textContent = "✓ Certificate downloaded.";
      }, "image/png");
    });
    panel.append(fieldBox, h("div", { class: "cert-wrap" }, canvas), h("div", { class: "btn-row" }, dl, pdfBtn), msg);
    wrap.append(panel);
    drawCert(canvas);
    return wrap;
  }
  async function drawCert(cv) {
    try { await Promise.all(["400 40px", "600 40px", "700 40px", "italic 400 40px"].map((f) => document.fonts.load(`${f} "Proxima Nova"`))); } catch (e) {}
    const p = P(); const sc = scores();
    const ctx = cv.getContext("2d"); const W = cv.width, H = cv.height;
    const F = (w, s, it) => `${it ? "italic " : ""}${w} ${s}px "Proxima Nova", "Helvetica Neue", Arial, sans-serif`;
    const spaced = (on) => { if ("letterSpacing" in ctx) ctx.letterSpacing = on ? "8px" : "0px"; };
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#0B2545"; ctx.fillRect(0, 0, W, 28); ctx.fillRect(0, H - 28, W, 28);
    ctx.strokeStyle = "#D1DBE5"; ctx.lineWidth = 4; ctx.strokeRect(70, 90, W - 140, H - 180);
    ctx.strokeStyle = "#1AA0A6"; ctx.lineWidth = 2; ctx.strokeRect(90, 110, W - 180, H - 220);
    const bars = ["#1D5F8A", "#1AA0A6", "#2E9063", "#0F6E80"]; bars.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(W / 2 - 160 + i * 80, 170, 70, 10); });
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    spaced(true); ctx.fillStyle = "#0F6E73"; ctx.font = F(700, 34); ctx.fillText(RAW.program.toUpperCase(), W / 2, 250);
    spaced(false); ctx.fillStyle = "#0B2545"; ctx.font = F(700, 96); ctx.fillText("Certificate of Completion", W / 2, 370);
    ctx.fillStyle = "#5A6878"; ctx.font = F(400, 38, true); ctx.fillText("This certifies that", W / 2, 470);
    const name = (store.name || "").trim() || "Your Name";
    let ns = 110; ctx.font = F(700, ns); while (ctx.measureText(name).width > W - 400 && ns > 50) { ns -= 4; ctx.font = F(700, ns); }
    ctx.fillStyle = (store.name || "").trim() ? "#1B1924" : "#AAA7BA"; ctx.fillText(name, W / 2, 600);
    ctx.strokeStyle = "#1AA0A6"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 520, 640); ctx.lineTo(W / 2 + 520, 640); ctx.stroke();
    ctx.fillStyle = "#5A6878"; ctx.font = F(400, 38, true); ctx.fillText("has successfully completed", W / 2, 715);
    ctx.fillStyle = "#0B2545"; ctx.font = F(700, 72); ctx.fillText(RAW.title, W / 2, 810);
    spaced(true); ctx.fillStyle = "#1D5F8A"; ctx.font = F(600, 30); ctx.fillText(`${roleLabel()} · ${fnLabel()}`.toUpperCase(), W / 2, 870); spaced(false);
    const doneAt = (p.final && p.final.passedAt) || Date.now();
    const cols = [["TIME INVESTED", fmtTime(p.secs)], ["KNOWLEDGE CHECK", (sc.final != null ? sc.final : 0) + "%"], ["DATE COMPLETED", new Date(doneAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })]];
    const cw = 480, x0 = W / 2 - cw;
    cols.forEach(([l, v], i) => {
      const x = x0 + i * cw;
      if (i) { ctx.strokeStyle = "#D1DBE5"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - cw / 2, 975); ctx.lineTo(x - cw / 2, 1105); ctx.stroke(); }
      ctx.fillStyle = "#0B2545"; ctx.font = F(700, 56); ctx.fillText(v, x, 1050);
      spaced(true); ctx.fillStyle = "#5A6878"; ctx.font = F(600, 22); ctx.fillText(l, x, 1095); spaced(false);
    });
    ctx.fillStyle = "#5A6878"; ctx.font = F(400, 22); ctx.fillText(RAW.copyright, W / 2, H - 140);
  }

  /* ---------------- PDF of answers (jsPDF loaded on demand) ---------------- */
  function loadJsPDF() {
    if (window.jspdf) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload = res; s.onerror = () => rej(new Error("load")); document.head.append(s); });
  }
  const plain = (t) => String(t == null ? "" : t).replace(/<br\s*\/?>/gi, "\n").replace(/<li>/gi, "\n• ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/→/g, "->").replace(/←/g, "<-").replace(/≠/g, "is not").replace(/[✓✔]/g, "").replace(/[✕✗]/g, "").replace(/[^\x00-\xFF‘’“”–—•…€]/g, "");
  async function downloadPDF() {
    const p = P(); if (!p) return;
    try { await loadJsPDF(); } catch (e) { alert("Couldn't load the PDF library — check your internet connection and try again."); return; }
    const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 50; let y = M;
    const ensure = (n) => { if (y + n > H - M) { doc.addPage(); y = M; } };
    const text = (t, { size = 10.5, bold = false, color = [55, 53, 67], gap = 4, italic = false } = {}) => {
      doc.setFont("helvetica", bold ? (italic ? "bolditalic" : "bold") : italic ? "italic" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
      doc.splitTextToSize(plain(t), W - 2 * M).forEach((ln) => { ensure(size * 1.35); doc.text(ln, M, y); y += size * 1.35; }); y += gap;
    };
    const rule = () => { ensure(14); doc.setDrawColor(209, 219, 229); doc.line(M, y, W - M, y); y += 14; };
    const sc = scores();
    doc.setFillColor(11, 37, 69); doc.rect(0, 0, W, 8, "F");
    text(RAW.program.toUpperCase(), { size: 9, bold: true, color: [15, 110, 115] });
    text(RAW.title + " — My Answers", { size: 20, bold: true, color: [11, 37, 69] });
    text(`${(store.name || "").trim() || "(name not entered)"}  ·  ${roleLabel()} · ${fnLabel()}  ·  ${new Date().toLocaleDateString()}`, { size: 10, color: [125, 138, 144], gap: 10 });
    text(`Time invested: ${fmtTime(p.secs)}   |   Knowledge Check (best): ${sc.final != null ? sc.final + "%" + (sc.passed ? " — Passed" : "") : "not attempted"}   |   Checks for Understanding: ${sc.got}/${sc.tot} (${sc.cfuPct}%)`, { size: 10, bold: true });
    sc.rows.forEach((r) => text(`${r.label}: ${r.answered ? r.n + "/" + r.t : "not completed"}`, { size: 9.5, gap: 0 }));
    y += 6;
    if (p.scale.confOpen != null || p.scale.confClose != null) text(`Confidence communicating two levels up (1–5): start ${p.scale.confOpen ?? "—"}  ->  end ${p.scale.confClose ?? "—"}`, { size: 10, bold: true });
    rule();
    C.modules.forEach((m) => {
      const parts = [];
      m.steps.forEach((s) => s.blocks.forEach((b, bi) => {
        if (b.t === "reflect") {
          const r = p.refl[b.id] || { v: {} };
          const lines = [];
          b.fields.forEach((fd) => lines.push([fd.label, (r.v[fd.id] || "").trim() || "(not answered)"]));
          const sc2 = b.selfcheck ? b.selfcheck.map((t, i) => `[${r.sc && r.sc[i] ? "x" : " "}] ${t}`) : [];
          parts.push({ kind: "refl", title: `${s.title} — ${b.title || ""}`, lines, sc: sc2 });
        } else if (b.t === "activity") {
          const a = b.a, st = p.act[a.id] || {};
          let res = st.complete ? "Completed" : "Not completed";
          if (st.complete && a.type === "sim") res += ` — ${a.steps.filter((_, i) => (st.tried[i] || []).length === 1).length} of ${a.steps.length} decisions right first time`;
          else if (st.complete && st.attempts) res += ` — ${st.attempts === 1 ? "correct on first check" : st.attempts + " checks to get everything right"}`;
          else if (st.complete && a.type === "hunt") res += ` — ${st.misses || 0} wrong click(s)`;
          parts.push({ kind: "act", title: `Activity: ${a.title}`, res, coach: st.complete ? a.coach || (s.blocks[bi + 1] && s.blocks[bi + 1].items) : null });
        } else if (b.t === "choice" && p.choice[b.id]) parts.push({ kind: "line", t: `${b.prompt} ${p.choice[b.id]}` });
        else if (b.t === "checklist") parts.push({ kind: "check", items: b.items });
      }));
      if (!parts.length) return;
      ensure(40); text(`${m.num ? "Module " + m.num + " · " : ""}${m.title}`, { size: 13, bold: true, color: [15, 110, 128], gap: 6 });
      parts.forEach((pt) => {
        if (pt.kind === "refl") {
          text(pt.title, { size: 10.5, bold: true, gap: 2 });
          pt.lines.forEach(([l, a]) => { text(l, { size: 9.5, color: [94, 105, 107], gap: 0 }); text(a, { size: 10.5, gap: 5 }); });
          if (pt.sc.length) { text("Self-check:", { size: 9.5, bold: true, gap: 0 }); pt.sc.forEach((l) => text(l, { size: 9.5, gap: 0 })); y += 4; }
        } else if (pt.kind === "act") {
          text(`${pt.title} — ${pt.res}`, { size: 10.5, bold: true, gap: 2 });
          if (pt.coach) pt.coach.forEach((c) => text("• " + c, { size: 9.5, color: [64, 102, 89], gap: 0 }));
          y += 5;
        } else if (pt.kind === "line") text(pt.t, { size: 10.5, bold: true });
        else if (pt.kind === "check") { text("My Communication Checklist — keep this", { size: 10.5, bold: true, gap: 2 }); pt.items.forEach((t) => text("[  ]  " + t, { size: 10.5, gap: 0 })); y += 5; }
      });
      rule();
    });
    text(RAW.copyright, { size: 8, color: [125, 138, 144] });
    doc.save(`${RAW.title} - My Answers - ${roleLabel()} ${fnLabel()}.pdf`.replace(/[\\/:*?"<>|]/g, ""));
  }

  /* ---------------- copy protection ---------------- */
  // Stops learners copying questions/scenarios into an AI tool. (It can't stop retyping or screenshots.)
  const copyOK = (t) => t && t.closest && t.closest("#learner-name, #cert-name");
  ["copy", "cut"].forEach((ev) => document.addEventListener(ev, (e) => { if (!copyOK(e.target)) e.preventDefault(); }, true));
  document.addEventListener("dragstart", (e) => { if (!copyOK(e.target) && !(e.target.closest && e.target.closest(".chip"))) e.preventDefault(); }, true);

  /* ---------------- boot ---------------- */
  build(); shell(); render();
  window.__course = { store: () => store, P, go, STEPS: () => STEPS };   // debugging hook
})();

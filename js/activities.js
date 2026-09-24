/* =========================================================================
   ACTIVITY RENDERERS
   Each renderer: (root, data, st, api)
     st  – this activity's persisted state object (mutate, then api.save())
     api – { save(), complete(), isDone() }
   Every change is saved immediately so a mid-activity refresh loses nothing.
   ========================================================================= */
(function () {
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  };
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const shuffledNot = (arr) => { if (arr.length < 2) return arr.slice(); let s; do { s = shuffle(arr); } while (s.every((x, i) => x === arr[i])); return s; };
  const sameSet = (a, b) => a && a.length === b.length && a.every((x) => b.includes(x));

  function frame(root, a, api) {
    const badge = h("span", { class: "badge" + (api.isDone() ? " done" : "") , text: api.isDone() ? "Completed" : "Activity" });
    root.append(h("div", { class: "act-h" }, h("div", { class: "at", html: a.title }), badge));
    if (a.instructions) root.append(h("p", { class: "ai", html: a.instructions }));
    const body = h("div", { class: "act-body" });
    const msg = h("div", { class: "msg", role: "status", "aria-live": "polite" });
    const coach = h("div");
    root.append(body, msg, coach);
    const showCoach = () => {
      badge.className = "badge done"; badge.textContent = "Completed";
      if (!a.coach || coach.childElementCount) return;
      coach.append(h("div", { class: "coach" }, h("div", { class: "ct", text: "Coaching key points" }), h("ul", {}, a.coach.map((c) => h("li", { html: c })))));
    };
    return { body, msg, coach, showCoach, setMsg: (text, kind) => { msg.className = "msg " + (kind || ""); msg.innerHTML = text || ""; } };
  }

  /* ---------------- FLIP CARDS ---------------- */
  function flip(root, a, st, api) {
    st.seen = st.seen || {}; st.on = st.on || {};
    const f = frame(root, a, api);
    const grid = h("div", { class: "flips" });
    const status = () => {
      const n = Object.keys(st.seen).length;
      if (n >= a.cards.length) { f.setMsg(""); if (!api.isDone()) api.complete(); f.showCoach(); }
      else f.setMsg(`${n} of ${a.cards.length} explored`, "");
    };
    a.cards.forEach((c, i) => {
      const b = h("button", { class: "flip" + (st.on[i] ? " on" : "") + (st.seen[i] ? " seen" : ""), "aria-pressed": st.on[i] ? "true" : "false", "aria-label": (c.front || "").replace(/<[^>]+>/g, "") + " — flip card" },
        h("div", { class: "fi" },
          h("div", { class: "ff" }, h("div", { class: "big", html: c.front }), c.sub ? h("div", { class: "sub", html: c.sub }) : null, h("div", { class: "hint", text: "Tap to flip" })),
          h("div", { class: "fb" }, h("div", { class: "big", html: c.back }), c.note ? h("div", { class: "sub", html: c.note }) : null)));
      b.addEventListener("click", () => {
        st.on[i] = !st.on[i]; st.seen[i] = true;
        b.classList.toggle("on", !!st.on[i]); b.classList.add("seen"); b.setAttribute("aria-pressed", st.on[i] ? "true" : "false");
        api.save(); status();
      });
      grid.append(b);
    });
    f.body.append(grid);
    status();
  }

  /* ---------------- BUCKET SORT (drag-and-drop + tap) ---------------- */
  function bucket(root, a, st, api) {
    const ids = a.items.map((x) => x.id);
    if (!sameSet(st.order, ids)) { st.order = shuffle(ids); st.place = {}; st.locked = {}; st.attempts = 0; }
    st.place = st.place || {}; st.locked = st.locked || {}; st.attempts = st.attempts || 0;
    const byId = Object.fromEntries(a.items.map((x) => [x.id, x]));
    const f = frame(root, a, api);
    let sel = null;
    const pool = h("div", { class: "pool", "data-drop": "__pool", "aria-label": "Unsorted statements" });
    const bucketsEl = h("div", { class: "buckets", style: `--n:${a.buckets.length}` });
    const bEls = {};
    a.buckets.forEach((b) => {
      const el = h("div", { class: "bucket", "data-drop": b.id, role: "button", tabindex: "0", "aria-label": "Bucket: " + b.label },
        h("div", { class: "bh", html: b.label }, b.hint ? h("small", { html: b.hint }) : null));
      el.addEventListener("click", (e) => { if (e.target.closest(".chip")) return; if (sel) place(sel, b.id); });
      el.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && sel && !e.target.closest(".chip")) { e.preventDefault(); place(sel, b.id); } });
      bEls[b.id] = el; bucketsEl.append(el);
    });
    pool.addEventListener("click", (e) => { if (!e.target.closest(".chip") && sel && st.place[sel]) place(sel, null); });
    const checkBtn = h("button", { class: "btn", text: "Check my sort" });
    const resetSel = () => { sel = null; root.querySelectorAll(".chip.sel").forEach((c) => c.classList.remove("sel")); root.querySelectorAll(".bucket.target").forEach((c) => c.classList.remove("target")); root.querySelectorAll(".chip-actions").forEach((c) => c.remove()); };
    // tap/keyboard selection: show an inline "Move to" row right under the statement (buckets may be off-screen on phones)
    function select(id, c) {
      resetSel(); sel = id; c.classList.add("sel"); Object.values(bEls).forEach((b) => b.classList.add("target"));
      const row = h("div", { class: "chip-actions", role: "group", "aria-label": "Move statement to" }, h("span", { text: "Move to:" }));
      a.buckets.forEach((b) => { if (st.place[id] !== b.id) row.append(h("button", { class: "btn secondary", html: b.label, onclick: () => place(id, b.id) })); });
      if (st.place[id]) row.append(h("button", { class: "btn ghost", text: "Back to list", onclick: () => place(id, null) }));
      row.append(h("button", { class: "btn ghost", text: "Cancel", onclick: () => { resetSel(); f.setMsg(""); } }));
      c.after(row); f.setMsg("Choose where it goes — or drag it, or tap a bucket.", "");
    }

    function place(id, bid) {
      if (st.locked[id]) return;
      if (bid) st.place[id] = bid; else delete st.place[id];
      resetSel(); api.save(); draw();
    }
    function chip(id) {
      const it = byId[id];
      const c = h("button", { class: "chip" + (st.locked[id] ? " locked" : ""), "data-id": id, html: it.text, "aria-disabled": st.locked[id] ? "true" : null });
      if (st.locked[id]) return c;
      let start = null, dragging = false, ghost = null, over = null;
      c.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; start = { x: e.clientX, y: e.clientY, touch: e.pointerType === "touch" }; dragging = false; if (!start.touch) c.setPointerCapture(e.pointerId); });
      c.addEventListener("pointermove", (e) => {
        if (!start) return;
        if (start.touch) { if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) start = null; return; }   // touch = scroll, not drag
        if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) {
          dragging = true; ghost = c.cloneNode(true); ghost.classList.add("ghost"); ghost.style.width = c.offsetWidth + "px"; document.body.append(ghost); c.classList.add("dragging");
        }
        if (dragging) {
          ghost.style.left = e.clientX - c.offsetWidth / 2 + "px"; ghost.style.top = e.clientY - 18 + "px";
          const t = document.elementFromPoint(e.clientX, e.clientY); const d = t && t.closest("[data-drop]");
          if (over && over !== d) over.classList.remove("over"); over = d && d.classList.contains("bucket") ? d : null; if (over) over.classList.add("over");
        }
      });
      const end = (e, cancelled) => {
        if (!start) return;
        const wasDrag = dragging; start = null; dragging = false;
        if (ghost) { ghost.remove(); ghost = null; } c.classList.remove("dragging"); if (over) over.classList.remove("over"); over = null;
        if (wasDrag && !cancelled) {
          const t = document.elementFromPoint(e.clientX, e.clientY); const d = t && t.closest("[data-drop]");
          if (d && root.contains(d)) place(id, d.dataset.drop === "__pool" ? null : d.dataset.drop);
        } else if (!cancelled) {
          if (sel === id) { resetSel(); f.setMsg(""); } else select(id, c);
        }
      };
      c.addEventListener("pointerup", (e) => end(e, false));
      c.addEventListener("pointercancel", (e) => end(e, true));
      c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (sel === id) { resetSel(); f.setMsg(""); } else { select(id, c); const first = c.nextElementSibling && c.nextElementSibling.querySelector("button"); if (first) first.focus(); } } });
      c.addEventListener("click", (e) => e.preventDefault());
      return c;
    }
    function draw() {
      pool.innerHTML = ""; Object.values(bEls).forEach((b) => b.querySelectorAll(".chip").forEach((c) => c.remove()));
      st.order.forEach((id) => { const p = st.place[id]; (p && bEls[p] ? bEls[p] : pool).append(chip(id)); });
      const allPlaced = st.order.every((id) => st.place[id]);
      const allLocked = st.order.every((id) => st.locked[id]);
      checkBtn.disabled = !allPlaced || allLocked;
      checkBtn.style.display = allLocked ? "none" : "";
      if (allLocked) { if (!api.isDone()) api.complete(); f.setMsg(`✓ All sorted correctly${st.attempts > 1 ? ` (${st.attempts} attempts)` : " — first time"}.`, "ok"); f.showCoach(); }
    }
    checkBtn.addEventListener("click", () => {
      st.attempts++;
      const wrong = [];
      st.order.forEach((id) => { if (st.locked[id]) return; if (st.place[id] === byId[id].b) st.locked[id] = true; else { wrong.push(id); delete st.place[id]; } });
      api.save(); draw();
      if (wrong.length) {
        f.setMsg(`✕ ${wrong.length} of ${st.order.length} ${wrong.length === 1 ? "is" : "are"} in the wrong bucket — ${wrong.length === 1 ? "it's" : "they've"} gone back to the top. Correct ones are locked in green. Try again.`, "err");
        wrong.forEach((id) => { const c = pool.querySelector(`[data-id="${id}"]`); if (c) { c.classList.add("wrong"); setTimeout(() => c.classList.remove("wrong"), 1800); } });
      }
    });
    f.body.append(pool, bucketsEl, h("div", { class: "btn-row" }, checkBtn));
    draw();
  }

  /* ---------------- SEQUENCE (tap in order, connected slots) ---------------- */
  function sequence(root, a, st, api) {
    const ids = a.items.map((x) => x.id);
    if (!sameSet(st.order, ids)) { st.order = shuffledNot(ids); st.slots = ids.map(() => null); st.locked = {}; st.attempts = 0; }
    const byId = Object.fromEntries(a.items.map((x) => [x.id, x]));
    const f = frame(root, a, api);
    const list = h("div", { class: "seq-items" });
    const slots = h("div", { class: "slots" });
    const checkBtn = h("button", { class: "btn", text: "Check my order" });
    function draw() {
      list.innerHTML = ""; slots.innerHTML = "";
      st.order.forEach((id) => {
        if (st.slots.includes(id)) return;                     // placed sentences leave the list
        list.append(h("button", { class: "seq-item", html: byId[id].text, onclick: () => { const k = st.slots.indexOf(null); if (k < 0) return; st.slots[k] = id; api.save(); draw(); } }));
      });
      if (!list.childElementCount) list.append(h("p", { class: "note", style: "margin:0", text: "All placed — check your order." }));
      st.slots.forEach((id, i) => {
        const locked = !!st.locked[i];
        const sv = h("button", { class: "sv" + (id ? " filled" : "") + (locked ? " locked" : ""), html: id ? byId[id].text : "<span class='note'>Tap a sentence…</span>", disabled: !id || locked, "aria-label": `Position ${i + 1}${id ? "" : " (empty)"}` });
        sv.addEventListener("click", () => { st.slots[i] = null; api.save(); draw(); });
        slots.append(h("div", { class: "slot" }, h("div", { class: "sl", text: (a.slotLabels && a.slotLabels[i]) || String(i + 1) }), sv));
      });
      const full = st.slots.every(Boolean), allLocked = st.slots.every((_, i) => st.locked[i]);
      checkBtn.disabled = !full || allLocked; checkBtn.style.display = allLocked ? "none" : "";
      leftCol.style.display = allLocked ? "none" : ""; if (leftCol.parentElement) leftCol.parentElement.style.gridTemplateColumns = allLocked ? "1fr" : "";
      if (allLocked) { if (!api.isDone()) api.complete(); f.setMsg(`✓ Correct order${st.attempts > 1 ? ` (${st.attempts} attempts)` : " — first time"}.`, "ok"); f.showCoach(); }
    }
    checkBtn.addEventListener("click", () => {
      st.attempts++; let wrong = 0;
      st.slots.forEach((id, i) => { if (st.locked[i]) return; if (id === ids[i]) st.locked[i] = true; else { st.slots[i] = null; wrong++; } });
      api.save(); draw();
      if (wrong) f.setMsg(`✕ ${wrong} ${wrong === 1 ? "sentence is" : "sentences are"} in the wrong position and ${wrong === 1 ? "has" : "have"} been taken back. Correct positions are locked in green — try again.`, "err");
    });
    const leftCol = h("div", {}, h("div", { class: "col-t", text: "Sentences" }), list);
    f.body.append(h("div", { class: "seq" },
      leftCol,
      h("div", {}, h("div", { class: "col-t", text: "Your order" }), slots)), h("div", { class: "btn-row" }, checkBtn));
    draw();
  }

  /* ---------------- MATCH WITH LINES (1:1, all labels unique) ---------------- */
  function match(root, a, st, api) {
    const n = a.pairs.length; const idx = [...Array(n).keys()];
    if (!sameSet(st.rorder, idx) || st.sig !== a.pairs[0].l) { st.rorder = shuffledNot(idx); st.links = {}; st.locked = {}; st.attempts = 0; st.sig = a.pairs[0].l; }
    const f = frame(root, a, api);
    const wrap = h("div", { class: "match" });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "m-lines"); svg.setAttribute("aria-hidden", "true");
    const lc = h("div", { class: "mcol" }), rc = h("div", { class: "mcol" });
    wrap.append(svg, lc, rc);
    const checkBtn = h("button", { class: "btn", text: "Check my matches" });
    let selL = null, selR = null;
    const lEls = [], rEls = [];
    const rightOf = (li) => st.links[li];
    const leftOf = (ri) => { for (const k in st.links) if (st.links[k] === ri) return +k; return null; };
    function link(li, ri) {
      if (st.locked[li] || (leftOf(ri) != null && st.locked[leftOf(ri)])) return;
      const prevL = leftOf(ri); if (prevL != null) delete st.links[prevL];
      st.links[li] = ri; selL = selR = null; api.save(); draw();
    }
    a.pairs.forEach((p, i) => {
      const b = h("button", { class: "m-item l", html: p.l });
      b.addEventListener("click", () => { if (st.locked[i]) return; if (selR != null) return link(i, selR); selL = selL === i ? null : i; draw(); });
      lEls[i] = b; lc.append(b);
    });
    st.rorder.forEach((ri) => {
      const b = h("button", { class: "m-item r" }, h("span", { html: a.pairs[ri].r }), h("span", { class: "tag" }));
      b.addEventListener("click", () => { const l = leftOf(ri); if (l != null && st.locked[l]) return; if (selL != null) return link(selL, ri); selR = selR === ri ? null : ri; draw(); });
      rEls[ri] = b; rc.append(b);
    });
    function lines() {
      svg.innerHTML = "";
      if (getComputedStyle(svg).display === "none") return;             // suppressed on narrow screens
      const box = wrap.getBoundingClientRect(); svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`); svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
      for (const k in st.links) {
        const L = lEls[k].getBoundingClientRect(), R = rEls[st.links[k]].getBoundingClientRect();
        const x1 = L.right - box.left, y1 = L.top + L.height / 2 - box.top, x2 = R.left - box.left, y2 = R.top + R.height / 2 - box.top;
        const cls = st.locked[k] ? "locked" : "";
        const ln = document.createElementNS(svg.namespaceURI, "line"); Object.entries({ x1, y1, x2, y2, class: cls }).forEach(([a2, v]) => ln.setAttribute(a2, v)); svg.append(ln);
        [[x1, y1], [x2, y2]].forEach(([cx, cy]) => { const c = document.createElementNS(svg.namespaceURI, "circle"); c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", 5); c.setAttribute("class", cls); svg.append(c); });
      }
    }
    function draw() {
      lEls.forEach((b, i) => { b.className = "m-item l" + (st.locked[i] ? " locked" : rightOf(i) != null ? " paired" : "") + (selL === i ? " sel" : ""); });
      rEls.forEach((b, ri) => {
        const l = leftOf(ri);
        b.className = "m-item r" + (l != null && st.locked[l] ? " locked" : l != null ? " paired" : "") + (selR === ri ? " sel" : "");
        b.querySelector(".tag").textContent = l != null ? "→ " + a.pairs[l].l.replace(/<[^>]+>/g, "") : "";
      });
      const allLinked = idx.every((i) => rightOf(i) != null), allLocked = idx.every((i) => st.locked[i]);
      checkBtn.disabled = !allLinked || allLocked; checkBtn.style.display = allLocked ? "none" : "";
      if (selL != null) f.setMsg("Now select the opening written for <strong>" + a.pairs[selL].l + "</strong>.", "");
      else if (selR != null) f.setMsg("Now select the audience this opening is for.", "");
      else if (!allLocked) f.setMsg("", "");
      if (allLocked) { if (!api.isDone()) api.complete(); f.setMsg(`✓ All matched${st.attempts > 1 ? ` (${st.attempts} attempts)` : " — first time"}.`, "ok"); f.showCoach(); }
      requestAnimationFrame(lines);
    }
    checkBtn.addEventListener("click", () => {
      st.attempts++; let wrong = 0;
      idx.forEach((i) => { if (st.locked[i]) return; if (st.links[i] === i) st.locked[i] = true; else { delete st.links[i]; wrong++; } });
      api.save(); draw();
      if (wrong) f.setMsg(`✕ ${wrong} ${wrong === 1 ? "match was" : "matches were"} wrong and ${wrong === 1 ? "has" : "have"} been cleared. Correct ones are locked in green — try again.`, "err");
    });
    f.body.append(wrap, h("div", { class: "btn-row" }, checkBtn));
    if (window.ResizeObserver) new ResizeObserver(() => lines()).observe(wrap); else window.addEventListener("resize", lines);
    draw();
  }

  /* ---------------- ANNOTATION / SCAVENGER HUNT ---------------- */
  function hunt(root, a, st, api) {
    st.task = st.task || 0; st.found = st.found || {}; st.misses = st.misses || 0;
    const f = frame(root, a, api);
    const taskEl = h("div", { class: "task" });
    const msgBox = h("div", { class: "hunt-msg" }, h("div", { class: "hh", html: a.header || "" }));
    const sEls = {};
    a.sentences.forEach((s) => {
      const b = h("button", { class: "sent", html: s.text });
      b.addEventListener("click", () => {
        if (st.task >= a.tasks.length) return;
        const t = a.tasks[st.task];
        if (s.id === t.answer) {
          st.found[s.id] = true; st.task++; api.save();
          f.setMsg("✓ Yes — that's " + s.tag.toLowerCase() + ".", "ok"); draw();
        } else {
          st.misses++; api.save();
          const hint = (t.wrong && t.wrong[s.id]) || (a.hints && a.hints[s.tag]) || "Not quite.";
          f.setMsg("✕ " + hint + " " + (t.look || "Try another sentence."), "err");
          b.classList.add("miss"); setTimeout(() => b.classList.remove("miss"), 1200);
        }
      });
      sEls[s.id] = b; msgBox.append(b, " ");
    });
    const afterEl = h("div");
    function draw() {
      a.sentences.forEach((s) => {
        const b = sEls[s.id];
        if (st.found[s.id] && !b.classList.contains("found")) { b.classList.add("found"); b.prepend(h("span", { class: "tg", text: s.tag })); }
      });
      if (st.task < a.tasks.length) { taskEl.innerHTML = ""; taskEl.append(h("span", { class: "tn", text: `Task ${st.task + 1} of ${a.tasks.length}` }), h("span", { html: a.tasks[st.task].prompt })); }
      else {
        taskEl.innerHTML = "";
        taskEl.append(h("span", { class: "tn", text: "All found" }));
        if (!afterEl.childElementCount && a.after) afterEl.append(h("div", { class: "callout", style: "margin-top:14px", html: a.after }));
        Object.values(sEls).forEach((b) => (b.disabled = true));
        if (!api.isDone()) api.complete();
        f.showCoach();
      }
    }
    f.body.append(taskEl, msgBox, afterEl);
    draw();
    if (st.task >= a.tasks.length) f.setMsg(`✓ Completed${st.misses ? ` with ${st.misses} wrong click${st.misses > 1 ? "s" : ""}` : " with no wrong clicks"}.`, "ok");
  }

  /* ---------------- BRANCHING SIMULATION ---------------- */
  function sim(root, a, st, api) {
    st.step = st.step || 0; st.tried = st.tried || {}; st.passed = st.passed || {};
    const f = frame(root, a, api);
    function draw() {
      f.body.innerHTML = "";
      f.body.append(h("div", { class: "sim-setup" }, h("b", { text: "The situation" }), h("div", { html: a.setup })));
      f.body.append(h("div", { class: "sim-prog" }, a.steps.map((s, i) => h("span", { class: st.passed[i] ? "ok" : i === st.step ? "cur" : "", text: s.label }))));
      const tr = h("div", { class: "transcript" });
      a.steps.forEach((s, i) => { if (st.passed[i]) { const o = s.options.find((x) => x.ok); tr.append(h("p", { class: "you", html: "<strong>You:</strong> " + o.text })); } });
      if (tr.childElementCount) f.body.append(tr);
      if (st.step >= a.steps.length) {
        const first = a.steps.filter((_, i) => (st.tried[i] || []).length === 1).length;
        f.setMsg(`✓ Conversation complete — ${first} of ${a.steps.length} decisions right first time.`, "ok");
        const again = h("button", { class: "btn ghost", text: "Replay the simulation" });
        again.addEventListener("click", () => { st.step = 0; st.tried = {}; st.passed = {}; api.save(); f.setMsg(""); draw(); });
        f.body.append(h("div", { class: "btn-row" }, again));
        if (!api.isDone()) api.complete(); f.showCoach();
        return;
      }
      const s = a.steps[st.step]; const tried = st.tried[st.step] || [];
      f.body.append(h("div", { class: "sim-sit", html: `<span class="note" style="display:block;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:12px">Decision ${st.step + 1} of ${a.steps.length} · ${s.label}</span>` + s.situation }));
      const opts = h("div", { class: "sim-opts" });
      const fb = h("div");
      const passed = !!st.passed[st.step];
      s.options.forEach((o, oi) => {
        const wasTried = tried.includes(oi);
        const b = h("button", { class: "sim-opt" + (wasTried ? (o.ok ? " good" : " bad") : ""), html: o.text, disabled: wasTried || passed });
        b.addEventListener("click", () => {
          st.tried[st.step] = (st.tried[st.step] || []).concat(oi);
          if (o.ok) st.passed[st.step] = true;
          api.save(); draw();
        });
        opts.append(b);
      });
      const last = tried.length ? s.options[tried[tried.length - 1]] : null;
      if (last) {
        fb.append(h("div", { class: "fb " + (last.ok ? "good" : "bad") }, h("b", { text: last.ok ? "✓ Strong choice" : "✕ Not this time" }), h("span", { html: last.fb })));
        if (last.ok) {
          const nx = h("button", { class: "btn", text: st.step === a.steps.length - 1 ? "Finish conversation" : "Continue →" });
          nx.addEventListener("click", () => { st.step++; api.save(); f.setMsg(""); draw(); });
          fb.append(h("div", { class: "btn-row" }, nx));
        } else fb.append(h("p", { class: "note", style: "margin:8px 0 0", text: "Pick another response to try again." }));
      }
      f.body.append(opts, fb);
    }
    draw();
  }

  window.ACT = { flip, bucket, sequence, match, hunt, sim, h };
})();

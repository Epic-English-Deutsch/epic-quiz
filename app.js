/* ===== EPIC QUIZ app ===== */
(function () {
  "use strict";

  var DATA = window.QUIZ_DATA || { items: [], categories: [] };
  var ADMIN_PASSWORD = "0609";
  /* Supabase (user's project). Key stays empty until provided — the app then falls back to localStorage only. */
  var SUPABASE_URL = "https://vxvhushnspkxalabzzjv.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_GLCgN5quF_6M78erMw9y0A_Bj1Xyr-h";
  var SUPABASE_TABLE = "quiz_results";
  var KEYS = {
    records: "eq_records_v1",
    name: "eq_name_v1",
    supa: "eq_supa_v1",
    adminOk: "eq_admin_ok",
    draft: "epic_quiz_draft_v1",
    code: "eq_code_v1"
  };
  var CIRCLE = ["①", "②", "③", "④", "⑤"];
  /* ---------- 학생 명단(allowed_students): 세 사이트가 함께 쓰는 허용/차단 명단 ---------- */
  var STUDENTS_TABLE = "allowed_students";
  var BLOCK_MSG = "허용되지 않았거나 차단된 학생입니다. 원장님께 이름과 코드를 확인해 주세요.";
  var STUDENTS_SQL = "create table if not exists public.allowed_students (\n"
    + "  id bigint generated always as identity primary key,\n"
    + "  name text not null,\n"
    + "  code text not null,\n"
    + "  active boolean not null default true,\n"
    + "  created_at timestamptz not null default now()\n"
    + ");\n"
    + "create unique index if not exists allowed_students_name_code_uidx\n"
    + "  on public.allowed_students (lower(btrim(name)), btrim(code));\n"
    + "grant usage on schema public to anon;\n"
    + "grant select, insert, update, delete on public.allowed_students to anon;\n"
    + "grant usage, select on all sequences in schema public to anon;\n"
    + "alter table public.allowed_students disable row level security;";

  function studentsApi() {
    var cfg = getSupa();
    var base = (cfg.url || SUPABASE_URL).replace(/\/+$/, "") + "/rest/v1/" + STUDENTS_TABLE;
    var key = cfg.key || "";
    function req(query, opts) {
      opts = opts || {};
      if (!key) return Promise.reject({ kind: "nokey", message: "anon key 없음" });
      var headers = { apikey: key, Authorization: "Bearer " + key };
      if (opts.body != null) headers["Content-Type"] = "application/json";
      if (opts.prefer) headers.Prefer = opts.prefer;
      var init = { method: opts.method || "GET", headers: headers };
      if (opts.body != null) init.body = JSON.stringify(opts.body);
      var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
      if (ctrl) init.signal = ctrl.signal;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, opts.timeout || 7000);
      return fetch(base + (query || ""), init).then(function (r) {
        return r.text().then(function (txt) {
          var data = null;
          try { data = txt ? JSON.parse(txt) : null; } catch (e0) { data = null; }
          if (r.ok) return data;
          var code = (data && data.code) || "";
          var msg = (data && data.message) || ("HTTP " + r.status);
          if (code === "23505" || r.status === 409) throw { kind: "dup", status: r.status, message: msg };
          if (r.status === 404 || code === "PGRST205" || code === "42P01") throw { kind: "missing", status: r.status, message: msg };
          if (r.status === 401 || r.status === 403 || code === "42501" || /permission denied/i.test(msg)) throw { kind: "denied_db", status: r.status, message: msg };
          throw { kind: "error", status: r.status, message: msg };
        });
      }).catch(function (e) {
        if (e && e.kind) throw e;
        throw { kind: "network", status: 0, message: (e && e.name === "AbortError") ? "응답 없음(시간 초과)" : ((e && e.message) || "네트워크 오류") };
      }).then(function (v) { clearTimeout(timer); return v; }, function (e) { clearTimeout(timer); throw e; });
    }
    return {
      list: function () {
        return req("?select=id,name,code,active,created_at&order=created_at.asc", { timeout: 9000 }).then(function (rows) {
          return Array.isArray(rows) ? rows : [];
        });
      },
      find: function (name, code) {
        var q = "?select=id,name,code,active&name=eq." + encodeURIComponent(name) + "&code=eq." + encodeURIComponent(code) + "&limit=10";
        return req(q, { timeout: 6000 }).then(function (rows) {
          var list = Array.isArray(rows) ? rows : [];
          var hit = null;
          list.forEach(function (r) {
            var same = String(r.name == null ? "" : r.name).trim() === name && String(r.code == null ? "" : r.code).trim() === code;
            if (!same) return;
            if (!hit || (r.active === true && hit.active !== true)) hit = r;
          });
          if (!hit) return { status: "unknown" };
          return { status: hit.active === true ? "ok" : "blocked", row: hit };
        });
      },
      add: function (name, code) {
        return req("", { method: "POST", body: { name: name, code: code, active: true }, prefer: "return=representation" });
      },
      setActive: function (id, active) {
        return req("?id=eq." + encodeURIComponent(id), { method: "PATCH", body: { active: !!active }, prefer: "return=representation" });
      },
      remove: function (id) {
        return req("?id=eq." + encodeURIComponent(id), { method: "DELETE", prefer: "return=minimal" });
      }
    };
  }

  function studentsProblemText(e) {
    if (!e) return "";
    if (e.kind === "missing") return "학생 명단 표(public.allowed_students)가 아직 Supabase에 없습니다. 아래 SQL을 Supabase SQL Editor에서 한 번 실행해 주세요.";
    if (e.kind === "denied_db") return "학생 명단 표에 접근 권한이 없습니다(42501 permission denied). 아래 SQL의 grant 문을 실행해 주세요.";
    if (e.kind === "nokey") return "Supabase anon key가 없어 학생 명단을 사용할 수 없습니다. [설정 · 동기화] 탭에서 키를 확인해 주세요.";
    if (e.kind === "dup") return "같은 이름과 코드가 이미 명단에 있습니다.";
    return "학생 명단을 불러오지 못했습니다 (" + String(e.message || "알 수 없는 오류") + ").";
  }

  /* 학생 확인 후 진입. status: ok / blocked / unknown / unavailable / invalid */
  function verifyStudent(name, code, cb) {
    name = String(name == null ? "" : name).trim();
    code = String(code == null ? "" : code).trim();
    if (!name) { toast("학생 이름을 입력해 주세요."); cb({ status: "invalid" }); return; }
    if (!code) { toast("학생 코드를 입력해 주세요."); cb({ status: "invalid" }); return; }
    studentsApi().find(name, code).then(cb).catch(function (e) {
      cb({ status: "unavailable", error: e });
    });
  }

  function setBlocked(msg) {
    state.blocked = msg || "";
    if (msg) toast(msg);
  }

  /* 명단을 확인할 수 없을 때(표가 아직 없거나 통신 실패)는 학생을 막지 않는다.
     원장님이 SQL을 실행하기 전에 사이트가 잠기지 않도록. */
  function gatePassMessage() {
    return "학생 명단을 확인하지 못해 그대로 진행합니다.";
  }

  function beginQuizFlow() {
    if (!state.cat) { toast("문제 유형을 선택해 주세요."); return; }
    if (state.draft && Object.keys(cleanAnswers(state.draft.answers)).length) {
      if (!window.confirm("저장된 답안이 있습니다. 새로 시작하면 저장된 답안이 지워집니다. 새로 시작할까요?")) {
        toast("위의 ‘이어서 풀기’를 누르면 저장된 답안으로 이어집니다.");
        return;
      }
    }
    startQuiz(state.cat);
  }


  /* ---------- utils ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso || "";
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function hash32(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2100);
  }

  /* ---------- prepare items (deterministic option order) ---------- */
  var ITEMS = {};
  var ORDER = [];          // all item ids, in exam order
  DATA.items.forEach(function (raw) {
    var item = JSON.parse(JSON.stringify(raw));
    var rand = rng(hash32(item.id + "|eq2026"));
    if (item.cat === "grammar") {
      item.blanks.forEach(function (b) {
        var idx = [0, 1];
        shuffle(idx, rand);
        var opts = idx.map(function (i) { return b.opts[i]; });
        b.opts = opts;
        b.answer = idx.indexOf(b.answer);
      });
    } else {
      var idx2 = item.options.map(function (_, i) { return i; });
      shuffle(idx2, rand);
      item.options = idx2.map(function (i) { return item.options[i]; });
      item.answer = idx2.indexOf(item.answer);
    }
    ITEMS[item.id] = item;
    ORDER.push(item.id);
  });

  function itemsByCat(cat) {
    return ORDER.map(function (id) { return ITEMS[id]; }).filter(function (it) { return it.cat === cat; });
  }
  function catMeta(id) {
    for (var i = 0; i < DATA.categories.length; i++) if (DATA.categories[i].id === id) return DATA.categories[i];
    return { id: id, name: id, color: "#4f46e5", sub: "" };
  }
  function unitsOf(item) {
    if (item.cat === "grammar") {
      return item.blanks.map(function (b) { return { key: item.id + "#" + b.n, label: "(" + b.n + ")", b: b }; });
    }
    return [{ key: item.id + "#q", label: "" }];
  }
  function correctIndex(item, key) {
    if (item.cat === "grammar") {
      var n = key.split("#")[1];
      var b = item.blanks.filter(function (x) { return String(x.n) === n; })[0];
      return b ? b.answer : -1;
    }
    return item.answer;
  }
  function optionText(item, key, i) {
    if (i == null || i < 0) return "";
    if (item.cat === "grammar") {
      var n = key.split("#")[1];
      var b = item.blanks.filter(function (x) { return String(x.n) === n; })[0];
      return b ? b.opts[i] : "";
    }
    return item.options[i];
  }
  function whyOf(item, key) {
    if (item.cat === "grammar") {
      var n = key.split("#")[1];
      var b = item.blanks.filter(function (x) { return String(x.n) === n; })[0];
      return b ? b.why : "";
    }
    return item.why || "";
  }
  function unitTitle(item, key) {
    if (item.cat === "grammar") {
      var n = key.split("#")[1];
      return item.no + "번 (" + n + ")";
    }
    return item.no + "번";
  }

  /* ---------- storage ---------- */
  function loadRecords() {
    try {
      var raw = localStorage.getItem(KEYS.records);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveRecords(arr) {
    try { localStorage.setItem(KEYS.records, JSON.stringify(arr)); return true; }
    catch (e) { toast("저장 공간이 부족합니다."); return false; }
  }
  function addRecord(rec) {
    var arr = loadRecords();
    arr.push(rec);
    if (arr.length > 3000) arr = arr.slice(arr.length - 3000);
    saveRecords(arr);
    supaPush(rec);
  }
  /* ---------- draft: auto-save answers in progress ---------- */
  function draftKeyOk(key) {
    return typeof key === "string" && key.indexOf("#") > 0 && !!ITEMS[key.split("#")[0]];
  }
  function cleanAnswers(obj) {
    var out = {};
    if (!obj) return out;
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v != null && draftKeyOk(k)) out[k] = v;
    });
    return out;
  }
  function loadDraft() {
    var d;
    try {
      var raw = localStorage.getItem(KEYS.draft);
      if (!raw) return null;
      d = JSON.parse(raw);
    } catch (e) { return null; }
    if (!d || !d.cat) return null;
    var catOk = DATA.categories.some(function (c) { return c.id === d.cat; });
    if (!catOk) return null;
    var answers = cleanAnswers(d.answers);
    if (!Object.keys(answers).length) return null;
    var ids = (Array.isArray(d.ids) ? d.ids : []).filter(function (id) {
      return !!ITEMS[id] && ITEMS[id].cat === d.cat;
    });
    if (!ids.length) ids = itemsByCat(d.cat).map(function (it) { return it.id; });
    var idx = Math.round(Number(d.idx) || 0);
    if (idx < 0) idx = 0;
    if (idx > ids.length - 1) idx = ids.length - 1;
    var retry = !!d.retry;
    var rk = (d.retryLock && d.retryLock.keys) || d.retryKeys;
    var retryKeys = null;
    if (retry) {
      retryKeys = {};
      if (rk && typeof rk === "object") {
        Object.keys(rk).forEach(function (k) { if (draftKeyOk(k)) retryKeys[k] = true; });
      }
      if (!Object.keys(retryKeys).length) {
        ids.forEach(function (id) {
          unitsOf(ITEMS[id]).forEach(function (u) { if (answers[u.key] == null) retryKeys[u.key] = true; });
        });
      }
      if (!Object.keys(retryKeys).length) retry = false;
    }
    var locked = cleanAnswers(d.retryLock && d.retryLock.locked);
    var origin = d.retryOriginScore;
    if (origin && typeof origin === "object") {
      origin = { correct: Number(origin.correct) || 0, total: Number(origin.total) || 0, pct: Number(origin.pct) || 0 };
    } else {
      origin = null;
    }
    return {
      v: 1,
      cat: d.cat,
      ids: ids,
      idx: idx,
      answers: answers,
      retry: retry,
      retryKeys: retryKeys,
      locked: locked,
      retryOriginScore: origin,
      name: typeof d.name === "string" ? d.name : "",
      code: typeof d.code === "string" ? d.code : "",
      elapsed: Math.max(0, Number(d.elapsed) || 0),
      updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : ""
    };
  }
  function saveDraft() {
    if (state.view !== "quiz" || !state.cat || !state.ids.length) return;
    var answers = cleanAnswers(state.answers);
    if (!Object.keys(answers).length) { clearDraft(); return; }
    var retryKeys = null;
    var locked = {};
    if (state.retry && state.retryKeys) {
      retryKeys = {};
      Object.keys(state.retryKeys).forEach(function (k) { if (draftKeyOk(k)) retryKeys[k] = true; });
      locked = cleanAnswers(state.locked);
    }
    var d = {
      v: 1,
      cat: state.cat,
      ids: state.ids.slice(),
      idx: state.idx,
      answers: answers,
      retry: !!state.retry,
      retryLock: { keys: retryKeys, locked: locked },
      retryOriginScore: state.retryOriginScore || null,
      name: state.name || "",
      code: state.code || "",
      elapsed: Math.round(state.elapsed || 0),
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(KEYS.draft, JSON.stringify(d)); } catch (e) { return; }
    state.draft = d;
  }
  function clearDraft() {
    try { localStorage.removeItem(KEYS.draft); } catch (e) {}
    state.draft = null;
  }
  function restoreDraft(d) {
    if (!d || !d.cat || !d.ids || !d.ids.length) return;
    state.cat = d.cat;
    state.ids = d.ids.slice();
    state.idx = d.idx;
    state.answers = d.answers;
    state.retry = !!d.retry;
    state.retryKeys = d.retry ? d.retryKeys : null;
    state.locked = d.locked || {};
    state.retryOriginScore = d.retryOriginScore || null;
    state.result = null;
    if (d.name) state.name = d.name;
    if (d.code) state.code = d.code;
    state.draft = d;
    state.view = "quiz";
    window.scrollTo(0, 0);
    startTimer(d.elapsed);
    render();
    toast("이전에 풀던 답안을 불러왔습니다 (" + Object.keys(d.answers).length + "개)");
  }
  function draftBannerHTML() {
    var d = state.draft;
    if (!d || !d.cat) return "";
    var n = Object.keys(cleanAnswers(d.answers)).length;
    if (!n) return "";
    var dc = catMeta(d.cat);
    var label = dc.name + " · " + n + "개 답변 저장됨";
    return '<section class="card pad" style="margin-top:14px;border:1.5px solid #a5b4fc;background:#eef2ff">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:160px">' +
          '<div style="font-weight:800;color:#3730a3;font-size:15px">저장된 답안이 있습니다</div>' +
          '<div style="font-size:13px;color:#475569;margin-top:3px">' + esc(label) +
            (d.retry ? " · 오답 재풀이" : "") + (d.updatedAt ? " · " + esc(fmtDate(d.updatedAt)) : "") + "</div>" +
        "</div>" +
        '<button class="btn primary" data-act="resume">이어서 풀기 (' + esc(label) + ')</button>' +
        '<button class="btn ghost" data-act="discard-draft">지우기</button>' +
      "</div></section>";
  }

  function getSupa() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEYS.supa) || "{}") || {}; } catch (e) { saved = {}; }
    return {
      url: saved.url || SUPABASE_URL,
      key: (saved.key != null && saved.key !== "") ? saved.key : SUPABASE_ANON_KEY,
      table: saved.table || SUPABASE_TABLE
    };
  }
  function setSupa(cfg) {
    try { localStorage.setItem(KEYS.supa, JSON.stringify(cfg)); } catch (e) {}
  }
  function supaEndpoint(cfg) { return cfg.url.replace(/\/+$/, "") + "/rest/v1/" + (cfg.table || SUPABASE_TABLE); }

  /* payload matches the user's quiz_results schema:
     student_name, category, score, total, accuracy, wrong_items(jsonb), answers(jsonb) */
  function supaPayload(rec) {
    var wrong = (rec.units || []).filter(function (u) { return !u.ok; }).map(function (u) {
      return {
        questionNumber: u.no + (u.label ? " " + u.label : ""),
        chosen: u.chosen == null ? "미응답" : u.chosen,
        correct: u.answer
      };
    });
    var answers = {};
    (rec.units || []).forEach(function (u) {
      answers[u.i + (u.label || "")] = u.chosen == null ? null : u.chosen;
    });
    return {
      student_name: rec.name,
      category: rec.catName,
      score: rec.correct,
      total: rec.total,
      accuracy: rec.pct,
      wrong_items: wrong,
      answers: { _rid: rec.id, _mode: rec.mode, _elapsed: rec.elapsed || 0, detail: answers }
    };
  }

  function supaPush(rec) {
    var cfg = getSupa();
    if (!cfg.url || !cfg.key) return;   // no key yet → localStorage only
    fetch(supaEndpoint(cfg), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.key,
        Authorization: "Bearer " + cfg.key,
        Prefer: "return=representation"
      },
      body: JSON.stringify(supaPayload(rec))
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (rows) {
      if (rows && rows[0] && rows[0].id != null) {
        var arr = loadRecords();
        for (var i = arr.length - 1; i >= 0; i--) {
          if (arr[i].id === rec.id) { arr[i].sid = rows[0].id; saveRecords(arr); break; }
        }
      }
    }).catch(function (err) { console.warn("[supabase]", err.message); });
  }

  function supaPull() {
    var cfg = getSupa();
    if (!cfg.url || !cfg.key) return Promise.reject(new Error("Supabase anon key가 설정되지 않았습니다."));
    var url = supaEndpoint(cfg) + "?select=*&order=created_at.desc&limit=500";
    return fetch(url, { headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) {
        var recs = loadRecords();
        var sids = {}, rids = {};
        recs.forEach(function (r) { if (r.sid != null) sids[String(r.sid)] = true; rids[r.id] = true; });
        var added = 0;
        (rows || []).forEach(function (row) {
          var ans = row.answers || {};
          if (sids[String(row.id)]) return;
          if (ans._rid && rids[ans._rid]) return;
          var units = (row.wrong_items || []).map(function (w) {
            return { i: "sb" + row.id, no: String(w.questionNumber || "").split(" ")[0], label: (String(w.questionNumber || "").split(" ")[1] || ""), ok: false, chosen: w.chosen, answer: w.correct };
          });
          var rec = {
            id: "sb" + row.id,
            sid: row.id,
            name: row.student_name || "(이름 없음)",
            catName: row.category || "",
            cat: "",
            mode: (ans._mode === "retry") ? "retry" : "full",
            ts: row.created_at || new Date().toISOString(),
            elapsed: ans._elapsed || 0,
            correct: row.score || 0,
            total: row.total || 0,
            pct: row.accuracy != null ? Number(row.accuracy) : 0,
            units: units,
            remote: true
          };
          recs.push(rec); rids[rec.id] = true;
          added++;
        });
        saveRecords(recs);
        return added;
      });
  }

  /* ---------- state ---------- */
  var state = {
    view: "login",
    name: localStorage.getItem(KEYS.name) || "",
    code: localStorage.getItem(KEYS.code) || "",
    blocked: "",
    cat: null,
    ids: [],
    idx: 0,
    answers: {},
    locked: {},
    retryKeys: null,
    retry: false,
    retryOriginScore: null,
    draft: null,
    t0: 0,
    elapsed: 0,
    result: null,
    admin: { ok: false, tab: "records", sort: "low" }
  };
  var timerId = null;

  function startTimer(baseSec) {
    stopTimer();
    var base = Math.max(0, Number(baseSec) || 0);
    state.t0 = Date.now() - base * 1000;
    state.elapsed = base;
    timerId = setInterval(function () {
      state.elapsed = (Date.now() - state.t0) / 1000;
      var el = $("#clock");
      if (el) el.textContent = fmtTime(state.elapsed);
    }, 1000);
  }
  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (state.t0) state.elapsed = (Date.now() - state.t0) / 1000;
  }

  /* ---------- views ---------- */
  function render() {
    var app = $("#app");
    if (state.view === "login") app.innerHTML = viewLogin();
    else if (state.view === "quiz") app.innerHTML = viewQuiz();
    else if (state.view === "result") app.innerHTML = viewResult();
    bind();
    var bar = $(".qbar");
    if (bar) document.body.classList.add("has-qbar"); else document.body.classList.remove("has-qbar");
  }

  function viewLogin() {
    var m = DATA.meta || {};
    var draftHTML = draftBannerHTML();
    var blockedHTML = state.blocked
      ? '<div class="notice bad" role="alert" style="margin-top:14px;font-weight:700">' + esc(state.blocked) + "</div>"
      : "";
    var cats = DATA.categories.map(function (c) {
      var n = itemsByCat(c.id).length;
      return '<button class="cat" data-act="pick-cat" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
        '<span class="dot" style="background:' + c.color + '">' + esc(c.name.slice(0, 2)) + "</span>" +
        '<span><span class="t">' + esc(c.name) + '<span class="tag">' + n + "세트</span></span>" +
        '<span class="d">' + esc(c.desc || "") + "</span></span></button>";
    }).join("");
    return '<div class="wrap">' +
      '<section class="hero">' +
        '<span class="kicker">' + esc((m.year || "") + " " + (m.month || "") + " " + (m.grade || "") + " 학평") + "</span>" +
        "<h1>" + esc(m.subject || "영어 변형문제") + "</h1>" +
        "<p>" + esc((m.range || "29~42번") + " 지문으로 만든 어법·독해 변형문제") + "</p>" +
      "</section>" +
      blockedHTML +
      draftHTML +
      '<section class="card pad" style="margin-top:18px">' +
        '<div class="field-row">' +
          '<div class="field"><label for="nm">학생 이름</label>' +
            '<input id="nm" class="input" type="text" maxlength="20" placeholder="이름" value="' + esc(state.name) + '" autocomplete="off"></div>' +
          '<div class="field"><label for="cd">학생 코드</label>' +
            '<input id="cd" class="input" type="text" maxlength="20" placeholder="코드" value="' + esc(state.code) + '" autocomplete="off"></div>' +
        '</div>' +
        '<div class="field"><label>문제 유형 선택</label><div class="cat-list">' + cats + "</div></div>" +
        '<button class="btn primary block" data-act="start" style="margin-top:8px">문제 풀기 시작</button>' +
        '<div class="notice">점수와 오답 기록은 이 기기에 저장되며, 관리자(선생님) 화면에서 확인할 수 있습니다. ' +
          "PDF·인쇄 버튼으로 학생용 문제지와 해설지를 출력할 수 있습니다.</div>" +
        '<div class="meta-row"><span>' + esc(m.school || "") + "</span><span>지문 출처: EBSi 공식 문제지</span></div>" +
      "</section>" +
      '<p class="footer">' + esc(m.source || "") + "</p>" +
    "</div>";
  }

  function viewQuiz() {
    var item = ITEMS[state.ids[state.idx]];
    var cat = catMeta(item.cat);
    var total = state.ids.length;
    var answered = countAnswered();
    var unitCount = unitsAnswered(item);
    var pct = total ? Math.round(((state.idx) / total) * 100) : 0;
    return '<div class="wrap" style="padding-top:6px">' +
      '<div class="quiz-top">' +
        '<div class="row"><div class="cat-name"><span class="dot" style="width:9px;height:9px;border-radius:50%;background:' + cat.color + '"></span>' + esc(cat.name) +
          (state.retry ? ' <span class="chip no">오답 재풀이</span>' : "") + "</div>" +
          '<div class="count"><b>' + (state.idx + 1) + "</b> / " + total + " · <span id=\"clock\">" + fmtTime(state.elapsed) + "</span></div>" +
          '<button class="btn ghost" data-act="home" title="답안은 자동 저장됩니다" style="padding:4px 10px;font-size:12px;line-height:1.2">처음으로</button></div>' +
        '<div class="bar"><i style="width:' + Math.max(3, pct) + '%"></i></div>' +
      "</div>" +
      itemHTML(item, "solve") +
      '<div class="qbar"><div class="wrapbar">' +
        '<button class="btn" data-act="prev"' + (state.idx === 0 ? " disabled" : "") + ">이전</button>" +
        '<button class="btn ghost" data-act="palette">문제 목록</button>' +
        '<span class="spacer"></span>' +
        (state.idx < total - 1
          ? '<button class="btn primary" data-act="next">다음</button>'
          : '<button class="btn primary submit" data-act="submit">채점하기</button>') +
      "</div></div>" +
    "</div>";
  }

  function itemHTML(item, mode) {
    var head = '<div class="item-head"><div class="no-badge">' + esc(item.no) + "</div>" +
      '<div class="h"><div class="t">' + esc(item.title || "") + "</div>" +
      '<div class="s">' + esc(item.type || "") + (item.cat === "grammar" ? " · " + item.blanks.length + "문항" : "") + "</div></div></div>";
    var q = '<div class="q-text">' + esc(item.instruction || "") + "</div>";
    var pass = '<div class="passage">' + passageHTML(item, mode) + "</div>";
    var body = "";
    if (item.cat === "grammar") {
      body = head + q + pass;
    } else {
      var key = unitsOf(item)[0].key;
      var chosen = state.answers[key];
      var opts = item.options.map(function (o, i) {
        var cls = "choice";
        if (mode === "review") {
          if (i === item.answer) cls += " ok";
          else if (chosen === i) cls += " no";
        } else if (chosen === i) cls += " on";
        return '<li><button class="' + cls + '" data-act="pick" data-unit="' + key + '" data-i="' + i + '"' +
          (mode === "review" ? " disabled" : "") + '><span class="num">' + CIRCLE[i] + "</span><span>" + esc(o) + "</span></button></li>";
      }).join("");
      body = head + q + pass + '<ul class="choices">' + opts + "</ul>";
    }
    var foot = "";
    if (mode === "solve") {
      var done = unitsAnswered(item), tot = unitsOf(item).length;
      var hint;
      if (item.cat === "grammar") {
        if (state.retry) {
          var left = unitsOf(item).filter(function (u) { return state.retryKeys && state.retryKeys[u.key] && state.answers[u.key] == null; }).length;
          hint = "다시 볼 빈칸 " + left + "개 · 이미 맞힌 빈칸은 잠김";
        } else {
          hint = "빈칸 " + tot + "개 중 " + done + "개 선택";
        }
      } else {
        hint = state.answers[unitsOf(item)[0].key] != null ? "선택 완료" : "보기를 선택하세요";
      }
      foot = '<div class="item-foot"><span class="hint">' + hint + "</span></div>";
    }
    return '<article class="item">' + body + foot + "</article>";
  }

  function passageHTML(item, mode) {
    return (item.paragraphs || []).map(function (p) {
      var h = esc(p)
        .replace(/\[\[([a-e])\]\]/g, '<u class="ul">')
        .replace(/\[\[\/([a-e])\]\]/g, "</u>");
      if (item.cat === "grammar") {
        h = h.replace(/\{\{(\d+)\}\}/g, function (_, n) { return blankHTML(item, Number(n), mode); });
      } else {
        h = h.replace(/\{\{B\}\}/g, '<span class="blank-slot"></span>');
      }
      return "<p>" + h + "</p>";
    }).join("");
  }

  function blankHTML(item, n, mode) {
    var b = item.blanks.filter(function (x) { return x.n === n; })[0];
    var key = item.id + "#" + n;
    var chosen = state.answers[key];
    var locked = !!state.locked[key];
    var cls = "blank-inline";
    if (mode === "review") {
      var ok = chosen === b.answer;
      cls += ok ? " is-right" : " is-wrong";
    }
    var pills = b.opts.map(function (o, i) {
      var c = "pill";
      if (mode === "review") {
        if (i === b.answer) c += " ok";
        else if (chosen === i) c += " no";
      } else {
        if (chosen === i) c += " on";
        if (locked && b.answer === i) c += " ok";
      }
      return '<button class="' + c + '" data-act="pick" data-unit="' + key + '" data-i="' + i + '"' +
        (mode === "review" || locked ? " disabled" : "") + ">" + esc(o) + "</button>";
    }).join("");
    return '<span class="' + cls + '"><span class="bno">(' + n + ")</span>" + pills + "</span>";
  }

  function countAnswered() {
    return state.ids.filter(function (id) {
      var it = ITEMS[id];
      return unitsOf(it).every(function (u) { return state.answers[u.key] != null; });
    }).length;
  }
  function unitsAnswered(item) {
    return unitsOf(item).filter(function (u) { return state.answers[u.key] != null; }).length;
  }

  /* ---------- grading ---------- */
  function grade() {
    var units = [];
    state.ids.forEach(function (id) {
      var it = ITEMS[id];
      unitsOf(it).forEach(function (u) {
        if (state.retryKeys && !state.retryKeys[u.key]) return;
        var chosen = state.answers[u.key];
        var answer = correctIndex(it, u.key);
        units.push({
          i: it.id, no: it.no, label: u.label, key: u.key,
          cat: it.cat, title: it.title, type: it.type,
          chosen: chosen == null ? null : optionText(it, u.key, chosen),
          chosenIdx: chosen == null ? null : chosen,
          answer: optionText(it, u.key, answer),
          answerIdx: answer,
          ok: chosen === answer,
          why: whyOf(it, u.key)
        });
      });
    });
    var correct = units.filter(function (u) { return u.ok; }).length;
    var total = units.length;
    return {
      units: units,
      total: total,
      correct: correct,
      pct: total ? Math.round((correct / total) * 1000) / 10 : 0
    };
  }

  function submitQuiz() {
    var res = grade();
    var unanswered = res.units.filter(function (u) { return u.chosenIdx == null; }).length;
    if (unanswered > 0) {
      var go = window.confirm("아직 풀지 않은 문항이 " + unanswered + "개 있습니다. 그래도 채점할까요?");
      if (!go) return;
    }
    clearDraft();
    stopTimer();
    var rec = {
      id: uid(),
      name: (state.name || "이름 없음").slice(0, 20),
      cat: state.cat,
      catName: catMeta(state.cat).name,
      mode: state.retry ? "retry" : "full",
      ts: new Date().toISOString(),
      elapsed: Math.round(state.elapsed),
      total: res.total,
      correct: res.correct,
      pct: res.pct,
      units: res.units.map(function (u) {
        return {
          i: u.i, no: u.no, label: u.label, ok: u.ok,
          chosen: u.chosen, answer: u.answer, type: u.type
        };
      })
    };
    state.result = res;
    state.result.rec = rec;
    addRecord(rec);
    state.view = "result";
    window.scrollTo(0, 0);
    render();
  }

  function viewResult() {
    var r = state.result;
    if (!r) { state.view = "login"; return viewLogin(); }
    var cat = catMeta(state.cat);
    var wrong = r.units.filter(function (u) { return !u.ok; });
    var byItem = {};
    r.units.forEach(function (u) { (byItem[u.i] = byItem[u.i] || []).push(u); });

    var review = Object.keys(byItem).map(function (id) {
      var it = ITEMS[id];
      var us = byItem[id];
      var badCount = us.filter(function (u) { return !u.ok; }).length;
      var rows = us.map(function (u) {
        return '<div class="ans-line"><span class="k">' + esc(u.label ? u.no + " " + u.label : u.no + "번") + "</span>" +
          '<span class="' + (u.ok ? "right" : "mine") + '">내 답: ' + esc(u.chosen == null ? "미응답" : u.chosen) + "</span>" +
          (u.ok ? "" : '<span class="right">정답: ' + esc(u.answer) + "</span>") + "</div>" +
          '<div class="why">' + esc(u.why) + "</div>";
      }).join("");
      return '<details class="rev"' + (badCount ? " open" : "") + ">" +
        '<summary><span class="no">' + esc(it.no) + "</span>" + esc(it.title || "") +
        (badCount ? '<span class="chip no">' + badCount + "개 오답</span>" : '<span class="chip ok">모두 정답</span>') +
        '<span class="arw">⌄</span></summary>' +
        '<div class="body">' + rows +
        (it.summary ? '<div class="mini-passage">' + esc(it.summary) + "</div>" : "") + "</div></details>";
    }).join("");

    return '<div class="wrap">' +
      '<section class="card score-card">' +
        '<div class="ring" style="--p:' + r.pct + '"><span>' + r.pct + "<i>%</i></span></div>" +
        '<div class="score-meta">' +
          "<h2>" + esc(state.name || "학생") + " · " + esc(cat.name) + "</h2>" +
          '<div class="sub">' + (state.retry ? "오답 재풀이 결과" : "채점 완료") + " · " + fmtDate((r.rec || {}).ts || new Date().toISOString()) + "</div>" +
          '<div class="stat-row">' +
            '<div class="stat">정답<b>' + r.correct + " / " + r.total + "</b></div>" +
            '<div class="stat">정답률<b>' + r.pct + "%</b></div>" +
            '<div class="stat">오답<b>' + wrong.length + "개</b></div>" +
            '<div class="stat">풀이 시간<b>' + fmtTime(state.elapsed) + "</b></div>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<div class="actions">' +
        (wrong.length ? '<button class="btn primary" data-act="retry-wrong">틀린 문제만 다시 풀기</button>' : "") +
        '<button class="btn" data-act="retry-all">전체 다시 풀기</button>' +
        '<button class="btn" data-act="print-result">성적표 인쇄</button>' +
        '<button class="btn ghost" data-act="home">처음으로</button>' +
      "</div>" +
      '<section class="review"><h3>문항별 해설 <span class="chip">' + r.total + "문항</span></h3>" + review + "</section>" +
      '<p class="footer">기록은 이 기기의 관리자 화면에 저장되었습니다.</p>' +
    "</div>";
  }

  /* ---------- quiz flow ---------- */
  function startQuiz(cat) {
    clearDraft();
    state.cat = cat;
    state.retry = false;
    state.retryOriginScore = null;
    state.result = null;
    state.ids = itemsByCat(cat).map(function (it) { return it.id; });
    state.retryKeys = null;
    state.locked = {};
    state.answers = {};
    state.idx = 0;
    state.view = "quiz";
    window.scrollTo(0, 0);
    startTimer();
    render();
  }

  function retryWrong() {
    var r = state.result;
    if (!r) return;
    state.retryOriginScore = { correct: r.correct, total: r.total, pct: r.pct };
    var wrongKeys = r.units.filter(function (u) { return !u.ok; }).map(function (u) { return u.key; });
    var ids = [];
    r.units.forEach(function (u) { if (u.i && ids.indexOf(u.i) < 0) ids.push(u.i); });
    ids = ids.filter(function (id) {
      return unitsOf(ITEMS[id]).some(function (u) { return wrongKeys.indexOf(u.key) >= 0; });
    });
    // only the previously wrong blanks stay interactive; the rest are pre-filled correctly
    state.answers = {};
    state.locked = {};
    state.retryKeys = {};
    wrongKeys.forEach(function (k) { state.retryKeys[k] = true; });
    ids.forEach(function (id) {
      var it = ITEMS[id];
      unitsOf(it).forEach(function (u) {
        if (!state.retryKeys[u.key]) {
          state.answers[u.key] = correctIndex(it, u.key);
          state.locked[u.key] = true;
        }
      });
    });
    state.ids = ids;
    state.idx = 0;
    state.retry = true;
    state.result = null;
    state.view = "quiz";
    window.scrollTo(0, 0);
    startTimer();
    saveDraft();
    render();
    if (state.retryOriginScore) toast("오답 재풀이를 시작합니다. 이전 " + state.retryOriginScore.correct + "/" + state.retryOriginScore.total);
  }

  /* ---------- palette ---------- */
  function openPalette() {
    var html = '<div class="sheet-back" data-act="close-palette"><div class="sheet" data-stop="1">' +
      "<h3>문제 목록</h3><div class=\"legend\">번호를 누르면 바로 이동합니다. 파란색은 답을 모두 고른 문항입니다.</div>" +
      '<div class="grid">' +
      state.ids.map(function (id, i) {
        var it = ITEMS[id];
        var done = unitsOf(it).every(function (u) { return state.answers[u.key] != null; });
        return '<button class="' + (done ? "done " : "") + (i === state.idx ? "cur" : "") + '" data-act="jump" data-i="' + i + '">' +
          esc(it.no) + "<small>" + esc(it.type || "") + "</small></button>";
      }).join("") +
      "</div></div></div>";
    var host = $("#modalRoot");
    host.innerHTML = html;
  }

  /* ---------- print ---------- */
  function printModal() {
    var host = $("#modalRoot");
    var opts = ['<option value="all">전체 (29~42번)</option>'].concat(DATA.categories.map(function (c) {
      return '<option value="' + c.id + '"' + (state.cat === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>";
    })).join("");
    host.innerHTML = '<div class="modal" data-act="close-modal"><div class="box" data-stop="1" style="max-width:520px">' +
      '<div class="box-head"><h2>PDF 출력 / 인쇄</h2><button class="x" data-act="close-modal">✕</button></div>' +
      '<div class="box-body">' +
        '<div class="field"><label>범위</label><select id="printScope" class="input">' + opts + "</select></div>" +
        '<div class="hint-inline">브라우저 인쇄 창에서 ‘PDF로 저장’을 선택하면 PDF 파일이 만들어집니다.</div>' +
        '<button class="btn block primary" data-act="print" data-mode="exam" style="margin-bottom:8px">학생용 문제지 (정답 숨김)</button>' +
        '<button class="btn block" data-act="print" data-mode="key" style="margin-bottom:8px">해설지 포함 (정답·해설)</button>' +
        (state.result ? '<button class="btn block" data-act="print" data-mode="report">내 성적표 인쇄</button>' : "") +
      "</div></div></div>";
  }

  function printScopeItems() {
    var sel = $("#printScope");
    var v = sel ? sel.value : "all";
    if (v === "all") return ORDER.map(function (id) { return ITEMS[id]; });
    return itemsByCat(v);
  }

  function buildPrint(mode) {
    var root = $("#printRoot");
    var meta = DATA.meta || {};
    var now = new Date();
    var head = '<div class="p-head"><h1>' + esc(meta.school + " " + meta.subject) + "</h1>" +
      '<div class="sub">' + esc(meta.range) + " · " + (mode === "key" ? "해설지" : mode === "report" ? "성적표" : "학생용 문제지") + "</div>" +
      '<div class="p-info"><span>이름: ' + (mode === "report" ? esc(state.name || "") : "________________") + "</span>" +
      "<span>날짜: " + now.getFullYear() + "." + pad(now.getMonth() + 1) + "." + pad(now.getDate()) + "</span>" +
      "<span>출처: 2026년 10월 고2 전국연합학력평가 (EBSi 공식 문제지)</span></div></div>";

    if (mode === "report") {
      root.innerHTML = '<div class="p-doc">' + head + reportBody() +
        '<div class="p-foot">EPIC QUIZ · 2026 10월 고2 영어 변형문제</div></div>';
      return;
    }

    var items = printScopeItems();
    var withKey = mode === "key";
    var sel = $("#printScope");
    var isAll = !sel || sel.value === "all";
    var parts = "";
    if (isAll) {
      ["grammar", "multiple", "cloze"].forEach(function (cid) {
        var group = items.filter(function (it) { return it.cat === cid; });
        if (!group.length) return;
        parts += '<h2 class="p-sec">' + esc(catMeta(cid).name) + "</h2>" +
          group.map(function (it) { return printItem(it, withKey); }).join("");
      });
    } else {
      parts = items.map(function (it) { return printItem(it, withKey); }).join("");
    }
    var keyTable = withKey ? answerTable(items) : "";
    root.innerHTML = '<div class="p-doc">' + head + keyTable + parts +
      '<div class="p-foot">EPIC QUIZ · ' + esc(meta.source || "") + "</div></div>";
  }

  function printItem(item, withKey) {
    var h = '<div class="p-item"><h2>[' + esc(item.no) + "] " + esc(item.title || "") + "</h2>" +
      '<div class="p-q">' + esc(item.type) + " · " + esc(item.instruction) + "</div>";
    var body = (item.paragraphs || []).map(function (p) {
      var t = esc(p).replace(/\[\[([a-e])\]\]/g, "<u>" ).replace(/\[\[\/([a-e])\]\]/g, "</u>");
      if (item.cat === "grammar") {
        t = t.replace(/\{\{(\d+)\}\}/g, function (_, n) {
          var b = item.blanks.filter(function (x) { return x.n === Number(n); })[0];
          return ' <span class="p-opt">(' + n + ") " + b.opts.map(function (o, i) {
            var isRight = withKey && i === b.answer;
            return '<span class="p-opt' + (isRight ? " right" : "") + '">' + esc(o) + "</span>";
          }).join(" / ") + "</span> ";
        });
      } else {
        t = t.replace(/\{\{B\}\}/g, '<span class="p-blank"></span>');
      }
      return "<p>" + t + "</p>";
    }).join("");
    var choices = "";
    if (item.cat !== "grammar") {
      choices = '<div class="p-choices">' + item.options.map(function (o, i) {
        var right = withKey && i === item.answer;
        return '<span class="' + (right ? "p-opt right" : "") + '">' + CIRCLE[i] + " " + esc(o) + "</span>";
      }).join("") + "</div>";
    }
    var ans = "";
    if (withKey) {
      if (item.cat === "grammar") {
        ans = '<div class="p-ans"><b>정답</b> ' + item.blanks.map(function (b) {
          return "(" + b.n + ") <b>" + esc(b.opts[b.answer]) + "</b>";
        }).join(" · ") + "<br><b>해설</b> " + item.blanks.map(function (b) {
          return "(" + b.n + ") " + esc(b.why);
        }).join(" ") + "</div>";
      } else {
        ans = '<div class="p-ans"><b>정답</b> ' + CIRCLE[item.answer] + " " + esc(item.options[item.answer]) +
          "<br><b>해설</b> " + esc(item.why) + "</div>";
      }
    }
    return h + '<div class="p-pass">' + body + "</div>" + choices + ans + "</div>";
  }

  function answerTable(items) {
    var blocks = "";
    ["grammar", "multiple", "cloze"].forEach(function (cid) {
      var group = items.filter(function (it) { return it.cat === cid; });
      if (!group.length) return;
      var cells = [];
      group.forEach(function (it) {
        if (it.cat === "grammar") {
          it.blanks.forEach(function (b) { cells.push(esc(it.no) + "(" + b.n + ") " + esc(b.opts[b.answer])); });
        } else {
          cells.push(esc(it.no) + " " + CIRCLE[it.answer]);
        }
      });
      blocks += '<div class="p-key"><b>정답표 · ' + esc(catMeta(cid).name) + "</b>" +
        cells.map(function (c) { return "<span>" + c + "</span>"; }).join("") + "</div>";
    });
    return blocks;
  }

  function reportBody() {
    var r = state.result;
    if (!r) return '<p>결과가 없습니다.</p>';
    var wrong = r.units.filter(function (u) { return !u.ok; });
    var rows = wrong.length ? wrong.map(function (u) {
      return '<div class="p-ans"><b>' + esc(u.no + ' ' + (u.label || '')) + '번</b> · 내 답: <span style="text-decoration:line-through">' +
        esc(u.chosen || "미응답") + "</span> · 정답: <b>" + esc(u.answer) + "</b><br>" + esc(u.why) + "</div>";
    }).join("") : '<p>모든 문항을 맞혔습니다.</p>';
    return '<h2 style="font-size:12pt;margin:8px 0 4px">' + esc(state.name || "학생") + " · " + esc(catMeta(state.cat).name) + "</h2>" +
      '<p style="font-size:10pt;margin-bottom:8px">정답 ' + r.correct + " / " + r.total + " · 정답률 " + r.pct + "% · 풀이 시간 " + fmtTime(state.elapsed) + "</p>" +
      '<h2 style="font-size:11pt;margin:10px 0 6px">오답 및 해설</h2>' + rows;
  }

  function doPrint(mode) {
    buildPrint(mode);
    $("#modalRoot").innerHTML = "";
    setTimeout(function () { window.print(); }, 120);
  }

  /* ---------- admin ---------- */
  function adminModal() {
    var host = $("#modalRoot");
    if (!state.admin.ok) {
      host.innerHTML = '<div class="modal" data-act="close-modal"><div class="box" data-stop="1" style="max-width:400px">' +
        '<div class="box-head"><h2>관리자 전용</h2><button class="x" data-act="close-modal">✕</button></div>' +
        '<div class="box-body">' +
          '<div class="field"><label for="pw">비밀번호</label><input id="pw" class="input" type="password" inputmode="numeric" placeholder="비밀번호" autocomplete="off"></div>' +
          '<button class="btn primary block" data-act="admin-login">들어가기</button>' +
          '<div class="hint-inline" style="margin-top:10px">학생 성적과 오답 기록을 확인하는 화면입니다.</div>' +
        "</div></div></div>";
      var inp = $("#pw");
      if (inp) {
        inp.focus();
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") adminLogin(); });
      }
      return;
    }
    host.innerHTML = '<div class="modal" data-act="close-modal"><div class="box" data-stop="1">' +
      '<div class="box-head"><h2>관리자 대시보드</h2><button class="x" data-act="close-modal">✕</button></div>' +
      '<div class="box-body" id="adminBody">' + adminBody() + "</div></div></div>";
    bindAdmin();
  }

  function adminBody() {
    var recs = loadRecords().slice().sort(function (a, b) { return (b.ts || "").localeCompare(a.ts || ""); });
    var full = recs.filter(function (r) { return r.mode !== "retry"; });
    var names = {};
    recs.forEach(function (r) { names[r.name] = true; });
    var nameCount = Object.keys(names).length;
    var avg = full.length ? Math.round(full.reduce(function (s, r) { return s + (r.pct || 0); }, 0) / full.length * 10) / 10 : 0;
    var tab = state.admin.tab;
    var out = '<div class="kpis">' +
      '<div class="kpi"><div class="l">응시 기록</div><div class="v">' + recs.length + " <small>건</small></div></div>" +
      '<div class="kpi"><div class="l">학생 수</div><div class="v">' + nameCount + " <small>명</small></div></div>" +
      '<div class="kpi"><div class="l">평균 정답률</div><div class="v">' + avg + " <small>%</small></div></div>" +
      '<div class="kpi"><div class="l">오답 재풀이</div><div class="v">' + recs.filter(function (r) { return r.mode === "retry"; }).length + " <small>건</small></div></div>" +
      "</div>" +
      '<div class="tabs">' +
        '<button data-act="admin-tab" data-tab="records" class="' + (tab === "records" ? "on" : "") + '">학생 기록</button>' +
        '<button data-act="admin-tab" data-tab="students" class="' + (tab === "students" ? "on" : "") + '">학생 명단</button>' +
        '<button data-act="admin-tab" data-tab="accuracy" class="' + (tab === "accuracy" ? "on" : "") + '">문항별 정답률</button>' +
        '<button data-act="admin-tab" data-tab="settings" class="' + (tab === "settings" ? "on" : "") + '">설정 · 동기화</button>' +
      "</div>";

    if (tab === "records") {
      out += '<div class="toolbar">' +
        '<button class="btn" data-act="csv">CSV 내려받기</button>' +
        '<button class="btn" data-act="refresh">새로고침</button>' +
        '<button class="btn danger" data-act="clear-records">기록 전체 삭제</button>' +
      "</div>";
      out += recs.length ? recs.map(studentRow).join("") : '<div class="empty">아직 제출된 기록이 없습니다.<br>학생이 문제를 풀고 ‘채점하기’를 누르면 여기에 표시됩니다.</div>';
    } else if (tab === "students") {
      if (!state.admin.stu || (!state.admin.stu.rows && !state.admin.stu.error && !state.admin.stu.loading)) {
        setTimeout(function () { loadStudents(true); }, 0);
      }
      out += studentsPanel();
    } else if (tab === "accuracy") {
      out += accuracyTable(full);
    } else {
      out += settingsPanel();
    }
    return out;
  }

  function studentRow(r, i) {
    var wrong = (r.units || []).filter(function (u) { return !u.ok; });
    var detail = wrong.length ? '<ul class="wrong-list">' + wrong.map(function (u) {
      return '<li><span class="w-q">' + esc(u.no) + (u.label ? " " + esc(u.label) : "") + "번</span>" +
        "<span>내 답: <b>" + esc(u.chosen == null ? "미응답" : u.chosen) + "</b></span>" +
        '<span class="c">정답: ' + esc(u.answer) + "</span></li>";
    }).join("") + "</ul>" : '<div class="hint-inline" style="margin-top:8px">오답이 없습니다.</div>';
    return '<details class="stu"><summary>' +
      '<span class="nm">' + esc(r.name) + "</span>" +
      '<span class="dt">' + esc(fmtDate(r.ts)) + "</span>" +
      '<span class="badge">' + esc(r.catName || r.cat || "") + "</span>" +
      (r.mode === "retry" ? '<span class="badge">오답 재풀이</span>' : "") +
      '<span class="sc">' + (r.correct || 0) + "/" + (r.total || 0) + " · " + (r.pct || 0) + '% <small>정답률</small></span>' +
      "</summary><div class=\"body\">" +
      '<div class="hint-inline" style="margin:8px 0">풀이 시간 ' + fmtTime(r.elapsed || 0) +
        " · 오답 " + wrong.length + "개" + (r.id ? " · ID " + esc(r.id) : "") + "</div>" +
      detail + "</div></details>";
  }

  function accuracyTable(recs) {
    var map = {};
    recs.forEach(function (r) {
      (r.units || []).forEach(function (u) {
        var key = u.no + (u.label ? " " + u.label : "");
        var row = map[key] || (map[key] = { key: key, no: u.no, label: u.label || "", type: u.type || "", title: "", att: 0, ok: 0 });
        row.att++; if (u.ok) row.ok++;
      });
      (r.units || []).forEach(function (u) {
        var k = u.no + (u.label ? " " + u.label : "");
        if (map[k] && !map[k].title && u.i && ITEMS[u.i]) { map[k].title = ITEMS[u.i].title; map[k].cat = ITEMS[u.i].cat; }
      });
    });
    var rows = Object.keys(map).map(function (k) {
      var r = map[k];
      r.pct = r.att ? Math.round((r.ok / r.att) * 1000) / 10 : 0;
      return r;
    });
    if (!rows.length) return '<div class="empty">문항별 통계를 계산할 기록이 없습니다.<br>학생이 제출하면 문항별 정답률이 여기에 집계됩니다.</div>';
    rows.sort(function (a, b) {
      if (state.admin.sort === "low") return a.pct - b.pct;
      if (state.admin.sort === "high") return b.pct - a.pct;
      return String(a.no).localeCompare(String(b.no), "ko", { numeric: true }) ||
        a.label.localeCompare(b.label);
    });
    var head = '<div class="toolbar">' +
      '<button class="btn ' + (state.admin.sort === "low" ? "primary" : "") + '" data-act="admin-sort" data-sort="low">정답률 낮은 순</button>' +
      '<button class="btn ' + (state.admin.sort === "high" ? "primary" : "") + '" data-act="admin-sort" data-sort="high">높은 순</button>' +
      '<button class="btn ' + (state.admin.sort === "no" ? "primary" : "") + '" data-act="admin-sort" data-sort="no">번호 순</button>' +
      "</div>";
    var body = rows.map(function (r) {
      var low = r.pct < 60;
      return "<tr><td class=\"num\"><b>" + esc(r.no) + (r.label ? " " + esc(r.label) : "") + "</b></td>" +
        "<td>" + esc(r.title || "") + "<br><small style=\"color:#6b7280\">" + esc(r.type) + "</small></td>" +
        '<td class="num">' + r.att + "</td>" +
        '<td class="num"><b>' + r.pct + "%</b></td>" +
        '<td style="min-width:110px"><div class="bar-mini' + (low ? " low" : "") + '"><i style="width:' + Math.max(2, r.pct) + '%"></i></div></td></tr>';
    }).join("");
    return head + '<div style="overflow:auto;max-height:56vh"><table><thead><tr><th>문항</th><th>지문 / 유형</th><th>응답</th><th>정답률</th><th></th></tr></thead><tbody>' +
      body + "</tbody></table></div>" +
      '<div class="hint-inline" style="margin-top:8px">학생별 ‘전체 풀이’ 기록만 집계합니다(오답 재풀이 제외).</div>';
  }

  /* ---------- admin: 학생 명단 ---------- */
  function adminStu() {
    if (!state.admin.stu) state.admin.stu = { rows: null, loading: false, error: null, name: "", code: "" };
    return state.admin.stu;
  }
  function renderAdminStu() {
    var b = $("#adminBody");
    if (b) b.innerHTML = adminBody();
  }
  function loadStudents(force) {
    var s = adminStu();
    if (s.loading) return;
    if (!force && s.rows) return;
    s.loading = true;
    s.error = null;
    renderAdminStu();
    studentsApi().list().then(function (rows) {
      s.rows = rows; s.loading = false; s.error = null; renderAdminStu();
    }).catch(function (e) {
      s.rows = null; s.loading = false; s.error = e; renderAdminStu();
    });
  }
  function studentsPanel() {
    var s = adminStu();
    var rows = s.rows || [];
    var on = rows.filter(function (r) { return r.active === true; }).length;
    var off = rows.length - on;
    var out = '<div class="notice" style="margin:0 0 12px">학생 명단은 <b>세 사이트(2026 10모 · 2026 수능 · 2026 9모)</b>가 같은 표를 함께 씁니다. 여기서 추가·차단하면 세 사이트에 바로 적용되고, 명단에 없거나 차단된 학생은 문제를 시작할 수 없습니다.</div>';
    out += '<div class="stu-add">' +
      '<input id="stuNm" class="input" type="text" maxlength="20" placeholder="학생 이름" value="' + esc(s.name) + '" autocomplete="off">' +
      '<input id="stuCd" class="input" type="text" maxlength="20" placeholder="학생 코드" value="' + esc(s.code) + '" autocomplete="off">' +
      '<button class="btn primary" data-act="stu-add">추가</button></div>';
    out += '<div class="toolbar"><button class="btn" data-act="stu-refresh">새로고침</button>' +
      (rows.length ? '<span class="hint-inline" style="align-self:center">전체 <b>' + rows.length + '</b>명 · 허용 <b>' + on + '</b>명 · 차단 <b>' + off + '</b>명</span>' : "") +
      "</div>";
    if (s.error) {
      out += '<div class="notice bad">' + esc(studentsProblemText(s.error)) + "</div>";
      if (s.error.kind === "missing" || s.error.kind === "denied_db" || s.error.kind === "nokey") {
        out += '<div class="notice"><b>Supabase SQL Editor에서 아래 SQL을 한 번 실행해 주세요.</b>' +
          '<code style="font-size:11px;display:block;white-space:pre-wrap;background:#f3f4f8;padding:8px;border-radius:8px;margin-top:8px">' + esc(STUDENTS_SQL) + "</code></div>";
      }
      return out;
    }
    if (!rows.length) {
      return out + '<div class="empty">' + (s.loading
        ? "학생 명단을 불러오는 중…"
        : "명단에 등록된 학생이 없습니다.<br>위에서 이름과 코드를 넣고 [추가]를 누르면, 그 학생만 문제를 시작할 수 있습니다.") + "</div>";
    }
    var sorted = rows.slice().sort(function (a, b) {
      var aa = a.active === true ? 0 : 1, bb = b.active === true ? 0 : 1;
      if (aa !== bb) return aa - bb;
      return String(a.name || "").localeCompare(String(b.name || ""), "ko");
    });
    out += '<div class="stu-list">' + sorted.map(function (r) {
      var act = r.active === true;
      return '<div class="stu-item' + (act ? "" : " off") + '">' +
        '<div class="who"><b>' + esc(r.name) + '</b><span class="cd">코드 ' + esc(r.code) + "</span></div>" +
        '<span class="state ' + (act ? "on" : "off") + '">' + (act ? "허용 중" : "차단됨") + "</span>" +
        '<button class="btn" data-act="stu-toggle" data-id="' + esc(r.id) + '" data-active="' + (act ? "false" : "true") + '">' + (act ? "차단" : "허용") + "</button>" +
        '<button class="btn danger" data-act="stu-del" data-id="' + esc(r.id) + '" data-name="' + esc(r.name) + '">삭제</button>' +
        "</div>";
    }).join("") + "</div>";
    return out;
  }

  function settingsPanel() {
    var cfg = getSupa();
    var ready = !!(cfg.url && cfg.key);
    var sql = "alter table quiz_results enable row level security;\n"
      + 'create policy "quiz insert" on quiz_results for insert to anon with check (true);\n'
      + 'create policy "quiz select" on quiz_results for select to anon using (true);';
    return '<div class="notice" style="margin:0 0 14px">동기화 상태: <b>'
      + (ready ? "연결 준비됨 (anon key 입력됨)" : "기기 저장만 사용 중 (anon key 없음)")
      + "</b><br>키가 없어도 모든 기록은 이 기기(localStorage)에 저장되고, 관리자 화면에서 확인할 수 있습니다.</div>"
      + '<div class="field"><label>Supabase URL</label><input id="sUrl" class="input" placeholder="https://xxxx.supabase.co" value="' + esc(cfg.url || "") + '"></div>'
      + '<div class="field"><label>anon public key</label><input id="sKey" class="input" placeholder="eyJhbGciOi... (비워 두면 기기 저장만)" value="' + esc(cfg.key || "") + '"></div>'
      + '<div class="field"><label>테이블 이름</label><input id="sTable" class="input" placeholder="quiz_results" value="' + esc(cfg.table || SUPABASE_TABLE) + '"></div>'
      + '<div class="toolbar"><button class="btn primary" data-act="supa-save">저장</button>'
      + '<button class="btn" data-act="supa-pull">원격 기록 불러오기</button></div>'
      + '<div class="notice">테이블 <code>quiz_results</code>의 컬럼(student_name, category, score, total, accuracy, wrong_items, answers)에 맞춰 전송합니다. anon key로 읽고 쓰려면 아래 정책을 한 번 실행해 두세요.<br><br>'
      + '<code style="font-size:11px;display:block;white-space:pre-wrap;background:#f3f4f8;padding:8px;border-radius:8px">' + esc(sql) + '</code></div>';
  }

  function adminLogin() {
    var v = ($("#pw") || {}).value || "";
    if (v.trim() === ADMIN_PASSWORD) {
      state.admin.ok = true;
      adminModal();
    } else {
      toast("비밀번호가 올바르지 않습니다.");
      var pw = $("#pw"); if (pw) { pw.value = ""; pw.focus(); }
    }
  }

  function bindAdmin() {
    // handled by delegated events
  }

  function refreshAdmin() {
    var b = $("#adminBody");
    if (b) b.innerHTML = adminBody();
  }

  function csvDownload() {
    var recs = loadRecords();
    var lines = [["이름", "시각", "유형", "구분", "정답", "총문항", "정답률(%)", "풀이시간(초)", "오답문항"].join(",")];
    recs.forEach(function (r) {
      var wrong = (r.units || []).filter(function (u) { return !u.ok; })
        .map(function (u) { return u.no + (u.label || "") + "(내답:" + (u.chosen || "미응답") + "/정답:" + u.answer + ")"; }).join(" | ");
      lines.push([r.name, fmtDate(r.ts), r.catName, r.mode === "retry" ? "오답재풀이" : "전체",
        r.correct, r.total, r.pct, r.elapsed || 0, wrong].map(function (v) {
          return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
        }).join(","));
    });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "epic-quiz-records-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------- events ---------- */
  function bind() { /* events are delegated once, below */ }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");

    // modal backdrop close
    if (t.classList.contains("sheet-back") && e.target !== t) return;
    if (t.classList.contains("modal") && e.target !== t) return;

    switch (act) {
      case "pick-cat":
        state.cat = t.getAttribute("data-cat");
        render();
        break;
      case "start": {
        var nm = ($("#nm") || {}).value || "";
        var cdv = ($("#cd") || {}).value || "";
        state.name = nm.trim();
        state.code = cdv.trim();
        state.blocked = "";
        if (!state.name) { toast("이름을 입력해 주세요."); var i0 = $("#nm"); if (i0) i0.focus(); return; }
        if (!state.code) { toast("학생 코드를 입력해 주세요."); var i1 = $("#cd"); if (i1) i1.focus(); return; }
        try { localStorage.setItem(KEYS.name, state.name); localStorage.setItem(KEYS.code, state.code); } catch (err) {}
        if (!state.cat) { toast("문제 유형을 선택해 주세요."); return; }
        var startBtn = t;
        if (startBtn) startBtn.disabled = true;
        verifyStudent(state.name, state.code, function (res) {
          if (startBtn) startBtn.disabled = false;
          if (res.status === "invalid") return;
          if (res.status === "unavailable") { toast(gatePassMessage()); beginQuizFlow(); return; }
          if (res.status !== "ok") { setBlocked(BLOCK_MSG); render(); return; }
          beginQuizFlow();
        });
        break;
      }
      case "pick":
        e.stopPropagation();
        var unit = t.getAttribute("data-unit");
        var idx = Number(t.getAttribute("data-i"));
        if (state.locked[unit]) return;
        state.answers[unit] = (state.answers[unit] === idx) ? undefined : idx;
        saveDraft();
        render();
        break;
      case "next":
        if (state.idx < state.ids.length - 1) { state.idx++; saveDraft(); window.scrollTo(0, 0); render(); }
        break;
      case "prev":
        if (state.idx > 0) { state.idx--; saveDraft(); window.scrollTo(0, 0); render(); }
        break;
      case "jump":
        state.idx = Number(t.getAttribute("data-i"));
        saveDraft();
        $("#modalRoot").innerHTML = "";
        window.scrollTo(0, 0);
        render();
        break;
      case "palette":
        openPalette();
        break;
      case "close-palette":
        $("#modalRoot").innerHTML = "";
        break;
      case "submit":
        submitQuiz();
        break;
      case "retry-wrong":
        retryWrong();
        break;
      case "resume": {
        if (!state.draft) break;
        var rn = (($("#nm") || {}).value || state.name || "").trim();
        var rc = (($("#cd") || {}).value || state.code || "").trim();
        var dName = String(state.draft.name || "").trim();
        if (dName && rn && dName !== rn) {
          toast("저장된 답안은 ‘" + dName + "’ 학생의 것입니다. 이름을 확인해 주세요.");
          return;
        }
        state.name = rn; state.code = rc; state.blocked = "";
        try { localStorage.setItem(KEYS.name, rn); localStorage.setItem(KEYS.code, rc); } catch (err2) {}
        var resBtn = t;
        if (resBtn) resBtn.disabled = true;
        verifyStudent(rn, rc, function (res) {
          if (resBtn) resBtn.disabled = false;
          if (res.status === "invalid") return;
          if (res.status === "unavailable") toast(gatePassMessage());
          if (res.status === "ok" || res.status === "unavailable") {
            if (state.draft) restoreDraft(state.draft);
            return;
          }
          clearDraft();
          setBlocked(BLOCK_MSG);
          render();
        });
        break;
      }
      case "discard-draft":
        if (window.confirm("저장된 답안을 지울까요? 되돌릴 수 없습니다.")) {
          clearDraft();
          render();
          toast("저장된 답안을 지웠습니다.");
        }
        break;
      case "retry-all": {
        if (!state.name || !state.code) { startQuiz(state.cat); break; }
        var raBtn = t;
        if (raBtn) raBtn.disabled = true;
        verifyStudent(state.name, state.code, function (res) {
          if (raBtn) raBtn.disabled = false;
          if (res.status === "invalid") return;
          if (res.status === "unavailable") toast(gatePassMessage());
          if (res.status === "ok" || res.status === "unavailable") { startQuiz(state.cat); return; }
          setBlocked(BLOCK_MSG);
          state.view = "login";
          render();
        });
        break;
      }
      case "home":
        stopTimer();
        saveDraft();
        state.view = "login";
        state.result = null;
        state.retry = false;
        render();
        break;
      case "print-result":
        state.result = state.result;
        printModal();
        break;
      case "close-modal":
        $("#modalRoot").innerHTML = "";
        break;
      case "admin-login":
        adminLogin();
        break;
      case "admin-tab":
        state.admin.tab = t.getAttribute("data-tab");
        refreshAdmin();
        break;
      case "admin-sort":
        state.admin.sort = t.getAttribute("data-sort");
        refreshAdmin();
        break;
      case "stu-add": {
        var sa = adminStu();
        var nn1 = (($("#stuNm") || {}).value || "").trim();
        var cc1 = (($("#stuCd") || {}).value || "").trim();
        sa.name = nn1; sa.code = cc1;
        if (!nn1) { toast("학생 이름을 입력해 주세요."); var e1 = $("#stuNm"); if (e1) e1.focus(); return; }
        if (!cc1) { toast("학생 코드를 입력해 주세요."); var e2 = $("#stuCd"); if (e2) e2.focus(); return; }
        var dupRow = (sa.rows || []).filter(function (r) {
          return String(r.name == null ? "" : r.name).trim() === nn1 && String(r.code == null ? "" : r.code).trim() === cc1;
        })[0];
        if (dupRow) { toast("이미 명단에 있는 학생입니다. (" + nn1 + " · " + cc1 + ")"); return; }
        t.disabled = true;
        studentsApi().add(nn1, cc1).then(function () {
          t.disabled = false;
          sa.name = ""; sa.code = "";
          toast("명단에 추가했습니다 · " + nn1 + " (" + cc1 + ")");
          loadStudents(true);
        }).catch(function (err) {
          t.disabled = false;
          toast(studentsProblemText(err));
          if (err && (err.kind === "missing" || err.kind === "denied_db" || err.kind === "nokey" || err.kind === "dup")) {
            if (err.kind === "dup") loadStudents(true);
            else { sa.error = err; renderAdminStu(); }
          }
        });
        break;
      }
      case "stu-refresh":
        toast("학생 명단을 새로 불러옵니다…");
        loadStudents(true);
        break;
      case "stu-toggle": {
        var sid = t.getAttribute("data-id");
        var wantActive = t.getAttribute("data-active") === "true";
        t.disabled = true;
        studentsApi().setActive(sid, wantActive).then(function () {
          toast(wantActive ? "이 학생을 다시 허용했습니다." : "이 학생을 차단했습니다.");
          loadStudents(true);
        }).catch(function (err) {
          t.disabled = false;
          toast(studentsProblemText(err));
        });
        break;
      }
      case "stu-del": {
        var delId = t.getAttribute("data-id");
        var delName = t.getAttribute("data-name") || "";
        if (!window.confirm("‘" + delName + "’ 학생을 명단에서 삭제할까요? 삭제하면 이 학생은 문제를 시작할 수 없습니다.")) return;
        t.disabled = true;
        studentsApi().remove(delId).then(function () {
          toast("명단에서 삭제했습니다.");
          loadStudents(true);
        }).catch(function (err) {
          t.disabled = false;
          toast(studentsProblemText(err));
        });
        break;
      }
      case "refresh":
        refreshAdmin();
        toast("새로고침했습니다.");
        break;
      case "csv":
        csvDownload();
        break;
      case "clear-records":
        if (window.confirm("이 기기에 저장된 모든 학생 기록을 삭제할까요? 되돌릴 수 없습니다.")) {
          saveRecords([]);
          refreshAdmin();
          toast("기록을 삭제했습니다.");
        }
        break;
      case "supa-save":
        setSupa({
          url: (($("#sUrl") || {}).value || "").trim(),
          key: (($("#sKey") || {}).value || "").trim(),
          table: ((($("#sTable") || {}).value || "").trim() || "epic_quiz_results")
        });
        toast("저장했습니다.");
        break;
      case "supa-pull":
        toast("원격 기록을 불러오는 중…");
        supaPull().then(function (n) { toast(n + "건을 새로 불러왔습니다."); refreshAdmin(); })
          .catch(function (err) { toast("불러오기 실패: " + err.message); });
        break;
    }
  });

  // header buttons
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-top]");
    if (!t) return;
    var act = t.getAttribute("data-top");
    if (act === "admin") adminModal();
    if (act === "print") printModal();
  });

  // print buttons inside modal (need scope value)
  document.addEventListener("click", function (e) {
    var t = e.target.closest('[data-act="print"]');
    if (!t) return;
    doPrint(t.getAttribute("data-mode"));
  });

  // supabase config inputs are read on save via delegation (no inline JS)
  window.addEventListener("beforeprint", function () { /* noop */ });

  /* ---------- init ---------- */
  document.addEventListener("input", function (e) {
    if (!e.target) return;
    var id = e.target.id;
    if (id === "nm") state.name = e.target.value;
    else if (id === "cd") state.code = e.target.value;
    else if (id === "stuNm") adminStu().name = e.target.value;
    else if (id === "stuCd") adminStu().code = e.target.value;
  });

  function init() {
    if (!DATA.items.length) {
      $("#app").innerHTML = '<div class="wrap"><div class="empty">문항 데이터를 불러오지 못했습니다.</div></div>';
      return;
    }
    if (state.cat == null) state.cat = "grammar";
    var d = loadDraft();
    render();
    if (!d) return;
    /* 저장된 답안도 명단을 다시 확인한 뒤 연다.
       차단되었거나 명단에 없으면 답안을 지우고 막는다(새로고침으로 우회 방지). */
    var dn = String(d.name || state.name || "").trim();
    var dc = String(d.code || state.code || "").trim();
    if (!dn || !dc) {
      toast("저장된 답안이 있습니다. 이름과 학생 코드를 입력하고 ‘이어서 풀기’를 눌러 주세요.");
      return;
    }
    verifyStudent(dn, dc, function (res) {
      if (res.status === "invalid") return;
      if (res.status === "ok" || res.status === "unavailable") {
        state.name = dn; state.code = dc;
        if (res.status === "unavailable") toast(gatePassMessage());
        restoreDraft(d);
        return;
      }
      clearDraft();
      state.name = dn; state.code = dc;
      setBlocked(BLOCK_MSG);
      render();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();
})();

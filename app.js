'use strict';
/* Hablo · španělština A1 — celá logika appky (bez frameworku) */

const KEY = 'hablo-v1';
const DAY = 86400000;
const ITEMS = {};
LESSONS.forEach((L) => L.items.forEach((it) => { ITEMS[it.id] = it; }));
const ALL_ITEMS = Object.values(ITEMS);
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const HAS_TTS = 'speechSynthesis' in window;

/* ================= stav ================= */
function defaultState() {
  return {
    v: 1, name: '', onboarded: false, cards: {}, parts: {}, days: {},
    settings: { goal: 20, listen: true, speak: true, rate: 0.9, unlockAll: false }
  };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v) {
      const d = defaultState();
      return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings || {}) });
    }
  } catch (e) { /* nic */ }
  return defaultState();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* plné úložiště */ } }

/* ================= datumy ================= */
function dkey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function dayAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function todayRec() {
  const k = dkey();
  if (!S.days[k]) S.days[k] = { sec: 0, ok: 0, bad: 0, sessions: 0, newW: 0 };
  return S.days[k];
}
function dayGet(d) { return S.days[dkey(d)] || { sec: 0, ok: 0, bad: 0, sessions: 0, newW: 0 }; }
function streak() {
  let n = 0;
  let i = dayGet(dayAgo(0)).sessions ? 0 : 1;
  while (dayGet(dayAgo(i)).sessions) { n++; i++; }
  return n;
}
function minutesToday() { return Math.floor(dayGet(new Date()).sec / 60); }

/* ================= SRS (opakování s rozestupy) ================= */
function newCard() { return { ease: 2.5, ivl: 0, reps: 0, lapses: 0, due: 0, lvl: 0 }; }
function dueAt(days) { const d = new Date(); d.setHours(4, 0, 0, 0); d.setDate(d.getDate() + days); return d.getTime(); }
// r: 0 znovu, 1 těžké, 2 dobré, 3 snadné
function schedule(c, r) {
  c = Object.assign({}, c);
  if (r === 0) {
    c.lapses++; c.ease = Math.max(1.3, c.ease - 0.2); c.ivl = 0; c.reps = 0; c.due = Date.now() + 10 * 60000;
  } else if (r === 1) {
    c.ivl = Math.max(1, Math.round(c.ivl * 1.2)); c.ease = Math.max(1.3, c.ease - 0.15); c.reps++; c.due = dueAt(c.ivl);
  } else if (r === 2) {
    c.ivl = c.ivl < 1 ? 1 : c.ivl < 3 ? 3 : Math.round(c.ivl * c.ease); c.reps++; c.due = dueAt(c.ivl);
  } else {
    c.ivl = c.ivl < 1 ? 3 : c.ivl < 3 ? 5 : Math.round(Math.max(c.ivl * c.ease * 1.3, c.ivl + 2)); c.ease += 0.15; c.reps++; c.due = dueAt(c.ivl);
  }
  return c;
}
function ivlLabel(c, r) {
  if (r === 0) return '10 min';
  const n = schedule(c, r).ivl;
  if (n >= 60) return Math.round(n / 30) + ' měs.';
  if (n === 1) return '1 den';
  if (n <= 4) return n + ' dny';
  return n + ' dní';
}
function dueCards() {
  const now = Date.now();
  return Object.keys(S.cards).filter((id) => ITEMS[id] && S.cards[id].due <= now)
    .sort((a, b) => S.cards[a].due - S.cards[b].due);
}

/* ================= lekce: postup ================= */
function partKey(L, p) { return L.id + '-' + p; }
function partDone(L, p) { return (S.parts[partKey(L, p)] || 0) > 0; }
function lessonDoneParts(L) { return L.parts.filter((_, p) => partDone(L, p)).length; }
function lessonDone(L) { return lessonDoneParts(L) === L.parts.length; }
function lessonIdx(id) { return LESSONS.findIndex((L) => L.id === id); }
function unlocked(i) { return S.settings.unlockAll || i === 0 || lessonDone(LESSONS[i - 1]); }
function currentLesson() {
  for (let i = 0; i < LESSONS.length; i++) if (unlocked(i) && !lessonDone(LESSONS[i])) return LESSONS[i];
  return LESSONS[LESSONS.length - 1];
}
function nextPart(L) { for (let p = 0; p < L.parts.length; p++) if (!partDone(L, p)) return p; return null; }
function newWordsWaiting() {
  const L = currentLesson(); const p = nextPart(L);
  if (p === null) return 0;
  return L.parts[p].filter((it) => !S.cards[it.id]).length;
}

/* ================= text ================= */
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function norm(s) { return String(s).toLowerCase().replace(/[¿?¡!.,;:"«»()…]/g, ' ').replace(/\s+/g, ' ').trim(); }
function strip(s) { return norm(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function checkEs(ans, item) {
  const a = norm(ans);
  if (!a) return { ok: false };
  const cands = [item.es].concat(item.esAlt || []);
  const right = '<b>' + esc(item.es) + '</b>';
  if (cands.some((c) => norm(c) === a)) return { ok: true };
  if (cands.some((c) => strip(c) === strip(a))) return { ok: true, note: 'Pozor na diakritiku: ' + right };
  for (const c of cands) {
    const m = norm(c).match(/^(el|la|los|las|un|una) (.+)$/);
    if (m && strip(m[2]) === strip(a)) return { ok: true, note: 'Nezapomeň na člen: ' + right };
  }
  for (const c of cands) {
    const sc = strip(c);
    if (sc.length >= 5 && lev(sc, strip(a)) <= 1) return { ok: true, typo: true, note: 'Skoro! Jen překlep: ' + right };
  }
  return { ok: false };
}
function tokens(s) { return s.replace(/[¿?¡!.,;:]/g, ' ').split(/\s+/).filter(Boolean); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(a, n) { return shuffle(a).slice(0, n); }
function plural(n, one, few, many) { return n === 1 ? one : (n >= 2 && n <= 4 ? few : many); }

/* ================= hlas ================= */
let esVoice = null;
function pickVoice() {
  if (!HAS_TTS) return;
  const vs = speechSynthesis.getVoices();
  esVoice = vs.find((v) => /es[-_]ES/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
}
if (HAS_TTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, slow) {
  if (!HAS_TTS) { toast('Tenhle prohlížeč neumí přehrávat zvuk.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  if (esVoice) u.voice = esVoice;
  u.rate = slow ? 0.6 : S.settings.rate;
  speechSynthesis.speak(u);
}

/* ================= ikony ================= */
const I = {
  x: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>',
  back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  arrow: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  flame: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-4 3 0-2-1-4-2-5-1 4-4 6-4 11 0 4 3 7 7 7z"/></svg>',
  home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
  book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7v14H4z"/><path d="M13 5h7v14h-7z"/></svg>',
  cards: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="14" height="14" rx="3"/><path d="M8 3h11a2 2 0 0 1 2 2v11"/></svg>',
  chart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V11"/><path d="M12 20V5"/><path d="M19 20v-6"/></svg>',
  repeat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  plus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  lock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  speaker: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  speakerBig: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  turtle: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15c0-4 3.5-7 8-7s8 3 8 7H4z"/><path d="M20 15l2-1.5-1-2.5-2 .5"/><path d="M7 15v3"/><path d="M17 15v3"/><path d="M9 8l1.5 3.5h3L15 8"/></svg>',
  mic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>',
  micBig: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>',
  gear: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  bulb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>'
};

/* ================= drobnosti UI ================= */
const $app = document.getElementById('app');
let toastT = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
function vibrate(ms) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* nic */ } }

let view = { name: S.onboarded ? 'home' : 'onboarding' };
function go(name, extra) {
  if (HAS_TTS) speechSynthesis.cancel();
  view = Object.assign({ name }, extra || {});
  render(); window.scrollTo(0, 0);
}

function nav(active) {
  const due = dueCards().length;
  const b = (name, icon, label, badge) =>
    `<button class="${active === name ? 'on' : ''}" onclick="A.go('${name}')">${icon}${badge ? `<span class="badge">${badge > 99 ? '99+' : badge}</span>` : ''}${label}</button>`;
  return `<nav class="nav">${b('home', I.home, 'Domů')}${b('path', I.book, 'Lekce')}${b('review', I.cards, 'Opakování', due)}${b('stats', I.chart, 'Statistiky')}</nav>`;
}

/* ================= obrazovky ================= */
function render() {
  const r = {
    onboarding: vOnboarding, home: vHome, path: vPath, lesson: vLesson, review: vReview,
    stats: vStats, settings: vSettings, session: vSession, done: vDone
  }[view.name] || vHome;
  $app.innerHTML = r();
  if (view.name === 'session') renderTask();
}

function vOnboarding() {
  const g = view.goal || 20;
  const opt = (m, l) => `<button class="${g === m ? 'on' : ''}" onclick="A.onbGoal(${m})"><b>${m}</b><span>${l}</span></button>`;
  return `<div class="onb pop">
    <img src="icon-192.png" alt="">
    <div><h1 class="h1">¡Hola!<br>Vítej v Hablo.</h1>
    <p class="muted" style="font-size:16px;line-height:1.5">Španělština od nuly do A1. Krátké lekce, opakování ve správný čas a výslovnost ke všemu.</p></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <label for="nm" class="lbl-sm">Jak ti mám říkat?</label>
      <input id="nm" class="answer-input" style="font-size:18px" placeholder="Tvoje jméno" value="${esc(view.nm || '')}" oninput="view.nm=this.value" autocomplete="given-name">
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="lbl-sm">Kolik minut denně?</div>
      <div class="goal-opts">${opt(10, 'pohoda')}${opt(15, 'normál')}${opt(20, 'vážně')}${opt(30, 'naplno')}</div>
    </div>
    <button class="btn terra block" onclick="A.onbDone()">Jdeme na to ${I.arrow}</button>
  </div>`;
}

function vHome() {
  const st = streak();
  const min = minutesToday();
  const goal = S.settings.goal;
  const pct = Math.min(100, Math.round(min / goal * 100));
  const due = dueCards().length;
  const newW = newWordsWaiting();
  const L = currentLesson();
  const li = lessonIdx(L.id);
  const lp = Math.round(lessonDoneParts(L) / L.parts.length * 100);
  const doneGoal = min >= goal;
  const d = new Date();
  const days = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const months = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  let cta, ctaSub;
  if (due > 0) { cta = 'Zopakovat'; ctaSub = due + ' ' + plural(due, 'kartička čeká', 'kartičky čekají', 'kartiček čeká'); }
  else if (nextPart(L) !== null) { cta = nextPart(L) === 0 && lessonDoneParts(L) === 0 ? 'Začít lekci' : 'Pokračovat'; ctaSub = L.title + ' · část ' + (nextPart(L) + 1) + '/' + L.parts.length; }
  else { cta = 'Procvičit'; ctaSub = 'Všechno hotovo, procvič si slovíčka'; }
  return `<div class="screen pop">
    <div class="row between">
      <div><div class="muted" style="font-size:14px;font-weight:500">${days[d.getDay()]} · ${d.getDate()}. ${months[d.getMonth()]}</div>
      <h1 class="h1">¡Hola${S.name ? ', ' + esc(S.name) : ''}!</h1></div>
      <div class="streak ${st ? '' : 'off'}" title="Dní v řadě"><span style="color:${st ? 'var(--terra)' : 'var(--muted)'};display:flex">${I.flame}</span>${st}</div>
    </div>
    <div class="goal ${doneGoal ? 'done' : ''}">
      <div class="row between" style="align-items:flex-end">
        <div><div class="lbl">${doneGoal ? 'Cíl splněn' : 'Dnešní cíl'}</div>
        <div class="big">${min}<small> / ${goal} min</small></div></div>
        <div style="font-size:14px;font-weight:500">${doneGoal ? '¡Muy bien!' : 'Ještě ' + (goal - min) + ' min'}</div>
      </div>
      <div class="gbar"><i style="width:${pct}%"></i></div>
      <button class="btn white" onclick="A.cta()">${cta} ${I.arrow}</button>
      <div style="font-size:13px;margin-top:-6px;text-align:center;opacity:.9">${esc(ctaSub)}</div>
    </div>
    <div class="tiles">
      <button class="tile" onclick="A.go('review')">
        <div class="ic" style="background:var(--saffron-soft);color:var(--saffron-ink)">${I.repeat}</div>
        <div class="num">${due}</div><div class="t">${plural(due, 'kartička', 'kartičky', 'kartiček')} k opakování</div>
      </button>
      <button class="tile" onclick="A.startNext()">
        <div class="ic" style="background:var(--olive-soft);color:var(--olive-ink)">${I.plus}</div>
        <div class="num">${newW}</div><div class="t">${plural(newW, 'nové slovíčko', 'nová slovíčka', 'nových slovíček')}</div>
      </button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="row between" style="align-items:baseline"><h2 class="h2">Aktuální lekce</h2>
      <a href="#" onclick="A.go('path');return false" style="font-size:14px;font-weight:600;text-decoration:none">Celá cesta</a></div>
      <button class="card lesson-now" onclick="A.openLesson('${L.id}')">
        <div class="lesson-num">${li + 1}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:17px;font-weight:700">${esc(L.title)}</div>
          <div class="muted" style="font-size:13px">${esc(L.cz)}</div>
          <div class="bar"><i style="width:${lp}%"></i></div>
        </div>
      </button>
    </div>
  </div>${nav('home')}`;
}

function vPath() {
  const doneL = LESSONS.filter(lessonDone).length;
  const words = Object.keys(S.cards).length;
  const cur = currentLesson();
  const rows = LESSONS.map((L, i) => {
    const ul = unlocked(i), dn = lessonDone(L), isCur = L === cur && !dn;
    const cls = dn ? 'done' : isCur ? 'current' : ul ? '' : 'locked';
    const dp = lessonDoneParts(L);
    const badge = dn ? `<span style="color:#fff;display:flex">${I.check}</span>` : ul ? (i + 1) : `<span style="color:var(--muted);display:flex">${I.lock}</span>`;
    const sub = isCur || (ul && dp > 0 && !dn)
      ? `<div class="bar" style="height:6px"><i style="width:${Math.round(dp / L.parts.length * 100)}%;background:var(--terra)"></i></div>`
      : `<span class="st">${esc(L.cz)}</span>`;
    return `<button class="lesson-row ${cls}" onclick="A.openLesson('${L.id}')">
      <div class="badge-n">${badge}</div>
      <div class="grow"><div class="row between"><span class="tt" style="${ul ? '' : 'color:var(--muted)'}">${esc(L.title)}</span>
      ${isCur ? `<span style="font-size:13px;font-weight:700;color:var(--terra-ink)">${dp}/${L.parts.length}</span>` : ''}</div>${sub}</div>
    </button>`;
  }).join('');
  return `<div class="screen pop">
    <div class="path-head">
      <div class="row between"><span class="pill" style="background:var(--saffron);color:var(--ink)">Úroveň A1</span></div>
      <div class="h1" style="color:#fff">Tvoje cesta<br>ke španělštině</div>
      <div class="row" style="gap:24px">
        <div class="stat"><b>${doneL} / ${LESSONS.length}</b><span>lekcí hotovo</span></div>
        <div class="stat"><b>${words}</b><span>${plural(words, 'slovíčko', 'slovíčka', 'slovíček')} v opakování</span></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">${rows}</div>
  </div>${nav('path')}`;
}

function lvlBars(id) {
  const c = S.cards[id]; const l = c ? c.lvl : 0;
  let s = '<span class="lvl" aria-label="Znalost ' + l + ' z 5">';
  for (let i = 1; i <= 5; i++) s += `<i class="${i <= l ? 'on' : ''}"></i>`;
  return s + '</span>';
}

function vLesson() {
  const L = LESSONS[lessonIdx(view.id)];
  const i = lessonIdx(L.id);
  const parts = L.parts.map((items, p) => {
    const dn = partDone(L, p);
    const first = items.slice(0, 3).map((it) => it.es.replace(/[¿?¡!.]/g, '')).join(', ');
    return `<div class="part ${dn ? 'done' : ''}">
      <div class="pn">${dn ? I.check : p + 1}</div>
      <div style="flex:1;min-width:0"><div style="font-weight:700">Část ${p + 1}</div>
      <div class="muted" style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(first)}…</div></div>
      <button class="btn ${dn ? 'ghost' : 'terra'}" style="min-height:44px;font-size:15px;padding:0 16px" onclick="A.startPart('${L.id}',${p})">${dn ? 'Znovu' : 'Začít'}</button>
    </div>`;
  }).join('<div style="height:1px;background:var(--soft)"></div>');
  const grammar = L.grammar.map((g) => `<div class="grammar-card"><h3>${esc(g.title)}</h3>${g.body}</div>`).join('');
  const words = L.items.map((it) => `<div class="w"><b>${esc(it.es)}${lvlBars(it.id)}</b><span>${esc(it.cz)}</span></div>`).join('');
  return `<div class="screen pop" style="padding-bottom:calc(40px + var(--safe-b))">
    <div class="row"><button class="icon-btn" onclick="A.go('path')" aria-label="Zpět">${I.back}</button>
    <span class="pill white">Lekce ${i + 1}</span></div>
    <div><h1 class="h1">${esc(L.title)}</h1><div class="muted" style="margin-top:4px">${esc(L.cz)}</div></div>
    <div class="card" style="display:flex;flex-direction:column;gap:12px">${parts}</div>
    <h2 class="h2">Tahák</h2>
    ${grammar}
    <h2 class="h2">Slovíčka</h2>
    <div class="card wordlist" style="padding:4px 16px">${words}</div>
  </div>`;
}

function vReview() {
  const due = dueCards().length;
  const total = Object.keys(S.cards).length;
  const tomorrow = dueAt(1) + DAY - 1;
  const soon = Object.values(S.cards).filter((c) => c.due > Date.now() && c.due <= tomorrow).length;
  const weak = Object.keys(S.cards).filter((id) => ITEMS[id])
    .sort((a, b) => (S.cards[a].lvl - S.cards[b].lvl) || (S.cards[b].lapses - S.cards[a].lapses)).slice(0, 8);
  const top = due > 0
    ? `<div class="goal"><div class="lbl">Čeká na tebe</div><div class="big">${due}<small> ${plural(due, 'kartička', 'kartičky', 'kartiček')}</small></div>
       <button class="btn white" onclick="A.startReview()">Zopakovat ${I.arrow}</button></div>`
    : `<div class="goal done"><div class="lbl">Hotovo</div><div class="big" style="font-size:30px">Vše zopakováno</div>
       <div style="font-size:15px">${total ? `Zítra tě čeká ${soon} ${plural(soon, 'kartička', 'kartičky', 'kartiček')}.` : 'Kartičky se sem přidají, jakmile dokončíš první část lekce.'}</div></div>`;
  return `<div class="screen pop">
    <h1 class="h1">Opakování</h1>
    ${top}
    ${total >= 5 ? `<button class="btn outline block" onclick="A.startPractice()">Procvičit slabší slovíčka</button>` : ''}
    <p class="muted" style="margin:0;font-size:14px;line-height:1.5">Každé slovíčko se vrací ve chvíli, kdy ho začínáš zapomínat. Čím líp ho umíš, tím delší pauza a tím těžší cvičení.</p>
    ${weak.length ? `<h2 class="h2">Nejslabší slovíčka</h2><div class="card wordlist" style="padding:4px 16px">${weak.map((id) => `<div class="w"><b>${esc(ITEMS[id].es)}${lvlBars(id)}</b><span>${esc(ITEMS[id].cz)}</span></div>`).join('')}</div>` : ''}
  </div>${nav('review')}`;
}

function vStats() {
  const st = streak();
  const cards = Object.values(S.cards);
  const longTerm = cards.filter((c) => c.ivl >= 21).length;
  let ok = 0, bad = 0, totalSec = 0;
  Object.keys(S.days).forEach((k) => { totalSec += S.days[k].sec; });
  const bars = [];
  let maxMin = S.settings.goal;
  for (let i = 6; i >= 0; i--) { const r = dayGet(dayAgo(i)); ok += r.ok; bad += r.bad; maxMin = Math.max(maxMin, Math.round(r.sec / 60)); }
  const dn = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  for (let i = 6; i >= 0; i--) {
    const d = dayAgo(i); const m = Math.round(dayGet(d).sec / 60);
    bars.push(`<div class="c"><em>${m || ''}</em><i class="${m >= S.settings.goal ? 'goalmet' : ''}" style="height:${Math.max(3, m / maxMin * 100)}%;${m ? '' : 'background:var(--soft)'}"></i><span>${i === 0 ? 'Dnes' : dn[d.getDay()]}</span></div>`);
  }
  const acc = ok + bad ? Math.round(ok / (ok + bad) * 100) + ' %' : '–';
  const doneL = LESSONS.filter(lessonDone).length;
  return `<div class="screen pop">
    <div class="row between"><h1 class="h1">Statistiky</h1><button class="icon-btn" onclick="A.go('settings')" aria-label="Nastavení">${I.gear}</button></div>
    <div class="stat-grid">
      <div class="card"><b style="color:var(--terra)">${st}</b><span>${plural(st, 'den', 'dny', 'dní')} v řadě</span></div>
      <div class="card"><b>${cards.length}</b><span>slovíček a frází</span></div>
      <div class="card"><b>${longTerm}</b><span>umíš dlouhodobě</span></div>
      <div class="card"><b>${acc}</b><span>úspěšnost (7 dní)</span></div>
    </div>
    <div class="card"><div class="row between"><h2 class="h2">Minuty za týden</h2><span class="muted" style="font-size:13px">cíl ${S.settings.goal} min</span></div>
      <div class="chart">${bars.join('')}</div></div>
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="row between"><span style="font-weight:700">Cesta A1</span><span class="muted">${doneL}/${LESSONS.length} lekcí</span></div>
      <div class="bar"><i style="width:${Math.round(doneL / LESSONS.length * 100)}%"></i></div>
      <div class="muted" style="font-size:13px">Celkem ${Math.round(totalSec / 60)} min učení</div>
    </div>
  </div>${nav('stats')}`;
}

function vSettings() {
  const s = S.settings;
  const seg = (vals, cur, fn) => `<div class="seg">${vals.map(([v, l]) => `<button class="${cur === v ? 'on' : ''}" onclick="A.set('${fn}',${v})">${l}</button>`).join('')}</div>`;
  const sw = (key, on, dis) => `<button class="switch ${on ? 'on' : ''}" ${dis ? 'disabled style="opacity:.4"' : ''} onclick="A.set('${key}',${!on})" aria-label="Přepnout" aria-pressed="${on}"></button>`;
  return `<div class="screen pop">
    <div class="row"><button class="icon-btn" onclick="A.go('stats')" aria-label="Zpět">${I.back}</button><h1 class="h1">Nastavení</h1></div>
    <div class="card" style="padding:4px 16px">
      <div class="set-row"><label for="sn">Jméno</label><input id="sn" class="text-in" value="${esc(S.name)}" onchange="A.setName(this.value)"></div>
      <div class="set-row"><label>Denní cíl</label>${seg([[10, '10'], [15, '15'], [20, '20'], [30, '30']], s.goal, 'goal')}</div>
      <div class="set-row"><label>Rychlost hlasu</label>${seg([[0.75, 'Pomalu'], [0.9, 'Normál'], [1, 'Rychle']], s.rate, 'rate')}</div>
      <div class="set-row"><div><label>Poslechová cvičení</label><small>Vypni, když nemůžeš mít zvuk</small></div>${sw('listen', s.listen)}</div>
      <div class="set-row"><div><label>Mluvení do mikrofonu</label><small>${SR ? 'Appka pozná, co řekneš' : 'Tenhle prohlížeč to neumí (zkus Chrome)'}</small></div>${sw('speak', s.speak && !!SR, !SR)}</div>
      <div class="set-row"><div><label>Odemknout všechny lekce</label><small>Když už něco umíš ze školy</small></div>${sw('unlockAll', s.unlockAll)}</div>
    </div>
    <button class="btn outline block" onclick="A.testVoice()">${I.speaker} Vyzkoušet hlas</button>
    <div class="card" style="padding:4px 16px">
      <div class="set-row"><div><label>Záloha</label><small>Pokrok je uložený v tomhle telefonu</small></div>
      <button class="btn ghost" style="min-height:44px;font-size:15px" onclick="A.exportData()">Stáhnout</button></div>
      <div class="set-row"><div><label>Obnovit ze zálohy</label></div>
      <label class="btn ghost" style="min-height:44px;font-size:15px;cursor:pointer">Nahrát<input type="file" accept="application/json" class="hidden" onchange="A.importData(this)"></label></div>
      <div class="set-row"><div><label style="color:var(--terra-ink)">Smazat pokrok</label></div>
      <button class="btn ghost" style="min-height:44px;font-size:15px;color:var(--terra-ink)" onclick="A.reset()">Smazat</button></div>
    </div>
    <p class="muted" style="text-align:center;font-size:13px">Hablo · A1 · ${ALL_ITEMS.length} slovíček a frází ve ${LESSONS.length} lekcích</p>
  </div>${nav('stats')}`;
}

/* ================= sezení (lekce / opakování) ================= */
let sess = null;

function mkTask(t, it, extra) { return Object.assign({ t, it }, extra || {}); }

function buildPart(L, p) {
  const items = L.parts[p];
  const tasks = [];
  const nParts = L.parts.length;
  L.grammar.forEach((g, gi) => {
    const target = nParts === 1 ? 0 : Math.min(gi, nParts - 1);
    if (target === p) tasks.push({ t: 'grammar', g });
  });
  const half = items.length > 4 ? Math.ceil(items.length / 2) : items.length;
  for (let s = 0; s < items.length; s += half) {
    const grp = items.slice(s, s + half);
    grp.forEach((it) => { if (!S.cards[it.id] || p === nextPart(L)) tasks.push(mkTask('intro', it)); });
    shuffle(grp).forEach((it) => tasks.push(mkTask('choice', it)));
  }
  if (items.length >= 4) tasks.push({ t: 'match', items: sample(items, Math.min(5, items.length)) });
  const practice = [];
  items.forEach((it) => practice.push(mkTask('write', it)));
  const phrases = items.filter((it) => tokens(it.es).length >= 3);
  sample(phrases, 2).forEach((it) => practice.push(mkTask('order', it)));
  if (S.settings.listen && HAS_TTS) {
    sample(items, 2).forEach((it) => practice.push(mkTask('listen', it)));
    practice.push(mkTask('dictation', sample(items, 1)[0]));
  }
  if (SR && S.settings.speak) practice.push(mkTask('speak', sample(phrases.length ? phrases : items, 1)[0]));
  if (p === nParts - 1) L.fill.forEach((f) => practice.push({ t: 'fill', f }));
  return tasks.concat(shuffle(practice));
}

function typeForLevel(it, lvl) {
  const listen = S.settings.listen && HAS_TTS;
  const speak = SR && S.settings.speak;
  const phrase = tokens(it.es).length >= 3;
  const r = Math.random();
  if (lvl <= 0) return listen && r < 0.3 ? 'listen' : 'choice';
  if (lvl === 1) return r < 0.6 ? 'write' : (listen ? 'listen' : 'choice');
  if (lvl === 2) return phrase && r < 0.3 ? 'order' : 'write';
  if (lvl === 3) return listen && r < 0.4 ? 'dictation' : (phrase && r < 0.6 ? 'order' : 'write');
  if (speak && r < 0.25) return 'speak';
  if (listen && r < 0.5) return 'dictation';
  return 'write';
}

function startSession(mode, tasks, extra) {
  if (!tasks.length) { toast('Není co procvičovat.'); return; }
  sess = Object.assign({ mode, tasks, i: 0, ok: 0, bad: 0, start: Date.now(), taskStart: Date.now(), answered: false, reviewed: {} }, extra || {});
  go('session');
}

function startPart(lid, p) {
  const L = LESSONS[lessonIdx(lid)];
  const i = lessonIdx(lid);
  if (!unlocked(i)) { toast('Nejdřív dokonči předchozí lekci.'); return; }
  startSession('lesson', buildPart(L, p), { lid, p });
}
function startReview() {
  const ids = dueCards().slice(0, 20);
  if (!ids.length) { toast('Teď není co opakovat.'); return; }
  startSession('review', shuffle(ids).map((id) => mkTask(typeForLevel(ITEMS[id], S.cards[id].lvl), ITEMS[id], { card: true })));
}
function startPractice() {
  const ids = Object.keys(S.cards).filter((id) => ITEMS[id]);
  if (!ids.length) { toast('Nejdřív dokonči první lekci.'); return; }
  const weighted = ids.sort((a, b) => (S.cards[a].lvl - S.cards[b].lvl) + (Math.random() - 0.5) * 2).slice(0, 15);
  startSession('practice', shuffle(weighted).map((id) => mkTask(typeForLevel(ITEMS[id], S.cards[id].lvl), ITEMS[id])));
}
function startNext() {
  const L = currentLesson(); const p = nextPart(L);
  if (p === null) { startPractice(); return; }
  startPart(L.id, p);
}

function vSession() {
  return `<div class="session">
    <div class="topbar">
      <button class="icon-btn" onclick="A.quit()" aria-label="Ukončit">${I.x}</button>
      <div class="bar"><i id="pbar" style="width:0%"></i></div>
      <div class="cnt" id="pcnt"></div>
    </div>
    <div class="stage" id="stage"></div>
    <div class="pad-sheet hidden" id="pad"></div>
  </div>
  <div class="sheet" id="sheet"></div>`;
}

function curTask() { return sess.tasks[sess.i]; }

function distractorsCz(it, n) {
  const phrase = tokens(it.es).length >= 3;
  const L = LESSONS[lessonIdx(it.lesson)];
  const known = (x) => S.cards[x.id] || (sess && sess.mode === 'lesson' && sess.lid === x.lesson && L.parts[sess.p].includes(x));
  const score = (x) => (known(x) ? 2 : 0) + (x.lesson === it.lesson ? 1 : 0) + ((tokens(x.es).length >= 3) === phrase ? 2 : 0) + Math.random();
  const pool = ALL_ITEMS.filter((x) => x.id !== it.id && x.cz !== it.cz).sort((a, b) => score(b) - score(a));
  const res = []; const seen = new Set([it.cz]);
  for (const x of pool) { if (!seen.has(x.cz)) { seen.add(x.cz); res.push(x.cz); } if (res.length >= n) break; }
  return res;
}

const tagFor = { choice: 'Co to znamená?', listen: 'Co slyšíš?', write: 'Přelož do španělštiny', dictation: 'Napiš, co slyšíš', order: 'Slož větu', fill: 'Doplň', speak: 'Řekni nahlas', match: 'Spoj dvojice' };

function accentsRow() {
  return `<div class="accents">${['á', 'é', 'í', 'ó', 'ú', 'ñ'].map((c) => `<button onmousedown="event.preventDefault()" onclick="A.acc('${c}')">${c}</button>`).join('')}</div>`;
}
function inputBox(ph) {
  return `<input id="ans" class="answer-input" placeholder="${ph}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="es" oninput="A.inp()">`;
}

function renderTask() {
  const T = curTask();
  sess.answered = false; sess.taskStart = Date.now(); sess.hint = false;
  hideSheet();
  const n = sess.tasks.length;
  document.getElementById('pbar').style.width = Math.round(sess.i / n * 100) + '%';
  document.getElementById('pcnt').textContent = (sess.i + 1) + '/' + n;
  const st = document.getElementById('stage');
  const it = T.it;
  const lessonPill = it ? `<span class="pill white">${esc(LESSONS[lessonIdx(it.lesson)].title)}</span>` : '';
  const tag = tagFor[T.t] ? `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill saffron">${tagFor[T.t]}</span>${sess.mode !== 'lesson' ? lessonPill : ''}</div>` : '';
  let h = '';

  if (T.t === 'grammar') {
    h = `<span class="intro-new">Gramatika</span>
      <div class="grammar-card pop"><h3>${esc(T.g.title)}</h3>${T.g.body}</div>
      <div style="margin-top:auto"><button class="btn dark block" onclick="A.next()">Rozumím ${I.arrow}</button></div>`;
  } else if (T.t === 'intro') {
    h = `<span class="intro-new">Nové slovíčko</span>
      <div class="prompt-card pop">
        <div class="big">${esc(it.es)}</div>
        <div class="sub" style="font-size:18px;color:var(--ink);font-weight:500">${esc(it.cz)}</div>
        <button class="speak-btn" onclick="A.say()">${I.speaker} Přehrát</button>
      </div>
      <div style="margin-top:auto"><button class="btn dark block" onclick="A.next()">Dál ${I.arrow}</button></div>`;
    setTimeout(() => say(it.es), 250);
  } else if (T.t === 'choice' || T.t === 'listen') {
    if (!T.opts) T.opts = shuffle([it.cz].concat(distractorsCz(it, 3)));
    const head = T.t === 'choice'
      ? `<div class="prompt-card pop"><div class="big">${esc(it.es)}</div><button class="speak-btn" onclick="A.say()">${I.speaker} Přehrát</button></div>`
      : `<div class="speak-row" style="padding:20px 0"><button class="speak-big" onclick="A.say()" aria-label="Přehrát">${I.speakerBig}</button><button class="speak-slow" onclick="A.say(1)" aria-label="Přehrát pomalu">${I.turtle}</button></div>`;
    h = `${tag}${head}<div class="options">${T.opts.map((o, k) => `<button class="opt" data-k="${k}" onclick="A.pick(${k})">${esc(o)}</button>`).join('')}</div>
      ${T.t === 'listen' ? `<button class="skip" onclick="A.noAudio()">Teď nemůžu poslouchat</button>` : ''}`;
    setTimeout(() => say(it.es), 300);
  } else if (T.t === 'write' || T.t === 'dictation') {
    const head = T.t === 'write'
      ? `<div class="prompt-card pop"><div class="big">${esc(it.cz)}</div><div class="sub" id="hint"></div></div>`
      : `<div class="speak-row" style="padding:12px 0"><button class="speak-big" onclick="A.say()" aria-label="Přehrát">${I.speakerBig}</button><button class="speak-slow" onclick="A.say(1)" aria-label="Přehrát pomalu">${I.turtle}</button></div><div class="sub muted" id="hint" style="text-align:center"></div>`;
    h = `${tag}${head}
      <div style="display:flex;flex-direction:column;gap:8px"><label for="ans" class="lbl-sm">Tvoje odpověď</label>${inputBox(T.t === 'write' ? 'napiš španělsky…' : 'co jsi slyšel…')}</div>
      ${accentsRow()}
      <div class="actions" style="margin-top:auto">
        <button class="btn outline" style="flex:0 0 auto;width:60px;padding:0" onclick="A.hint()" aria-label="Nápověda">${I.bulb}</button>
        <button class="btn dark" id="check" disabled onclick="A.checkInput()">Zkontrolovat</button>
      </div>
      ${T.t === 'dictation' ? `<button class="skip" onclick="A.noAudio()">Teď nemůžu poslouchat</button>` : ''}`;
    if (T.t === 'dictation') setTimeout(() => say(it.es), 300);
    setTimeout(() => { const el = document.getElementById('ans'); if (el && window.matchMedia('(pointer:fine)').matches) el.focus(); }, 50);
  } else if (T.t === 'order') {
    if (!T.bank) {
      const words = tokens(it.es).map((w, k) => (k === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w));
      const inSet = new Set(words.map((w) => strip(w)));
      const extra = shuffle(ALL_ITEMS.flatMap((x) => tokens(x.es))).find((w) => !inSet.has(strip(w)) && w.length > 2);
      T.bank = shuffle(words.concat(words.length < 7 && extra ? [extra] : [])).map((w) => ({ w, used: false }));
      T.line = [];
    }
    h = `${tag}<div class="prompt-card pop" style="padding:20px"><div class="big" style="font-size:26px">${esc(it.cz)}</div></div>
      <div class="order-line" id="oline"></div><div class="order-bank" id="obank"></div>
      <div class="actions" style="margin-top:auto"><button class="btn dark" id="check" disabled onclick="A.checkOrder()">Zkontrolovat</button></div>`;
  } else if (T.t === 'fill') {
    if (!T.opts) T.opts = shuffle(T.f.opts);
    const s = esc(T.f.s).replace('___', '<span class="blank" id="blank">&nbsp;</span>');
    h = `${tag}<div class="prompt-card pop"><div class="fill-s">${s}</div><div class="sub">${esc(T.f.cz)}</div></div>
      <div class="options">${T.opts.map((o, k) => `<button class="opt" data-k="${k}" onclick="A.pickFill(${k})">${esc(o)}</button>`).join('')}</div>`;
  } else if (T.t === 'speak') {
    h = `${tag}<div class="prompt-card pop"><div class="big">${esc(it.es)}</div><div class="sub">${esc(it.cz)}</div>
      <button class="speak-btn" onclick="A.say()">${I.speaker} Poslechnout</button></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:8px">
        <button class="speak-big" id="micbtn" onclick="A.mic()" aria-label="Mluvit">${I.micBig}</button>
        <div class="muted" id="heard" style="min-height:22px;font-weight:600;text-align:center">Klepni a řekni to španělsky</div>
      </div>
      <button class="skip" style="margin-top:auto" onclick="A.noMic()">Teď nemůžu mluvit</button>`;
  } else if (T.t === 'match') {
    if (!T.L) {
      T.L = shuffle(T.items.map((x) => ({ id: x.id, s: x.es })));
      T.R = shuffle(T.items.map((x) => ({ id: x.id, s: x.cz })));
      T.done = {}; T.selL = null; T.selR = null; T.miss = 0;
    }
    h = `${tag}<div class="match" id="match"></div>`;
  }
  st.innerHTML = h;
  if (T.t === 'order') drawOrder();
  if (T.t === 'match') drawMatch();
}

function drawOrder() {
  const T = curTask();
  document.getElementById('oline').innerHTML = T.line.map((bi, k) => `<button class="tile-w" onclick="A.oRem(${k})">${esc(T.bank[bi].w)}</button>`).join('');
  document.getElementById('obank').innerHTML = T.bank.map((b, i) => `<button class="tile-w ${b.used ? 'used' : ''}" onclick="A.oAdd(${i})">${esc(b.w)}</button>`).join('');
  document.getElementById('check').disabled = !T.line.length || sess.answered;
}
function drawMatch() {
  const T = curTask();
  const col = (arr, side) => `<div class="col">${arr.map((x, i) => {
    const cls = T.done[x.id] ? 'ok' : ((side === 'L' ? T.selL : T.selR) === i ? 'sel' : '');
    return `<button class="${cls}" id="m${side}${i}" ${T.done[x.id] ? 'disabled' : ''} onclick="A.m('${side}',${i})">${esc(x.s)}</button>`;
  }).join('')}</div>`;
  document.getElementById('match').innerHTML = col(T.L, 'L') + col(T.R, 'R');
}

/* ---------- hodnocení ---------- */
function addTime() {
  const dt = Math.min(90000, Date.now() - sess.taskStart);
  todayRec().sec += dt / 1000;
}

function grade(ok, info) {
  if (sess.answered) return;
  sess.answered = true;
  info = info || {};
  const T = curTask();
  addTime();
  const cb = document.getElementById('check'); if (cb) cb.disabled = true;
  const rec = todayRec();
  if (ok) { sess.ok++; rec.ok++; vibrate(15); } else { sess.bad++; rec.bad++; vibrate([40, 60, 40]); }
  if (T.it) {
    const c = S.cards[T.it.id];
    if (c) c.lvl = ok ? Math.min(5, c.lvl + (info.typo || sess.hint ? 0 : 1)) : Math.max(0, c.lvl - 2);
    if (!ok && !T.retry) {
      const back = T.t === 'dictation' || T.t === 'speak' ? 'write' : T.t;
      sess.tasks.push(Object.assign({}, mkTask(back, T.it, { card: T.card }), { retry: true }));
    }
    if (sess.mode === 'lesson') {
      sess.perf = sess.perf || {};
      sess.perf[T.it.id] = (sess.perf[T.it.id] || 0) + (ok ? 1 : -2);
    }
    if (T.card && !ok && S.cards[T.it.id]) { S.cards[T.it.id] = schedule(S.cards[T.it.id], 0); sess.reviewed[T.it.id] = true; }
  }
  save();
  showSheet(ok, info);
}

const PRAISE = ['¡Correcto!', '¡Muy bien!', '¡Perfecto!', '¡Genial!', '¡Eso es!', '¡Bravo!'];
function showSheet(ok, info) {
  const T = curTask();
  const it = T.it;
  let body = '';
  if (T.t === 'fill') {
    const full = esc(T.f.s).replace('___', '<b>' + esc(T.f.a) + '</b>');
    body = ok ? full + '<br><span style="opacity:.85">' + esc(T.f.cz) + '</span>' : 'Správně: ' + full + '<br><span style="opacity:.85">' + esc(T.f.cz) + '</span>';
  } else if (it) {
    if (!ok && (T.t === 'choice' || T.t === 'listen')) body = `<b>${esc(it.es)}</b> = <b>${esc(it.cz)}</b>`;
    else if (!ok) body = `Správně: <b>${esc(it.es)}</b><br><span style="opacity:.85">${esc(it.cz)}</span>${info.given ? `<br><span style="opacity:.8">Tvoje odpověď: <s>${esc(info.given)}</s></span>` : ''}`;
    else body = (info.note ? info.note + '<br>' : '') + `<b>${esc(it.es)}</b> · ${esc(it.cz)}`;
    if (info.heard !== undefined) body += `<br><span style="opacity:.85">Slyšel jsem: „${esc(info.heard || '…')}“</span>`;
  }
  const playBtn = it ? `<button class="play" onclick="A.say()">${I.speaker} Přehrát</button>` : '';
  let buttons;
  const c = it && S.cards[it.id];
  if (ok && T.card && c && sess.mode === 'review') {
    const main = info.typo || sess.hint ? 1 : 2;
    buttons = `<div class="rate">${[['Znovu', 0], ['Těžké', 1], ['Dobré', 2], ['Snadné', 3]].map(([l, r]) =>
      `<button class="${r === main ? 'main' : ''}" onclick="A.rate(${r})"><b>${l}</b><span>${ivlLabel(c, r)}</span></button>`).join('')}</div>`;
    sess.defaultRate = main;
  } else {
    buttons = `<button class="btn white block" onclick="A.next()">Pokračovat ${I.arrow}</button>`;
    sess.defaultRate = null;
  }
  const sh = document.getElementById('sheet');
  sh.className = 'sheet ' + (ok ? 'ok' : 'bad');
  sh.innerHTML = `<div class="head"><div class="chk" style="color:${ok ? 'var(--olive)' : 'var(--terra)'}">${ok ? I.check : I.x}</div>
    <div class="ttl">${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'Tohle ne'}</div><div style="margin-left:auto">${playBtn}</div></div>
    <div class="body">${body}</div>${buttons}`;
  requestAnimationFrame(() => sh.classList.add('show'));
  document.getElementById('pad').classList.remove('hidden');
  if (it && T.t !== 'intro') setTimeout(() => say(it.es), 200);
  if (T.t === 'fill') setTimeout(() => say(T.f.s.replace('___', T.f.a)), 200);
}
function hideSheet() {
  const sh = document.getElementById('sheet'); if (sh) sh.className = 'sheet';
  const p = document.getElementById('pad'); if (p) p.classList.add('hidden');
}

function nextTask() {
  if (HAS_TTS) speechSynthesis.cancel();
  if (curTask() && ['grammar', 'intro'].includes(curTask().t)) addTime();
  sess.i++;
  if (sess.i >= sess.tasks.length) { finishSession(); return; }
  renderTask();
  window.scrollTo(0, 0);
}

function finishSession() {
  const rec = todayRec();
  rec.sessions++;
  let newCount = 0;
  if (sess.mode === 'lesson') {
    const L = LESSONS[lessonIdx(sess.lid)];
    L.parts[sess.p].forEach((it) => {
      if (!S.cards[it.id]) {
        const c = newCard();
        const perf = (sess.perf && sess.perf[it.id]) || 0;
        c.lvl = perf >= 2 ? 2 : perf >= 1 ? 1 : 0;
        c.ivl = 1; c.due = perf < 0 ? Date.now() + 10 * 60000 : dueAt(1);
        S.cards[it.id] = c; newCount++;
      }
    });
    S.parts[partKey(L, sess.p)] = (S.parts[partKey(L, sess.p)] || 0) + 1;
    rec.newW += newCount;
  }
  save();
  sess.newCount = newCount;
  sess.doneAt = Date.now();
  go('done');
}

function vDone() {
  const total = sess.ok + sess.bad;
  const acc = total ? Math.round(sess.ok / total * 100) : 100;
  const mins = Math.max(1, Math.round((sess.doneAt - sess.start) / 60000));
  const st = streak();
  const L = sess.lid ? LESSONS[lessonIdx(sess.lid)] : null;
  const lessonFinished = L && lessonDone(L);
  const title = sess.mode === 'lesson' ? (lessonFinished ? 'Lekce hotová!' : 'Část hotová!') : sess.mode === 'review' ? 'Zopakováno!' : 'Procvičeno!';
  const third = sess.mode === 'lesson' ? [sess.newCount, plural(sess.newCount, 'nové slovíčko', 'nová slovíčka', 'nových slovíček')] : [Object.keys(sess.reviewed).length || sess.ok, 'kartiček'];
  const nextL = currentLesson(); const np = nextPart(nextL);
  const hasNext = dueCards().length > 0 || np !== null;
  return `<div class="done-wrap pop">
    <img src="icon-192.png" alt="" style="width:88px;height:88px;border-radius:24px;box-shadow:0 14px 30px rgba(194,80,46,.3)">
    <div class="big">${title}</div>
    <div class="muted" style="font-size:16px">${acc >= 90 ? '¡Excelente! Skoro bez chyby.' : acc >= 70 ? '¡Bien! Chyby se ti vrátí v opakování.' : 'Nevadí, chyby jsou součást učení. Uvidíš je znovu.'}</div>
    <div class="done-stats">
      <div class="card"><b style="color:var(--olive)">${acc} %</b><span>úspěšnost</span></div>
      <div class="card"><b>${mins}</b><span>min</span></div>
      <div class="card"><b>${third[0]}</b><span>${third[1]}</span></div>
    </div>
    <div class="streak" style="font-size:16px"><span style="color:var(--terra);display:flex">${I.flame}</span>${st} ${plural(st, 'den', 'dny', 'dní')} v řadě</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%;margin-top:10px">
      ${hasNext ? `<button class="btn terra block" onclick="A.cta()">Pokračovat ${I.arrow}</button>` : ''}
      <button class="btn ${hasNext ? 'ghost' : 'dark'} block" onclick="A.go('home')">Domů</button>
    </div>
  </div>`;
}

/* ---------- mikrofon ---------- */
let rec = null;
function startMic() {
  const T = curTask();
  if (!SR) { toast('Mluvení tady nejde, zkus Chrome.'); return; }
  if (rec) { try { rec.stop(); } catch (e) { /* nic */ } return; }
  if (HAS_TTS) speechSynthesis.cancel();
  rec = new SR();
  rec.lang = 'es-ES'; rec.interimResults = true; rec.maxAlternatives = 4;
  const btn = document.getElementById('micbtn'); const heard = document.getElementById('heard');
  btn.classList.add('mic-live'); heard.textContent = 'Poslouchám…';
  let final = false;
  rec.onresult = (e) => {
    const r = e.results[e.results.length - 1];
    heard.textContent = r[0].transcript;
    if (r.isFinal) {
      final = true;
      const cands = [T.it.es].concat(T.it.esAlt || []).map(strip);
      let best = 0, bestT = r[0].transcript;
      for (let k = 0; k < r.length; k++) {
        const a = strip(r[k].transcript);
        cands.forEach((c) => { const sim = 1 - lev(a, c) / Math.max(a.length, c.length, 1); if (sim > best) { best = sim; bestT = r[k].transcript; } });
      }
      grade(best >= 0.75, { heard: bestT, note: best < 0.95 && best >= 0.75 ? 'Dobrý, jen to ještě trochu doladit.' : '' });
    }
  };
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Povol mikrofon v prohlížeči, nebo klepni na „Teď nemůžu mluvit“.');
    else if (e.error === 'no-speech') toast('Nic jsem neslyšel, zkus to znovu.');
  };
  rec.onend = () => {
    rec = null;
    const b = document.getElementById('micbtn'); if (b) b.classList.remove('mic-live');
    if (!final && !sess.answered) { const h = document.getElementById('heard'); if (h) h.textContent = 'Klepni a zkus to znovu'; }
  };
  try { rec.start(); } catch (e) { rec = null; toast('Mikrofon se nepodařilo spustit.'); }
}

/* ================= akce (volané z HTML) ================= */
const A = {
  go,
  say(slow) {
    const T = view.name === 'session' && curTask();
    if (T && T.it) say(T.it.es, !!slow);
    else if (T && T.f) say(T.f.s.replace('___', T.f.a), !!slow);
  },
  onbGoal(m) { view.goal = m; render(); },
  onbDone() {
    S.name = (view.nm || '').trim().slice(0, 30);
    S.settings.goal = view.goal || 20;
    S.onboarded = true; save(); go('home');
  },
  cta() {
    if (dueCards().length) startReview();
    else startNext();
  },
  startNext, startReview, startPractice, startPart,
  openLesson(id) {
    if (!unlocked(lessonIdx(id))) { toast('Nejdřív dokonči předchozí lekci.'); return; }
    go('lesson', { id });
  },
  next() { if (view.name === 'session') nextTask(); },
  quit() {
    const lessonMode = sess && sess.mode === 'lesson';
    if (sess && sess.i > 0 && !confirm(lessonMode ? 'Ukončit? Tahle část lekce se neuloží jako hotová.' : 'Ukončit opakování? Co už máš zodpovězené, zůstane uložené.')) return;
    if (rec) try { rec.abort(); } catch (e) { /* nic */ }
    if (sess && sess.i > 0) { todayRec(); save(); }
    sess = null; go('home');
  },
  pick(k) {
    const T = curTask(); if (sess.answered) return;
    const ok = T.opts[k] === T.it.cz;
    document.querySelectorAll('.opt').forEach((b, i) => {
      b.disabled = true;
      if (T.opts[i] === T.it.cz) b.classList.add('good'); else if (i === k) b.classList.add('bad');
    });
    grade(ok);
  },
  pickFill(k) {
    const T = curTask(); if (sess.answered) return;
    const ok = T.opts[k] === T.f.a;
    document.getElementById('blank').textContent = T.opts[k];
    document.querySelectorAll('.opt').forEach((b, i) => {
      b.disabled = true;
      if (T.opts[i] === T.f.a) b.classList.add('good'); else if (i === k) b.classList.add('bad');
    });
    grade(ok);
  },
  inp() { const el = document.getElementById('ans'); document.getElementById('check').disabled = !el.value.trim() || sess.answered; },
  acc(ch) {
    const el = document.getElementById('ans'); if (!el || el.disabled) return;
    const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, s) + ch + el.value.slice(e);
    el.focus(); el.setSelectionRange(s + ch.length, s + ch.length); A.inp();
  },
  hint() {
    const T = curTask(); if (sess.answered) return;
    sess.hint = true;
    const h = tokens(T.it.es).map((w) => w[0] + '_'.repeat(Math.max(0, w.length - 1))).join(' ');
    const el = document.getElementById('hint');
    el.innerHTML = `<span style="font-family:monospace;letter-spacing:2px;font-size:17px;color:var(--terra-ink)">${esc(h)}</span>`;
  },
  checkInput() {
    const T = curTask(); if (sess.answered) return;
    const el = document.getElementById('ans'); const v = el.value;
    if (!v.trim()) return;
    el.disabled = true;
    const r = checkEs(v, T.it);
    grade(r.ok, Object.assign({ given: v }, r));
  },
  oAdd(i) { const T = curTask(); if (sess.answered || T.bank[i].used) return; T.bank[i].used = true; T.line.push(i); drawOrder(); },
  oRem(k) { const T = curTask(); if (sess.answered) return; const bi = T.line.splice(k, 1)[0]; T.bank[bi].used = false; drawOrder(); },
  checkOrder() {
    const T = curTask(); if (sess.answered) return;
    const given = T.line.map((bi) => T.bank[bi].w).join(' ');
    const ok = [T.it.es].concat(T.it.esAlt || []).some((c) => strip(c) === strip(given));
    grade(ok, { given });
  },
  m(side, i) {
    const T = curTask();
    if (side === 'L') T.selL = T.selL === i ? null : i; else T.selR = T.selR === i ? null : i;
    if (T.selL !== null && T.selR !== null) {
      const l = T.L[T.selL], r = T.R[T.selR];
      if (l.id === r.id) {
        T.done[l.id] = true; say(l.s); vibrate(10);
        T.selL = T.selR = null; drawMatch();
        if (Object.keys(T.done).length === T.L.length) {
          addTime();
          sess.answered = true;
          if (T.miss === 0) { sess.ok++; todayRec().ok++; } else { sess.bad++; todayRec().bad++; }
          save();
          setTimeout(nextTask, 500);
        }
        return;
      }
      T.miss++; vibrate([30, 40, 30]);
      const li = T.selL, ri = T.selR;
      T.selL = T.selR = null; drawMatch();
      ['L' + li, 'R' + ri].forEach((id) => { const b = document.getElementById('m' + id); if (b) b.classList.add('no'); });
      return;
    }
    drawMatch();
  },
  mic: startMic,
  noMic() {
    if (rec) try { rec.abort(); } catch (e) { /* nic */ }
    sess.tasks = sess.tasks.filter((t, k) => k <= sess.i || t.t !== 'speak');
    toast('Mluvení teď přeskakuju.');
    nextTask();
  },
  noAudio() {
    sess.tasks = sess.tasks.map((t, k) => (k > sess.i && (t.t === 'listen' || t.t === 'dictation')) ? mkTask(t.t === 'listen' ? 'choice' : 'write', t.it, { card: t.card }) : t);
    toast('Poslech teď přeskakuju.');
    nextTask();
  },
  rate(r) {
    const T = curTask();
    if (T.it && S.cards[T.it.id]) {
      S.cards[T.it.id] = schedule(S.cards[T.it.id], r);
      if (r === 0) { S.cards[T.it.id].lvl = Math.max(0, S.cards[T.it.id].lvl - 1); if (!T.retry) sess.tasks.push(Object.assign(mkTask('write', T.it, { card: true }), { retry: true })); }
      sess.reviewed[T.it.id] = true;
      save();
    }
    nextTask();
  },
  set(key, val) {
    S.settings[key] = val; save(); render();
    if (key === 'speak' && val && SR) toast('Až budeš mluvit poprvé, prohlížeč se zeptá na mikrofon.');
  },
  setName(v) { S.name = v.trim().slice(0, 30); save(); toast('Uloženo'); },
  testVoice() { say('¡Hola! ¿Qué tal? Vamos a aprender español.'); if (HAS_TTS && !esVoice) setTimeout(() => toast('Nenašel jsem španělský hlas, zkus doinstalovat v nastavení telefonu.'), 800); },
  exportData() {
    const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'hablo-zaloha-' + dkey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
  },
  importData(inp) {
    const f = inp.files && inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || !d.v || !d.cards) throw new Error('bad');
        if (!confirm('Přepsat současný pokrok zálohou?')) return;
        localStorage.setItem(KEY, JSON.stringify(d)); S = load(); toast('Záloha nahraná'); go('home');
      } catch (e) { toast('Tohle není záloha z Hablo.'); }
    };
    r.readAsText(f);
  },
  reset() {
    if (!confirm('Opravdu smazat všechen pokrok?')) return;
    if (!confirm('Fakt? Nejde to vrátit.')) return;
    localStorage.removeItem(KEY); S = load(); go('onboarding');
  }
};
window.A = A;

/* ---------- klávesnice (na počítači) ---------- */
document.addEventListener('keydown', (e) => {
  if (view.name !== 'session' || !sess) return;
  const T = curTask(); if (!T) return;
  const sheetOn = document.getElementById('sheet').classList.contains('show');
  if (e.key === 'Enter') {
    e.preventDefault();
    if (sheetOn) { if (sess.defaultRate !== null && sess.defaultRate !== undefined) A.rate(sess.defaultRate); else A.next(); return; }
    if (T.t === 'grammar' || T.t === 'intro') { A.next(); return; }
    if (T.t === 'write' || T.t === 'dictation') { A.checkInput(); return; }
    if (T.t === 'order') { A.checkOrder(); return; }
    return;
  }
  if (!sheetOn && /^[1-4]$/.test(e.key) && document.activeElement.tagName !== 'INPUT') {
    const k = +e.key - 1;
    if ((T.t === 'choice' || T.t === 'listen') && T.opts[k] !== undefined) A.pick(k);
    if (T.t === 'fill' && T.opts[k] !== undefined) A.pickFill(k);
  }
});

/* ---------- start ---------- */
render();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline režim nepůjde, nevadí */ }); });
}

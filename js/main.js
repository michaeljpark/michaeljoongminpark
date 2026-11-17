/* Selected work strip: card + 16:9 detail panel that pushes the row.
   Project content lives in js/projects.js. */

const $ = id => document.getElementById(id);
const root = document.documentElement;
const stage = $('stage'), strip = $('strip'), track = $('track'), panel = $('panel'), inner = $('panelInner');
const mq = matchMedia('(max-width: 760px)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const pad2 = n => String(n).padStart(2, '0');
const DUR = 700;
let cur = -1, cw = 0, offset = 0, busy = false;

/* theme */
function syncTheme() {
  const dark = root.getAttribute('data-theme') === 'dark';
  $('themeLabel').textContent = dark ? 'Light' : 'Dark';
  $('theme').setAttribute('aria-pressed', String(dark));
}
$('theme').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncTheme();
});
syncTheme();

/* cards */
$('count').textContent = `(${pad2(PROJECTS.length)})`;
PROJECTS.forEach((p, i) => {
  const b = document.createElement('button');
  b.className = 'work' + (p.video ? ' has-video' : '');
  b.setAttribute('aria-controls', 'panel');
  b.setAttribute('aria-expanded', 'false');
  b.innerHTML = `
    <div class="frame">
      ${p.art ? p.art : p.poster ? `<img src="${p.poster}" alt="" loading="lazy" onerror="this.remove()">` : ''}
      ${p.video ? `<video muted loop playsinline preload="none" data-src="${p.video}"></video>` : ''}
      <span class="tags">${p.category.split(/,\s*/).map(t => `<span class="tag">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`).join('')}</span>
    </div>
    <div class="meta small">
      <b>${p.title}</b><span class="yr mid">${p.year}</span>
      <span class="pitch mid">${p.pitch}</span>
    </div>`;
  b.addEventListener('click', () => { if (cur !== i) open(i); });
  track.appendChild(b);
});
const works = [...track.querySelectorAll('.work')];

const padPx = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
const gapPx = () => parseFloat(getComputedStyle(track).columnGap) || 12;
const wait = ms => new Promise(r => setTimeout(r, reduce.matches ? 0 : ms));

function maxOffset() {
  const last = works[works.length - 1];
  return Math.max(0, last.offsetLeft + last.offsetWidth + padPx() - strip.clientWidth);
}
function setOffset(x, animate = true) {
  offset = x;
  if (!animate) track.style.transition = 'none';
  track.style.transform = `translateX(${-x}px)`;
  if (!animate) { track.offsetHeight; track.style.transition = ''; }
  updateChev();
}
function updateChev() {
  const open = cur > -1;
  $('prev').disabled = !open && offset <= 1;
  $('next').disabled = !open && offset >= maxOffset() - 1;
}
function placePanel() {
  if (mq.matches) {
    if (cur > -1) works[cur].after(panel);
  } else if (panel.parentElement !== stage) {
    stage.insertBefore(panel, $('prev'));
  }
}
function layout() {
  placePanel();
  if (mq.matches) { offset = 0; push(-1); return; }
  const W = stage.clientWidth, pad = padPx(), gap = gapPx();
  const h = Math.round(Math.max(220, Math.min(460, (W - pad * 2 - gap) / (4 / 3 + 16 / 9))));
  stage.style.setProperty('--h', h + 'px');
  cw = Math.round(h * 4 / 3);
  if (cur > -1) setOffset(works[cur].offsetLeft - pad, false);
  else setOffset(Math.min(offset, maxOffset()), false);
  push(cur);
}
function push(i) {
  const on = i > -1 && !mq.matches;
  works.forEach((w, j) => {
    w.classList.toggle('is-pushed', on && j > i);
    w.classList.toggle('is-pulled', on && j < i);
  });
}
function fill(i) {
  const p = PROJECTS[i], n = PROJECTS.length;
  $('pIdx').textContent = `${pad2(i + 1)} / ${pad2(n)}`;
  $('pTitle').textContent = p.title;
  $('pProblem').textContent = p.problem;
  $('pKpi').innerHTML = p.kpi.map(k => `<div><dt class="small mid">${k.l}</dt><dd>${k.v}</dd></div>`).join('');
  $('pTldr').textContent = p.tldr;
  $('pCta').href = p.href;
  $('pCtaM').href = p.href;
  $('mTitle').textContent = p.title;
  $('mYear').textContent = p.year;
  $('mPitch').textContent = p.pitch;
}
function play(w, on) {
  const v = w.querySelector('video');
  if (!v) return;
  if (on) {
    if (!v.src && v.dataset.src) v.src = v.dataset.src;
    v.currentTime = 0;
    v.play().catch(() => {});
  } else v.pause();
}
function mark() {
  works.forEach((w, j) => {
    const on = j === cur;
    w.classList.toggle('is-active', on);
    w.setAttribute('aria-expanded', String(on));
    play(w, on);
  });
}
const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

async function openMobile(i) {
  if (cur > -1) {
    panel.classList.remove('is-open');
    await wait(480);
  }
  cur = i;
  mark();
  fill(i);
  works[i].after(panel);
  panel.setAttribute('aria-hidden', 'false');
  const y = works[i].getBoundingClientRect().top + scrollY - 8;
  window.scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
  await frames();
  panel.classList.add('is-open');
  await wait(560);
}

async function open(i) {
  if (busy) return;
  busy = true;
  if (mq.matches) { await openMobile(i); busy = false; return; }
  const wasOpen = cur > -1;
  const target = works[i].offsetLeft - padPx();
  cur = i;
  mark();
  updateChev();
  if (!wasOpen) {
    fill(i);
    panel.setAttribute('aria-hidden', 'false');
    if (Math.abs(target - offset) > 1) { setOffset(target); await wait(DUR - 120); }
    push(i);
    panel.classList.add('is-open');
    await wait(DUR);
  } else {
    inner.classList.add('is-swapping');
    push(i);
    setOffset(target);
    await wait(220);
    fill(i);
    await wait(DUR - 340);
    inner.classList.remove('is-swapping');
    await wait(120);
  }
  busy = false;
}
async function close() {
  if (cur < 0 || busy) return;
  busy = true;
  const last = works[cur];
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  push(-1);
  cur = -1;
  await wait(mq.matches ? 520 : DUR);
  mark();
  if (!mq.matches && offset > maxOffset()) setOffset(maxOffset());
  updateChev();
  last.focus({ preventScroll: true });
  busy = false;
}
function step(dir) {
  if (cur > -1) return open((cur + dir + PROJECTS.length) % PROJECTS.length);
  if (mq.matches) return;
  setOffset(Math.min(maxOffset(), Math.max(0, offset + dir * (cw + gapPx()))));
}

$('mPrev').addEventListener('click', () => step(-1));
$('mNext').addEventListener('click', () => step(1));
$('pClose').addEventListener('click', close);
$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
document.addEventListener('keydown', e => {
  if (cur < 0) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
strip.addEventListener('scroll', () => {
  const s = strip.scrollLeft;
  if (!s) return;
  strip.scrollLeft = 0;
  if (cur < 0) setOffset(Math.min(maxOffset(), Math.max(0, offset + s)), false);
});
let sx = null;
strip.addEventListener('touchstart', e => { sx = mq.matches ? null : e.touches[0].clientX; }, { passive: true });
strip.addEventListener('touchend', e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  sx = null;
});
window.addEventListener('resize', layout);
mq.addEventListener('change', layout);
layout();

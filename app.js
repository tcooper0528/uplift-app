// Date helpers
function getWeek(d = new Date()) {
  const day = d.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}
function getDayOfWeek(d = new Date()) {
  // Monday=1 … Sunday=7
  const js = d.getDay(); // Sun=0
  return js === 0 ? 7 : js; // 1..7
}

async function loadData() {
  const res = await fetch('/assets/devotionals.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load data');
  return await res.json();
}

function formatTodayMeta(dt, week) {
  const opt = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return `${dt.toLocaleDateString(undefined, opt)} • Week ${week}`;
}

function toShareText(payload) {
  const { verse_ref, verse_text, reflection, encouragement } = payload;
  return `🌿 Today’s Devotional\n“${verse_text}”\n— ${verse_ref}\n\n${reflection}\n\nEncouragement: ${encouragement}\n\nFaith & Hope Uplift (NKJV)`;
}

function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function buildArchive(dataset) {
  const grid = document.getElementById('archive-grid');
  grid.innerHTML = '';
  Object.values(dataset).forEach(week => {
    Object.entries(week.days).forEach(([d, payload]) => {
      const el = document.createElement('div');
      el.className = 'tile';
      el.innerHTML = `<h3>Week ${week.week} • Day ${d}</h3>
        <div class="small">${payload.verse_ref}</div>
        <p>${payload.reflection}</p>`;
      el.addEventListener('click', () => renderToday(week.week, parseInt(d), dataset));
      grid.appendChild(el);
    });
  });
}

function renderToday(week, day, dataset) {
  const weekObj = dataset[String(week)];
  const payload = weekObj?.days?.[String(day)];
  if (!payload) return;

  document.getElementById('tag-week').textContent = `Week ${week} — ${weekObj.title}`;
  document.getElementById('meta').textContent = formatTodayMeta(new Date(), week);
  document.getElementById('verse-text').textContent = `“${payload.verse_text}”`;
  document.getElementById('verse-ref').textContent = payload.verse_ref;
  document.getElementById('reflection').textContent = payload.reflection;
  document.getElementById('encouragement').textContent = `Encouragement: ${payload.encouragement}`;

  document.getElementById('share-btn').onclick = async () => {
    const text = toShareText(payload);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied share text to clipboard!');
    }
  };
  document.getElementById('copy-btn').onclick = async () => {
    const text = toShareText(payload);
    await navigator.clipboard.writeText(text);
    alert('Copied!');
  };
}

(async function init() {
  const dataset = await loadData();
  const now = new Date();
  const week = getWeek(now);
  const day = getDayOfWeek(now);
  document.getElementById('year').textContent = now.getFullYear();

  // Nav
  document.getElementById('btn-today').addEventListener('click', () => switchPanel('today'));
  document.getElementById('btn-archive').addEventListener('click', () => switchPanel('archive'));
  document.getElementById('btn-about').addEventListener('click', () => switchPanel('about'));

  renderToday(week, day, dataset);
  buildArchive(dataset);
})();


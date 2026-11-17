#!/usr/bin/env node
/**
 * Generates every graphic on the profile README as hand-written SVG, in light + dark themes.
 *
 *   node scripts/generate.mjs            # all graphics (stats need GITHUB_TOKEN)
 *   node scripts/generate.mjs --static   # skip the live stats card
 *
 * The daily GitHub Action re-runs this to keep the stats card fresh.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const LOGIN = 'Ashish-Agarwal-12';
const OUT = new URL('../assets/', import.meta.url);

const THEMES = {
  dark: {
    bg: '#0d1117', panel: '#161b22', panel2: '#1c2330', border: '#30363d', text: '#e6edf3', muted: '#8b949e',
    a1: '#a78bfa', a2: '#22d3ee', a3: '#f59e0b', a4: '#f472b6', green: '#3fb950', grid: '#ffffff', gridOpacity: 0.04,
    kw: '#ff7b72', str: '#a5d6ff', key: '#d2a8ff', punc: '#8b949e', num: '#79c0ff',
  },
  light: {
    bg: '#ffffff', panel: '#f6f8fa', panel2: '#eef1f5', border: '#d0d7de', text: '#1f2328', muted: '#57606a',
    a1: '#7c3aed', a2: '#0891b2', a3: '#d97706', a4: '#db2777', green: '#1a7f37', grid: '#000000', gridOpacity: 0.05,
    kw: '#cf222e', str: '#0a3069', key: '#8250df', punc: '#57606a', num: '#0550ae',
  },
};

const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const EMOJI = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }';

/** Wrap text to lines of at most `max` characters. */
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line.trim());
      line = word;
    } else line += ' ' + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/* ------------------------------------------------------------------ *
 * Header: name, typing roles, and a train running along the bottom
 * ------------------------------------------------------------------ */
function header(t) {
  const W = 1200, H = 400;
  const phrases = ['full-stack developer', 'Java + Spring Boot backends', 'Next.js + React frontends', 'systems that never double-book'];
  const n = phrases.length, per = 4, T = n * per; // seconds
  const fs = 34, cw = fs * 0.6, X = 112, Y = 196;
  const pct = (x) => +(x * 100).toFixed(3);

  let typingCss = '';
  let typingSvg = '';
  phrases.forEach((p, i) => {
    const w = p.length * cw;
    const s = i / n, e = (i + 1) / n, span = e - s;
    const typed = s + span * 0.32, hold = e - span * 0.16;
    // visibility window
    typingCss += `.p${i}{opacity:0;animation:vis${i} ${T}s linear infinite}
@keyframes vis${i}{0%{opacity:0}${s > 0 ? `${pct(s) - 0.001}%{opacity:0}` : ''}${pct(s)}%{opacity:1}${pct(e) - 0.001}%{opacity:1}${pct(e) < 100 ? `${pct(e)}%{opacity:0}` : ''}100%{opacity:${e >= 1 ? 1 : 0}}}
.r${i}{transform-box:fill-box;transform-origin:0 0;animation:type${i} ${T}s infinite}
@keyframes type${i}{0%{transform:scaleX(0)}${pct(s)}%{transform:scaleX(0);animation-timing-function:steps(${p.length},end)}${pct(typed)}%{transform:scaleX(1)}${pct(hold)}%{transform:scaleX(1);animation-timing-function:steps(${p.length},end)}${pct(e)}%{transform:scaleX(0)}100%{transform:scaleX(0)}}
.c${i}{animation:cur${i} ${T}s infinite}
@keyframes cur${i}{0%{transform:translateX(0)}${pct(s)}%{transform:translateX(0);animation-timing-function:steps(${p.length},end)}${pct(typed)}%{transform:translateX(${w}px)}${pct(hold)}%{transform:translateX(${w}px);animation-timing-function:steps(${p.length},end)}${pct(e)}%{transform:translateX(0)}100%{transform:translateX(0)}}
`;
    typingSvg += `<g class="p${i}">
  <clipPath id="clip${i}"><rect class="r${i}" x="${X}" y="${Y - fs}" width="${w}" height="${fs + 12}"/></clipPath>
  <text x="${X}" y="${Y}" clip-path="url(#clip${i})" font-family="${MONO}" font-size="${fs}" fill="${t.text}">${esc(p)}</text>
  <g class="c${i}"><rect class="blink" x="${X + 2}" y="${Y - fs + 4}" width="${fs * 0.5}" height="${fs}" rx="2" fill="${t.a2}"/></g>
</g>`;
  });

  // Train made of simple shapes (engine + 3 coaches), drawn facing right at origin.
  const coach = (x, c) => `<g transform="translate(${x},0)">
    <rect x="0" y="-46" width="96" height="40" rx="7" fill="${c}"/>
    <rect x="0" y="-18" width="96" height="6" fill="${t.bg}" opacity="0.25"/>
    ${[10, 34, 58].map((wx) => `<rect x="${wx}" y="-40" width="18" height="13" rx="3" fill="${t.bg}" opacity="0.85"/>`).join('')}
    <circle cx="20" cy="-4" r="7" fill="${t.text}" opacity="0.9"/><circle cx="76" cy="-4" r="7" fill="${t.text}" opacity="0.9"/>
  </g>`;
  const train = `<g class="train">
    ${coach(0, t.a4)}${coach(102, t.a2)}${coach(204, t.a1)}
    <g transform="translate(306,0)">
      <rect x="0" y="-56" width="70" height="50" rx="8" fill="${t.a3}"/>
      <rect x="10" y="-48" width="22" height="16" rx="3" fill="${t.bg}" opacity="0.85"/>
      <path d="M70,-40 L104,-24 L104,-6 L70,-6 Z" fill="${t.a3}"/>
      <rect x="46" y="-74" width="12" height="20" rx="2" fill="${t.muted}"/>
      <circle cx="98" cy="-20" r="4" fill="#fde68a"/>
      <circle cx="20" cy="-4" r="8" fill="${t.text}" opacity="0.9"/><circle cx="58" cy="-4" r="8" fill="${t.text}" opacity="0.9"/><circle cx="90" cy="-4" r="6" fill="${t.text}" opacity="0.9"/>
      <circle class="smoke s1" cx="52" cy="-82" r="7" fill="${t.muted}"/>
      <circle class="smoke s2" cx="52" cy="-82" r="9" fill="${t.muted}"/>
      <circle class="smoke s3" cx="52" cy="-82" r="6" fill="${t.muted}"/>
    </g>
  </g>`;

  const floaters = [
    ['{ }', 1010, 70, 0], ['</>', 1100, 150, 2], ['=>', 940, 170, 4], ['λ', 1120, 60, 1], ['[ ]', 860, 90, 3], ['&&', 1050, 210, 5],
  ].map(([s, x, y, d]) => `<text class="float" style="animation-delay:-${d}s" x="${x}" y="${y}" font-family="${MONO}" font-size="22" fill="${t.a1}" opacity="0.45">${esc(s)}</text>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hi, I'm Ashish — full-stack developer">
<title>Hi, I'm Ashish — full-stack developer</title>
<defs>
  <linearGradient id="name" x1="0" x2="1"><stop offset="0" stop-color="${t.a1}"/><stop offset="0.55" stop-color="${t.a2}"/><stop offset="1" stop-color="${t.a3}"/></linearGradient>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${t.grid}" stroke-opacity="${t.gridOpacity * 2}" stroke-width="1"/></pattern>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55"/></filter>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
</defs>
<style>
  .blob{animation:drift 14s ease-in-out infinite alternate}
  .blob.b2{animation-duration:18s;animation-direction:alternate-reverse}
  @keyframes drift{from{transform:translate(0,0)}to{transform:translate(60px,-30px)}}
  .wave{transform-box:fill-box;transform-origin:70% 80%;animation:wave 2.6s ease-in-out infinite}
  @keyframes wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(14deg)}20%,40%{transform:rotate(-8deg)}}
  .blink{animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .train{animation:ride 12s linear infinite}
  @keyframes ride{from{transform:translate(-460px,${H - 38}px)}to{transform:translate(1260px,${H - 38}px)}}
  .smoke{opacity:0;transform-box:fill-box;transform-origin:center;animation:puff 1.8s ease-out infinite}
  .s2{animation-delay:.6s}.s3{animation-delay:1.2s}
  @keyframes puff{0%{opacity:.6;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(-46px,-26px) scale(2)}}
  .sleepers{animation:sleep 1.2s linear infinite}
  @keyframes sleep{to{transform:translateX(-40px)}}
  .float{animation:bob 6s ease-in-out infinite}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  ${typingCss}
  ${REDUCED_MOTION}
</style>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${t.panel}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <g filter="url(#blur)" opacity="0.55">
    <circle class="blob" cx="980" cy="80" r="150" fill="${t.a1}"/>
    <circle class="blob b2" cx="1150" cy="240" r="120" fill="${t.a2}"/>
    <circle class="blob" cx="120" cy="40" r="110" fill="${t.a4}" opacity="0.6"/>
  </g>
  ${floaters}

  <text x="${X}" y="118" font-family="${SANS}" font-size="64" font-weight="800" fill="url(#name)" letter-spacing="-1">Hi, I'm Ashish</text>
  <text class="wave" x="560" y="114" font-family="${EMOJI}" font-size="54">👋</text>
  <text x="${X - 36}" y="${Y}" font-family="${MONO}" font-size="${fs}" font-weight="700" fill="${t.green}">❯</text>
  ${typingSvg}

  <g font-family="${SANS}" font-size="21" fill="${t.muted}">
    <text x="${X}" y="252">📍 India   ·   ☕ Java   ·   ⚡ TypeScript   ·   🚀 Shipping on Vercel</text>
  </g>

  <!-- track -->
  <rect x="0" y="${H - 34}" width="${W}" height="4" rx="2" fill="${t.muted}" opacity="0.5"/>
  <g class="sleepers">${Array.from({ length: 34 }, (_, i) => `<rect x="${i * 40}" y="${H - 30}" width="22" height="6" rx="2" fill="${t.border}"/>`).join('')}</g>
  ${train}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${t.border}"/>
</svg>`;
}

/* ------------------------------------------------------------------ *
 * About me, as a syntax-highlighted code editor
 * ------------------------------------------------------------------ */
function about(t) {
  const W = 1200, lineH = 36, top = 100, left = 100;
  const k = (s) => `<tspan fill="${t.kw}">${esc(s)}</tspan>`;
  const key = (s) => `<tspan fill="${t.key}">${esc(s)}</tspan>`;
  const str = (s) => `<tspan fill="${t.str}">"${esc(s)}"</tspan>`;
  const p = (s) => `<tspan fill="${t.punc}">${esc(s)}</tspan>`;
  const arr = (items) => p('[') + items.map((x, i) => str(x) + (i < items.length - 1 ? p(', ') : '')).join('') + p(']');
  const lines = [
    `${k('const')} ${key('ashish')} ${p('=')} ${p('{')}`,
    `  ${key('role')}${p(':')} ${str('Full-stack developer')}${p(',')}`,
    `  ${key('location')}${p(':')} ${str('India')}${p(',')}`,
    `  ${key('backend')}${p(':')} ${arr(['Java', 'Spring Boot', 'Node.js', 'Express', 'Prisma'])}${p(',')}`,
    `  ${key('frontend')}${p(':')} ${arr(['Next.js', 'React', 'Tailwind', 'GSAP'])}${p(',')}`,
    `  ${key('currentlyBuilding')}${p(':')} ${str('IRCTC-style train reservation backend')}${p(',')}`,
    `  ${key('learning')}${p(':')} ${arr(['System design', 'Distributed systems', 'Redis'])}${p(',')}`,
    `  ${key('caresAbout')}${p(':')} ${arr(['correctness', 'tests', 'security', 'readable code'])}${p(',')}`,
    `  ${key('funFact')}${p(':')} ${str('my own app warns me before I overspend')}${p(',')}`,
    `${p('};')}`,
  ];
  const H = top + lines.length * lineH + 36;
  const body = lines
    .map((l, i) => `<g class="ln" style="animation-delay:${(0.25 + i * 0.18).toFixed(2)}s">
      <text x="${left - 28}" y="${top + i * lineH}" text-anchor="end" font-family="${MONO}" font-size="17" fill="${t.muted}" opacity="0.6">${i + 1}</text>
      <text x="${left}" y="${top + i * lineH}" font-family="${MONO}" font-size="21" fill="${t.text}" xml:space="preserve">${l}</text>
    </g>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="About Ashish">
<title>About Ashish: full-stack developer in India building an IRCTC-style reservation backend</title>
<style>
  .ln{opacity:0;animation:in .5s ease-out forwards}
  @keyframes in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
  .cursor{animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  ${REDUCED_MOTION.replace('animation: none !important;', 'animation: none !important; opacity: 1 !important;')}
</style>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${t.panel}" stroke="${t.border}"/>
<path d="M1,48 H${W - 1}" stroke="${t.border}"/>
<circle cx="30" cy="25" r="7" fill="#ff5f57"/><circle cx="54" cy="25" r="7" fill="#febc2e"/><circle cx="78" cy="25" r="7" fill="#28c840"/>
<rect x="112" y="10" width="150" height="38" rx="8" fill="${t.bg}" stroke="${t.border}"/>
<text x="132" y="34" font-family="${MONO}" font-size="15" fill="${t.text}">ashish.ts</text>
<circle cx="245" cy="29" r="4" fill="${t.a2}"/>
<text x="${W - 24}" y="34" text-anchor="end" font-family="${MONO}" font-size="13" fill="${t.muted}">TypeScript · UTF-8</text>
${body}
<rect class="cursor" x="${left + 28}" y="${top + (lines.length - 1) * lineH - 20}" width="12" height="25" fill="${t.a2}"/>
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Project cards
 * ------------------------------------------------------------------ */
const PROJECTS = [
  {
    slug: 'irctc-backend', icon: '🚆', title: 'IRCTC Backend', tag: 'Building',
    desc: 'IRCTC-style train reservation backend: seat holds, payments, PNRs and RAC/WL promotion — built to never double-book.',
    stack: ['TypeScript', 'Express 5', 'PostgreSQL', 'Prisma', 'Redis'],
  },
  {
    slug: 'debt-free-tracker', icon: '💸', title: 'Debt-Free Tracker', tag: 'CI/CD',
    desc: 'Tracks daily spending and every EMI in one place, and warns you before you overspend. Password-protected, tested, auto-deployed.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'MongoDB', 'Vercel'],
  },
  {
    slug: 'comet-2025', icon: '☄️', title: 'CoMeT 2025', tag: 'Live',
    desc: 'Website for a corporate leadership summit with a cosmic theme, scroll-triggered animations and live feedback collection.',
    stack: ['Next.js', 'Tailwind', 'GSAP', 'Three.js', 'Supabase'],
  },
  {
    slug: 'corporate-quiz', icon: '🧠', title: 'Corporate Quiz App', tag: 'Live',
    desc: 'Interactive quiz app for corporate events with smooth, animated question flows.',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
  },
  {
    slug: 'ecommerce-spring', icon: '🛒', title: 'E-commerce Backend', tag: 'Java',
    desc: 'Monolithic e-commerce backend built with Spring Boot and Spring Data JPA.',
    stack: ['Java', 'Spring Boot', 'Spring Data JPA', 'H2'],
  },
  {
    slug: 'irctc-console', icon: '🎫', title: 'IRCTC Console Booking', tag: 'Java 21',
    desc: 'Command-line train booking: BCrypt-hashed sign-up, train search, seat map, booking and cancellation.',
    stack: ['Java 21', 'Gradle', 'BCrypt', 'JSON storage'],
  },
];

function card(pr, t, i) {
  const W = 520, H = 236;
  const accents = [t.a1, t.a2, t.a3, t.a4, t.green, t.a1];
  const ac = accents[i % accents.length];
  const descLines = wrap(pr.desc, 47).slice(0, 3);
  let cx = 26;
  const chips = pr.stack
    .map((s) => {
      const w = Math.round(s.length * 8.2 + 22);
      const out = `<rect x="${cx}" y="184" width="${w}" height="30" rx="15" fill="${ac}" fill-opacity="0.14" stroke="${ac}" stroke-opacity="0.45"/>
        <text x="${cx + w / 2}" y="204" text-anchor="middle" font-family="${SANS}" font-size="14.5" font-weight="600" fill="${t.text}">${esc(s)}</text>`;
      cx += w + 7;
      return out;
    })
    .join('');
  const tagW = Math.round(pr.tag.length * 8.4 + 26);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(pr.title)}">
<title>${esc(pr.title)} — ${esc(pr.desc)}</title>
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ac}" stop-opacity="0.22"/><stop offset="0.6" stop-color="${ac}" stop-opacity="0"/></linearGradient>
  <clipPath id="r"><rect width="${W}" height="${H}" rx="16"/></clipPath>
</defs>
<style>
  .shine{animation:shine 6s ease-in-out infinite;animation-delay:${i * 0.7}s}
  @keyframes shine{0%,70%{transform:translateX(-200px)}100%{transform:translateX(${W + 200}px)}}
  ${REDUCED_MOTION}
</style>
<g clip-path="url(#r)">
  <rect width="${W}" height="${H}" fill="${t.panel}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="6" height="${H}" fill="${ac}"/>
  <rect class="shine" x="0" y="-40" width="60" height="${H + 80}" fill="${t.text}" opacity="0.05" transform="rotate(18)"/>
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.border}"/>
<text x="24" y="56" font-family="${EMOJI}" font-size="32">${pr.icon}</text>
<text x="72" y="52" font-family="${SANS}" font-size="26" font-weight="700" fill="${t.text}">${esc(pr.title)}</text>
<rect x="${W - tagW - 20}" y="29" width="${tagW}" height="27" rx="13.5" fill="${ac}"/>
<text x="${W - tagW / 2 - 20}" y="47.5" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="700" fill="${t.bg}">${esc(pr.tag)}</text>
${descLines.map((l, j) => `<text x="26" y="${96 + j * 25}" font-family="${SANS}" font-size="17.5" fill="${t.muted}">${esc(l)}</text>`).join('')}
${chips}
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Live stats (repos, stars, contributions, streak, languages)
 * ------------------------------------------------------------------ */
async function fetchStats(token) {
  const query = `query($login:String!){user(login:$login){
    repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100){totalCount nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
  }}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-readme-generator' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error('GitHub API error: ' + JSON.stringify(json.errors || json).slice(0, 300));
  const u = json.data.user;

  const langs = new Map();
  let stars = 0;
  for (const r of u.repositories.nodes) {
    stars += r.stargazerCount;
    for (const e of r.languages.edges) {
      const cur = langs.get(e.node.name) || { size: 0, color: e.node.color || '#8b949e' };
      cur.size += e.size;
      langs.set(e.node.name, cur);
    }
  }
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: count back from today (today may not have contributions yet).
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else if (i === days.length - 1) continue;
    else break;
  }
  const total = [...langs.values()].reduce((s, l) => s + l.size, 0) || 1;
  const sorted = [...langs.entries()].sort((a, b) => b[1].size - a[1].size);
  const top = sorted.slice(0, 5).map(([name, l]) => ({ name, color: l.color, pct: (l.size / total) * 100 }));
  const rest = 100 - top.reduce((s, l) => s + l.pct, 0);
  if (rest > 0.5) top.push({ name: 'Other', color: '#8b949e', pct: rest });

  return {
    repos: u.repositories.totalCount,
    stars,
    contributions: u.contributionsCollection.contributionCalendar.totalContributions,
    current,
    longest,
    langCount: langs.size,
    langs: top,
    recent: days.slice(-30).map((d) => d.contributionCount),
  };
}

function stats(s, t) {
  const W = 1200, H = 280;
  const tiles = [
    ['📦', s.repos, 'Public repos'],
    // Show stars once there are some; until then, show language breadth instead of a sad "0".
    s.stars > 0 ? ['⭐', s.stars, 'Stars earned'] : ['🧩', s.langCount, 'Languages used'],
    ['🔥', s.contributions, 'Contributions (1y)'],
    ['⚡', `${s.current}d`, `Streak · best ${s.longest}d`],
  ];
  const tileW = 172, tileGap = 12;
  const tilesSvg = tiles
    .map(([icon, value, label], i) => {
      const x = 24 + i * (tileW + tileGap);
      return `<g class="tile" style="animation-delay:${0.1 + i * 0.12}s">
        <rect x="${x}" y="70" width="${tileW}" height="134" rx="14" fill="${t.panel2}" stroke="${t.border}"/>
        <text x="${x + 18}" y="108" font-family="${EMOJI}" font-size="26">${icon}</text>
        <text x="${x + 18}" y="158" font-family="${SANS}" font-size="40" font-weight="800" fill="${t.text}">${esc(value)}</text>
        <text x="${x + 18}" y="188" font-family="${SANS}" font-size="16" fill="${t.muted}">${esc(label)}</text>
      </g>`;
    })
    .join('');

  // Languages: stacked bar + legend
  const LX = 790, LW = 380;
  let bx = LX;
  const bar = s.langs
    .map((l) => {
      const w = (l.pct / 100) * LW;
      const out = `<rect x="${bx.toFixed(1)}" y="100" width="${Math.max(w - 2, 1).toFixed(1)}" height="16" fill="${l.color}"/>`;
      bx += w;
      return out;
    })
    .join('');
  const legend = s.langs
    .map((l, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = LX + col * 190, y = 150 + row * 30;
      return `<circle cx="${x + 7}" cy="${y - 6}" r="7" fill="${l.color}"/>
        <text x="${x + 22}" y="${y}" font-family="${SANS}" font-size="17" fill="${t.text}">${esc(l.name)} <tspan fill="${t.muted}">${l.pct.toFixed(1)}%</tspan></text>`;
    })
    .join('');

  // Sparkline of the last 30 days
  const max = Math.max(1, ...s.recent);
  const pts = s.recent.map((c, i) => `${(130 + i * (630 / 29)).toFixed(1)},${(266 - (c / max) * 40).toFixed(1)}`).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 10}" viewBox="0 0 ${W} ${H + 10}" role="img" aria-label="GitHub stats">
<title>GitHub stats: ${s.repos} public repos, ${s.stars} stars, ${s.contributions} contributions in the last year</title>
<defs>
  <linearGradient id="spark" x1="0" x2="1"><stop offset="0" stop-color="${t.a1}"/><stop offset="1" stop-color="${t.a2}"/></linearGradient>
  <clipPath id="barclip"><rect x="${LX}" y="100" width="${LW}" height="16" rx="8"/></clipPath>
</defs>
<style>
  .tile{opacity:0;animation:up .6s ease-out forwards}
  @keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .grow{transform-box:fill-box;transform-origin:left;animation:grow 1.2s ease-out forwards;transform:scaleX(0)}
  @keyframes grow{to{transform:scaleX(1)}}
  .line{stroke-dasharray:1200;stroke-dashoffset:1200;animation:draw 2s ease-out .4s forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  ${REDUCED_MOTION.replace('animation: none !important;', 'animation: none !important; opacity: 1 !important; transform: none !important; stroke-dashoffset: 0 !important;')}
</style>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H + 9}" rx="18" fill="${t.panel}" stroke="${t.border}"/>
<text x="24" y="46" font-family="${SANS}" font-size="24" font-weight="700" fill="${t.text}">📊 GitHub at a glance</text>
<text x="${W - 24}" y="46" text-anchor="end" font-family="${SANS}" font-size="15" fill="${t.muted}">updated daily · ${new Date().toISOString().slice(0, 10)}</text>
${tilesSvg}
<text x="${LX}" y="86" font-family="${SANS}" font-size="18" font-weight="700" fill="${t.text}">Most used languages</text>
<g clip-path="url(#barclip)"><rect x="${LX}" y="100" width="${LW}" height="16" fill="${t.border}"/><g class="grow">${bar}</g></g>
${legend}
<text x="24" y="262" font-family="${SANS}" font-size="15" fill="${t.muted}">Last 30 days</text>
<polyline class="line" points="${pts}" fill="none" stroke="url(#spark)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Footer wave
 * ------------------------------------------------------------------ */
function footer(t) {
  const W = 1200, H = 140;
  const wave = (amp, y, len) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= W * 2; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
    return d + ` V ${H} H 0 Z`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thanks for visiting">
<title>Thanks for visiting!</title>
<defs><linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="${t.a1}"/><stop offset="0.5" stop-color="${t.a2}"/><stop offset="1" stop-color="${t.a3}"/></linearGradient></defs>
<style>
  .w1{animation:slide 9s linear infinite}.w2{animation:slide 14s linear infinite reverse}
  @keyframes slide{to{transform:translateX(-300px)}}
  ${REDUCED_MOTION}
</style>
<path class="w2" d="${wave(16, 92, 300)}" fill="url(#w)" opacity="0.35"/>
<path class="w1" d="${wave(12, 104, 300)}" fill="url(#w)" opacity="0.8"/>
<text x="${W / 2}" y="54" text-anchor="middle" font-family="${SANS}" font-size="28" font-weight="700" fill="${t.text}">Thanks for stopping by ✨</text>
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Connect buttons
 * ------------------------------------------------------------------ */
function button(kind, t) {
  const W = 230, H = 56;
  const spec = {
    linkedin: { label: 'Connect on LinkedIn', color: '#0A66C2', glyph: `<rect x="18" y="14" width="28" height="28" rx="6" fill="#ffffff"/><text x="32" y="36" text-anchor="middle" font-family="${SANS}" font-size="18" font-weight="800" fill="#0A66C2">in</text>` },
    repos: { label: 'Browse my repos', color: t.a1, glyph: `<text x="32" y="38" text-anchor="middle" font-family="${MONO}" font-size="19" font-weight="700" fill="#ffffff">&lt;/&gt;</text>` },
  }[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${spec.label}">
<title>${spec.label}</title>
<style>.glow{animation:glow 3s ease-in-out infinite}@keyframes glow{50%{opacity:.55}}${REDUCED_MOTION}</style>
<rect class="glow" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${H / 2}" fill="none" stroke="${spec.color}" stroke-width="2" opacity="0.9"/>
<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="${(H - 10) / 2}" fill="${spec.color}"/>
${spec.glyph}
<text x="${(W + 50) / 2}" y="34" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="700" fill="#ffffff">${spec.label}</text>
</svg>`;
}

/* ------------------------------------------------------------------ */

async function main() {
  const staticOnly = process.argv.includes('--static');
  await mkdir(OUT, { recursive: true });
  const write = (name, svg) => writeFile(new URL(name, OUT), svg.trim() + '\n');

  for (const [mode, t] of Object.entries(THEMES)) {
    await write(`header-${mode}.svg`, header(t));
    await write(`about-${mode}.svg`, about(t));
    await write(`footer-${mode}.svg`, footer(t));
    await write(`btn-linkedin-${mode}.svg`, button('linkedin', t));
    await write(`btn-repos-${mode}.svg`, button('repos', t));
    for (const [i, pr] of PROJECTS.entries()) await write(`card-${pr.slug}-${mode}.svg`, card(pr, t, i));
  }

  if (!staticOnly) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) throw new Error('Set GITHUB_TOKEN to build the stats card (or pass --static).');
    try {
      const s = await fetchStats(token);
      for (const [mode, t] of Object.entries(THEMES)) await write(`stats-${mode}.svg`, stats(s, t));
      console.log(`stats: ${s.repos} repos, ${s.stars} stars, ${s.contributions} contributions, streak ${s.current}/${s.longest}, langs ${s.langs.map((l) => l.name).join(', ')}`);
    } catch (e) {
      // Keep yesterday's card rather than breaking the profile if the API has a bad day.
      console.warn(`::warning::Stats not updated, keeping the previous card: ${e.message}`);
    }
  }
  console.log('Graphics written to assets/');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

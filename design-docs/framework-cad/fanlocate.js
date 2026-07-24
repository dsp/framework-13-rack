// Locate the fan + fin stack in BOARD coordinates by anchoring drawing views
// to the asymmetric 5-boss pattern (1:1 views, orthogonal orientations).
const { geoms } = require('./parse_dxf.js');
const fmt = n => (n == null) ? '?' : Number(n).toFixed(2);

const bosses = [[28.50, -24.70], [-111.15, 3.05], [111.00, 4.15], [-111.15, 67.05], [110.50, 71.85]];
const circ = geoms.filter(g => g.type === 'CIRCLE');

// 8 orthogonal transforms: paper = R*board + t (R in {rot0,90,180,270} x {id,mirrorX})
const mats = [];
for (const m of [1, -1]) // mirror in x first
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, c = Math.round(Math.cos(a)), s = Math.round(Math.sin(a));
    // R = rot(k) * diag(m,1)
    mats.push({ m, k, R: [[c * m, -s], [s * m, c]] });
  }
const apply = (R, p) => [R[0][0] * p[0] + R[0][1] * p[1], R[1][0] * p[0] + R[1][1] * p[1]];

const views = [];
for (const M of mats) {
  const mb = bosses.map(b => apply(M.R, b));
  for (const c0 of circ) {
    // hypothesize boss[1] (an extreme corner) lands on c0
    const t = [c0.c[0] - mb[1][0], c0.c[1] - mb[1][1]];
    let hits = 0, pts = [];
    for (const b of mb) {
      const target = [b[0] + t[0], b[1] + t[1]];
      const found = circ.find(cc => Math.hypot(cc.c[0] - target[0], cc.c[1] - target[1]) < 0.4);
      if (found) { hits++; pts.push(found.r); }
    }
    if (hits === 5) {
      // dedupe by translation
      if (!views.some(v => Math.hypot(v.t[0] - t[0], v.t[1] - t[1]) < 1 && v.M.m === M.m && v.M.k === M.k))
        views.push({ M, t, bossRadii: pts });
    }
  }
}
console.log('Anchored views found:', views.length);
for (const v of views)
  console.log(`  mirror=${v.M.m} rot=${v.M.k * 90} t=(${fmt(v.t[0])},${fmt(v.t[1])}) bossR=[${v.bossRadii.map(fmt).join(',')}]`);

// inverse map: board = R^-1 * (paper - t); R orthogonal (det ±1) -> inv = transpose * det adjustments
function inv(v, p) {
  const q = [p[0] - v.t[0], p[1] - v.t[1]];
  const R = v.M.R; // orthogonal, so R^-1 = R^T when det=1; for det=-1 R^-1 = R^T too (orthogonal matrix!)
  return [R[0][0] * q[0] + R[1][0] * q[1], R[0][1] * q[0] + R[1][1] * q[1]];
}

for (const [vi, v] of views.entries()) {
  console.log(`\n=== VIEW ${vi} (mirror=${v.M.m} rot=${v.M.k * 90}) ===`);
  // large circles in this view mapped to board coords (fan rotor ~ r 15..30)
  console.log('Large circles (r>=8) in board coords:');
  for (const c of circ.filter(c => c.r >= 8)) {
    const b = inv(v, c.c);
    if (b[0] > -120 && b[0] < 120 && b[1] > -35 && b[1] < 95)
      console.log(`  r=${fmt(c.r)} board(${fmt(b[0])},${fmt(b[1])})`);
  }
  // fin zone density: geometry with board Y in [70,90], histogram over board X
  const bins = new Array(48).fill(0); // X -120..120, 5mm bins
  let finPts = 0;
  for (const g of geoms) {
    if (!g.pts) continue;
    for (let i = 0; i + 1 < g.pts.length; i++) {
      const a = g.pts[i], b2 = g.pts[i + 1];
      if (a[0] == null || b2[0] == null) continue;
      const L = Math.hypot(b2[0] - a[0], b2[1] - a[1]);
      const n = Math.max(1, Math.ceil(L));
      for (let s = 0; s <= n; s++) {
        const p = [a[0] + (b2[0] - a[0]) * s / n, a[1] + (b2[1] - a[1]) * s / n];
        const bd = inv(v, p);
        if (bd[1] >= 70 && bd[1] <= 90 && bd[0] >= -120 && bd[0] <= 120) {
          bins[Math.floor((bd[0] + 120) / 5)]++; finPts++;
        }
      }
    }
  }
  if (finPts > 100) {
    console.log('Fin-zone (board Y 70..90) geometry density over board X (5mm bins, -120..120):');
    const mx = Math.max(...bins);
    let bar = '';
    for (const b of bins) bar += ' .:-=+*#%@'[b === 0 ? 0 : Math.min(9, 1 + Math.floor(b / mx * 8.99))];
    console.log('  [' + bar + ']');
    console.log('   X: -120       -70       -20   0    +30       +80      +120');
    // contiguous dense region
    const th = mx * 0.25;
    let runs = [], run = null;
    bins.forEach((b, i) => {
      if (b > th) { if (!run) run = [i, i]; else run[1] = i; }
      else if (run) { runs.push(run); run = null; }
    });
    if (run) runs.push(run);
    for (const r of runs.filter(r => r[1] > r[0]))
      console.log(`  dense X run: ${fmt(-120 + r[0] * 5)} .. ${fmt(-120 + (r[1] + 1) * 5)}`);
  } else console.log('(no significant fin-zone geometry in this view: ' + finPts + ' pts)');
}

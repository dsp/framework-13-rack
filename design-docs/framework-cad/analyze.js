const { geoms } = require('./parse_dxf.js');

// 1. Dump MTEXT with insertion points
console.log('=== MTEXT / TEXT (ins x,y : text) ===');
const texts = geoms.filter(g => g.type === 'MTEXT' || g.type === 'TEXT');
for (const t of texts) {
  let s = (t.text || '').replace(/\\[A-Za-z][^;]*;/g, '').replace(/[{}]/g, '').replace(/\\P/g, ' | ');
  console.log(`(${fmt(t.ins[0])}, ${fmt(t.ins[1])})  "${s}"`);
}

function fmt(n) { return (n === undefined || n === null) ? '?' : Number(n).toFixed(2); }

// 2. Find rectangle-like LWPOLYLINEs (4 or 5 pts, axis-aligned), report w x h and centroid
console.log('\n=== Rectangular LWPOLYLINEs (closed, axis-aligned, w x h) ===');
const rects = [];
for (const g of geoms) {
  if (g.type !== 'LWPOLYLINE' || !g.pts || g.pts.length < 4) continue;
  let pts = g.pts.slice();
  // dedupe last==first
  if (pts.length >= 2) {
    const a = pts[0], b = pts[pts.length - 1];
    if (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6) pts = pts.slice(0, -1);
  }
  if (pts.length !== 4) continue;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  // check axis aligned: each edge horiz or vert
  let aligned = true;
  for (let i = 0; i < 4; i++) {
    const p = pts[i], q = pts[(i + 1) % 4];
    if (Math.abs(p[0] - q[0]) > 1e-3 && Math.abs(p[1] - q[1]) > 1e-3) { aligned = false; break; }
  }
  if (!aligned) continue;
  rects.push({ w, h, cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2, minx: Math.min(...xs), miny: Math.min(...ys), maxx: Math.max(...xs), maxy: Math.max(...ys) });
}
// sort by area desc
rects.sort((a, b) => b.w * b.h - a.w * a.h);
console.log('Total axis-aligned rects:', rects.length);
console.log('Largest 15 rects (w x h @ cx,cy):');
for (const r of rects.slice(0, 15)) {
  console.log(`  ${fmt(r.w)} x ${fmt(r.h)}  @ (${fmt(r.cx)}, ${fmt(r.cy)})  bbox[${fmt(r.minx)},${fmt(r.miny)} -> ${fmt(r.maxx)},${fmt(r.maxy)}]`);
}

// 3. Board outline candidates: dims close to 226.9 x 104.83 (either orientation)
console.log('\n=== Board-outline candidates (~226.9 x ~104.83, any rect-ish polyline incl >4 pts) ===');
for (const g of geoms) {
  if (g.type !== 'LWPOLYLINE' || !g.pts) continue;
  const xs = g.pts.map(p => p[0]), ys = g.pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  const match = (a, b, t) => Math.abs(a - b) < t;
  if ((match(w, 226.9, 3) && match(h, 104.83, 3)) || (match(h, 226.9, 3) && match(w, 104.83, 3))) {
    console.log(`  ${g.pts.length}pts  bbox ${fmt(w)} x ${fmt(h)}  @ (${fmt((Math.max(...xs)+Math.min(...xs))/2)}, ${fmt((Math.max(...ys)+Math.min(...ys))/2)})`);
  }
}

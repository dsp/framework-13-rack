const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const region = JSON.parse(process.argv[2]);
const minlen = parseFloat(process.argv[3]||'3');
const pad=2;
const inside=(x,y)=>x>=region.minx-pad&&x<=region.maxx+pad&&y>=region.miny-pad&&y<=region.maxy+pad;
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}
const lines=geoms.filter(g=>g.type==='LINE'&&g.pts[0][0]!=null&&inside(...g.pts[0])&&inside(...g.pts[1])&&len(g)>=minlen);
const H=lines.filter(l=>Math.abs(l.pts[0][1]-l.pts[1][1])<0.05);
const V=lines.filter(l=>Math.abs(l.pts[0][0]-l.pts[1][0])<0.05);
const O=lines.filter(l=>!H.includes(l)&&!V.includes(l));
console.log(`Region ${JSON.stringify(region)} minlen=${minlen}: H=${H.length} V=${V.length} O=${O.length}`);
console.log('\n-- Horizontal (sorted by y) --');
H.sort((a,b)=>a.pts[0][1]-b.pts[0][1]);
for(const l of H){const x0=Math.min(l.pts[0][0],l.pts[1][0]),x1=Math.max(l.pts[0][0],l.pts[1][0]);console.log(`  y=${fmt(l.pts[0][1])} x[${fmt(x0)}..${fmt(x1)}] len=${fmt(len(l))}`);}
console.log('\n-- Vertical (sorted by x) --');
V.sort((a,b)=>a.pts[0][0]-b.pts[0][0]);
for(const l of V){const y0=Math.min(l.pts[0][1],l.pts[1][1]),y1=Math.max(l.pts[0][1],l.pts[1][1]);console.log(`  x=${fmt(l.pts[0][0])} y[${fmt(y0)}..${fmt(y1)}] len=${fmt(len(l))}`);}
console.log('\n-- Oblique (sorted by len) --');
O.sort((a,b)=>len(b)-len(a));
for(const l of O)console.log(`  (${fmt(l.pts[0][0])},${fmt(l.pts[0][1])})->(${fmt(l.pts[1][0])},${fmt(l.pts[1][1])}) len=${fmt(len(l))}`);

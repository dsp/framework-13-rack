const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null);
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}
function isFrame(l){const fx=[0,20.42,26.42,564.92,571.42,594],fy=[0,20.31,28.31,397.31,405.31,420];const near=(v,arr)=>arr.some(a=>Math.abs(v-a)<0.5);return len(l)>200&&((near(l.pts[0][0],fx)&&near(l.pts[1][0],fx))||(near(l.pts[0][1],fy)&&near(l.pts[1][1],fy)));}
const minlen=parseFloat(process.argv[2]||'12');
const dl=lines.filter(l=>!isFrame(l)&&len(l)>=minlen);
const H=dl.filter(l=>Math.abs(l.pts[0][1]-l.pts[1][1])<0.05).sort((a,b)=>len(b)-len(a));
const V=dl.filter(l=>Math.abs(l.pts[0][0]-l.pts[1][0])<0.05).sort((a,b)=>len(b)-len(a));
const O=dl.filter(l=>Math.abs(l.pts[0][1]-l.pts[1][1])>=0.05&&Math.abs(l.pts[0][0]-l.pts[1][0])>=0.05).sort((a,b)=>len(b)-len(a));
console.log(`Structural lines len>=${minlen} (non-frame): H=${H.length} V=${V.length} O=${O.length}`);
console.log('\n-- Horizontal --');
for(const l of H){const x0=Math.min(l.pts[0][0],l.pts[1][0]),x1=Math.max(l.pts[0][0],l.pts[1][0]);console.log(`  len=${fmt(len(l))} y=${fmt(l.pts[0][1])} x[${fmt(x0)}..${fmt(x1)}]`);}
console.log('\n-- Vertical --');
for(const l of V){const y0=Math.min(l.pts[0][1],l.pts[1][1]),y1=Math.max(l.pts[0][1],l.pts[1][1]);console.log(`  len=${fmt(len(l))} x=${fmt(l.pts[0][0])} y[${fmt(y0)}..${fmt(y1)}]`);}
console.log('\n-- Oblique --');
for(const l of O)console.log(`  len=${fmt(len(l))} (${fmt(l.pts[0][0])},${fmt(l.pts[0][1])})->(${fmt(l.pts[1][0])},${fmt(l.pts[1][1])})`);

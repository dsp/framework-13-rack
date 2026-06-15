const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null);
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}
function isH(l){return Math.abs(l.pts[0][1]-l.pts[1][1])<0.05;}
function isV(l){return Math.abs(l.pts[0][0]-l.pts[1][0])<0.05;}

// candidate scales: board long=226.9, cross=104.83
const scales={'1:2':2,'1:2.5':2.5,'1:3':3,'1:4':4,'1:1.5':1.5};
for(const[name,s]of Object.entries(scales)){
  const L=226.9/s, W=104.83/s;
  const hMatch=lines.filter(l=>isH(l)&&Math.abs(len(l)-L)<1.5);
  const vMatchL=lines.filter(l=>isV(l)&&Math.abs(len(l)-L)<1.5);
  const hMatchW=lines.filter(l=>isH(l)&&Math.abs(len(l)-W)<1.5);
  const vMatchW=lines.filter(l=>isV(l)&&Math.abs(len(l)-W)<1.5);
  console.log(`scale ${name}: long edge ${fmt(L)} -> H:${hMatch.length} V:${vMatchL.length} | cross ${fmt(W)} -> H:${hMatchW.length} V:${vMatchW.length}`);
}

// Look broadly: lines whose length matches board long edge for ANY scale 1.5-4
console.log('\n=== Horizontal lines len 50-120 (potential board long edges) ===');
const hl=lines.filter(l=>isH(l)&&len(l)>=50&&len(l)<=120).sort((a,b)=>len(b)-len(a));
for(const l of hl)console.log(`  H len ${fmt(len(l))} y=${fmt(l.pts[0][1])} x:[${fmt(Math.min(l.pts[0][0],l.pts[1][0]))}..${fmt(Math.max(l.pts[0][0],l.pts[1][0]))}]`);
console.log('\n=== Vertical lines len 50-120 ===');
const vl=lines.filter(l=>isV(l)&&len(l)>=50&&len(l)<=120).sort((a,b)=>len(b)-len(a));
for(const l of vl)console.log(`  V len ${fmt(len(l))} x=${fmt(l.pts[0][0])} y:[${fmt(Math.min(l.pts[0][1],l.pts[1][1]))}..${fmt(Math.max(l.pts[0][1],l.pts[1][1]))}]`);

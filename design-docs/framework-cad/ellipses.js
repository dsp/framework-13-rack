const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const ell = geoms.filter(g=>g.type==='ELLIPSE');
console.log('All ELLIPSES (center, major-axis-vec, ratio) -> semi-major,semi-minor:');
for(const e of ell){
  const a=Math.hypot(e.maj[0],e.maj[1]);
  const b=a*e.ratio;
  const ang=Math.atan2(e.maj[1],e.maj[0])*180/Math.PI;
  console.log(`  c(${fmt(e.c[0])},${fmt(e.c[1])}) a=${fmt(a)} b=${fmt(b)} ang=${fmt(ang)}`);
}
// arcs grouped by radius
const arc=geoms.filter(g=>g.type==='ARC');
const byR={};
for(const a of arc){const k=a.r.toFixed(2);(byR[k]=byR[k]||[]).push(a);}
console.log('\nARC radius histogram:');
for(const k of Object.keys(byR).sort((x,y)=>x-y))console.log(`  r=${k}: ${byR[k].length}`);

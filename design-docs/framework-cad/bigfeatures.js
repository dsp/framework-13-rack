const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const arc=geoms.filter(g=>g.type==='ARC');
console.log('Big arcs (r>=2):');
for(const a of arc.filter(a=>a.r>=2).sort((x,y)=>y.r-x.r)){
  console.log(`  r=${fmt(a.r)} c(${fmt(a.c[0])},${fmt(a.c[1])}) ang ${fmt(a.a1)}..${fmt(a.a2)}`);
}
const cir=geoms.filter(g=>g.type==='CIRCLE'&&g.r>=1);
console.log('\nBig circles (r>=1):');
for(const c of cir.sort((x,y)=>y.r-x.r))console.log(`  r=${fmt(c.r)} c(${fmt(c.c[0])},${fmt(c.c[1])})`);

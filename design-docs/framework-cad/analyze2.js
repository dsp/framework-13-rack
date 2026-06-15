const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);

// Collect all LINE segments
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null && g.pts[1][0]!=null);

// The sheet has a drawing frame. Find lines that are long horizontal or vertical (board edges ~226.9 / 104.83)
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}
function isH(l){return Math.abs(l.pts[0][1]-l.pts[1][1])<1e-3;}
function isV(l){return Math.abs(l.pts[0][0]-l.pts[1][0])<1e-3;}

console.log('=== Long horizontal lines (len 100-230) ===');
const longH = lines.filter(l=>isH(l) && len(l)>=100 && len(l)<=235);
const lenGroupsH={};
for(const l of longH){const k=len(l).toFixed(2);(lenGroupsH[k]=lenGroupsH[k]||[]).push(l);}
for(const k of Object.keys(lenGroupsH).sort((a,b)=>b-a)){
  const arr=lenGroupsH[k];
  console.log(`  len ${k}  count=${arr.length}  ys:[${[...new Set(arr.map(l=>l.pts[0][1].toFixed(1)))].join(',')}]`);
}

console.log('\n=== Long vertical lines (len 100-230) ===');
const longV = lines.filter(l=>isV(l) && len(l)>=100 && len(l)<=235);
const lenGroupsV={};
for(const l of longV){const k=len(l).toFixed(2);(lenGroupsV[k]=lenGroupsV[k]||[]).push(l);}
for(const k of Object.keys(lenGroupsV).sort((a,b)=>b-a)){
  const arr=lenGroupsV[k];
  console.log(`  len ${k}  count=${arr.length}  xs:[${[...new Set(arr.map(l=>l.pts[0][0].toFixed(1)))].join(',')}]`);
}

// Look for lines near 226.9 and 104.83 specifically with tolerance
console.log('\n=== Lines len ~226.9 (±2) ===');
for(const l of lines){const L=len(l); if(Math.abs(L-226.9)<2){
  console.log(`  len ${fmt(L)} ${isH(l)?'H':isV(l)?'V':'?'} (${fmt(l.pts[0][0])},${fmt(l.pts[0][1])})->(${fmt(l.pts[1][0])},${fmt(l.pts[1][1])})`);
}}
console.log('\n=== Lines len ~104.83 (±2) ===');
for(const l of lines){const L=len(l); if(Math.abs(L-104.83)<2){
  console.log(`  len ${fmt(L)} ${isH(l)?'H':isV(l)?'V':'?'} (${fmt(l.pts[0][0])},${fmt(l.pts[0][1])})->(${fmt(l.pts[1][0])},${fmt(l.pts[1][1])})`);
}}

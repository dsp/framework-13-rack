const { geoms, entities } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null && g.pts[1][0]!=null);
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}

// overall extent
let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
for(const l of lines){for(const p of l.pts){minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1]);}}
console.log('LINE extent:',fmt(minx),fmt(miny),'->',fmt(maxx),fmt(maxy));

// longest 25 lines
const sorted=[...lines].sort((a,b)=>len(b)-len(a));
console.log('\nLongest 25 lines:');
for(const l of sorted.slice(0,25)){
  const dx=Math.abs(l.pts[0][0]-l.pts[1][0]),dy=Math.abs(l.pts[0][1]-l.pts[1][1]);
  const dir=dx<1e-3?'V':dy<1e-3?'H':'/';
  console.log(`  ${fmt(len(l))} ${dir} (${fmt(l.pts[0][0])},${fmt(l.pts[0][1])})->(${fmt(l.pts[1][0])},${fmt(l.pts[1][1])})`);
}

// histogram of line lengths
const buckets={};
for(const l of lines){const b=Math.floor(len(l)/10)*10;buckets[b]=(buckets[b]||0)+1;}
console.log('\nLength histogram (bucket of 10):');
for(const k of Object.keys(buckets).sort((a,b)=>a-b))console.log(`  ${k}-${+k+10}: ${buckets[k]}`);

// INSERT entities - check block names & insertion points & scale
console.log('\n=== INSERT entities ===');
for(const e of entities){
  if(e.type!=='INSERT'){continue;}
  const get=(c)=>{for(const[cc,v]of e.codes)if(cc===c)return v;};
  console.log(`  block="${get(2)}" at (${fmt(get(10))},${fmt(get(20))}) scale=(${get(41)||1},${get(42)||1})`);
}

const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const circ = geoms.filter(g=>g.type==='CIRCLE');
console.log('All CIRCLES (c,r) sorted by r:');
const cs=[...circ].sort((a,b)=>a.r-b.r);
for(const c of cs)console.log(`  r=${fmt(c.r)} @ (${fmt(c.c[0])},${fmt(c.c[1])})`);

// Known boss coords (model, board frame). Pattern of relative distances is scale-invariant up to factor.
const bosses=[[28.50,-24.70],[-111.15,3.05],[111.00,4.15],[-111.15,67.05],[110.50,71.85]];
// Board long X range: -111.15..111.0 = 222.15; Y -24.7..71.85 = 96.55.
// Note PCB outline given separately: X 226.9, Y -27..77.83.
// Try to find 5 circles forming this pattern at some scale s and offset, possibly rotated 90.
// brute force: for each scale candidate, for each pair mapping
console.log('\nLooking for 5-circle clusters matching boss pattern...');
// compute pairwise distances of model bosses
function pdist(pts){const d=[];for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)d.push(Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]));return d.sort((a,b)=>a-b);}
const modelD=pdist(bosses);
console.log('model boss pairwise dists:',modelD.map(d=>d.toFixed(1)).join(','));
// the max model dist:
const maxModel=Math.max(...modelD);
console.log('max model dist:',fmt(maxModel),'(~diagonal)');
// At 1:3 max diag = '+fmt(maxModel/3)
console.log('expected max diag at 1:3 =',fmt(maxModel/3),' at 1:2.5 =',fmt(maxModel/2.5));

const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null);
const arcs = geoms.filter(g=>g.type==='ARC');
const circ = geoms.filter(g=>g.type==='CIRCLE');
const ell = geoms.filter(g=>g.type==='ELLIPSE');
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}

// Exclude frame border lines (the 594x420 outer + title-block big rect). Frame y in {0,20.31,28.31,397.31,405.31,420} and x in {0,20.42,26.42,564.92,571.42,594}.
function isFrame(l){
  const fx=[0,20.42,26.42,564.92,571.42,594];
  const fy=[0,20.31,28.31,397.31,405.31,420];
  const near=(v,arr)=>arr.some(a=>Math.abs(v-a)<0.5);
  // a frame line lies entirely on a frame x or frame y
  const onx=near(l.pts[0][0],fx)&&near(l.pts[1][0],fx);
  const ony=near(l.pts[0][1],fy)&&near(l.pts[1][1],fy);
  return len(l)>200&&(onx||ony);
}
const drawLines=lines.filter(l=>!isFrame(l));

// Collect all geometry points (excluding frame)
const pts=[];
for(const l of drawLines){pts.push(l.pts[0],l.pts[1]);}
for(const a of arcs)pts.push(a.c);
for(const c of circ)pts.push(c.c);
for(const e of ell)pts.push(e.c);

// Finer clustering: cell 4mm, threshold>=3, then merge components and grow bbox by including all geometry within
const cell=6;
const cells={};
for(const p of pts){if(p[0]==null)continue;const k=Math.floor(p[0]/cell)+','+Math.floor(p[1]/cell);cells[k]=(cells[k]||0)+1;}
const dense=new Set(Object.keys(cells).filter(k=>cells[k]>=3));
const visited=new Set();const comps=[];
for(const k of dense){if(visited.has(k))continue;const st=[k],comp=[];visited.add(k);
  while(st.length){const c=st.pop();comp.push(c);const[x,y]=c.split(',').map(Number);
    for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const n=(x+dx)+','+(y+dy);if(dense.has(n)&&!visited.has(n)){visited.add(n);st.push(n);}}}
  comps.push(comp);}
const views=comps.map(comp=>{let a=1e9,b=1e9,c=-1e9,d=-1e9,n=0;for(const cc of comp){const[x,y]=cc.split(',').map(Number);a=Math.min(a,x*cell);c=Math.max(c,(x+1)*cell);b=Math.min(b,y*cell);d=Math.max(d,(y+1)*cell);n+=cells[cc];}return{minx:a,miny:b,maxx:c,maxy:d,w:c-a,h:d-b,pts:n};}).filter(v=>v.pts>50);
views.sort((a,b)=>b.w*b.h-a.w*a.h);
console.log('=== Merged view regions (cell '+cell+', gap-tolerant) ===');
views.forEach((v,i)=>console.log(`#${i} bbox(${fmt(v.minx)},${fmt(v.miny)})->(${fmt(v.maxx)},${fmt(v.maxy)}) size ${fmt(v.w)}x${fmt(v.h)} pts=${v.pts}`));

// For each big view, report actual tight geometry bbox using real geometry within region
console.log('\n=== Tight bbox of geometry inside each big view region ===');
function tight(region){
  let a=1e9,b=1e9,c=-1e9,d=-1e9;
  const inside=(x,y)=>x>=region.minx-2&&x<=region.maxx+2&&y>=region.miny-2&&y<=region.maxy+2;
  for(const l of drawLines)for(const p of l.pts)if(inside(p[0],p[1])){a=Math.min(a,p[0]);c=Math.max(c,p[0]);b=Math.min(b,p[1]);d=Math.max(d,p[1]);}
  for(const e of ell)if(inside(e.c[0],e.c[1])){a=Math.min(a,e.c[0]);c=Math.max(c,e.c[0]);b=Math.min(b,e.c[1]);d=Math.max(d,e.c[1]);}
  return{a,b,c,d,w:c-a,h:d-b};
}
views.slice(0,6).forEach((v,i)=>{const t=tight(v);console.log(`#${i} tight ${fmt(t.w)} x ${fmt(t.h)}  [${fmt(t.a)},${fmt(t.b)} -> ${fmt(t.c)},${fmt(t.d)}]  @1:3model ${fmt(t.w*3)}x${fmt(t.h*3)}`);});

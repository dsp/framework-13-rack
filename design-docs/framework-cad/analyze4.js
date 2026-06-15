const { geoms } = require('./parse_dxf.js');
const fmt = n => (n==null)?'?':Number(n).toFixed(2);
// All segments from LINE, ARC(approx by bbox center), CIRCLE, ELLIPSE, LWPOLYLINE
const segs=[];
for(const g of geoms){
  if(g.type==='LINE')segs.push(g.pts[0],g.pts[1]);
  else if(g.type==='CIRCLE')segs.push([g.c[0]-g.r,g.c[1]],[g.c[0]+g.r,g.c[1]],[g.c[0],g.c[1]-g.r],[g.c[0],g.c[1]+g.r]);
  else if(g.type==='ARC')segs.push(g.c);
  else if(g.type==='ELLIPSE')segs.push(g.c);
  else if(g.type==='LWPOLYLINE'&&g.pts)for(const p of g.pts)segs.push(p);
}
// exclude frame (the giant border lines). Keep points within drawing area but cluster.
// Use grid-based clustering on points to find dense view regions.
// Simple: 2D histogram with 10mm cells, find connected components of dense cells.
const cell=8;
const cells={};
for(const p of segs){
  if(p[0]==null||p[1]==null)continue;
  // skip exact frame border coordinates
  const cx=Math.floor(p[0]/cell),cy=Math.floor(p[1]/cell);
  const k=cx+','+cy;cells[k]=(cells[k]||0)+1;
}
// dense threshold
const dense=new Set(Object.keys(cells).filter(k=>cells[k]>=5));
// connected components (8-neighbor)
const visited=new Set();const comps=[];
for(const k of dense){
  if(visited.has(k))continue;
  const stack=[k];const comp=[];visited.add(k);
  while(stack.length){
    const c=stack.pop();comp.push(c);
    const[x,y]=c.split(',').map(Number);
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
      const n=(x+dx)+','+(y+dy);
      if(dense.has(n)&&!visited.has(n)){visited.add(n);stack.push(n);}
    }
  }
  comps.push(comp);
}
// for each comp compute bbox in model coords from member cells
const views=[];
for(const comp of comps){
  let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9,n=0;
  for(const c of comp){const[x,y]=c.split(',').map(Number);
    minx=Math.min(minx,x*cell);maxx=Math.max(maxx,(x+1)*cell);
    miny=Math.min(miny,y*cell);maxy=Math.max(maxy,(y+1)*cell);
    n+=cells[c];
  }
  views.push({minx,miny,maxx,maxy,w:maxx-minx,h:maxy-miny,pts:n,cells:comp.length});
}
views.sort((a,b)=>b.pts-a.pts);
console.log('=== View clusters (dense regions, cell='+cell+'mm, >=5 pts/cell) ===');
let i=0;
for(const v of views){
  if(v.cells<4)continue;
  console.log(`#${i++} bbox(${fmt(v.minx)},${fmt(v.miny)})->(${fmt(v.maxx)},${fmt(v.maxy)}) size ${fmt(v.w)}x${fmt(v.h)} pts=${v.pts} cells=${v.cells}`);
}

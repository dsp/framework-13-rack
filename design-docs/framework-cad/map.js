const { geoms } = require('./parse_dxf.js');
const lines = geoms.filter(g => g.type === 'LINE' && g.pts[0][0]!=null);
function len(l){const[a,b]=l.pts;return Math.hypot(b[0]-a[0],b[1]-a[1]);}
function isFrame(l){const fx=[0,20.42,26.42,564.92,571.42,594],fy=[0,20.31,28.31,397.31,405.31,420];const near=(v,arr)=>arr.some(a=>Math.abs(v-a)<0.5);return len(l)>200&&((near(l.pts[0][0],fx)&&near(l.pts[1][0],fx))||(near(l.pts[0][1],fy)&&near(l.pts[1][1],fy)));}
const dl=lines.filter(l=>!isFrame(l));
// density map over drawing area 26..565 x 28..397, cols 90 rows 45
const X0=26,X1=565,Y0=28,Y1=397,COLS=90,ROWS=45;
const grid=Array.from({length:ROWS},()=>new Array(COLS).fill(0));
for(const l of dl){
  // sample along line
  const n=Math.max(2,Math.ceil(len(l)));
  for(let i=0;i<=n;i++){const t=i/n;const x=l.pts[0][0]+(l.pts[1][0]-l.pts[0][0])*t,y=l.pts[0][1]+(l.pts[1][1]-l.pts[0][1])*t;
    const c=Math.floor((x-X0)/(X1-X0)*COLS),r=Math.floor((y-Y0)/(Y1-Y0)*ROWS);
    if(c>=0&&c<COLS&&r>=0&&r<ROWS)grid[r][c]++;}
}
const ch=' .:-=+*#%@';
console.log('Density map (x '+X0+'..'+X1+', y '+Y0+'..'+Y1+'), top=low y');
// print top of sheet = high y first? DXF y up. print high y at top.
for(let r=ROWS-1;r>=0;r--){
  let s='';
  for(let c=0;c<COLS;c++){const v=grid[r][c];const idx=v===0?0:Math.min(9,1+Math.floor(Math.log2(v+1)));s+=ch[idx];}
  const ymid=(Y0+(r+0.5)/ROWS*(Y1-Y0)).toFixed(0);
  console.log(ymid.padStart(4)+' '+s);
}
let xs='     ';for(let c=0;c<COLS;c+=10)xs+=String(Math.round(X0+(c+0.5)/COLS*(X1-X0))).padEnd(10);console.log(xs);

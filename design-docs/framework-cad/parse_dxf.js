// Parse fw_main_pcb_generic_2_w_fan_1.dxf
// Group-code/value pairs. Extract entities in ENTITIES section.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'fw_main_pcb_generic_2_w_fan_1.dxf');
const raw = fs.readFileSync(file, 'utf8');
// DXF lines: alternating code, value
const lines = raw.split(/\r\n|\r|\n/);
const pairs = [];
for (let i = 0; i + 1 < lines.length; i += 2) {
  const code = parseInt(lines[i].trim(), 10);
  const val = lines[i + 1];
  pairs.push([code, val]);
}

// Find ENTITIES section
let start = -1, end = pairs.length;
for (let i = 0; i < pairs.length; i++) {
  if (pairs[i][0] === 0 && pairs[i][1] === 'SECTION') {
    // next pair code 2 = section name
    if (pairs[i + 1] && pairs[i + 1][0] === 2 && pairs[i + 1][1] === 'ENTITIES') {
      start = i + 2;
    }
  }
  if (start >= 0 && i > start && pairs[i][0] === 0 && pairs[i][1] === 'ENDSEC') {
    end = i;
    break;
  }
}
if (start < 0) { console.error('No ENTITIES section'); process.exit(1); }

// Parse entities. Each entity starts with code 0 = TYPE
const entities = [];
let cur = null;
function pushVal(ent, code, val) {
  // store multi-value: vertices for LWPOLYLINE come as repeated 10/20
  ent.codes.push([code, val]);
}
for (let i = start; i < end; i++) {
  const [code, val] = pairs[i];
  if (code === 0) {
    if (cur) entities.push(cur);
    cur = { type: val, codes: [] };
  } else if (cur) {
    cur.codes.push([code, parseValMaybe(code, val)]);
  }
}
if (cur) entities.push(cur);

function parseValMaybe(code, val) {
  // numeric codes
  if ((code >= 10 && code <= 59) || (code >= 140 && code <= 147) || code === 90 || code === 70 || code === 42 || code === 38 || code === 39) {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  }
  return val;
}

function get(ent, code) {
  for (const [c, v] of ent.codes) if (c === code) return v;
  return undefined;
}
function getAll(ent, code) {
  const out = [];
  for (const [c, v] of ent.codes) if (c === code) out.push(v);
  return out;
}

// Build geometry: for each entity, compute its bounding info and store key points
const geoms = [];
for (const ent of entities) {
  const t = ent.type;
  if (t === 'LINE') {
    const x1 = get(ent, 10), y1 = get(ent, 20), x2 = get(ent, 11), y2 = get(ent, 21);
    geoms.push({ type: 'LINE', pts: [[x1, y1], [x2, y2]] });
  } else if (t === 'LWPOLYLINE') {
    // vertices: pairs of 10/20 in order
    const xs = [], ys = [];
    for (const [c, v] of ent.codes) {
      if (c === 10) xs.push(v);
      else if (c === 20) ys.push(v);
    }
    const pts = [];
    for (let k = 0; k < xs.length; k++) pts.push([xs[k], ys[k]]);
    const closed = (get(ent, 70) & 1) === 1;
    geoms.push({ type: 'LWPOLYLINE', pts, closed });
  } else if (t === 'CIRCLE') {
    geoms.push({ type: 'CIRCLE', c: [get(ent, 10), get(ent, 20)], r: get(ent, 40) });
  } else if (t === 'ARC') {
    geoms.push({ type: 'ARC', c: [get(ent, 10), get(ent, 20)], r: get(ent, 40), a1: get(ent, 50), a2: get(ent, 51) });
  } else if (t === 'ELLIPSE') {
    geoms.push({ type: 'ELLIPSE', c: [get(ent, 10), get(ent, 20)], maj: [get(ent, 11), get(ent, 21)], ratio: get(ent, 40) });
  } else if (t === 'MTEXT' || t === 'TEXT') {
    geoms.push({ type: t, ins: [get(ent, 10), get(ent, 20)], text: get(ent, 1) || get(ent, 3) || '' });
  } else if (t === 'POLYLINE') {
    geoms.push({ type: 'POLYLINE' });
  } else if (t === 'SPLINE') {
    // control/fit points code 10/20
    const xs = [], ys = [];
    for (const [c, v] of ent.codes) { if (c === 10) xs.push(v); else if (c === 20) ys.push(v); }
    const pts = xs.map((x, k) => [x, ys[k]]);
    geoms.push({ type: 'SPLINE', pts });
  }
}

// Counts
const counts = {};
for (const e of entities) counts[e.type] = (counts[e.type] || 0) + 1;
console.log('ENTITY COUNTS:', JSON.stringify(counts));
console.log('Total geoms with points:', geoms.length);

module.exports = { geoms, entities, get, getAll };

# Framework 13 Mainboard — 3-Bay 1U Rack

A 19" EIA-310 1U rack that holds three Framework Laptop 13 mainboards. Every part prints
without supports on a Bambu Lab H2D (325 × 320 × 325 mm). The geometry comes from
Framework's published CAD, corrected against a physical board and real prints.

## Repository layout

- `stl/` — print-ready STLs, exported 2026-07-06 from the current script
- `scripts/rebuild_all.py` — the source of truth. It rebuilds every part in a fresh Fusion 360
  document (direct modeling). Edit dimensions here and re-run; set `EXPORT_STL = True` to export.
- `design-docs/SPEC-RevB.md` — the reviewed design spec. Read the errata blocks at the top
  first; they supersede the body. Where spec and script disagree, the script wins.
- `design-docs/final-spec-revB.json` — raw research output behind the spec
- `design-docs/framework-cad/` — Framework's reference CAD (tray STL, board drawing PDF/DXF,
  case STEP) and the Node scripts that measured it
- `SCREWS.txt` — hardware shopping list and fastener notes
- `framework.jpg` — calibrated top-view photo of the physical board, used to locate the
  fin stack (thermal errata 2)

## Parts (8 prints plus pegs, 5 unique)

| Part | Qty | Print orientation | Supports |
|---|---|---|---|
| BayModule — rack tray | 3 | standing on front face (Z = 248) | none; 8–10 mm brim |
| CarrierTray — board sled | 3 | flat, plate on bed (Z = 34.5) | none |
| SideHolderLeft — rear-exhaust duct + rack ear | 1 | standing on front face | none |
| SideHolderRight — intake plenum + rack ear | 1 | standing on front face | none |
| RetainerPeg — board hold-down | 9 + spares | head down on bed | none |

PETG or PETG-CF, 4 walls, 30–40% infill, 0.2 mm layers.

## Assembly

Full sequence: SPEC-RevB.md §7. Fasteners: SCREWS.txt.

1. Set "Power on AC attach" in each board's BIOS before racking — the power switch is
   unreachable once the board is mid-rack.
2. Press the heat-set inserts: five M3 per bay (four seam, one header), four M3 in the
   left holder.
3. Bolt the bays together left to right with M3×8 screws and Ø3×8 dowel pins. Drive seam
   screws from inside the right-hand module of each pair. The left holder screws on from
   inside bay 1, the right holder from outside through its counterbores.
4. Mount each board RAM/cooler-side up on its carrier: drop it into the cage onto the five
   standoffs, then press RetainerPegs through two or three mounting holes. Two expansion
   cards face front, two face rear; USB-C power enters at the rear.
5. Slide each carrier in until the left-edge latch clicks, then lock it with its M3×8
   thumbscrew.
6. Rack with six M6 screws and cage nuts. Back the printed ears with 1.5 mm metal plates;
   tighten only until snug. Support the rear of any rack that travels.

## How the board mounts

The carrier locates the board with a printed cage: two side nubs on the card-free long
edges (0.2 mm clearance per side) and front/rear stops between the card bays (0.5 mm).
RetainerPegs hold it down — a Ø4.2 head over the screw keep-out, a tapered Ø1.85→1.55
shaft press-fit into the Ø1.7 standoff pilot. The cage bears only on the board's edges,
never its face, and peg heads land where Framework's own screw heads sit. Pegs are
consumable: print spares; pry under the head to remove. The same pilots accept M2×6
self-tapping screws (see SCREWS.txt).

The board sits component-side up at h16.5, its laptop orientation, with expansion cards
hanging below. Standard cards (5.4 mm below the PCB) clear the carrier floor by 3.1 mm;
Framework's Ethernet card (~7.4 mm) clears by about 1.1 — check yours first. Each carrier
lip has two 14 × 8 stadium openings on the USB-C axes (centers c 32.95 / 73.75, height
h19.6 ≈ 2 mm above the PCB top); expansion-card ports share the same axes. The receptacle
face sits ~8.5 mm behind the lip and the card face ~6 mm, so use cables with slim
overmolds (≤ ~13 × 7 mm) or fit expansion cards.

## Revision history

Every fix below came from real hardware. The spec body lags them; its errata blocks and
`rebuild_all.py` are current.

- **Rev C (2026-06-12).** The mirrored standoff pattern forced the board component-side
  down. Rev C restored the true map, c = 82.82 − board_y (laptop orientation), raised the
  seat to h16.5, and verified the board and card-bay positions against Framework's
  `printable_case_full.stp` and 2D drawing.
- **Rev D (2026-06-14) — abandoned.** Widened the bay (W_int 114→118, pitch 128→132) to
  clear the cooler. That changed the outer envelope, so nothing fit the bays already
  printed. Reverted in full.
- **Recenter (2026-06-15).** Fixed both Rev D flaws inside unchanged outer dimensions.
  Because the cooler overhangs the fan-side edge by 7 mm (measured), every board-locating
  feature shifted +6.84 mm in carrier-c, centering the 111.83 mm envelope in the 114 mm
  interior (~1.1 mm per side). USB-C apertures raised to h19.6. Vent print-tops chamfered
  to self-supporting 12 mm lintels.
- **Thermal errata (2026-07-05).** The spec's airflow was mirrored: the fin jets blow
  LEFT. Holder roles swapped — left is now the rear-exhaust duct, right the intake plenum
  (3 front + 2 outboard slots, 390 mm²). The right holder's front screws pass through Ø6
  channels crossing the plenum. Preheat now cascades 3→2→1; watch bay 1 temperatures on
  first bring-up.
- **Vent relocation (2026-07-06).** The fin stack sits in the front half of the bay
  (y ≈ 28–101 from the faceplate, measured from `framework.jpg`), not mid-board. All wall
  vents and holder cutouts moved to y 31–105 (h 13–31); the left duct now starts at y 14.
  **Bays printed before this date vent the wrong spot — reprint them before loaded
  operation.**

## Verify before committing plastic

- Print the 20-minute fit coupon first: groove and tongue at 0.15/0.20/0.25/0.30 mm
  clearance, the latch beam section, one standoff with a RetainerPeg, one insert pocket.
- Check that your PCB mounting holes pass a Ø2.0 shank; pegs and M2 screws assume it.
- Confirm the Ethernet card's below-board height (~7.4 mm assumed) and the board outline
  at the cage contacts (nubs at y 118.5–121.5 on the long edges, stops at c 44.4–48.7).
- Elephant-foot chamfers, floor perforation, and +0.2 mm vertical oversize on
  horizontal-axis holes are left to the slicer; drill or ream the Ø3 dowel sockets if the
  pins won't enter.

# Framework 13 Mainboard — 3-Bay 1U Rack

A 19" EIA-310 1U rack that holds three Framework Laptop 13 mainboards. All parts print
without supports on a Bambu Lab H2D (325 × 320 × 325 mm). Dimensions come from
Framework's published CAD and from measurements of a physical board.

## Contents

- `stl/` — print-ready STLs, exported 2026-07-06
- `scripts/rebuild_all.py` — parametric source for all parts. It rebuilds the model in a
  fresh Fusion 360 document; set `EXPORT_STL = True` to export. Where the spec and the
  script disagree, the script is authoritative.
- `design-docs/SPEC-RevB.md` — design spec with all dimensions, stack-ups, and rationale.
  The errata blocks at the top supersede the body and record the design's revision history.
- `design-docs/framework-cad/` — Framework's reference CAD (tray STL, board drawing
  PDF/DXF, case STEP) and the scripts used to measure it
- `SCREWS.txt` — hardware list and fastener notes
- `framework.jpg` — top-view photo of the mainboard, used to locate the cooler fin stack

## Parts

| Part | Qty | Print orientation | Supports |
|---|---|---|---|
| BayModule — rack tray | 3 | standing on front face (Z = 248) | none; 8–10 mm brim |
| CarrierTray — board sled | 3 | flat, plate on bed (Z = 34.5) | none |
| SideHolderLeft — exhaust duct + rack ear | 1 | standing on front face | none |
| SideHolderRight — intake plenum + rack ear | 1 | standing on front face | none |
| RetainerPeg — board hold-down | 9 + spares | head down on bed | none |

Print in PETG or PETG-CF with 4 walls and 30–40% infill. A standard PETG profile at
0.4 mm layers works; the spec assumed 0.2 mm but the parts don't need it.

Bays printed from STLs older than 2026-07-06 have their wall vents behind the cooler
instead of over it; reprint them before running boards under load.

## Assembly

The full sequence is in SPEC-RevB.md §7; hardware is listed in SCREWS.txt.

1. Set "Power on AC attach" in each board's BIOS before racking. The power switch is
   unreachable once the board is in the rack.
2. Press the heat-set inserts: five M3 per bay (four seam, one header), four M3 in the
   left holder.
3. Bolt the bays together left to right with M3×8 screws and Ø3×8 dowel pins. Drive seam
   screws from inside the right-hand module of each pair. The left holder attaches from
   inside bay 1, the right holder from outside through its counterbores.
4. Mount each board RAM/cooler-side up on its carrier: drop it into the cage onto the
   five standoffs, then press RetainerPegs through two or three mounting holes. Two
   expansion cards face front, two face rear; USB-C power enters at the rear.
5. Slide each carrier in until the left-edge latch clicks, then lock it with its M3×8
   thumbscrew.
6. Rack with six M6 screws and cage nuts. Back the printed ears with 1.5 mm metal plates;
   tighten only until snug. Support the rear of any rack that travels.

## Board mounting

The carrier locates the board with two side nubs on the card-free long edges (0.2 mm
clearance per side) and front/rear stops between the card bays (0.5 mm). RetainerPegs
hold it down: a Ø4.2 head over the screw keep-out and a tapered Ø1.85→1.55 shaft that
press-fits into the Ø1.7 standoff pilot. The nubs and stops bear only on the board's
edges, and peg heads land where Framework's own screw heads sit. Print spare pegs; pry
under the head to remove one. The same pilots accept M2×6 self-tapping screws
(see SCREWS.txt).

The board sits component-side up at h16.5, its laptop orientation, with expansion cards
hanging below. Standard cards (5.4 mm below the PCB) clear the carrier floor by 3.1 mm;
Framework's Ethernet card (~7.4 mm) clears by about 1.1 mm. Each carrier lip has two
14 × 8 mm stadium openings on the USB-C axes (centers c 32.95 / 73.75, height h19.6,
about 2 mm above the PCB top); expansion-card ports share the same axes. The receptacle
face sits about 8.5 mm behind the lip and the card face about 6 mm, so use cables with
slim overmolds (up to about 13 × 7 mm) or fit expansion cards.

## Cooling

Air enters through the right holder's grille and each bay's front slots. The mainboard
blower exhausts through the fin stack toward the bay's left wall, out the wall vents
(y 31–105, h 13–31), and through the left holder's rear duct. Keep those vents clear.
Bay 1 sits downstream of bays 2 and 3, so watch its temperatures on first bring-up.

## Before printing

- Print the fit coupon first (about 20 minutes): groove and tongue at 0.15/0.20/0.25/0.30 mm
  clearance, the latch beam section, one standoff with a RetainerPeg, and one insert pocket.
- Verify that the PCB mounting holes pass a Ø2.0 shank; pegs and M2 screws assume it.
- Verify the Ethernet card's below-board height (7.4 mm assumed) and the board outline at
  the cage contacts (nubs at y 118.5–121.5 on the long edges, stops at c 44.4–48.7).
- Elephant-foot chamfers, floor perforation, and +0.2 mm vertical oversize on
  horizontal-axis holes are left to the slicer. Drill or ream the Ø3 dowel sockets if the
  pins won't enter.

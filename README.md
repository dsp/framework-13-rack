# Framework 13 Mainboard — 3-Bay 1U Rack

A 19" EIA-310 1U rack holding three Framework Laptop 13 mainboards, every part printable
on a Bambu Lab H2D (325 x 320 x 325). Designed 2026-06-11/12 from Framework's own tray STL
(standoff positions measured from the import) + a multi-agent research/review workflow.

## Folders
- `stl/` — print-ready STLs of the 4 unique parts (exported from Fusion, part-local orientation)
- `scripts/rebuild_all.py` — the parametric source: rebuilds the whole model in a fresh Fusion
  document (Direct Modeling). Edit dimensions there and re-run.
- `design-docs/SPEC-RevB.md` — full reviewed design spec (all dimensions, stack-ups, rationale)
- `design-docs/final-spec-revB.json` — raw workflow output
- `design-docs/workflow-transcripts/` — research/review agent transcripts

## Parts (8 prints, 4 unique)
| Part | Qty | Print orientation | Supports |
|---|---|---|---|
| BayModule (rack-tray) | 3 | standing on FRONT face (Z = 248) | none; 8-10mm brim |
| CarrierTray | 3 | flat, plate on bed (Z = 34.5) | none |
| SideHolderLeft (intake plenum + ear) | 1 | standing on FRONT face | none |
| SideHolderRight (rear-exhaust duct + ear) | 1 | standing on FRONT face | none |
| RetainerPeg (board hold-down) | 9+ (3/board + spares) | head-down on bed | none |

PETG or PETG-CF, 4 walls, 30-40% infill, 0.2 layers.

## Assembly (short version — full sequence in SPEC-RevB.md §7)
1. Set BIOS "Power on AC attach" / standalone mode on each board BEFORE racking (SW1 is unreachable mid-rack).
2. Heat-set inserts: 5x M3 per bay (4 seam + 1 header), 4x M3 in left holder.
3. Bolt bays together left-to-right with M3x8 + Ø3x8 dowel pins (screws driven from inside the
   right-hand module of each pair). Left holder screws from inside bay 1; right holder from outside.
4. Mount boards to carriers RAM/cooler-side UP (laptop orientation): drop the board into the
   lateral cage (side nubs + front/rear stops) onto the 5 standoffs, then press a RetainerPeg
   through 2-3 of the board's mounting holes into the standoff pilots (no screws needed;
   M2 x 6 self-tapping screws fit the same O1.7 pilots if preferred). 2 expansion cards face
   the front lip openings, 2 face the rear. USB-C PD power at rear.
5. Slide carriers in until the sideways latch clicks (left edge); lock with M3x8 thumbscrew.
6. Rack with 6x M6 + cage nuts; back the printed ears with 1.5mm metal plates, snug torque only.
   A rear support is required for any rack that gets transported.

## Verified against Framework's official CAD (2026-06-12)
The card-bay positions were measured from Framework's `printable_case_full.stp` (registered to the
5 mounting bosses, confirmed against the 2D drawing `fw_main_pcb_generic_2_w_fan.pdf`): bays sit at
board-y [-1.15, 32.85] and [39.65, 73.95] on BOTH short edges. Rev C (2026-06-12) fixed a mirrored
standoff pattern that forced the board component-side-DOWN: the 5-hole pattern is now mirrored back
(c = 82.82 - board_y) so the board mounts in its laptop orientation — RAM/SSD/cooler UP (drawing
sheet 3: fan +4.2 above PCB top, H=3.0 limit area on top; bottom is H=1.0), expansion cards hanging
BELOW the PCB. The seat was raised to h16.5 (8.5mm under the board): standard cards (5.4 below PCB)
clear by 3.1mm and the official ETHERNET CARD (~7.4 below) now FITS with ~1.1mm clearance (verify
against your card before committing). The lip has ONLY two stadium-shaped (pill) USB-C openings,
14 x 8 with r4 ends, on the mirrored receptacle axes (Rev D: c 35.97 / 76.77, plug axis h18.4 —
the RAM-up aperture center is PCB-bottom+1.9; the old h14.6 sat 1.9 BELOW the PCB and missed the
ports). These align with the board's ports directly AND with expansion-card ports (same axis). The receptacle face sits
~8.5mm behind the lip outer face — use cables with slim overmolds (max ~13 x 7) or fit expansion
cards (card face only ~6mm behind). Standoff bosses are O6 (Framework's own size — the expansion
card has a corner notch for it). Reference CAD lives in design-docs/framework-cad/.

## Rev D (2026-06-14) — physical-fit fixes
Two flaws found on a real print, fixed in `scripts/rebuild_all.py` + spec (see SPEC-RevB.md Rev D summary):
- **Board+cooler too wide.** The cooler fin-block overhangs the PCB +Y edge ~9.0mm (measured from
  `fw_main_pcb_generic_2_w_fan.pdf` sheet 4), not the 6.7 the spec assumed → real envelope 113.86 ≈
  the old 114 interior → zero clearance, banged the wall. Bay interior **W_int 114→118** (pitch
  128→132), board **shifted +9.86mm** to center the asymmetric envelope (~2mm each side). Ear blades
  shortened (26.3→20.3) to keep the faceplate at 482.6; front body 442, still 8.85mm under the rack
  opening.
- **USB-C openings too low.** Rev C raised the board seat to h16.5 but the tray ports stayed at
  h14.6 (below the PCB). Aperture center moved to **h18.4** (PCB-bottom +1.9), centers shifted with
  the board to c 35.97 / 76.77.
- **Verify before printing** (calibrated from a rasterized drawing): the 9.0mm cooler overhang and
  the 1.9mm USB-C aperture height. One caliper span each on the physical board confirms both.
  The `stl/` files are now STALE — re-export from Fusion (set EXPORT_STL=True and re-run).

## Build notes / deviations from spec
- Board retention is SCREW-FREE (Rev C): the board is located laterally by a printed cage —
  two nubs on the card-free long edges (0.2mm clearance/side) and front/rear stops in the
  43.2-50.0 gap between the card bays (0.5mm clearance) — and held down by RetainerPegs:
  O4.2 head on the screw-keepout annulus, tapered shaft (O1.85 -> O1.55) press-fit ~3mm into
  the O1.7 standoff pilot through the board hole. Use 2-3 pegs per board (diagonal). Pegs are
  consumable-ish: print spares; pry under the head to remove.
- Screw option: the same O1.7 pilots take M2 x 6 pan-head SELF-TAPPING screws (thread passes the
  board's mounting holes, head fits the O4.4 keepout). UK sources: Accu (accu.co.uk), Amazon UK /
  eBay "M2x6 self tapping pan head". For M2 heat-set inserts instead, drill the standoff O3.2
  and skip the tip.
- Cage caveat: the side nubs and stops bear only on the board's EDGES (never the top face), so
  top-side components can't clash; peg heads land where Framework's own screw heads sit.
- Left-holder grille: 3 slots on the front face + 2 on the outboard face (spec's 5 front slots
  don't fit the 15mm box width); total intake area 390 mm² as specced.
- Latch relief slot extended to the plate front edge (y0) so the beam is genuinely cantilevered.
- CarrierTray is lightweighted: 4 through-windows in the plate mid-section (6mm ribs, Ø16 island
  under the interior standoff, anchored to the right margin), ~57 cm³ solid volume. Load paths
  (edge tongues, front/rear bands, latch zone, standoff islands) are untouched.
- Omitted as print/slicer details: 0.5mm elephant-foot chamfers, optional floor perforation grid,
  +0.2 vertical oversize on horizontal-axis holes (drill/ream Ø3 dowel sockets if pins won't enter).

## Open questions before committing plastic (SPEC-RevB.md bottom)
Verify against your actual hardware: PCB mounting-hole diameters (pegs/M2 assume >= O2.0 clear),
Ethernet card below-board envelope (~7.4 assumed), card-face overhang 4.45mm, board outline at the
cage contact points (nubs at y118.5-121.5 on the long edges, stops at c44.4-48.7 on the short
edges). Print the 20-min fit coupon first: groove+tongue at 0.15/0.20/0.25/0.30 clearance, latch
beam section, one standoff + RetainerPeg press-fit, insert pocket.

# Framework Laptop 13 Mainboard â€” 3-Bay 1U EIA-310 Rack (Parametric Design Specification, Rev B)

All dimensions mm. Target printer: Bambu Lab H2D (325 x 320 x 325). Material: PETG-CF recommended for bay modules and side holders (creep near warm electronics is the governing concern); plain PETG acceptable everywhere. All structural prints are oriented so primary loads are in-plane (see Â§9).

**Rev D change summary (physical-fit fixes against Framework official CAD — 2026-06-14):** Two flaws found on a real print, both traced to unverified board data (Open Question #1). (1) Board+cooler clash: the cooler fin-block overhangs the PCB +Y edge by ~9.0 (measured off `framework-cad/fw_main_pcb_generic_2_w_fan.pdf` sheet 4), not the 6.7 the spec assumed — the drawing's 6.7 callout is from an intermediate datum, not the PCB edge. True cross-bay envelope = 113.86 ≈ the old W_int 114 → zero clearance → the cooler banged the wall. Fix: **W_int 114→118** (bay_pitch 128→132, carrier_plate_w 121.5→125.5, groove_btb 122→126), board **shifted +9.86 in c** to center the asymmetric envelope (2.07/side), interior-standoff island Ø16→Ø12 to keep it on the plate, ear_blade_span 26.3→20.3 so the faceplate stays 482.6 (front body 430→442, margin to 450.85 now 8.85). (2) USB-C openings: the Rev C seat raise (PCB bottom h16.5) was never propagated to the tray ports — pills sat at h14.6 (1.9 BELOW the PCB). Fix: **aperture center → h18.4** (PCB-bottom+1.9, the real LOTES mid-mount receptacle center), pills span h14.4..22.4, lateral centers c 26.11/66.91 → 35.97/76.77 (follow the +9.86 board shift). Two numbers still rest on a calibrated raster read and should be caliper-checked on the physical board: the 9.0 cooler overhang and the 1.9 USB-C aperture height (see Open Questions). STLs in `stl/` are stale — re-run the script with EXPORT_STL=True in Fusion.

**Rev B change summary (review fixes):** sideways snap latch (old vertical latch never engaged and was unprintable); lip raised flush with plate bottom and shortened to h 32 + thumbscrew tab (carrier now truly support-free, header intake slots uncovered); lip card-cutout local coordinates corrected by the 3.75 frame-slip and enlarged to 34 x 14; groove roof chamfer deleted; rear top strap replaced by self-supporting plan-view V-brace; right holder duct moved to z 60â€“215 and turned into a REAR exhaust (fixes both the buried front screws and the hot-into-cold-aisle airflow); seam screw direction wording corrected (driven from inside the RIGHT module of each pair); seam insert holes shortened to 6.2 with M3x8 screws (no blow-through); board retention changed to M2 heat-set inserts as primary (original M1.6 x 1.5 screws are alignment-only); Ethernet card restricted to rear with plate relief pockets under all card bays; SW1 power-button / BIOS auto-power-on documented; side holders re-oriented standing on the front face; holders widened to 23 (duct area â‰¥ fin outlet) â€” front body 430, ear blades 26.3; front dowel moved to z 12 for faceplate-seam registration; strain-relief slots added at the rear; ML1220 note corrected to 11th-gen only.

---

**THERMAL ERRATA (2026-07-05, supersedes §0 orientation note and §5/§6 holder roles):** the fin-exhaust handedness stated in §0 ("blows RIGHT in every bay") is MIRRORED from physical reality. The as-built carrier maps the board as **c = 82.82 − board_y** (verified against all 5 standoffs in the live doc and by a real print — the board only mounts one way on the asymmetric hole pattern, and the user-measured 7 mm cooler overhang lands on the LOW-c edge). Therefore **every fin jet blows toward the bay's LEFT wall**. As specced, bay 1's hot jet pressurized the left "intake" plenum and blew out its front grille into the cold aisle (the exact Rev A failure §5 was fixing), while the right rear-exhaust duct received no jet. Fixed in `scripts/rebuild_all.py`: the holders' outboard boxes are SWAPPED — **LEFT holder = rear-exhaust duct** (box z 60–215, 45° prow, open rear, no grille), **RIGHT holder = front-intake plenum** (box z 0–160, 3 front + 2 outboard grille slots). Attachment hardware, plates, ear blades, EIA slots, inner vent cutouts and outer envelopes are unchanged; the right holder's two front screws (z 25 rows) are reached through sealed Ø10 tubes with Ø6 head/driver channels crossing the plenum (grip 4.0 unchanged). Cross-bay preheat now cascades 3→2→1; monitor **bay 1** (not bay 3) on first bring-up; yin-yang remains the fallback. §6's per-bay front intake and open-rear exhaust are unaffected.

**THERMAL ERRATA 2 (2026-07-06, supersedes §3 vent position and §6 "never obstruct" rule):** the fin stack is NOT centered on the board long axis — §2's cooler research and the §12 sanity check ("fins z 87.5–152.3") assumed symmetry. Measured from a calibrated top-view photo of the physical board (fin blocks 21–95 mm from the front edge) and corroborated by the fan rotor arcs in the DXF (center ≈ 46 mm forward of board center), the fin exhaust spans **bay depth z ≈ 28..101 — the FRONT half, over the fan**. The old vents (z 85–155) faced only ~16 mm of the ~74 mm fin stack; ~80 % of the jet hit solid wall. Fixed in `scripts/rebuild_all.py`: all four wall-vent cutouts (bay both walls, both holder plates) moved to **z 31..105, h 13–31** (z 31 keeps a 3 mm web to the z 25 seam-screw counterbores; corbel roof now z 102–105), and the left holder's exhaust duct pulled forward (box z 14–215, 45° prow z 14–29, cavity z 31–215.5, rear end open). Never obstruct **z 31–105** at h 13–31 on any wall. Bay outer envelope unchanged, but bays printed before this date have the vent in the wrong place for the real cooler — reprint for loaded operation.

## 0. Architecture and global coordinate conventions

**Parts (8 prints, 5 unique):**
| Part | Qty | Unique |
|---|---|---|
| Bay module ("rack-tray") | 3 | identical |
| Carrier-tray | 3 | identical |
| Side holder, LEFT (heat-set inserts on inner face; intake plenum) | 1 | unique |
| Side holder, RIGHT (through-holes counterbored from outside; rear-exhaust duct) | 1 | unique |

**Chassis frame:** origin at chassis vertical centerline, front faceplate plane, body bottom.
- `u` = across rack (left to right, viewed from front); `u_int` = per-bay interior coordinate, 0 at the bay's left wall interior face (interior spans u_int 0â€“114)
- `z` = depth, 0 at front faceplate plane, positive rearward
- `h` = height above body bottom

**Board orientation (handedness-checked, top side up):** board long axis (226.9, board X) runs front-to-back; board +X points REAR, +Y points RIGHT (pure rotation, no mirror; cooler side up). âˆ’X edge (2 expansion-card bays) faces FRONT; +X edge (2 bays) faces REAR. Cooler fin exhaust (+Y edge) blows RIGHT in every bay; blower intake faces UP.

## 1. Width budget / bay pitch

The 226.9 edge cannot run across a 3-bay split of the 450.85 opening; the 104.83 edge runs across each bay:
- Board cross-bay envelope = 104.83 PCB + 6.7 fin overhang = **111.53**
- Bay interior clear width `W_int` = **114.0** (1.235 clearance each side of the centered envelope; PCB itself: 1.235 gap left side, 7.935 gap fin/right side with fins reaching to 1.235 from the right wall)
- Wall `t_wall` = **7.0** (4.0 groove leaves 3.0 web). **Bay pitch P = 128.0.**
- 3 bays = 384.0; holder plates 8.0 each â†’ rear body 400.0; holder front sections 23.0 wide each â†’ **front body width 430.0** â‰¤ 450.85 (20.85 margin) âœ“
- Ear blades (482.6 âˆ’ 430)/2 = **26.3** per side to the 482.6 EIA faceplate âœ“

## 2. 1U height budget (verified stack â€” unchanged from Rev A, re-verified)

Panel/body height **43.2** (< 43.66 = 44.45 âˆ’ 0.794; 0.46 elephant-foot margin). From body bottom:

| Item | Height | Cumulative h |
|---|---|---|
| Bay floor | 3.0 | 3.0 (interior floor) |
| Carrier ride clearance | 2.0 | 5.0 = carrier plate bottom |
| Carrier plate | 3.0 | 8.0 = plate top |
| Standoffs (boss 5.5 + tip 1.0) | 6.5 | 14.5 = board plane |
| PCB | 1.1 | 15.6 = board top |
| Max top component (cooler stack, research 8.55) | 8.55 | 24.15 |
| **Headroom to body top** | **19.05** | 43.2 |

Check: 3.0+2.0+3.0+6.5+1.1+8.55 = 24.15; 24.15+19.05 = 43.2 âœ“. Standard expansion cards protrude 5.4 below board â†’ card bottom h 9.1 = 1.1 above plate top âœ“. The official **Ethernet card sits ~2.0 lower (h â‰ˆ 7.1)** â€” handled by plate relief pockets (Â§4) and restricted to REAR bays. Mid-rack, the unit above closes the top to a 1.25 gap: the 19 mm plenum is a distribution volume, NOT the primary intake â€” primary intake is the front (Â§6).

## 3. Bay module (x3, identical)

**Outer:** 128.0 W x 248.0 D x 43.2 H. Open top (except front header and rear V-brace), open rear center.

- **Floor:** 3.0 thick, full 114 x 248 interior. Optional Ã˜6 perforation grid mid-floor (skip groove lands, latch pocket region, zip slots). 2x zip-tie slots 4 x 4 through the floor at z 242â€“246, u_int 12â€“16 and 98â€“102 (rear cable strain relief).
- **Side walls:** 7.0 x 43.2 x 248, both sides.
- **Rail grooves** (both walls, full depth, open at front): plain rectangular â€” bottom face h 5.0, height 3.4, depth 4.0. **No roof chamfer** (Rev A's 45Â° roof chamfer deleted: unnecessary in the standing print, and it created a 0.6 ligament under the vent and destroyed Z retention; deletion restores a 4.6 solid land below the vent and full-depth retention). Groove-bottom-to-bottom 122.0. Entry chamfers 2.0 x 45Â° at the front face only.
- **Latch pocket (LEFT wall only):** blind lateral recess cut 1.8 deeper than the groove root (local wall web 7.0âˆ’4.0âˆ’1.8 = 1.2 over the pocket patch), z 10.0â€“16.5, full groove height (h 5.0â€“8.4). Receives the carrier's sideways snap (Â§4). 45Â° chamfer on the pocket's rear (print-upper) face.
- **Front frame:** opening 114.0 W x 28.0 H (h 3.0â€“31.0) plus groove break-throughs. **Front header** h 31.0â€“43.2 x 6.0 deep, full width; central boss 9.0 deep with M3 heat-set insert (Ã˜4.0 x 6.7, axis front-to-back) at module center u, h 36.0. **Two intake slots 40 x 6 at h 34.0â€“40.0**, u_int 8â€“48 and 66â€“106 (clear of the carrier's 16-wide center tab, u_int 49â€“65 â€” slots are now genuinely open with the shortened lip, Â§4).
- **Rear frame:** perimeter band 6.0 deep (z 242â€“248): bottom band h 0â€“3, wall columns full height; opening 114.0 W x 28.0 H (h 3.0â€“31.0) for rear cards/cables. **Rear top tie = plan-view V-brace** (replaces Rev A's full-width strap, which was an unprintable 114 mm bridge): two straps 8.0 wide x h 31.0â€“43.2, running at 45Â° in plan from each wall's interior face at z 180 to a center node (u_int 45â€“69) at z 242â€“248, merged with the rear band. Every layer of the standing print steps â‰¤ 0.2 laterally â€” fully self-supporting; straps sit above the 24.15 component line and above the rear opening âœ“.
- **Exhaust vent cutouts:** BOTH walls, z 85.0â€“155.0 x h 13.0â€“31.0, identical every module (aligned cross-flow relief).
- **Inter-module joint** (right wall face = insert side; left wall face = screw side):
  - 4x M3 heat-set inserts in the right wall outer face at (z, h) = (25, 18), (220, 18), (25, 36), (220, 36); hole **Ã˜4.0 x 6.2** (0.8 web â€” Rev A's 6.7/0.3 web invited melt-through). Insert 4.6 OD x 5.7 L seated ~0.5 sub-flush; still brace the wall when installing.
  - 4x Ã˜3.4 through-holes at identical positions in the left wall, counterbored Ã˜6.0 x 3.0 from the bay interior. Screws: **M3 x 8 SHCS, driven from inside the RIGHT module of each pair** (bay 2 for the 1â€“2 seam, bay 3 for the 2â€“3 seam â€” Rev A's "left neighbor" wording contradicted its own geometry). Grip 7.0âˆ’3.0 = 4.0; thread engagement â‰ˆ 3.5â€“4.0 in the insert; tip reach 4.0 < 6.2 hole âœ“. Use a ball-end or stubby driver (horizontal axis inside a 114-wide bay).
  - 2x Ã˜3.15 x 4.2 dowel sockets per joint face at **(z 12, h 38)** and (z 190, h 38); Ã˜3 x 8 steel pins. Front dowel moved from z 60 to z 12 to register faceplate segments at the seams (creep/stiffness fix â€” cheaper than a lap feature; retorque seam screws after the first week of warm operation).
  - All positions miss the groove band (5.0â€“8.4), latch pocket (z â‰¤ 16.5), and vent (z 85â€“155).
- **Chamfers:** 0.5 x 45Â° on all bed-contact edges.

## 4. Carrier-tray (x3, identical)

Carrier frame: z = 0 at lip REAR face (= bay front face when seated); `c` = 0 at plate LEFT edge; heights in chassis h. Conversions: bay u_int = c âˆ’ 3.75 (plate edge sits 3.75 inside the groove: âˆ’4.0 + 0.25 clearance); **lip-local = c + 2.75** (lip left edge at c âˆ’2.75). Cross-check: thumbscrew at lip center, lip-local 63.5 â†’ c 60.75 â†’ u_int 57 = module center = header boss âœ“.

- **Plate:** 121.5 W x 240.0 L x 3.0 thick (top h 8.0), solid (Rev A's underside ribs deleted â€” they prevented flat printing and the continuous groove support makes them unnecessary). Plate edges are the rail tongues: 3.75 engagement/side, 0.25/side lateral, 0.4 vertical clearance. 1.5 x 45Â° chamfers on tongue rear ends; 0.5 on running edges.
- **Card relief pockets (top face, 1.5 deep, 1.5 web):** 4x, 36 wide, centered c 37.5 and 78.1; front pair z 2â€“37, rear pair z 203â€“239. Leave Ã˜10 full-height collars where standoffs fall inside a pocket (standoff 2 at z 8.75/c 35.04 and standoff 3 at z 230.9/c 36.14). Pocket floor h 6.5 clears the Ethernet card bottom (h â‰ˆ 7.1) by 0.6. **Ethernet card: REAR bays only** (its RJ45 latch and 38 mm body cannot work through the front lip tunnel; the open rear frame gives full access).
- **Front lip (bezel/handle):** 127.0 W x **27.0 H (h 5.0â€“32.0)** x 4.0 thick at z âˆ’4.0â€“0, centered on the module (1.0 gaps between adjacent lips). Lip bottom is FLUSH with the plate bottom (h 5.0) â€” this is what makes the flat print legitimate. It still covers the 28-tall opening down to h 5 (2.0 open slot at h 3â€“5 = deliberate under-lip intake) and bears on the wall front faces over 6.5-wide strips each side as the insertion stop. **Center tab** 16.0 W x h 32.0â€“39.5 carries the Ã˜3.4 thumbscrew hole at h 36.0 (M3 x 8 knurled thumbscrew into the header insert; 4.0 engagement âœ“). The shortened lip leaves the header intake slots (h 34â€“40) fully exposed either side of the tab.
  - 2x card cutouts: **34.0 W x 14.0 H, h 8.0â€“22.0**, lip-local centers **40.25 and 80.85** (= c 37.5 / 78.1 â€” corrects Rev A's 3.75 frame-slip, which would have walled off both ports). No local thinning (deleted): with card faces at z 2.0 the recess from the lip outer face to the card face is 4.0 + 2.0 = **6.0** â€” plug shells insert fully; any overmold â‰¤ 33 x 13 within 6 mm of the plug seats. 45Â° chamfers on cutout tops (print bridging).
  - Latch release notch at lip bottom-left: 7.0 W x 6.0 H, lip-local 1.5â€“8.5, h 5.0â€“11.0 (push the latch tab RIGHT/inward to release).
- **Board placement:** board origin (X0, Y0) at (z 119.9, c 31.985); +X rearward, +Y right. PCB edges z 6.45 / 233.35. **Card faces protrude past the PCB edge to z â‰ˆ 2.0 (front) and z â‰ˆ 237.8 (rear)** (this resolves Rev A's self-contradiction; verify against board CAD). Rear card faces sit 4.2 ahead of the rear frame inner face (z 242); rear plugs insert through the open frame â€” chamfer the rear opening edges 1.5 x 45Â° as a blind-insertion guide.
- **Standoffs (5):** boss **Ã˜7.0** x 5.5 + concentric tip Ã˜4.2 x 1.0 (total 6.5; tip nests the board's Ã˜4.4 bottom keepout). **Primary retention: M2 brass heat-set insert** (pocket Ã˜3.2 x 4.0 from the boss top plane; tip bore Ã˜2.4 clearance) **with M2 x 5 low-profile screws** â€” engagement 5 âˆ’ (1.1 PCB + 1.0 tip) = 2.9 â‰ˆ 1.45xD âœ“. The original Framework M1.6 x 1.5 T5 screws leave ~0.4 of thread and are ALIGNMENT-ONLY (a transported carrier would drop its board). Fallback if the PCB holes reject Ã˜2.0 shanks: M1.6 x 5 screws self-threading a Ã˜1.4 x 5.0 pilot. Verify head Ã˜ â‰¤ 5.5 and height clearance per Framework keepout. Positions (carrier z, c) â€” unchanged, transforms z = 119.9 + X, c = 31.985 + Y re-verified:

| Board (x, y) | z | c |
|---|---|---|
| (28.50, âˆ’24.70) | 148.40 | 7.29 |
| (âˆ’111.15, 3.05) | 8.75 | 35.04 |
| (111.00, 4.15) | 230.90 | 36.14 |
| (âˆ’111.15, 67.05) | 8.75 | 99.04 |
| (110.50, 71.85) | 230.40 | 103.84 |

- **Snap latch â€” SIDEWAYS-acting (replaces Rev A's vertical latch, which mathematically never touched the floor and put geometry below the print bed):** cantilever beam cut into the plate at the LEFT edge, in-plane with the plate. Relief slot 2.5 W (c 1.8â€“4.3) x z 6â€“32 defines a beam c 0â€“1.8, root at z 32 pointing forward, free length 24, full plate height (h 5â€“8). Catch bump on the beam outer face: **1.5 proud beyond the plate edge** (to c âˆ’1.5 = 1.25 past the groove root), z 10â€“16, insertion ramp 35Â° (rear face), retention face 75Â° (front face). Release tab continues from the tip to z âˆ’1 through the lip notch. Mates the left-wall pocket (Â§3): engagement 1.5 âˆ’ 0.25 clearance = **1.25** on the retention face; ride deflection 1.25 over the **last ~16 mm of travel only** (the bump region enters the groove last); beam strain 3tÎ´/2LÂ² = 3Â·1.8Â·1.25/(2Â·24Â²) = **0.59 %** â€” comfortable for PETG; zero strain when seated. Everything prints in-plane, flat, support-free.

## 5. Side holders (left + right; both 23.0 wide overall, NOT identical hardware)

- **Body:** vertical plate 248.0 D x 43.2 H x 8.0 thick against the outer bay wall, plus an outboard hollow box 15.0 wide (total 23.0), walls 3.0, internal section 12.0 x 37.2 = **446 mmÂ²** (â‰¥ ~430 mmÂ² fin outlet â€” Rev A's 335 mmÂ² duct was undersized).
  - **LEFT holder = intake plenum:** box z 0â€“160, closed except a **front grille of 5 slots 3.0 W x 26 H (390 mmÂ² )**; inner plate cutout z 85â€“155, h 13â€“31 matching the bay-1 wall vent. Roof the cavity top with 45Â° corbels or accept the â‰¤12 mm bridge.
  - **RIGHT holder = REAR exhaust duct:** box **z 60â€“215**, closed front and outboard faces, **open rear end at z 215** (exhaust leaves rearward, hot side â€” Rev A blew hot air out the front grille into the cold aisle and over its own intakes). Box grows from the plate via a 45Â° prow over z 45â€“60 (self-supporting in the standing print). Inner plate cutout z 85â€“155, h 13â€“31. **No front grille.** Repositioning the box also moves BOTH screw rows (z 25 and z 220) outside the box â€” all four right-holder counterbores are now directly reachable from the outside face (fixes Rev A's two buried screws without access holes).
- **Ear blade:** coplanar with the front face, **26.3 span** x 43.2 H x 6.0 thick, R5 blend plus two triangular gussets 25 x 25 from the blade rear face onto the plate/box (bottom gusset 5.0 thick at h 0â€“5; top gusset 4.0 thick at h 39.2â€“43.2, thinned to clear the Ã˜6.0 counterbore at h 36 on the right holder). In the standing print orientation (Â§9) the blade root and gussets are loaded IN-PLANE â€” the layer-interface snap line of the Rev A flat print is eliminated. **Back each blade with a 1â€“2 mm steel or aluminium ear plate under the M6 washers (recommended) and torque M6 screws snug only (~1â€“1.5 NÂ·m)** â€” a 6 mm plastic blade will crush at full cage-nut torque.
- **Ear slots (EIA-310, 3 per U):** 10.0 W x 7.0 H, horizontal centers u = Â±232.55 (465.1 c-c; 8.75 in from the 482.6 edges; slot spans u 227.55â€“237.55, fully on the 26.3 blade spanning u 215â€“241.3 âœ“), vertical centers h 5.725 / 21.6 / 37.475 (EIA 6.35/22.225/38.1 minus the 0.625 centering gap).
- **Attachment:** same 4-hole + 2-dowel pattern as the inter-module joint (dowels z 12/190, h 38). LEFT holder: 4x heat-set inserts (Ã˜4.0 x 6.7 in the 8.0 plate, 1.3 web) + dowel sockets on the inner face; screws M3 x 8 from inside bay 1. RIGHT holder: 4x Ã˜3.4 through-holes counterbored Ã˜6.0 x 4.0 from the OUTSIDE + dowel sockets; M3 x 8 into bay 3's right-wall inserts. Grip 4.0 everywhere; engagement â‰ˆ 3.5â€“4.0 âœ“.
- **Load note:** ~2.2â€“2.7 kg on printed ears is acceptable static; PETG creep will relax insert preload â€” retorque after the first thermal cycles. **A rear support (L-bracket to the rear band or a rack shelf) is REQUIRED for any rack that is transported or slid**, recommended for all installs.

## 6. Ventilation / thermal scheme (front = intake, rear = exhaust)

- Per-board load ~28 W (prior art: 3-bay/17" build, zero heat issues).
- **Intake (front, cold aisle):** per bay: 2 header slots 480 mmÂ² + under-lip slot 114 x 2 = 228 mmÂ² (~708 mmÂ²/bay), plus card-cutout leakage; left holder front grille 390 mmÂ² feeding bay 1's left vent; top plenum is supplemental only (closed mid-rack).
- **Exhaust (rear, hot aisle):** each bay's primary exhaust is its own open rear (114 x 28); bay 3's fin jet additionally ducts through the right holder box and exits REARWARD at z 215. Bays 1/2 fin jets relieve through the aligned wall vents; residual cross-bay preheat into bay 3 is accepted at 28 W/board (most flow short-circuits out each bay's rear) â€” monitor bay-3 temps on first bring-up; alternating board orientation ("yin-yang") remains the documented fallback (open question).
- Never obstruct z 85â€“155 at h 13â€“31 on any wall.
- **Power/RTC/access:** Framework boards power-cycle via onboard SW1 (top side), inaccessible mid-rack. **Mandatory: set BIOS "Power on AC attach" and standalone-mode/chassis-intrusion (SW3) behavior BEFORE racking.** Optional Ã˜4 poke channel to SW1 deferred until SW1's position is taken from board CAD (open question). Rear PD cables: zip-tie to the floor slots (Â§3) so a cable tug loads the chassis, not the latch/thumbscrew; use 90Â° USB-C cables if possible; PD bricks live on a rear shelf/cable bar.

## 7. Assembly sequence

1. Pre-configure each mainboard's BIOS (auto power-on, standalone mode) while still in a laptop or on the bench.
2. Install heat-set inserts at ~250 Â°C: 5 per bay module (4 joint Ã˜4.0 x 6.2 + 1 header Ã˜4.0 x 6.7), 4 in the left holder (Ã˜4.0 x 6.7), 5x M2 per carrier. Brace bay walls while installing (0.8 web).
3. Dowel + screw bay1â€“bay2 then bay2â€“bay3 (M3 x 8 **from inside the right-hand module of each pair** â€” heads in bay 2 and bay 3; ball-end/stubby driver). Left holder to bay 1 (screws from inside bay 1); right holder to bay 3 (screws from outside, all four reachable).
4. Mount each mainboard to its carrier with 5x M2 x 5 (or verified fallback); fit expansion cards â€” USB-C PD at REAR for power, **Ethernet REAR only**; front and rear each expose 2 card faces.
5. Slide carriers in until the sideways latch clicks (last ~16 mm); fit M3 x 8 thumbscrews through the lip tabs.
6. Rack with 6x M6 + cage nuts, washers over the metal ear plates; snug torque only. Fit rear support. Zip-tie rear cables; retorque seam screws after the first week of warm operation.

## 8. Fastener / hardware BOM

| Item | Qty | Where |
|---|---|---|
| M3 heat-set insert, Ã˜4.6 x 5.7 (hole Ã˜4.0; Ã˜4.1â€“4.2 if tapered) | 19 (buy 25) | 12 bay joints, 3 headers, 4 left holder |
| M3 x 8 SHCS | 16 | module/holder joints (was M3 x 10 â€” shortened with the 6.2 holes) |
| M3 x 8 knurled thumbscrew | 3 | carrier locks |
| Ã˜3 x 8 steel dowel pin | 8 | joint alignment (sockets Ã˜3.15 x 4.2 at z 12/190) |
| M6 x 16 + cage nut + washer | 6 | rack ears â€” snug torque only |
| Steel/alu ear backing plate ~40 x 43 x 1.5 | 2 | under M6 washers (strongly recommended) |
| M2 brass heat-set insert (~3.5 OD x 4.0 L, hole Ã˜3.2) | 15 (buy 20) | board retention (PRIMARY) |
| M2 x 5 low-profile screws (head â‰¤ Ã˜5.5) | 15 | boards to standoffs |
| M1.6 x 1.5 Torx T5 (Framework originals) | â€” | alignment-only; NOT retention |
| ML1220 rechargeable coin cell (**Intel 11th-gen boards only**; never CR2032) | per board | RTC |
| Zip ties, small | ~6 | rear strain relief |

## 9. Print plan (all parts fit 325 x 320 x 325)

| Part | Orientation | Footprint x Z | Supports |
|---|---|---|---|
| Bay module | Standing on FRONT face | 128 x 43.2, Z = 248 | None (grooves vertical; V-brace self-supporting; latch pocket chamfered) â€” **brim 8â€“10 or draft shield** (tall narrow print; watch groove consistency near the rear) |
| Carrier-tray | Flat, plate bottom on bed (now genuinely flat: lip flush, latch in-plane, no underside features) | 127 x 244, **Z = 34.5** | None (cutout tops chamfered 45Â°) |
| Side holders | **Standing on FRONT face** (faceplate + blade on bed) â€” puts ear loads in-plane | 49.3 x 43.2, Z = 248 | None (gussets and box prow are 45Â° walls; box roofs â‰¤12 bridges or corbelled) |

**Horizontal-axis hole rule (standing prints):** model all horizontal round holes (Ã˜3.15 dowel sockets, Ã˜3.4/Ã˜4.0 joint holes) +0.2 oversize vertically (or teardrop), or drill/ream to size â€” as-printed circles droop and Ã˜3 pins will not enter Ã˜3.15 sockets otherwise.

PETG/PETG-CF, 4 walls, 5 top/bottom layers, 30â€“40 % infill, 0.2 layers. Print a 20-min fit coupon first: 30 mm groove + tongue stub at 0.15/0.20/0.25/0.30 clearances; one standoff boss with Ã˜3.2 insert pocket + M2 insert pull test (and Ã˜1.4 pilot + M1.6 x 5 fallback); a 30 mm latch-beam + pocket section.

## 10. Verification summary (all arithmetic re-run for Rev B)

- **Width:** 3x128 + 2x23 = 430 â‰¤ 450.85 (20.85 margin) âœ“; 430 + 2x26.3 = 482.6 âœ“; rear body 400 âœ“; ear holes 465.1 c-c, 8.75 inset, slots on-blade âœ“
- **Height:** 43.2 â‰¤ 43.656 âœ“; stack 3+2+3+6.5+1.1+8.55 = 24.15, headroom 19.05 âœ“; EIA hole heights 5.725/21.6/37.475 âœ“
- **Slide:** tongue 121.5 in 122.0 (0.25/side), 3.0 in 3.4 (0.4 Z, full-depth retention with chamfer deleted) âœ“; envelope 111.53 in 114.0 âœ“
- **Latch:** bump tip 1.25 past groove root; pocket 1.8 â‰¥ 1.25 + 0.3 âœ“; wall web 1.2 remains; ride deflection 1.25 â†’ strain 0.59 % âœ“; engages over the last ~16 mm only âœ“; release via lip notch âœ“
- **Lip frame conversion:** lip-local = c + 2.75; cutouts at 40.25/80.85 = c 37.5/78.1 = u_int 33.75/74.35; thumbscrew lip-local 63.5 â†’ u_int 57 = header boss âœ“ (the conversion that exposed Rev A's 3.75 error)
- **Cards:** standard card bottom 9.1 vs plate top 8.0 âœ“; Ethernet 7.1 vs pocket floor 6.5 âœ“ (rear only); 34 x 14 cutouts pass card + overmold; front recess 6.0 from lip outer face; rear faces 4.2 ahead of frame âœ“; fins z 87.5â€“152.3 inside vents z 85â€“155 âœ“
- **Fasteners:** seam grip 4.0, M3x8 tip 4.0 < 6.2 hole âœ“; holder grip 4.0 âœ“; thumbscrew 4.0 into 6.7 âœ“; M2 engagement 2.9 âœ“; counts 19 M3 inserts / 16 SHCS / 8 dowels / 15 M2 âœ“
- **Airflow:** front intake ~708 mmÂ²/bay + 390 grille; right duct 446 mmÂ² â‰¥ ~430 fin outlet; hot exhaust rear-only âœ“
- **Printability:** no part has geometry below its bed plane; no bridge > 12; largest footprint 248-tall prints fit the 325 bed âœ“

**Engineering calls where reviewers conflicted (noted):** (1) Latch â€” chose the sideways re-detail over "bigger bump + supports": one change fixes both the engagement arithmetic and the impossible print, at zero support cost. (2) Right-holder screw access â€” chose moving the duct box (z 60â€“215) over drilling access holes: the reposition was needed anyway for the rear-exhaust thermal fix and makes all four screws plainly accessible. (3) Header slots vs lip â€” chose shortening the lip (+ thumbscrew tab) over deleting the slots, preserving a real front intake for mid-rack units. (4) Carrier ribs â€” deleted rather than relocated (no clash-free location exists between the board envelope and the grooves; continuous groove support makes the solid 3.0 plate sufficient). (5) Board screws â€” M2 inserts primary per the sourced thermal review, with the M1.6 x 5 self-thread fallback retained because the PCB hole diameter for Ã˜2.0 shanks is unverified. (6) Ride gap kept at 2.0 / groove_bottom_h at 5.0 (the alternate 1.0-gap restack was unnecessary once the latch went sideways).

# Parameters
```
U_height = 44.45  # EIA 1U
panel_height = 43.2  # body and faceplate height (max 43.656)
faceplate_width = 482.6  # EIA total incl ears
post_opening = 450.85  # EIA clear opening (hard limit)
ear_hole_cc = 465.1  # horizontal hole centers
ear_hole_edge_inset = 8.75  # hole center from faceplate edge
ear_slot_w = 10.0  # horizontal slot length, M6 clearance
ear_slot_h = 7.0  # slot height
ear_hole_h1 = 5.725  # from panel bottom (6.35 - 0.625 U-gap)
ear_hole_h2 = 21.6
ear_hole_h3 = 37.475
ear_blade_span = 20.3  # Rev D: 26.3->20.3 beyond the 442 front body, per side (holds faceplate 482.6)
ear_blade_t = 6.0  # back with 1.5 metal plate under M6 washers; snug torque only
ear_gusset_leg = 20.3  # Rev D: 25.0->20.3 (follows the shorter blade)
ear_gusset_t_bottom = 5.0  # h 0-5
ear_gusset_t_top = 4.0  # h 39.2-43.2 (clears Ã˜6 cb at h 36)
bay_pitch = 132.0  # Rev D: 128->132 (W_int +4 for the real cooler envelope 113.86)
bay_outer_w = 132.0  # Rev D: 128->132
bay_outer_d = 248.0
bay_outer_h = 43.2
W_int = 118.0  # Rev D: 114->118; clears the 113.86 board+cooler cross-bay envelope with ~2.07/side
t_wall = 7.0
t_floor = 3.0
groove_bottom_h = 5.0
groove_height = 3.4  # plain rectangular roof (45deg roof chamfer DELETED)
groove_depth = 4.0
groove_btb = 126.0  # Rev D: 122->126 (= W_int + 8; tongue scheme unchanged)
groove_entry_chamfer = 2.0  # x45deg at front face only
front_opening_w = 114.0
front_opening_h = 28.0  # h 3.0-31.0
front_header_h1 = 31.0  # header band to 43.2, 6.0 deep
front_header_t = 6.0  # 9.0 at thumbscrew insert boss
header_vent_slot_w = 40.0  # two per bay
header_vent_slot_h1 = 34.0  # slot band h 34.0-40.0 (now exposed by shortened lip)
header_vent_slot_h2 = 40.0
header_vent_u1 = 8.0  # u_int spans 8-48 and 66-106 (clear of 49-65 tab zone)
header_vent_u2 = 66.0
rear_frame_t = 6.0  # z 242-248, opening 114 x 28
rear_vbrace_w = 8.0  # plan-view 45deg V-brace, h 31-43.2, wall@z180 to node z242-248 (replaces full-width strap)
rear_vbrace_node_w = 24.0  # center node u_int 45-69
rear_ziptie_slot = 4.0  # 4x4 through floor, z 242-246, u_int 12-16 and 98-102
vent_cut_z1 = 85.0
vent_cut_z2 = 155.0
vent_cut_h1 = 13.0
vent_cut_h2 = 31.0
joint_hole_z1 = 25.0
joint_hole_z2 = 220.0
joint_hole_h1 = 18.0
joint_hole_h2 = 36.0
joint_hole_dia = 3.4  # through left wall; cb 6.0 x 3.0 from own interior; screws driven from RIGHT module of pair
insert_hole_dia = 4.0  # M3 insert 4.6OD x 5.7L
insert_hole_depth_wall = 6.2  # bay seam walls (0.8 web; was 6.7/0.3)
insert_hole_depth_boss = 6.7  # header boss (9.0 deep) and left holder plate (8.0)
dowel_z1 = 12.0  # moved from 60 for front seam registration
dowel_z2 = 190.0
dowel_h = 38.0
dowel_socket_dia = 3.15  # x 4.2 deep; +0.2 vertical oversize when printed horizontal
seam_screw = 8.0  # M3 x 8 SHCS (was M3 x 10)
carrier_plate_w = 125.5  # Rev D: 121.5->125.5 (= W_int + 7.5)
carrier_plate_l = 240.0
carrier_plate_t = 3.0
carrier_ride_h = 2.0
carrier_print_z = 34.5  # tallest feature = lip tab top h 39.5 minus bed plane h 5.0
relief_pocket_w = 36.0  # 4x card relief pockets, top face
relief_pocket_d = 1.5  # leaves 1.5 web; floor h 6.5 clears Ethernet 7.1
relief_pocket_c1 = 37.5  # pocket centers (= card centers)
relief_pocket_c2 = 78.1
relief_pocket_zf1 = 2.0  # front pair z 2-37
relief_pocket_zf2 = 37.0
relief_pocket_zr1 = 203.0  # rear pair z 203-239
relief_pocket_zr2 = 239.0
relief_collar_dia = 10.0  # full-height collars around standoffs 2 and 3
lip_w = 131.0  # Rev D: 127->131 (follows pitch 132, keeps 0.5/side gap)
lip_h1 = 5.0  # lip bottom FLUSH with plate bottom (was 2.0)
lip_h2 = 32.0  # lip top (was 40.0; opening top 31.0 + 1.0 overlap)
lip_t = 4.0  # uniform (2.5 local thinning deleted)
lip_tab_w = 16.0  # center tab h 32.0-39.5 carrying thumbscrew
lip_tab_h2 = 39.5
lip_card_cut_w = 34.0  # was 32
lip_card_cut_h = 14.0  # h 8.0-22.0 (was 12, h 8.5-19)
lip_card_cut_c1 = 40.25  # lip-local = c + 2.75 (CORRECTED from 44.0)
lip_card_cut_c2 = 80.85  # CORRECTED from 84.6
lip_thumb_hole = 3.4  # at lip center (lip-local 63.5), h 36.0; M3x8 thumbscrew
lip_release_notch_w = 7.0  # lip-local 1.5-8.5, h 5.0-11.0, push latch tab inward
board_origin_z = 119.9
board_origin_c = 31.985
card_face_z_front = 2.0  # card faces overhang PCB edge 4.45 (verify vs board CAD)
card_face_z_rear = 237.8
front_recess_to_card = 6.0  # lip outer face to card face; overmold env <= 33x13
standoff_boss_dia = 7.0  # was 6.0 (insert wall)
standoff_boss_h = 7.5  # Rev C/D: boss z3..10.5 = 7.5 (raised seat); + tip 1.0 -> PCB bottom h16.5
standoff_tip_dia = 4.2
standoff_tip_h = 1.0
standoff_tip_bore = 2.4  # M2 clearance through tip
standoff_insert_hole = 3.2  # x 4.0 deep from boss top, M2 brass insert (PRIMARY)
standoff_pilot_fallback = 1.4  # x 5.0, M1.6 x 5 self-thread fallback
board_screw = 5.0  # M2 x 5 low-profile (engagement 2.9); originals M1.6x1.5 alignment-only
# NOTE (Rev C/D): the c-values below are the SUPERSEDED un-mirrored Rev B numbers. The script is
# authoritative: standoffs are mirrored (c = 82.82 - board_y) AND shifted +9.86 for cooler clearance.
# Current carrier-local (c, z): (117.38,148.40),(89.63,8.75),(88.53,230.90),(25.63,8.75),(20.83,230.40).
standoff1_z = 148.40
standoff1_c = 7.29
standoff2_z = 8.75
standoff2_c = 35.04
standoff3_z = 230.90
standoff3_c = 36.14
standoff4_z = 8.75
standoff4_c = 99.04
standoff5_z = 230.40
standoff5_c = 103.84
latch_beam_l = 24.0  # SIDEWAYS latch: root z32, tip forward, left plate edge
latch_beam_t = 1.8  # lateral (c 0-1.8), full plate height h 5-8
latch_relief_slot_w = 2.5  # c 1.8-4.3, z 6-32
latch_bump_proud = 1.5  # beyond plate edge, z 10-16; ramp 35deg / retention 75deg
latch_engagement = 1.25  # proud minus 0.25 clearance
latch_ride_deflection = 1.25  # strain 0.59 percent
latch_pocket_depth = 1.8  # into LEFT bay wall past groove root, z 10-16.5, h 5.0-8.4 (1.2 web)
latch_tab_z = -1.0  # release tab tip, through lip notch
holder_plate_t = 8.0
holder_total_w = 23.0  # was 20.0
holder_box_w = 15.0  # outboard, walls 3.0, internal 12.0 x 37.2 = 446 mm2
holder_box_left_z1 = 0.0  # left = intake plenum, front grille
holder_box_left_z2 = 160.0
holder_box_right_z1 = 60.0  # right = rear-exhaust duct (45deg prow z 45-60)
holder_box_right_z2 = 215.0  # open rear end; frees all 4 right-holder screws
holder_grille_slot_w = 3.0  # x 26 h, 5 slots, LEFT front face only (390 mm2)
holder_cb_dia = 6.0  # right holder cb x 4.0 from outside face
body_width_rear = 412.0  # Rev D: 400->412 (3x132 + 2x8 plates)
body_width_front = 442.0  # Rev D: 430->442 (3x132 + 2x23 holders); margin to 450.85 = 8.85
chassis_depth = 248.0  # +4 lip = 252 overall
board_plane_h = 16.5  # Rev C/D: raised seat; PCB bottom h16.5, PCB top h17.6
comp_top_h = 26.15  # Rev D: 24.15->26.15 (raised seat 16.5 + 1.1 PCB + 8.55 cooler)
headroom = 17.05  # Rev D: 19.05->17.05 (still > 0; panel 43.2 unchanged)
card_bottom_h = 9.1  # standard cards; Ethernet ~7.1 (REAR bays only)
plug_centerline_h = 18.4  # Rev D: 12.6->18.4. RAM-up USB-C aperture center = PCB-bottom(h16.5)+1.9. Carrier pills span h14.4..22.4. (Old script value h14.6 sat 1.9 BELOW the PCB -> the documented flaw.)
horizontal_hole_oversize = 0.2  # vertical oversize on all horizontal-axis holes in standing prints
elephant_chamfer = 0.5
brim_w = 10.0  # standing bay/holder prints (or draft shield)
```


# Open Questions
1. Board CAD verification (blocking before CAD): all board-derived dimensions came from unverifiable research data â€” validate against Framework's official mainboard drawing (FrameworkComputer/Framework-Laptop-13): standoff coordinates, card-bay footprints (note the apparent proximity of standoff 2 at c 35.04 to card bay 1 at c 37.5 â€” confirm card bodies clear the Ã˜7 bosses, adjust relief-pocket collars if not), fin span and 6.7 overhang, 8.55 cooler stack height, and the 4.45 card-face overhang past the PCB edge assumed in Rev B.
2. PCB mounting hole diameter: does it pass an M2 (Ã˜2.0) shank? If not, the M1.6 x 5 self-thread fallback becomes primary â€” confirm M2/M1.6 screw head Ã˜ â‰¤ 5.5 and height clearance against the board-top keepout.
3. SW1 power-button position (board X,Y) from CAD â€” decide whether to add the optional front poke channel/plunger, or rely solely on BIOS auto-power-on (documented as mandatory either way). Confirm SW3 chassis-intrusion behavior for standalone boards.
4. Ethernet expansion card exact envelope (38 deep, ~2 below standard bottom â€” community-sourced): confirm against a physical card; verify the rear opening and relief pocket accommodate it with the RJ45 latch operable.
5. Rear support bracket design (required for transportable racks): simple printed L-bracket to the rear band vs rack shelf â€” not yet detailed.
6. Bay-3 preheat: first bring-up should log per-board temps under sustained load; if bay 3 runs >10 C over bay 1, implement the yin-yang (alternating orientation) fallback or per-bay rear baffles.
7. Fit-coupon results gate final clearances: groove/tongue (0.15-0.30 sweep), M2 insert pull-out in the Ã˜3.2 boss pocket, sideways latch click force, and as-printed horizontal hole droop (validate the +0.2 oversize rule on the H2D).
8. CAD-level clash check of the right-holder top gusset (h 39.2-43.2) against the Ã˜6.0 counterbore at h 36 (0.2 nominal clearance as specified) â€” notch the gusset locally if the fillet/R5 blend intrudes.
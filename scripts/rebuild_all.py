# Framework 13 Mainboard 3-Bay 1U Rack — full rebuild script
# Run via Fusion 360 Scripts (or the Fusion MCP "execute" tool) in a NEW empty document.
# Switches the design to Direct Modeling and builds all 4 unique parts + the assembly.
# All dimensions in mm (converted to cm for the Fusion API via MM = 0.1).
#
# BASELINE: this is the ORIGINAL v5/v3 envelope (W_int 114, pitch 128, bay 128 wide).
#   Rev D (v4) widened bay+carrier (W_int 118, pitch 132) to swallow the cooler; that broke the fit
#   with the already-printed bays and was ABANDONED. Do NOT reintroduce Rev D's wider numbers.
# CARRIER FIX (2026-06-15): the cooler-up board's 7mm one-sided cooler overhang is cleared WITHIN the
#   unchanged carrier outer envelope by shifting every board-locating feature +SHIFT(6.84) in c to
#   center the 111.83 board+cooler envelope in the 114 interior (~1.09mm/side), and the USB-C
#   apertures are raised to local z-center UZC(14.6) = chassis h19.6 (~2mm above PCB top).
# THERMAL FIX (2026-07-05): the fin jet blows toward the bay's LEFT wall (board maps c = 82.82 -
#   board_y, the mirror of SPEC RevB section 0's stated handedness, proven by the as-built standoffs
#   + the user-measured 7mm cooler overhang on the low-c edge). SPEC section 6 routed airflow for the
#   mirror image, so the intake plenum sat in bay 1's hot exhaust jet. Fix = swap the two holders'
#   outboard boxes: LEFT holder now carries the rear-exhaust duct, RIGHT holder the front-intake
#   plenum. Attachment hardware, plates, ears, EIA slots and outer envelopes unchanged;
#   the right holder's two front screws (y25) get sealed tubes + O6 driver channels through the box.
# VENT RELOCATION (2026-07-05): the fin stack is NOT centered on the board long axis - measured from
#   the user's board photo (calibrated to the 226.9 edge) + the DXF fan arcs, fins span bay depth
#   y ~28..101 (front half, over the fan). The old vents (y85-155, from the SPEC's centered-cooler
#   assumption) faced only ~16mm of the 74mm fin stack. All 4 wall-vent cutouts (bay L/R, both holder
#   plates) moved to y31..105 (y25 screw row keeps a 3mm web; corbel roof now y102..105), and the
#   left holder's duct box/prow/cavity pulled forward (box y14..215, prow 14..29, cavity 31..215.5)
#   to receive the jet. Bay outer envelope unchanged, but already-printed bays have the old vent.
# Spec: ../design-docs/SPEC-RevB.md (sections 0/5/6 airflow handedness superseded by the note above)

import adsk.core, adsk.fusion, math, os

MM = 0.1
EXPORT_STL = False  # set True to re-export STLs
STL_DIR = r'C:\Users\exper\Documents\3d Prints\framework-1u-rack\stl'


def run(_context):
    app = adsk.core.Application.get()
    design = adsk.fusion.Design.cast(app.activeProduct)
    if design.designType != adsk.fusion.DesignTypes.DirectDesignType:
        design.designType = adsk.fusion.DesignTypes.DirectDesignType
    root = design.rootComponent
    tmp = adsk.fusion.TemporaryBRepManager.get()

    def P(x, y, z):
        return adsk.core.Point3D.create(x*MM, y*MM, z*MM)

    def V(x, y, z):
        return adsk.core.Vector3D.create(x, y, z)

    def box(x1, y1, z1, x2, y2, z2):
        cx, cy, cz = (x1+x2)/2, (y1+y2)/2, (z1+z2)/2
        ob = adsk.core.OrientedBoundingBox3D.create(P(cx, cy, cz), V(1, 0, 0), V(0, 1, 0),
                                                    abs(x2-x1)*MM, abs(y2-y1)*MM, abs(z2-z1)*MM)
        return tmp.createBox(ob)

    def rbox(center, ldir, wdir, l, w, h):
        ob = adsk.core.OrientedBoundingBox3D.create(P(*center), V(*ldir), V(*wdir), l*MM, w*MM, h*MM)
        return tmp.createBox(ob)

    def cyl(p1, p2, r):
        return tmp.createCylinderOrCone(P(*p1), r*MM, P(*p2), r*MM)

    def cylZ(cx, cy, z1, z2, r):
        return cyl((cx, cy, z1), (cx, cy, z2), r)

    def uni(t, tool):
        tmp.booleanOperation(t, tool, adsk.fusion.BooleanTypes.UnionBooleanType)

    def cut(t, tool):
        tmp.booleanOperation(t, tool, adsk.fusion.BooleanTypes.DifferenceBooleanType)

    def norm(v):
        m = math.sqrt(sum(c*c for c in v))
        return (v[0]/m, v[1]/m, v[2]/m)

    def cross(a, b):
        return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])

    def halfspace_cut(t, A, B, axis, size=500):
        # cut from t everything on the n-side of the plane containing line A->B and vector axis,
        # n = unit((B-A) x axis); A, B in mm
        d = norm((B[0]-A[0], B[1]-A[1], B[2]-A[2]))
        w = norm(axis)
        n = norm(cross(d, w))
        mid = ((A[0]+B[0])/2 + n[0]*size/2, (A[1]+B[1])/2 + n[1]*size/2, (A[2]+B[2])/2 + n[2]*size/2)
        ob = adsk.core.OrientedBoundingBox3D.create(P(*mid), V(*d), V(*w), size*2*MM, size*MM, size*MM)
        cut(t, tmp.createBox(ob))

    def add_comp(name, t):
        occ = root.occurrences.addNewComponent(adsk.core.Matrix3D.create())
        comp = occ.component
        comp.name = name
        body = comp.bRepBodies.add(t)
        body.name = name.lower()
        print(name, 'volume cm3: %.2f' % body.volume)
        return comp, occ

    s2 = 1/math.sqrt(2)

    # ============ CarrierTray (v5 baseline + 2026-06-15 recenter/USB-C fix) ============
    # local: x = c (0 at plate left edge), y = depth (lip -4..0, plate 0..240), z = 0 at plate bottom (chassis h5)
    # Board mounts in laptop orientation: RAM/SSD/cooler UP, expansion cards hang BELOW the PCB.
    # Seat raised to h16.5 (boss z3..10.5 + tip z10.5..11.5) so cards clear below.
    # FIX: board faces UP -> the cooler overhangs the fan/exhaust (low-c, +Y) PCB edge by ~7mm. To clear
    # it inside the UNCHANGED 114 interior, every board-locating feature is shifted +SHIFT in c (centers the
    # 111.83 board+cooler envelope -> ~1.09mm/side). USB-C apertures sit at local z-center UZC = chassis
    # h19.6 (~2mm above PCB top h17.6); the old h14.6 was for the abandoned board-down layout.
    SHIFT = 6.84
    UZC = 14.6
    t = box(0, 0, 0, 121.5, 240, 3)                      # plate (W_int 114; tongues = plate edges)
    uni(t, box(-2.75, -4, 0, 124.25, 0, 27))             # front lip (chassis h5..32)
    uni(t, box(52.75, -4, 27, 68.75, 0, 34.5))           # thumbscrew tab (h32..39.5), centered c60.75
    cut(t, cyl((60.75, -5, 31), (60.75, 1, 31), 1.7))    # thumbscrew hole O3.4 at h36
    # USB-C port openings: stadium/pill 14 x 8 (ends r4), on the mainboard receptacle axes.
    for cc in (26.11+SHIFT, 66.91+SHIFT):                # c 32.95 / 73.75 (board-base 26.11/66.91 + SHIFT)
        cut(t, box(cc-3, -5, UZC-4, cc+3, 1, UZC+4))
        cut(t, cyl((cc-3, -5, UZC), (cc-3, 1, UZC), 4))
        cut(t, cyl((cc+3, -5, UZC), (cc+3, 1, UZC), 4))
    cut(t, box(-1.25, -4.5, 0, 5.75, 0, 6))              # latch release notch (h5..11)
    for x1, x2 in ((12.0, 54.75), (60.75, 111.5)):       # lightweighting windows, 6mm ribs (left unshifted)
        for y1, y2 in ((37, 117), (123, 203)):
            cut(t, box(x1, y1, -0.5, x2, y2, 3.5))
    uni(t, cylZ(107.52+SHIFT, 148.40, 0, 3, 6))          # O12 island under interior standoff (r8->r6: clears plate edge after SHIFT)
    # standoffs, board-local holes -> base c = 82.82 - board_y; all shifted +SHIFT
    S = [(107.52, 148.40), (79.77, 8.75), (78.67, 230.90), (15.77, 8.75), (10.97, 230.40)]
    for sx, sy in S:
        uni(t, cylZ(sx+SHIFT, sy, 3, 10.5, 3.0))         # boss O6 x 7.5 (Framework dia, raised seat)
        uni(t, cylZ(sx+SHIFT, sy, 10.5, 11.5, 2.1))      # tip O4.2 x 1.0, seat = z11.5 (h16.5)
    for sx, sy in S:
        cut(t, cylZ(sx+SHIFT, sy, 6.5, 11.6, 0.85))      # O1.7 pilot: RetainerPeg press-fit OR M2x6 self-tap
    # lateral cage (screw-free board location), all shifted +SHIFT. Board outline after shift: c 11.83..116.66.
    uni(t, box(3.79+SHIFT, 118.5, 3, 4.79+SHIFT, 121.5, 12.8))     # left side nub (0.2 clearance)
    uni(t, box(110.02+SHIFT, 118.5, 3, 111.02+SHIFT, 121.5, 12.8)) # right side nub
    uni(t, box(44.4+SHIFT, 3.95, 3, 48.7+SHIFT, 5.95, 12.8))       # front stop (0.5 clearance)
    uni(t, box(44.4+SHIFT, 233.85, 3, 48.7+SHIFT, 235.85, 12.8))   # rear stop
    cut(t, box(1.8, 0, -0.5, 4.3, 32, 3.5))              # latch relief slot -> beam c0..1.8, root y32
    b = box(-1.5, 10, 0, 0, 16, 3)                       # latch bump, 1.5 proud
    halfspace_cut(b, (-1.5, 10.4, 0), (0, 10, 0), (0, 0, 1))   # 75deg retention face (front)
    halfspace_cut(b, (0, 16, 0), (-1.5, 13.86, 0), (0, 0, 1))  # 35deg insertion ramp (rear)
    uni(t, b)
    uni(t, box(0, -1, 0, 1.8, 0, 3))                     # release tab through lip notch
    halfspace_cut(t, (1.5, 240, 0), (0, 238.5, 0), (0, 0, 1))      # tongue rear chamfer L
    halfspace_cut(t, (121.5, 238.5, 0), (120, 240, 0), (0, 0, 1))  # tongue rear chamfer R
    carrier, carrier_occ = add_comp('CarrierTray', t)

    # ============ RetainerPeg ============
    # printed push-peg replacing the board screws: O4.2 head bears on the screw keepout annulus,
    # tapered shaft (O1.85 -> O1.55 over 4.6) press-fits ~3.0 deep into the standoff pilot through
    # the PCB hole. Print 5+ spares head-down. M2x6 self-tapping screws fit the same pilots.
    t = cylZ(0, 0, 0, 1.2, 2.1)
    sh = tmp.createCylinderOrCone(P(0, 0, 1.2), 0.925*MM, P(0, 0, 5.8), 0.775*MM)
    tmp.booleanOperation(t, sh, adsk.fusion.BooleanTypes.UnionBooleanType)
    peg, peg_occ = add_comp('RetainerPeg', t)

    # ============ BayModule (v5 baseline: bay_outer_w 128, pitch 128, right wall interior c121) ============
    # local: x 0..128 across, y 0..248 depth from front face, z 0..43.2 height
    t = box(0, 0, 0, 128, 248, 3)                        # floor
    uni(t, box(0, 0, 0, 7, 248, 43.2))                   # left wall
    uni(t, box(121, 0, 0, 128, 248, 43.2))               # right wall (interior face c121)
    uni(t, box(0, 0, 31, 128, 6, 43.2))                  # front header
    uni(t, box(56, 0, 31, 72, 9, 43.2))                  # header boss (thumbscrew insert), centered x64
    uni(t, box(52, 242, 31, 76, 248, 43.2))              # rear node
    uni(t, rbox((38, 211, 37.1), (s2, s2, 0), (-s2, s2, 0), 99, 8, 12.2))   # V-brace strap L
    uni(t, rbox((90, 211, 37.1), (-s2, s2, 0), (s2, s2, 0), 99, 8, 12.2))   # V-brace strap R
    cut(t, box(-40, 248, -10, 168, 268, 53))             # trim strap corners flush at y248
    cut(t, box(3, -1, 5, 7, 249, 8.4))                   # left rail groove
    cut(t, box(121, -1, 5, 125, 249, 8.4))               # right rail groove (interior face c121, root c125)
    for x1, x2 in ((3, 7), (121, 125)):                  # 2x45 groove entry flares
        w1 = box(x1, 0, 3, x2, 2, 5)
        halfspace_cut(w1, (x1, 0, 3), (x1, 2, 5), (1, 0, 0))
        cut(t, w1)
        w2 = box(x1, 0, 8.4, x2, 2, 10.4)
        halfspace_cut(w2, (x1, 2, 8.4), (x1, 0, 10.4), (1, 0, 0))
        cut(t, w2)
    cut(t, box(1.2, 10, 5, 3, 16.5, 8.4))                # latch pocket (LEFT wall)
    pw = box(1.2, 16.5, 5, 3, 18.3, 8.4)                 # 45deg chamfer on pocket rear face
    halfspace_cut(pw, (3, 18.3, 5), (1.2, 16.5, 5), (0, 0, 1))
    cut(t, pw)
    cut(t, box(-1, 31, 13, 8, 102, 31))                  # wall vent L on the fin jet (y31..105; rect body, top corbelled below)
    ventL = box(-1, 102, 13, 8, 105, 31)                 # 45deg roof: 18->12mm lintel, self-supporting in the y-up print
    halfspace_cut(ventL, (0, 102, 13), (0, 105, 16), (1, 0, 0))   # lower ramp
    halfspace_cut(ventL, (0, 105, 28), (0, 102, 31), (1, 0, 0))   # upper ramp
    cut(t, ventL)
    cut(t, box(120, 31, 13, 129, 102, 31))               # wall vent R (rect body; top corbelled below)
    ventR = box(120, 102, 13, 129, 105, 31)
    halfspace_cut(ventR, (120, 102, 13), (120, 105, 16), (1, 0, 0))
    halfspace_cut(ventR, (120, 105, 28), (120, 102, 31), (1, 0, 0))
    cut(t, ventR)
    cut(t, box(15, -1, 34, 55, 6.5, 40))                 # header intake slot 1 (about x64 tab)
    cut(t, box(73, -1, 34, 113, 6.5, 40))                # header intake slot 2
    cut(t, cyl((64, -1, 36), (64, 6.7, 36), 2.0))        # thumbscrew insert hole O4.0 x 6.7, x64
    for y, z in [(25, 18), (220, 18), (25, 36), (220, 36)]:
        cut(t, cyl((121.8, y, z), (128.5, y, z), 2.0))   # right wall: M3 insert O4.0 x 6.2
        cut(t, cyl((-0.5, y, z), (7.5, y, z), 1.7))      # left wall: O3.4 through
        cut(t, cyl((4, y, z), (7.5, y, z), 3.0))         # cb O6.0 x 3.0 from interior
    for y, z in [(12, 38), (190, 38)]:                   # dowel sockets O3.15 x 4.2 both faces
        cut(t, cyl((-0.5, y, z), (4.2, y, z), 1.575))
        cut(t, cyl((123.8, y, z), (128.5, y, z), 1.575))  # right-wall dowel socket
    cut(t, box(19, 242, -0.5, 23, 246, 3.5))             # zip-tie slot
    cut(t, box(105, 242, -0.5, 109, 246, 3.5))           # zip-tie slot
    bay, bay_occ = add_comp('BayModule', t)

    # ============ SideHolderLeft (REAR-exhaust duct + ear; thermal fix 2026-07-05) ============
    # local: x0 = inner face against bay1; plate x -8..0; box x -23..-8; blade to -49.3
    # The fin jets blow LEFT and sit at y28..101, so bay 1's jet exits here: duct y14-215, open rear end, no grille.
    t = box(-8, 0, 0, 0, 248, 43.2)                      # plate
    uni(t, box(-49.3, 0, 0, -8, 6, 43.2))                # front panel + ear blade (span 26.3 + box cover)
    bx = box(-23, 14, 0, -8, 215, 43.2)                  # duct box (front edge behind the panel, prow-supported)
    halfspace_cut(bx, (-23, 29, 0), (-8, 14, 0), (0, 0, 1))  # 45deg prow
    uni(t, bx)
    cut(t, box(-20, 31, 3, -8, 215.5, 40.2))             # cavity 12 x 37.2, open rear end
    cut(t, box(-8.5, 31, 13, 0.5, 102, 31))   # rect body; top corbelled below
    vcL = box(-8.5, 102, 13, 0.5, 105, 31)     # matching 45deg roof -> 12mm lintel
    halfspace_cut(vcL, (0, 102, 13), (0, 105, 16), (1, 0, 0))
    halfspace_cut(vcL, (0, 105, 28), (0, 102, 31), (1, 0, 0))
    cut(t, vcL)                  # plate cutout = bay-1 wall vent (feeds the duct)
    for z1, z2 in ((0, 5), (39.2, 43.2)):                # gussets blade->plate
        g = box(-33, 6, z1, -8, 31, z2)
        halfspace_cut(g, (-8, 31, z1), (-33, 6, z1), (0, 0, 1))
        uni(t, g)
    for zc in (5.725, 21.6, 37.475):                     # EIA ear slots 10x7 (u=-232.55, holder at world -192)
        cut(t, box(-45.55, -0.5, zc-3.5, -35.55, 6.5, zc+3.5))
    for y, z in [(25, 18), (220, 18), (25, 36), (220, 36)]:
        cut(t, cyl((0.5, y, z), (-6.7, y, z), 2.0))      # M3 inserts O4.0 x 6.7 inner face
    for y, z in [(12, 38), (190, 38)]:
        cut(t, cyl((0.5, y, z), (-4.2, y, z), 1.575))    # dowel sockets
    holderL, holderL_occ = add_comp('SideHolderLeft', t)

    # ============ SideHolderRight (front-intake plenum + ear; thermal fix 2026-07-05) ============
    # local: x0 = inner face against bay3; plate x 0..8; box x 8..23; blade to 49.3
    # Fresh cold-aisle air enters the grille and feeds bay 3's right vent (makeup air for the fin jet).
    t = box(0, 0, 0, 8, 248, 43.2)                       # plate
    uni(t, box(8, 0, 0, 23, 160, 43.2))                  # plenum box
    cut(t, box(8, 3, 3, 20, 157, 40.2))                  # cavity 12 x 37.2
    for x1, x2 in ((8.75, 11.75), (12.5, 15.5), (16.25, 19.25)):
        cut(t, box(x1, -0.5, 8.6, x2, 3.5, 34.6))        # front grille 3x (3 x 26)
    for y1, y2 in ((6, 9), (14, 17)):
        cut(t, box(19.5, y1, 8.6, 23.5, y2, 34.6))       # outboard slots 2x (3 x 26)
    cut(t, box(-0.5, 31, 13, 8.5, 102, 31))   # rect body; top corbelled below
    vcR = box(-0.5, 102, 13, 8.5, 105, 31)     # matching 45deg roof -> 12mm lintel
    halfspace_cut(vcR, (0, 102, 13), (0, 105, 16), (1, 0, 0))
    halfspace_cut(vcR, (0, 105, 28), (0, 102, 31), (1, 0, 0))
    cut(t, vcR)                  # plate cutout = bay-3 wall vent
    uni(t, box(23, 0, 0, 49.3, 6, 43.2))                 # ear blade (v5 outer 49.3)
    for z1, z2 in ((0, 5), (39.2, 43.2)):                # gussets blade->box
        g = box(23, 6, z1, 49.3, 31, z2)
        halfspace_cut(g, (49.3, 6, z1), (23, 31, z1), (0, 0, 1))
        uni(t, g)
    for z in (18, 36):                                   # sealed screw tubes through the plenum at y25
        uni(t, cyl((8, 25, z), (23, 25, z), 5))          # O10 tube (2.0 wall around the channel)
    for zc in (5.725, 21.6, 37.475):                     # EIA ear slots 10x7 (u=+232.55, holder at world 192)
        cut(t, box(35.55, -0.5, zc-3.5, 45.55, 6.5, zc+3.5))
    for y, z in [(25, 18), (220, 18), (25, 36), (220, 36)]:
        cut(t, cyl((-0.5, y, z), (8.5, y, z), 1.7))      # O3.4 through
        if y == 25:                                      # plenum covers these: O6 head+driver channel
            cut(t, cyl((4, y, z), (23.5, y, z), 3.0))    # to the outboard face (grip 4.0 unchanged)
        else:
            cut(t, cyl((4, y, z), (8.6, y, z), 3.0))     # cb O6.0 x 4.0 from outside
    for y, z in [(12, 38), (190, 38)]:
        cut(t, cyl((-0.5, y, z), (4.2, y, z), 1.575))
    holderR, holderR_occ = add_comp('SideHolderRight', t)

    # ============ Assembly (v5: pitch 128) ============
    def trans(x, y, z):
        m = adsk.core.Matrix3D.create()
        m.translation = adsk.core.Vector3D.create(x*MM, y*MM, z*MM)
        return m

    root.occurrences.addExistingComponent(bay, adsk.core.Matrix3D.create())
    root.occurrences.addExistingComponent(bay, adsk.core.Matrix3D.create())
    root.occurrences.addExistingComponent(carrier, adsk.core.Matrix3D.create())
    root.occurrences.addExistingComponent(carrier, adsk.core.Matrix3D.create())
    targets = {
        'BayModule': [(-192, 0, 0), (-64, 0, 0), (64, 0, 0)],          # pitch 128
        'CarrierTray': [(-188.75, 0, 5), (-60.75, 0, 5), (67.25, 0, 5)],
        'SideHolderLeft': [(-192, 0, 0)],
        'SideHolderRight': [(192, 0, 0)],
        'RetainerPeg': [(250, 0, 0)],
    }
    byname = {}
    for occ in root.occurrences:
        byname.setdefault(occ.component.name, []).append(occ)
    for name, poss in targets.items():
        for occ, pos in zip(byname[name], poss):
            occ.transform = trans(*pos)

    if EXPORT_STL:
        os.makedirs(STL_DIR, exist_ok=True)
        em = design.exportManager
        for c in (carrier, bay, holderL, holderR, peg):
            opts = em.createSTLExportOptions(c, os.path.join(STL_DIR, c.name + '.stl'))
            opts.meshRefinement = adsk.fusion.MeshRefinementSettings.MeshRefinementHigh
            em.execute(opts)

    app.activeViewport.fit()
    print('done')

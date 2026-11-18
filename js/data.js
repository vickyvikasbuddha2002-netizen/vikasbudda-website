/* Site content. Edit here to update the site. */
window.DATA = {
 "practice": [
  {
   "title": "Gear speed reduction",
   "tool": "Siemens NX",
   "sub": "Assembly",
   "model": "assets/gear-speed-reduction.glb"
  },
  {
   "title": "Gate valve",
   "tool": "SolidWorks 2025",
   "sub": "Part and assembly",
   "model": "assets/gate-valve-design.glb"
  },
  {
   "title": "2-pin right-angle PCB connector",
   "tool": "Molex KK 396 inspired",
   "sub": "2 circuits, tin plated",
   "model": "assets/molex-inspired-connector.glb"
  },
  {
   "title": "Pin and socket receptacle housing",
   "tool": "Molex inspired",
   "sub": "1.57 mm pins, 2 circuits",
   "model": "assets/molex-inspired-connector-housing.gltf"
  },
  {
   "title": "12-circuit plug housing",
   "tool": "Molex inspired",
   "sub": "1.57 mm pins, 12 circuits",
   "model": "assets/molex-inspired-pin-and-socket-plug-housing.gltf"
  },
  {
   "title": "CAD across three tools",
   "tool": "NX, CATIA V5, SolidWorks",
   "sub": "Snapshots, PDF",
   "doc": "assets/cad-modelling-softwares.pdf"
  }
 ],
 "certs": [
  {
   "title": "Certified SolidWorks Associate (CSWA)",
   "issuer": "Dassault Systèmes",
   "date": "Nov 2025",
   "file": "assets/certified-solidworks-associate-cswa.pdf"
  },
  {
   "title": "SolidWorks",
   "issuer": "Guvi",
   "date": "Nov 2025",
   "file": "assets/solidworks-certifications.png"
  },
  {
   "title": "Python Essentials",
   "issuer": "Cisco Networking Academy",
   "date": "Dec 2023"
  },
  {
   "title": "AutoCAD",
   "issuer": "IGIAT",
   "date": "May 2017"
  }
 ],
 "notes": [
  {
   "id": "a1f0c2d4e6b80011",
   "title": "What a datum reference frame is actually doing",
   "topic": "GD&T",
   "summary": "Datums are not labels you sprinkle on a drawing. A, B and C are an instruction for how the part is held, and the order changes the measurement.",
   "body": "A datum reference frame does one job: it takes a part that can move six ways in space and pins all six down, in a stated order. Everything measured afterwards is measured from that arrangement.\n\n[fig:dof]\n\n## The 3-2-1 rule\n\nA rigid part has six degrees of freedom: three translations and three rotations.\n\n- The primary datum, usually a plane, takes three: one translation and two rotations. Think three points of contact.\n- The secondary takes two more: one translation and one rotation. Two points.\n- The tertiary takes the last one. One point.\n\nThree, then two, then one. That is the whole idea, and it maps directly onto how a fixture actually holds the part.\n\n## Order is the part most people skip\n\n`A B C` and `B A C` are different instructions. In the first, the part seats flat on A and then slides against B. In the second it seats on B first, and the flatness of A no longer governs how it sits.\n\nChange the order and you change which surface absorbs the rocking, which changes the numbers a CMM reports. Two inspectors following two different orders will disagree, and both will be right.\n\nSo the order should match reality: seat the part the way the fixture holds it, and the way the assembly locates it.\n\n## Choosing datum features\n\nPick features that are:\n\n- **Functional.** The surface that mates in the assembly, not the one that is convenient to touch.\n- **Accessible.** If the inspector cannot reach it with the part in that orientation, the scheme fails on the shop floor.\n- **Large and stable.** A wide flat face makes a better primary than a narrow edge, because small features amplify rocking into angular error.\n\n## Common mistakes\n\n- **Over-datuming.** Calling out A, B and C when the feature only needs A and B. Every extra reference tightens the part for no functional reason.\n- **Datums on the wrong side of the tolerance chain.** If your datum is three features away from the mating surface, you are stacking tolerance you did not have to.\n- **Reusing a scheme from another part.** The scheme belongs to the function, not to the drawing template.\n\nA good check before you release: can you describe, in one sentence, how a machinist would hold this part to make the datums real? If you cannot, the frame is not finished.",
   "readTime": "5 min",
   "createdAt": "2026-02-11T09:00:00+00:00"
  },
  {
   "id": "b2e1d3c5f7a90022",
   "title": "Why ± on a hole location quietly costs you 57%",
   "topic": "GD&T",
   "summary": "±0.005 in X and Y gives you a square tolerance zone. Position gives you a round one. Same limits, more usable area, and it matches how the hole is actually gauged.",
   "body": "Coordinate tolerancing a hole, ±0.005 in X and ±0.005 in Y, produces a square zone 0.010 across. The hole centre is accepted anywhere inside that square.\n\nThe trouble is that the square has no functional meaning. A bolt does not care whether the error was in X or in Y. It cares about total radial deviation, which is round.\n\n[fig:position-zone]\n\n## Where the 57% comes from\n\nThe corners of that square sit 0.00707 from the centre, half the diagonal. A part with the hole at the corner is accepted. So the real limit you are already living with is a circle of ⌀0.0141.\n\n- Square zone area: 0.010 × 0.010 = 0.000100 in²\n- Cylindrical zone of the same diagonal: 0.000157 in²\n\nThat is 57% more area, describing exactly the same functional limit. Parts you were scrapping under coordinate tolerancing are parts that would have assembled perfectly.\n\n## What changes on the drawing\n\nReplace the ± dimensions with basic dimensions, boxed and untoleranced, locating the theoretically exact position, then a feature control frame:\n\n`⌀0.014 Ⓜ | A | B | C`\n\nThe basic dimensions carry no tolerance because all the tolerance now lives in the frame. This is also why you should not double up: a basic dimension with a ± beside it is a contradiction, and inspection will pick a side.\n\n## The second win\n\nPosition uses a datum reference frame, so the tolerance is now stated relative to how the part is held. Coordinate dimensions leave that ambiguous. Measured from which edge, seated which way?\n\nAnd once you write position, the Ⓜ modifier becomes available, which hands back more tolerance again as the hole grows. That is a separate note.\n\n## When ± is still fine\n\nCoordinate tolerancing is not wrong everywhere. For a non-critical clearance slot, a cosmetic cutout, or a stock item you are not gauging, ± is faster to read and nobody is measuring it anyway. Save position for features that locate something.",
   "readTime": "4 min",
   "createdAt": "2026-03-04T09:00:00+00:00"
  },
  {
   "id": "c3d2e4f6a8b10033",
   "title": "Bonus tolerance: free tolerance most drawings never claim",
   "topic": "GD&T",
   "summary": "The Ⓜ modifier means the tolerance zone grows as the hole grows. It is already yours under the standard. It just has to be written down.",
   "body": "Put the maximum material condition modifier, Ⓜ, after a position tolerance on a feature of size, and the tolerance stops being fixed. It grows by exactly however much the feature departs from its maximum material condition.\n\n[fig:mmc]\n\n## The arithmetic\n\nA hole specified ⌀6.0 – 6.2 with position ⌀0.2 Ⓜ to A B C:\n\n- At ⌀6.00, which is MMC (most material, smallest hole), the zone is ⌀0.20.\n- At ⌀6.10 the zone is ⌀0.30. Bonus of 0.10.\n- At ⌀6.20 (LMC) the zone is ⌀0.40. Bonus of 0.20.\n\nBonus = actual mating size − MMC size. Nothing more complicated than that.\n\n## Why it is legitimate, not a loophole\n\nThe reason a bolt fits is clearance. A bigger hole gives more clearance, which tolerates more positional error while still assembling. The standard is simply letting the tolerance follow the physics instead of pretending the worst case applies to every part.\n\nThe fixed boundary this creates is the virtual condition:\n\n`VC = MMC size − position tolerance = 6.0 − 0.2 = 5.8`\n\nEvery acceptable part clears a ⌀5.8 pin at true position. That is why a functional gauge works: one hardened pin, pass or fail, no CMM time.\n\n## When not to use it\n\n- **Not on a plane or a surface.** Ⓜ applies to features of size: holes, pins, slots, tabs. A flat face has no size to depart from.\n- **Not when the fit is a press or a bearing seat.** There the hole size itself is doing the locating work, and you do not want the location wandering as the size changes. Leave it regardless of feature size.\n- **Not on aligned features** where the relationship matters more than assembly clearance, like a dowel pair setting orientation.\n\n## The practical part\n\nIf you are inspecting to a drawing that says ⌀0.2 with no modifier, you cannot claim bonus. The drawing means what it says. This has to be decided at design time. Ask on every clearance hole: is this holding a fastener, or is it locating something? If it is holding a fastener, Ⓜ almost always belongs there.",
   "readTime": "5 min",
   "createdAt": "2026-03-26T09:00:00+00:00"
  },
  {
   "id": "d4c3f5a7b9c20044",
   "title": "Flat patterns: bend allowance and why A + B is wrong",
   "topic": "Sheet metal",
   "summary": "Metal stretches on the outside of a bend and compresses on the inside. The flat blank is shorter than the sum of the legs, and the K-factor is what tells you by how much.",
   "body": "Fold a strip of sheet and the outside surface has further to travel than the inside. Somewhere between them is a layer that neither stretches nor compresses. That is the neutral axis. Its length is the length of your flat blank.\n\n[fig:bend]\n\n## The formula\n\n`BA = (π / 180) × A × (R + K·T)`\n\n- **A** = bend angle in degrees, the angle the material is bent *through*, not the included angle\n- **R** = inside bend radius\n- **T** = material thickness\n- **K** = the K-factor, where the neutral axis sits as a fraction of thickness\n\nFlat length = leg + leg + BA, where legs are measured to the bend tangent lines.\n\n## What the K-factor really is\n\nThe neutral axis starts near the middle and migrates toward the inside of the bend as the bend gets tighter. So K is not a constant of the material alone.\n\n- Roughly 0.33 for tight bends where R is small relative to T\n- Around 0.44 for mild steel with R ≈ T, the number most shops start from\n- Approaching 0.50 for generous radii in soft material\n\nGet the real number from the shop that will bend it. Their tooling, their press, their K-factor. A table off the internet gets you a first flat pattern; a test bend gets you a correct one.\n\n## Bend deduction, if that is what your shop uses\n\nSome shops work from outside dimensions instead:\n\n`BD = 2 × OSSB − BA`, where `OSSB = (R + T) × tan(A / 2)`\n\nThen flat = outside leg + outside leg − BD. Same physics, different bookkeeping. Use whichever your supplier quotes in, and say which one you used on the drawing.\n\n## Things that ruin a good flat pattern\n\n- **Bend radius below the material minimum.** The outer fibre cracks. As a starting point, keep R ≥ T for soft aluminium and more for tempered grades. Check the alloy.\n- **Bending across the grain direction.** Rolled sheet cracks more readily when the bend line runs along the grain. On critical parts, call the grain direction out.\n- **Holes too close to the bend.** A hole inside the deformation zone distorts into an oval. Keep at least 2.5 × T plus the radius from the bend line, or add a relief.\n- **Trusting the CAD default.** SolidWorks, NX and CATIA all ship with a default K. It is a guess until someone at the press confirms it.",
   "readTime": "6 min",
   "createdAt": "2026-04-15T09:00:00+00:00"
  },
  {
   "id": "e5b4a6c8d0e30055",
   "title": "ECR and ECO: what actually moves between them",
   "topic": "PLM",
   "summary": "A change request asks a question. A change order answers it with parts, revisions and a date it starts. Most delays live in the gap between the two.",
   "body": "Change control looks like bureaucracy until the first time a supplier builds 400 parts to a superseded revision. The paperwork exists to answer one question: from which unit does the new design apply?\n\n[fig:eco]\n\n## The request\n\nAn ECR states a problem, not a solution. A good one contains:\n\n- What is wrong, with evidence: a failure, a fit issue, a supplier constraint, a cost target\n- Which part numbers and revisions are affected\n- What happens if nothing changes\n- A proposed direction, clearly marked as proposed\n\nIf an ECR arrives already containing the redesign, the review is being skipped.\n\n## The review\n\nSomeone, whether a board, a lead or a meeting, decides whether the change is worth its cost. That cost is rarely the CAD work. It is retooling, requalification, obsolete stock, documentation, and the test campaign the change invalidates.\n\nThe review's output is a decision, and it is allowed to be no.\n\n## The order\n\nAn ECO is the instruction. It has to say:\n\n- Exactly which items change, from which revision to which\n- What happens to material already in stock and in transit: use as is, rework, or scrap\n- Effectivity: the date or serial number where the change begins\n- What downstream documents follow: drawings, data sheets, work instructions, service manuals\n\nEffectivity is the field people leave vague, and it is the one that costs money. \"Immediately\" means different things to a machine shop with a queue and a warehouse with 6,000 pieces on a shelf.\n\n## Practical habits\n\n- **One problem per ECR.** Bundled changes get held up by the weakest item in the bundle.\n- **Write the reason in the record, not in an email.** Two years later, the record is all anyone can find.\n- **Check where else the part is used** before releasing. A shared bracket on four assemblies means four qualification questions, not one.\n- **Close the loop.** An ECO with no confirmation that drawings, BOM and data sheets were actually updated is an open change wearing a closed label.",
   "readTime": "5 min",
   "createdAt": "2026-05-06T09:00:00+00:00"
  },
  {
   "id": "f6a5b7c9e1f40066",
   "title": "EBOM, MBOM, and where the design BOM sits",
   "topic": "PLM",
   "summary": "The same product has two legitimate structures: one for how it is designed, one for how it is built. Confusing them is where the shortages come from.",
   "body": "Ask engineering for the bill of materials and you get a functional tree. Ask manufacturing and you get a different one. Neither is wrong.\n\n[fig:bom]\n\n## EBOM, how it is designed\n\nThe engineering BOM comes out of CAD. It mirrors the assembly structure: housing, cover, seal, fastener kit. It is organised by function, because that is how the product was thought about.\n\nIt generally does not contain adhesive by the gram, packaging, or the fact that two parts get pressed together at station 1 before anything else happens.\n\n## MBOM, how it is built\n\nThe manufacturing BOM reorganises the same product into the order it is assembled, and adds everything the process consumes:\n\n- Consumables: adhesive, thread lock, lubricant, solder\n- Packaging and labels\n- Sub-assemblies that exist only as work-in-progress\n- Loose-issue hardware that gets picked as a kit\n- Process aids and phantom levels used for scheduling\n\nAn MBOM built by hand from an EBOM in a spreadsheet is a shortage waiting to happen, because nothing ties the two together when a revision moves.\n\n## Where the design BOM fits\n\nThe design BOM is the structure that gets released from CAD into PLM. It is the controlled version of the EBOM, with part numbers, revisions and states attached. It is the handover point. Everything downstream, including the MBOM, references it.\n\nThat is why it matters that it is released rather than exported. An exported list is a photograph. A released structure is a link that stays connected when the next ECO lands.\n\n## Where things go wrong\n\n- **A part number that means two things.** The same number reused for a slightly different part, with the difference living only in someone's memory.\n- **Quantities carried as text.** \"2 (see note)\" cannot be planned against.\n- **Phantom levels that are invisible to engineering.** Manufacturing adds structure for scheduling, then engineering changes the design underneath it.\n- **Substitutes recorded nowhere.** If purchasing has been quietly buying an alternate resistor for a year, the BOM is fiction.\n\nThe test for a healthy structure: change one part's revision and see how many people have to be told by hand. The answer should be zero.",
   "readTime": "5 min",
   "createdAt": "2026-05-28T09:00:00+00:00"
  },
  {
   "id": "a7b6c8d0e2a50077",
   "title": "Threads and clearance holes: numbers worth memorising",
   "topic": "Design",
   "summary": "Tap drill, engagement depth and clearance hole class. Three small decisions that decide whether a joint holds or strips.",
   "body": "Most fastener problems are not analysis problems. They are three numbers nobody looked up.\n\n[fig:thread]\n\n## Tap drill\n\nFor ISO metric coarse threads, the practical starting point is:\n\n`tap drill ≈ D − pitch`\n\nM6 × 1.0 → 5.0 mm. M8 × 1.25 → 6.8 mm. M4 × 0.7 → 3.3 mm. This gives roughly 75% thread engagement, which is where the strength curve has already flattened. Chasing 100% costs tap life and gains almost nothing.\n\n## Engagement depth\n\nThe goal is simple: the screw should fail before the threads in the part strip.\n\n- Steel into steel, about 1 × D\n- Cast iron and brass, about 1.5 × D\n- Aluminium, 1.5 to 2 × D\n- Plastic, use an insert or design for a self-tapping screw properly\n\nAdd a couple of pitches beyond the usable depth for chip clearance in a blind hole, and remember the first thread or two rarely carries load.\n\n## Clearance holes (ISO 273)\n\n| Screw | Close | Medium | Free |\n|---|---|---|---|\n| M3 | 3.2 | 3.4 | 3.6 |\n| M4 | 4.3 | 4.5 | 4.8 |\n| M5 | 5.3 | 5.5 | 5.8 |\n| M6 | 6.4 | 6.6 | 7.0 |\n| M8 | 8.4 | 9.0 | 10.0 |\n| M10 | 10.5 | 11.0 | 12.0 |\n\nMedium is the sensible default. Close only where you genuinely control position, because it is the class that turns a position tolerance problem into an assembly problem. Free is for sheet metal stacks and weldments where things move.\n\n## Small habits that prevent rework\n\n- **Never tap into a blind hole without checking drill point depth.** The cone at the bottom is not usable thread.\n- **Countersink or chamfer every tapped hole.** It removes the raised lip from tapping and stops the first thread being damaged.\n- **Do not thread thin sheet.** Under about 1.5 × pitch of material there is nothing to hold. Use a nut, a rivet nut, or a clinch fastener.\n- **Watch edge distance.** Roughly 2 × D from hole centre to edge, more in castings.",
   "readTime": "4 min",
   "createdAt": "2026-06-17T09:00:00+00:00"
  },
  {
   "id": "b8c7d9e1f3b60088",
   "title": "Print orientation decides whether the part survives",
   "topic": "Prototyping",
   "summary": "A printed part is not isotropic. The same geometry, rotated 90°, can be twice as strong or half as strong, before you touch a single setting.",
   "body": "Fused filament parts are stacks of welded lines. Within a layer the material is nearly solid. Between layers it is a weld, and that weld is commonly around half as strong as the material either side of it.\n\nThat single fact decides most orientation choices.\n\n[fig:layers]\n\n## Orient against the load\n\nFind the direction the part is loaded in, then rotate so the layers run along the load rather than across it. A bracket that hangs from a bolt hole wants the layers running down the arm, not stacked across it.\n\nIf a part has to be strong in two directions, that is usually a sign it should be printed in two pieces and joined, or made another way.\n\n## Holes come out undersize\n\nA printed hole is almost always tight:\n\n- The nozzle path is compensated on the outside of a curve, not the inside\n- The first layer squashes outward, the elephant's foot\n- Bridging over the top of a hole sags a little\n\nPractical fix: model functional holes 0.1 to 0.2 mm oversize, or leave them undersize on purpose and drill them out. For a press-fit bearing seat, drilling is more repeatable than printing.\n\n## Overhangs and the 45° habit\n\nAnything overhanging more than about 45° from vertical needs support. Designing to that angle instead of fighting it means:\n\n- Chamfer the bottom of a boss instead of filleting it\n- Turn a horizontal hole into a teardrop or a hexagon so the top self-bridges\n- Split the part at a natural face rather than supporting a large internal cavity\n\nSupport removal leaves the worst surface on the part. Choose which surface pays that price rather than letting the slicer choose for you.\n\n## Settings that actually matter for function\n\n- **Walls before infill.** Three or four perimeters carry far more than raising infill from 20% to 50%.\n- **Higher temperature improves layer bonding**, often more than any other single change to strength across layers.\n- **Slower cooling on small parts**, which otherwise never fuse properly between layers.\n- **Round the internal corners.** A sharp internal corner in a printed part is a crack starter, exactly like in a machined one.",
   "readTime": "5 min",
   "createdAt": "2026-07-08T09:00:00+00:00"
  },
  {
   "id": "c9d8e0f2a4c70099",
   "title": "A drawing checklist before it leaves your desk",
   "topic": "Documentation",
   "summary": "The last ten minutes before release catch most of the errors that otherwise come back as a change order weeks later.",
   "body": "Every returned drawing I have seen failed on something small and checkable. This is the pass I run before anything is released.\n\n## The title block\n\n- Part number and revision match the model and the PLM record\n- Material and specification are stated, including temper or grade\n- Surface finish and treatment are called out, with the masking areas defined\n- Scale, units and projection symbol are correct. First angle and third angle drawings look identical until they don't\n- Drawn by, checked by, date\n\n## Dimensions\n\n- Every feature is dimensioned once. Twice is a contradiction, not a courtesy.\n- No dimensions to hidden lines or to construction geometry\n- Tolerance stack checked in the direction that matters. Add the worst cases and see whether the part still fits\n- Basic dimensions are boxed and carry no ± anywhere\n- Nothing is dimensioned that the process controls anyway\n\n## GD&T\n\n- Every feature control frame references a complete datum reference frame\n- Datums map to how the part is actually held\n- Modifiers are deliberate: Ⓜ on clearance features, nothing on locating features\n- Tolerances are the loosest the function allows. Tight tolerances are a cost decision, so make it consciously.\n\n## Views and readability\n\n- Section and detail views are labelled and appear in the right place\n- Text does not overlap geometry at print size. Check the actual sheet size, not the screen\n- Line weights distinguish visible, hidden and centre lines\n- The drawing prints legibly in black and white, because that is how it reaches the floor\n\n## Data and release\n\n- The BOM balloons match the assembly structure item for item\n- Related documents are identified: data sheets, test reports, work instructions\n- The file is released, not just saved\n- The previous revision is superseded properly, with the change recorded against a change order\n\nPrint it and read it as if you had never seen the part. Everything you have to reconstruct from memory is something a machinist will have to guess.",
   "readTime": "4 min",
   "createdAt": "2026-07-24T09:00:00+00:00"
  }
 ]
};

/* Roam build log. Newest status at the bottom. status: done, now, next */
window.DATA.roamlog = [
  { "status": "done", "title": "Character and behaviours", "text": "37 behaviours planned, from patting to sulking, plus its own sound language, Roamish." },
  { "status": "done", "title": "Industrial design", "text": "A seamless white shell with no visible screws, modelled in CAD." },
  { "status": "done", "title": "Face and moods", "text": "Eye animations for 12 moods, prototyped first right here on this site." },
  { "status": "now", "title": "Electronics", "text": "Every part chosen and ordered. Soldering and first power-on come next." },
  { "status": "next", "title": "First assembly and drive test", "text": "Print the shell, put it together and make it roll across a desk on its own." },
  { "status": "next", "title": "Learning over time", "text": "Teach it to remember routines and slowly grow its own personality." }
];

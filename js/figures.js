/* Animated diagrams used inside notes. Markup authored here only. */
window.FIGS = (function () {
    return {

        'dof': {
            caption: ['Datum reference frame', 'primary seats 3 · secondary 2 · tertiary 1'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="A part seating against three datum features">
  <line class="ln-2" x1="70" y1="200" x2="560" y2="200"/>
  <g class="ln">${Array.from({length:17},(_,i)=>`<line x1="${74+i*30}" y1="200" x2="${64+i*30}" y2="212"/>`).join('')}</g>
  <line class="ln-2" x1="120" y1="40" x2="120" y2="200"/>
  <g class="ln">${Array.from({length:6},(_,i)=>`<line x1="120" y1="${50+i*26}" x2="108" y2="${40+i*26}"/>`).join('')}</g>

  <g class="seatB"><g class="seatA">
    <rect class="fillp ln-2" x="140" y="80" width="230" height="120"/>
    <circle class="acc" cx="255" cy="140" r="26"/>
    <line class="acc dash" x1="255" y1="105" x2="255" y2="175"/>
    <line class="acc dash" x1="220" y1="140" x2="290" y2="140"/>
  </g></g>

  <g class="seatC">
    <line class="acc dash" x1="255" y1="60" x2="255" y2="86"/>
    <text class="hi" x="262" y="66">C locks the last rotation</text>
  </g>

  <rect class="ln fillp" x="300" y="212" width="18" height="16"/>
  <text class="ink" x="306" y="224">A</text>
  <text x="326" y="224">primary: 1 translation + 2 rotations</text>

  <rect class="ln fillp" x="76" y="46" width="18" height="16"/>
  <text class="ink" x="82" y="58">B</text>
  <text x="404" y="100">B secondary: 1 translation + 1 rotation</text>
  <text x="404" y="118">A + B + C = all 6 degrees of freedom</text>
  <text class="hi" x="404" y="146">Order is not decoration.</text>
  <text x="404" y="164">It is the order the part is held in</text>
  <text x="404" y="182">on the fixture and on the CMM.</text>
</svg>`
        },

        'position-zone': {
            caption: ['Square zone vs cylindrical zone', '+57% usable area, same limits'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="A square tolerance zone compared with a cylindrical tolerance zone">
  <text class="ink" x="60" y="34">±0.005 IN X AND Y</text>
  <text class="ink" x="380" y="34">POSITION ⌀0.014</text>

  <rect class="ln dash" x="90" y="70" width="120" height="120"/>
  <circle class="accf" cx="150" cy="130" r="3"/>
  <line class="ln" x1="90" y1="205" x2="210" y2="205"/>
  <text x="112" y="222">0.010 SQUARE</text>
  <text x="90" y="243">Area 0.000100 in²</text>

  <g>
    <circle class="ghost" cx="470" cy="130" r="85"/>
    <rect class="fillp" x="410" y="70" width="120" height="120" opacity="0.9"/>
    <circle class="acc" cx="470" cy="130" r="85"/>
    <rect class="ln dash" x="410" y="70" width="120" height="120"/>
    <circle class="accf pulse" cx="470" cy="130" r="3"/>
    <line class="acc" x1="470" y1="130" x2="530" y2="70"/>
  </g>
  <text class="hi" x="536" y="66">⌀0.0141</text>
  <text x="410" y="222">SAME CORNERS, PLUS THE SHADED AREA</text>
  <text class="hi" x="410" y="243">Area 0.000157 in², 57% more</text>
</svg>`
        },

        'mmc': {
            caption: ['Bonus tolerance at MMC', 'the hole grows, the zone grows with it'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="Bonus tolerance increasing as a hole departs from maximum material condition">
  <line class="ln" x1="70" y1="200" x2="600" y2="200"/>

  <g class="step">
    <circle class="ln-2 fillp" cx="150" cy="120" r="26"/>
    <rect class="accf" x="128" y="176" width="44" height="20"/>
    <text class="ink" x="118" y="222">⌀6.00 MMC</text>
    <text class="hi" x="126" y="240">zone ⌀0.20</text>
  </g>

  <g class="step">
    <circle class="ln-2 fillp" cx="330" cy="120" r="33"/>
    <rect class="accf" x="300" y="166" width="60" height="30"/>
    <text class="ink" x="304" y="222">⌀6.10</text>
    <text class="hi" x="292" y="240">zone ⌀0.30 (+0.10)</text>
  </g>

  <g class="step">
    <circle class="ln-2 fillp" cx="510" cy="120" r="40"/>
    <rect class="accf" x="470" y="156" width="80" height="40"/>
    <text class="ink" x="474" y="222">⌀6.20 LMC</text>
    <text class="hi" x="462" y="240">zone ⌀0.40 (+0.20)</text>
  </g>

  <text x="70" y="40">HOLE ⌀6.0 – 6.2 · POSITION ⌀0.2 Ⓜ A B C</text>
  <text class="hi" x="70" y="58">Bonus = actual size − MMC size. It is free, and most people never claim it.</text>
</svg>`
        },

        'bend': {
            caption: ['Bend allowance', 'the flat length is not A + B'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="A sheet metal bend unfolding into a flat pattern">
  <g class="unfold" style="--pivot:190px 170px">
    <rect class="fillq ln-2" x="182" y="70" width="16" height="100"/>
  </g>
  <rect class="fillq ln-2" x="190" y="162" width="180" height="16"/>
  <path class="acc" d="M190 162 A 8 8 0 0 0 182 170"/>

  <line class="acc dash" x1="186" y1="70" x2="186" y2="166"/>
  <line class="acc dash" x1="190" y1="170" x2="370" y2="170"/>
  <text class="hi" x="376" y="174">neutral axis at K · T</text>

  <line class="ln" x1="182" y1="60" x2="198" y2="60"/>
  <text x="204" y="62">T = material thickness</text>
  <text x="204" y="82">R = inside bend radius</text>
  <text x="204" y="102">A = bend angle</text>

  <line class="ln" x1="70" y1="200" x2="570" y2="200"/>
  <text class="ink" x="70" y="228">BA = (π / 180) × A × (R + K·T)</text>
  <text x="70" y="246">Flat = leg + leg + BA · K sits near 0.33–0.50, thinner and tighter pushes it down</text>
</svg>`
        },

        'eco': {
            caption: ['Change flow', 'request → review → order → release'],
            svg: `<svg viewBox="0 0 640 210" role="img" aria-label="An engineering change moving from request to release">
  <line class="ln" x1="90" y1="90" x2="560" y2="90"/>

  <g class="step"><rect class="ln-2 fillp" x="60" y="60" width="118" height="60"/><text class="ink" x="76" y="86">ECR</text><text x="76" y="104">problem stated</text></g>
  <g class="step"><rect class="ln-2 fillp" x="212" y="60" width="118" height="60"/><text class="ink" x="228" y="86">REVIEW</text><text x="228" y="104">cost, stock, risk</text></g>
  <g class="step"><rect class="ln-2 fillp" x="364" y="60" width="118" height="60"/><text class="ink" x="380" y="86">ECO</text><text x="380" y="104">what changes</text></g>
  <g class="step"><rect class="acc fillp" x="500" y="60" width="90" height="60"/><text class="hi" x="516" y="86">RELEASE</text><text x="516" y="104">new rev</text></g>

  <circle class="bead" r="4" style="--path:path('M 178 90 L 212 90 M 330 90 L 364 90 M 482 90 L 500 90')"/>

  <text x="60" y="164">An ECR asks a question. An ECO answers it with parts, revisions and an effectivity date.</text>
  <text class="hi" x="60" y="184">If you cannot say which serial number it starts on, the ECO is not finished.</text>
</svg>`
        },

        'bom': {
            caption: ['EBOM vs MBOM', 'same product, two different trees'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="An engineering bill of materials compared with a manufacturing bill of materials">
  <text class="ink" x="60" y="30">EBOM / HOW IT IS DESIGNED</text>
  <g class="fade">
    <line class="ln" x1="72" y1="46" x2="72" y2="196"/>
    <line class="ln" x1="72" y1="70" x2="96" y2="70"/><text x="104" y="74">Housing assembly</text>
    <line class="ln" x1="72" y1="106" x2="96" y2="106"/><text x="104" y="110">Cover, machined</text>
    <line class="ln" x1="72" y1="142" x2="96" y2="142"/><text x="104" y="146">Seal</text>
    <line class="ln" x1="72" y1="178" x2="96" y2="178"/><text x="104" y="182">Fastener kit</text>
  </g>

  <line class="ln dash" x1="320" y1="20" x2="320" y2="230"/>

  <text class="ink" x="360" y="30">MBOM / HOW IT IS BUILT</text>
  <g class="fade">
    <line class="ln" x1="372" y1="46" x2="372" y2="214"/>
    <line class="ln" x1="372" y1="70" x2="396" y2="70"/><text x="404" y="74">Sub-assembly, station 1</text>
    <line class="ln" x1="372" y1="106" x2="396" y2="106"/><text x="404" y="110">Cover + seal, pressed</text>
    <line class="ln" x1="372" y1="142" x2="396" y2="142"/><text class="hi" x="404" y="146">Adhesive, 12 g</text>
    <line class="ln" x1="372" y1="178" x2="396" y2="178"/><text class="hi" x="404" y="182">Screws, loose issue ×8</text>
    <line class="ln" x1="372" y1="214" x2="396" y2="214"/><text class="hi" x="404" y="218">Packaging</text>
  </g>
  <text x="360" y="246">Orange rows exist only in manufacturing.</text>
</svg>`
        },

        'thread': {
            caption: ['Thread engagement', 'depth by material, not by habit'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="Thread engagement depth in steel compared with aluminium">
  <rect class="fillq ln-2" x="60" y="100" width="220" height="110"/>
  <rect class="fillp ln" x="140" y="100" width="34" height="52"/>
  <g class="drive" style="--drive:26px"><rect class="accf" x="146" y="52" width="22" height="70"/></g>
  <line class="acc" x1="196" y1="100" x2="196" y2="152"/>
  <text class="hi" x="204" y="130">1.0 × D</text>
  <text class="ink" x="60" y="238">STEEL</text>

  <rect class="fillq ln-2" x="360" y="100" width="220" height="110"/>
  <rect class="fillp ln" x="440" y="100" width="34" height="78"/>
  <g class="drive" style="--drive:26px"><rect class="accf" x="446" y="52" width="22" height="96"/></g>
  <line class="acc" x1="496" y1="100" x2="496" y2="178"/>
  <text class="hi" x="504" y="142">1.5 × D</text>
  <text class="ink" x="360" y="238">ALUMINIUM</text>

  <text x="60" y="42">Engage enough thread that the screw fails before the hole does.</text>
  <text x="60" y="62">Soft material needs more length, not a bigger screw.</text>
</svg>`
        },

        'layers': {
            caption: ['Print orientation', 'layers are the weak direction'],
            svg: `<svg viewBox="0 0 640 250" role="img" aria-label="A printed part loaded across its layers compared with along them">
  <g>
    <rect class="fillq ln-2" x="70" y="90" width="180" height="110"/>
    <g class="ln">${Array.from({length:7},(_,i)=>`<line x1="70" y1="${104+i*14}" x2="250" y2="${104+i*14}"/>`).join('')}</g>
    <g class="press"><line class="acc" x1="160" y1="46" x2="160" y2="82"/><path class="accf" d="M160 88 l-6 -10 h12 z"/></g>
    <g class="crack"><line class="acc" x1="70" y1="146" x2="250" y2="146" stroke-width="3"/></g>
    <text class="ink" x="70" y="228">LOAD ACROSS LAYERS</text>
    <text class="hi" x="70" y="246">splits at a layer line</text>
  </g>

  <g>
    <rect class="fillq ln-2" x="400" y="90" width="180" height="110"/>
    <g class="ln">${Array.from({length:11},(_,i)=>`<line x1="${412+i*16}" y1="90" x2="${412+i*16}" y2="200"/>`).join('')}</g>
    <g class="press"><line class="acc" x1="490" y1="46" x2="490" y2="82"/><path class="accf" d="M490 88 l-6 -10 h12 z"/></g>
    <text class="ink" x="400" y="228">LOAD ALONG LAYERS</text>
    <text x="400" y="246">carries far more before it yields</text>
  </g>
</svg>`
        }
    };


    /* ---------- concepts: layer assets and placeholder plates ---------- */

    // Like resolveAsset, but returns null when nothing is actually there.;
})();

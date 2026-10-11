/**
 * Original line-art motifs. Each motif returns two SVG fragments in a 200x200 box:
 *  - `ink`: the engraving-style drawing (currentColor strokes, fine hatching)
 *  - `annot`: construction lines, dimension ticks and callouts in the accent colour,
 *    cross-faded over the ink drawing on hover.
 * Classes are styled in components.css (.illus).
 */
export const motifs = [
  'cubes',
  'graph',
  'waves',
  'tunnel',
  'book',
  'contour',
  'constellation',
  'sphere',
  'hourglass',
  'scissors',
] as const;
export type Motif = (typeof motifs)[number];

export interface Drawing {
  ink: string;
  annot: string;
}

const r = (n: number): number => Math.round(n * 100) / 100;
const pt = (x: number, y: number): string => `${r(x)} ${r(y)}`;
const seg = (x1: number, y1: number, x2: number, y2: number): string => `M${pt(x1, y1)}L${pt(x2, y2)}`;
const rad = (deg: number): number => (deg * Math.PI) / 180;
const text = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'start'): string =>
  `<text class="callout" x="${r(x)}" y="${r(y)}" text-anchor="${anchor}">${s}</text>`;
const tick = (x: number, y: number, dx: number, dy: number, len = 3): string =>
  seg(x - dx * len, y - dy * len, x + dx * len, y + dy * len);

/** Smooth closed curve through points (midpoint quadratic method). */
function smoothClosed(points: [number, number][]): string {
  const n = points.length;
  const at = (i: number): [number, number] => points[((i % n) + n) % n] as [number, number];
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(at(0), at(1));
  let d = `M${pt(...start)}`;
  for (let i = 1; i <= n; i++) {
    const m = mid(at(i), at(i + 1));
    d += `Q${pt(...at(i))} ${pt(...m)}`;
  }
  return `${d}Z`;
}

/* ---------- 1. Isometric cube stack ---------- */
function cubes(): Drawing {
  const s = 27;
  const w = s * 0.866;
  const h = s * 0.5;
  const ox = 100;
  const oy = 58;
  const grid: [number, number, number][] = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 0, 2],
  ];
  grid.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let ink = '';
  for (const [x, y, z] of grid) {
    const sx = ox + (x - y) * w;
    const sy = oy + (x + y) * h - z * s;
    const top = `M${pt(sx, sy)}L${pt(sx + w, sy + h)}L${pt(sx, sy + 2 * h)}L${pt(sx - w, sy + h)}Z`;
    const left = `M${pt(sx - w, sy + h)}L${pt(sx, sy + 2 * h)}L${pt(sx, sy + 2 * h + s)}L${pt(sx - w, sy + h + s)}Z`;
    const right = `M${pt(sx, sy + 2 * h)}L${pt(sx + w, sy + h)}L${pt(sx + w, sy + h + s)}L${pt(sx, sy + 2 * h + s)}Z`;
    let hatchLeft = '';
    for (let k = 1; k < 6; k++) {
      const hx = sx - w + (k * w) / 6;
      const top0 = sy + h + (k * h) / 6;
      hatchLeft += seg(hx, top0 + 1, hx, top0 + s - 1);
    }
    let hatchRight = '';
    for (let k = 1; k < 5; k++) {
      const t = (k * s) / 5;
      hatchRight += seg(sx + 1.5, sy + 2 * h + t, sx + w - 1.5, sy + h + t);
    }
    ink += `<path class="fill" d="${top}${left}${right}"/><path class="hatch" d="${hatchLeft}${hatchRight}"/>`;
  }
  const bx = ox;
  const by = oy + 4 * h + s;
  const annot =
    `<path class="dash" d="${seg(bx, by + 10, bx + 78, by - 29)}${seg(bx, by + 10, bx - 78, by - 29)}${seg(bx, by + 10, bx, 12)}"/>` +
    `<path class="dim" d="${seg(bx - 52, by - 30, bx - 52 + w * 2, by)}${tick(bx - 52, by - 30, 0.5, 0.86)}${tick(bx - 52 + w * 2, by, 0.5, 0.86)}"/>` +
    text(bx - 66, by - 36, 'a = 1.0', 'middle') +
    text(bx + 80, by - 33, 'x') + text(bx - 84, by - 33, 'y') + text(bx + 4, 14, 'z') +
    `<path class="dim" d="M${pt(bx + 18, by + 10)}A18 18 0 0 0 ${pt(bx + 15, by - 3)}"/>` +
    text(bx + 22, by + 4, '30°');
  return { ink, annot };
}

/* ---------- 2. Contour map ---------- */
function contour(): Drawing {
  let ink = '';
  const levels = 7;
  for (let i = 0; i < levels; i++) {
    const base = 14 + i * 11.5;
    const cx = 100 + (levels - i) * 2.2;
    const cy = 100 - (levels - i) * 1.4;
    const pts: [number, number][] = [];
    for (let k = 0; k < 28; k++) {
      const t = (k / 28) * Math.PI * 2;
      const radius = base * (1 + 0.13 * Math.sin(2 * t + i * 0.5) + 0.08 * Math.sin(3 * t + 1.3) + 0.045 * Math.sin(5 * t + i));
      pts.push([cx + radius * Math.cos(t) * 1.08, cy + radius * Math.sin(t) * 0.92]);
    }
    ink += `<path d="${smoothClosed(pts)}"${i === 3 ? ' class="heavy"' : ''}/>`;
    if (i > 1 && i % 2 === 0) {
      let slope = '';
      for (let k = 0; k < 28; k += 3) {
        const [x, y] = pts[k] as [number, number];
        const dx = cx - x;
        const dy = cy - y;
        const len = Math.hypot(dx, dy);
        slope += seg(x, y, x + (dx / len) * 3.2, y + (dy / len) * 3.2);
      }
      ink += `<path class="hatch" d="${slope}"/>`;
    }
  }
  const annot =
    `<path class="dash" d="${seg(100, 8, 100, 192)}${seg(8, 100, 192, 100)}"/>` +
    `<path class="dim" d="${seg(112, 100, 170, 100)}${tick(124, 100, 0, 1)}${tick(139, 100, 0, 1)}${tick(153, 100, 0, 1)}${tick(168, 100, 0, 1)}"/>` +
    text(124, 94, '120', 'middle') + text(153, 94, '80', 'middle') + text(176, 104, '40') +
    `<path class="dim" d="${seg(30, 180, 70, 180)}${tick(30, 180, 0, 1)}${tick(70, 180, 0, 1)}"/>` +
    text(50, 190, '0 — 50 m', 'middle') + text(176, 20, 'N') +
    `<path class="dim" d="${seg(180, 40, 180, 26)}"/>`;
  return { ink, annot };
}

/* ---------- 3. Node graph ---------- */
function graph(): Drawing {
  const nodes: [number, number][] = [
    [100, 100], [52, 62], [88, 40], [146, 52], [160, 104], [136, 150], [84, 154], [44, 120], [30, 78], [118, 78], [176, 150],
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 2], [1, 8], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [0, 9], [9, 3], [9, 2], [4, 10], [5, 10],
  ];
  let ink = `<path d="${edges.map(([a, b]) => seg(...(nodes[a] as [number, number]), ...(nodes[b] as [number, number]))).join('')}"/>`;
  nodes.forEach(([x, y], i) => {
    const big = i === 0;
    const rr = big ? 10 : 5;
    ink += `<circle class="fill" cx="${x}" cy="${y}" r="${rr}"/>`;
    ink += big
      ? `<circle class="hatch" cx="${x}" cy="${y}" r="6.5"/><circle class="hatch" cx="${x}" cy="${y}" r="3.2"/>`
      : `<circle cx="${x}" cy="${y}" r="1.4"/>`;
  });
  const route = [8, 1, 0, 4, 10].map((i) => nodes[i] as [number, number]);
  const annot =
    `<path class="strong" d="M${route.map(([x, y]) => pt(x, y)).join('L')}"/>` +
    `<circle class="dash" cx="100" cy="100" r="22"/>` +
    text(66, 52, 'v₁', 'middle') + text(26, 70, 'v₀', 'end') + text(176, 142, 'v₄', 'middle') +
    text(100, 128, 'deg 7', 'middle') +
    `<path class="dim" d="${seg(100, 78, 100, 20)}${seg(100, 20, 128, 20)}"/>` + text(130, 22, 'hub');
  return { ink, annot };
}

/* ---------- 4. Wave interference ---------- */
function waves(id: string): Drawing {
  const s1 = 72;
  const s2 = 128;
  let rings1 = '';
  let rings2 = '';
  for (let k = 1; k <= 12; k++) {
    rings1 += `<circle cx="${s1}" cy="100" r="${k * 9}"/>`;
    rings2 += `<circle cx="${s2}" cy="100" r="${k * 9}"/>`;
  }
  const ink =
    `<clipPath id="${id}"><circle cx="100" cy="100" r="88"/></clipPath>` +
    `<g clip-path="url(#${id})"><g class="thin">${rings1}</g><g class="thin">${rings2}</g></g>` +
    `<circle class="heavy" cx="100" cy="100" r="88"/><circle class="hatch" cx="100" cy="100" r="92"/>` +
    `<circle class="fill" cx="${s1}" cy="100" r="3.5"/><circle class="fill" cx="${s2}" cy="100" r="3.5"/>`;
  const annot =
    `<path class="dash" d="${seg(100, 6, 100, 194)}${seg(s1, 100, s2, 100)}"/>` +
    `<path class="dim" d="${seg(s1, 112, s1 + 9, 112)}${tick(s1, 112, 0, 1)}${tick(s1 + 9, 112, 0, 1)}${seg(s2, 100, s2 + 62, 100 - 38)}${seg(s1, 100, s1 - 62, 100 - 38)}"/>` +
    text(s1 + 4, 124, 'λ', 'middle') + text(s1, 90, 'S₁', 'middle') + text(s2, 90, 'S₂', 'middle') +
    text(104, 16, 'n = 0') + text(176, 56, 'n = 1') + text(24, 56, 'n = 1', 'start');
  return { ink, annot };
}

/* ---------- 5. Receding tunnel of squares ---------- */
function tunnel(): Drawing {
  const vp: [number, number] = [124, 86];
  const ratio = 0.72;
  const squares: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const k = ratio ** i;
    const s = 176 * k;
    const cx = vp[0] + (100 - vp[0]) * k;
    const cy = vp[1] + (100 - vp[1]) * k;
    squares.push({ x: cx - s / 2, y: cy - s / 2, s });
  }
  let ink = '';
  squares.forEach((q, i) => {
    ink += `<path class="${i % 2 ? 'fill' : 'fill alt'}" d="M${pt(q.x, q.y)}h${r(q.s)}v${r(q.s)}h${r(-q.s)}Z"/>`;
  });
  const first = squares[0] as { x: number; y: number; s: number };
  const second = squares[1] as { x: number; y: number; s: number };
  let hatch = '';
  for (let k = 1; k < 9; k++) {
    const t = k / 9;
    hatch += seg(first.x, first.y + first.s * t, second.x, second.y + second.s * t);
  }
  let corners = '';
  const last = squares[squares.length - 1] as { x: number; y: number; s: number };
  for (const [fx, fy] of [[0, 0], [1, 0], [1, 1], [0, 1]] as const) {
    corners += seg(first.x + first.s * fx, first.y + first.s * fy, last.x + last.s * fx, last.y + last.s * fy);
  }
  ink += `<path d="${corners}"/><path class="hatch" d="${hatch}"/>`;
  const annot =
    `<path class="dash" d="${seg(vp[0], vp[1], 4, 4)}${seg(vp[0], vp[1], 196, 4)}${seg(vp[0], vp[1], 196, 196)}${seg(vp[0], vp[1], 4, 196)}"/>` +
    `<path class="strong" d="${seg(vp[0] - 7, vp[1], vp[0] + 7, vp[1])}${seg(vp[0], vp[1] - 7, vp[0], vp[1] + 7)}"/>` +
    text(vp[0] + 9, vp[1] - 6, 'VP') +
    `<path class="dim" d="${seg(first.x, 188, first.x + first.s, 188)}${tick(first.x, 188, 0, 1)}${tick(first.x + first.s, 188, 0, 1)}"/>` +
    text(100, 198, 's₀ → s₁ = 0.72 s₀', 'middle');
  return { ink, annot };
}

/* ---------- 6. Open book ---------- */
function book(): Drawing {
  const page = (dir: 1 | -1): string => {
    const x = (d: number): number => 100 + dir * d;
    return `M${pt(100, 62)}C${pt(x(15), 54)} ${pt(x(45), 54)} ${pt(x(68), 64)}L${pt(x(68), 146)}C${pt(x(45), 136)} ${pt(x(15), 136)} ${pt(100, 146)}Z`;
  };
  let ink = '';
  for (const [i, off] of [[3, 6], [2, 4], [1, 2]] as const) {
    ink += `<path d="M${pt(32, 64 + off)}L${pt(32, 146 + off)}C${pt(55, 137 + off)} ${pt(85, 137 + off)} ${pt(100, 146 + off)}C${pt(115, 137 + off)} ${pt(145, 137 + off)} ${pt(168, 146 + off)}L${pt(168, 64 + off)}" class="${i > 1 ? 'thin' : ''}"/>`;
  }
  ink += `<path class="fill" d="${page(-1)}${page(1)}"/><path class="heavy" d="${seg(100, 62, 100, 146)}"/>`;
  let lines = '';
  const reach = [62, 62, 62, 34, 62, 62, 48, 62];
  const yTop = (d: number): number => 62 + (2 * d) / 68 - 7 * Math.sin((Math.PI * d) / 68);
  reach.forEach((end, k) => {
    const t = 12 + k * 8;
    for (const dir of [-1, 1] as const) {
      const points: string[] = [];
      for (let d = 6; d < end; d += 8) points.push(pt(100 + dir * d, yTop(d) + t));
      points.push(pt(100 + dir * end, yTop(end) + t));
      lines += `M${points.join('L')}`;
    }
  });
  ink += `<path class="hatch" d="${lines}"/>`;
  ink += `<circle cx="136" cy="86" r="11"/><path class="hatch" d="${seg(125, 86, 147, 86)}${seg(136, 75, 136, 97)}"/><circle class="hatch" cx="136" cy="86" r="5"/>`;
  const annot =
    `<path class="dash" d="${seg(46, 56, 46, 150)}${seg(88, 56, 88, 150)}${seg(112, 56, 112, 150)}${seg(154, 56, 154, 150)}${seg(34, 76, 166, 76)}${seg(34, 132, 166, 132)}"/>` +
    `<path class="dim" d="${seg(24, 76, 24, 132)}${tick(24, 76, 1, 0)}${tick(24, 132, 1, 0)}"/>` +
    text(20, 108, '1.75', 'end') + text(150, 160, 'p. 12', 'middle') + text(100, 50, 'gutter', 'middle') +
    `<path class="dim" d="${seg(46, 168, 88, 168)}${tick(46, 168, 0, 1)}${tick(88, 168, 0, 1)}"/>` + text(67, 178, 'measure', 'middle');
  return { ink, annot };
}

/* ---------- 7. Constellation ---------- */
function constellation(): Drawing {
  const stars: [number, number, number][] = [
    [46, 128, 3], [72, 96, 4], [98, 110, 2.5], [122, 74, 5], [152, 88, 3], [168, 54, 2.5], [132, 130, 3.5], [96, 150, 2.5], [60, 60, 2],
  ];
  let ink = `<circle class="heavy" cx="100" cy="100" r="90"/><circle class="hatch" cx="100" cy="100" r="85"/>`;
  let ticks = '';
  for (let a = 0; a < 360; a += 10) {
    const len = a % 30 === 0 ? 6 : 3;
    ticks += seg(100 + 90 * Math.cos(rad(a)), 100 + 90 * Math.sin(rad(a)), 100 + (90 - len) * Math.cos(rad(a)), 100 + (90 - len) * Math.sin(rad(a)));
  }
  ink += `<path class="hatch" d="${ticks}"/>`;
  const order = [0, 1, 2, 3, 4, 5];
  const links = order.slice(0, -1).map((a, i) => [a, order[i + 1] as number] as const);
  links.push([3, 6], [6, 7], [2, 7], [1, 8]);
  let lineD = '';
  for (const [a, b] of links) {
    const [x1, y1] = stars[a] as [number, number, number];
    const [x2, y2] = stars[b] as [number, number, number];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    lineD += seg(x1 + ux * 6, y1 + uy * 6, x2 - ux * 6, y2 - uy * 6);
  }
  ink += `<path d="${lineD}"/>`;
  for (const [x, y, m] of stars) {
    ink += `<path class="fill" d="${seg(x - m - 2, y, x + m + 2, y)}${seg(x, y - m - 2, x, y + m + 2)}${seg(x - m * 0.6, y - m * 0.6, x + m * 0.6, y + m * 0.6)}${seg(x - m * 0.6, y + m * 0.6, x + m * 0.6, y - m * 0.6)}"/><circle cx="${x}" cy="${y}" r="${r(m * 0.45)}"/>`;
  }
  const a = stars[3] as [number, number, number];
  const b = stars[6] as [number, number, number];
  const c = stars[7] as [number, number, number];
  const annot =
    `<path class="strong" d="M${pt(a[0], a[1])}L${pt(b[0], b[1])}L${pt(c[0], c[1])}"/>` +
    `<circle class="dash" cx="${a[0]}" cy="${a[1]}" r="14"/>` +
    `<path class="dash" d="${seg(100, 10, 100, 190)}${seg(10, 100, 190, 100)}"/>` +
    `<path class="dim" d="M${pt(b[0] - 12, b[1] - 6)}A14 14 0 0 0 ${pt(b[0] - 14, b[1] + 6)}"/>` +
    text(a[0] + 8, a[1] - 14, 'α') + text(b[0] + 8, b[1] + 6, 'β') + text(c[0] - 6, c[1] + 12, 'γ', 'end') +
    text(b[0] - 18, b[1] + 3, '34°', 'end') + text(100, 24, 'N', 'middle');
  return { ink, annot };
}

/* ---------- 8. Wireframe sphere ---------- */
function sphere(): Drawing {
  const R = 68;
  let ink = `<circle class="fill" cx="100" cy="100" r="${R}"/>`;
  let lines = '';
  for (let k = 1; k < 6; k++) {
    lines += `<ellipse cx="100" cy="100" rx="${r(R * Math.abs(Math.cos(rad(k * 30))))}" ry="${R}"/>`;
  }
  for (const phi of [-60, -30, 0, 30, 60]) {
    const cr = R * Math.cos(rad(phi));
    lines += `<ellipse cx="100" cy="${r(100 - R * Math.sin(rad(phi)))}" rx="${r(cr)}" ry="${r(cr * 0.28)}"/>`;
  }
  ink += `<g class="thin">${lines}</g><circle class="heavy" cx="100" cy="100" r="${R}"/>`;
  let shade = '';
  for (let k = 0; k < 7; k++) {
    const rr = R + 4 + k * 2.6;
    const a0 = rad(20 + k * 2);
    const a1 = rad(100 - k * 2);
    shade += `M${pt(100 + rr * Math.cos(a0), 100 + rr * Math.sin(a0))}A${r(rr)} ${r(rr)} 0 0 1 ${pt(100 + rr * Math.cos(a1), 100 + rr * Math.sin(a1))}`;
  }
  ink += `<path class="hatch" d="${shade}"/>`;
  const annot =
    `<path class="dash" d="${seg(100 - 26, 100 + 100, 100 + 26, 100 - 100)}"/>` +
    `<ellipse class="strong" cx="100" cy="100" rx="${R}" ry="${r(R * 0.28)}"/>` +
    `<path class="dim" d="${seg(100, 100, 100 + R * Math.cos(rad(-40)), 100 + R * Math.sin(rad(-40)))}"/>` +
    text(100 + 38 * Math.cos(rad(-40)) + 4, 100 + 38 * Math.sin(rad(-40)) - 3, 'r') +
    `<path class="dim" d="M${pt(100, 180)}A${r(80)} ${r(80)} 0 0 1 ${pt(100 + 80 * Math.sin(rad(14.5)), 100 + 80 * Math.cos(rad(14.5)))}"/>` +
    text(112, 192, '23.4°') + text(170, 106, 'eq.') + text(130, 16, 'axis');
  return { ink, annot };
}


/* ---------- 9. Hourglass (half an hour of sand) ---------- */
function hourglass(): Drawing {
  const upper = 'M70 38C70 80 96 90 100 100C104 90 130 80 130 38Z';
  const lower = 'M100 100C96 110 70 120 70 162H130C130 120 104 110 100 100Z';
  let grains = '';
  for (let k = 0; k < 6; k++) grains += seg(74 + k * 2, 160 - k * 5, 126 - k * 2, 160 - k * 5);
  let upperHatch = '';
  for (let k = 0; k < 4; k++) upperHatch += seg(80 + k * 3, 66 + k * 6, 120 - k * 3, 66 + k * 6);
  const ink =
    `<path class="fill" d="${upper}${lower}"/>` +
    `<path class="fill alt" d="M77 60L123 60C120 76 106 88 100 98C94 88 80 76 77 60Z"/><path class="hatch" d="${upperHatch}"/>` +
    `<path class="fill alt" d="M72 162C78 142 92 132 100 130C108 132 122 142 128 162Z"/><path class="hatch" d="${grains}"/>` +
    `<path class="thin" d="${seg(100, 100, 100, 130)}"/>` +
    `<path class="fill" d="M56 28H144V38H56ZM56 162H144V172H56Z"/>` +
    `<path d="${seg(62, 38, 62, 162)}${seg(138, 38, 138, 162)}"/>`;
  const annot =
    `<path class="dash" d="${seg(100, 14, 100, 188)}${seg(30, 60, 170, 60)}${seg(30, 130, 170, 130)}"/>` +
    `<path class="dim" d="${seg(158, 28, 158, 172)}${tick(158, 28, 1, 0)}${tick(158, 172, 1, 0)}${tick(158, 100, 1, 0)}"/>` +
    text(164, 102, '30:00') + text(26, 56, 'sand = T', 'start') + text(26, 126, 'sand = 0', 'start') +
    text(106, 118, 'dN/dt') + text(100, 190, 't →', 'middle');
  return { ink, annot };
}

/* ---------- 10. Scissors (the respectful kind) ---------- */
function scissors(): Drawing {
  const bladeA = 'M160 26L112 98L84 142L72 136L92 98Z';
  const bladeB = 'M40 26L88 98L116 142L128 136L108 98Z';
  let hatch = '';
  for (let k = 1; k < 6; k++) {
    const t = k / 7;
    hatch += seg(160 - 68 * t - 5, 26 + 72 * t + 3, 160 - 68 * t + 1, 26 + 72 * t + 5);
    hatch += seg(40 + 68 * t + 5, 26 + 72 * t + 3, 40 + 68 * t - 1, 26 + 72 * t + 5);
  }
  const ink =
    `<path class="fill" d="${bladeA}"/><path class="fill" d="${bladeB}"/><path class="hatch" d="${hatch}"/>` +
    `<circle class="fill" cx="62" cy="154" r="18"/><circle cx="62" cy="154" r="10"/>` +
    `<circle class="fill" cx="138" cy="154" r="18"/><circle cx="138" cy="154" r="10"/>` +
    `<path class="hatch" d="M50 140l-6 4M46 150l-7 1M48 162l-6 5M150 140l6 4M154 150l7 1M152 162l6 5"/>` +
    `<circle class="fill" cx="100" cy="100" r="4.5"/><circle cx="100" cy="100" r="1.4"/>` +
    `<path class="thin" d="M170 56q8 6 2 12t-2 12M182 70q6 6 0 12"/>`;
  const annot =
    `<path class="dash" d="M${pt(100, 100)}m-76 0a76 76 0 0 1 152 0"/>` +
    `<path class="dash" d="${seg(100, 100, 100, 12)}${seg(100, 100, 160, 26)}${seg(100, 100, 40, 26)}"/>` +
    `<path class="dim" d="M${pt(100, 56)}A44 44 0 0 1 ${pt(125, 64)}"/>` +
    text(112, 52, 'θ = 34°') + text(100, 118, 'fulcrum', 'middle') +
    `<path class="dim" d="${seg(170, 30, 118, 102)}${tick(170, 30, 0.8, 0.6)}${tick(118, 102, 0.8, 0.6)}"/>` + text(164, 96, 'L = 12 cm', 'end') +
    text(62, 184, 'finger', 'middle') + text(138, 184, 'thumb', 'middle');
  return { ink, annot };
}

export function drawMotif(motif: Motif, id: string): Drawing {
  switch (motif) {
    case 'cubes': return cubes();
    case 'contour': return contour();
    case 'graph': return graph();
    case 'waves': return waves(id);
    case 'tunnel': return tunnel();
    case 'book': return book();
    case 'constellation': return constellation();
    case 'sphere': return sphere();
    case 'hourglass': return hourglass();
    case 'scissors': return scissors();
  }
}

/** Motifs that suit each section; the slug hash picks one. */
export const sectionMotifs: Record<'research' | 'creative', readonly Motif[]> = {
  research: ['cubes', 'graph', 'waves', 'tunnel'],
  creative: ['book', 'sphere', 'constellation', 'contour', 'tunnel'],
};

let counter = 0;
export const nextId = (prefix: string): string => `${prefix}-${++counter}`;

/* ---------- Emblem: cog around a cup of coffee ---------- */
export function gearPath(teeth: number, outer: number, root: number, cx = 100, cy = 100): string {
  const pitch = (Math.PI * 2) / teeth;
  const p = (a: number, rr: number): string => pt(cx + rr * Math.cos(a - Math.PI / 2), cy + rr * Math.sin(a - Math.PI / 2));
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * pitch;
    const start = `${p(a - pitch * 0.3, root)}`;
    d += `${i === 0 ? 'M' : `A${root} ${root} 0 0 1 `}${start}L${p(a - pitch * 0.17, outer)}L${p(a + pitch * 0.17, outer)}L${p(a + pitch * 0.3, root)}`;
  }
  return `${d}A${root} ${root} 0 0 1 ${p(-pitch * 0.3, root)}Z`;
}

/** The emblem's centrepiece: a cup of coffee with a face, whose steam ends in the nodes of a tiny graph. */
export const coffeeMark = {
  cup: 'M64 96H136C136 126 124 140 100 140C76 140 64 126 64 96Z',
  handle: 'M136 104C158 100 158 130 130 128',
  saucer: 'M50 136C70 152 130 152 150 136',
  face: 'M92 124Q100 131 108 124',
  eyes: [
    [88, 113],
    [112, 113],
  ] as const,
  steam: 'M84 88C76 78 92 72 84 60C79 52 87 47 86 40M100 86C92 74 108 68 100 56C95 48 103 43 102 35M116 88C108 78 124 72 116 60C111 53 119 48 118 42',
  link: 'M86 40L102 35L118 42',
  nodes: [
    [86, 40],
    [102, 35],
    [118, 42],
  ] as const,
};

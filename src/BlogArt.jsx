import { useId } from "react";

// Code-drawn cover art for blog posts: crisp at any size, tiny, and on brand.
// Drawn on a 1200 x 750 canvas and cropped to fit (cards 16:10, article cover 2:1).

function rng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

const GLOBE_DOTS = (() => {
  const r = rng(11), dots = [];
  while (dots.length < 46) {
    const x = 520 + r() * 640, y = 330 + r() * 300;
    if (Math.hypot(x - 860, y - 900) < 560) dots.push([x, y, r() > .85 ? 4 : 2.2, r() * 4]);
  }
  return dots;
})();
const GLOBE_ARCS = [[0, 5], [5, 12], [12, 20], [3, 9], [9, 17], [20, 28], [7, 24]].map(([a, b]) => {
  const [x1, y1] = GLOBE_DOTS[a], [x2, y2] = GLOBE_DOTS[b];
  return `M${x1.toFixed(0)} ${y1.toFixed(0)}Q${((x1 + x2) / 2).toFixed(0)} ${(Math.min(y1, y2) - 70).toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`;
});
const STARS = (() => { const r = rng(5); return Array.from({ length: 36 }, () => [r() * 1200, r() * 360, r() > .9 ? 1.6 : .9]); })();

function Globe({ id }) {
  return <>
    <defs>
      <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b1628" /><stop offset="1" stopColor="#152c4d" /></linearGradient>
      <radialGradient id={`${id}sea`} cx="50%" cy="20%" r="60%"><stop offset="0" stopColor="#1b3f6e" /><stop offset="1" stopColor="#081426" /></radialGradient>
      <radialGradient id={`${id}glow`} cx="72%" cy="62%" r="45%"><stop offset="0" stopColor="#ec7a3f" stopOpacity=".35" /><stop offset="1" stopColor="#ec7a3f" stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}clip`}><circle cx="860" cy="900" r="560" /></clipPath>
    </defs>
    <rect width="1200" height="750" fill={`url(#${id}bg)`} />
    {STARS.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} fill="#dfe9ff" opacity=".45" className="art-twinkle" style={{ animationDelay: `${(i % 7) * .6}s` }} />)}
    <circle cx="860" cy="900" r="574" fill="none" stroke="#4a92ff" strokeWidth="16" opacity=".35" className="art-breathe" />
    <circle cx="860" cy="900" r="560" fill={`url(#${id}sea)`} />
    <g clipPath={`url(#${id}clip)`} fill="none" stroke="rgba(140,185,255,.12)">
      {[140, 280, 420, 560].map((rx) => <ellipse key={rx} cx="860" cy="900" rx={rx} ry="560" />)}
      {[460, 560, 660].map((y) => <line key={y} x1="200" x2="1500" y1={y} y2={y} />)}
    </g>
    <rect width="1200" height="750" fill={`url(#${id}glow)`} />
    <g fill="none" stroke="#ffc58f" strokeWidth="1.6" opacity=".7">{GLOBE_ARCS.map((d, i) => <path key={i} d={d} className="art-flow" style={{ animationDelay: `${i * .5}s` }} />)}</g>
    {GLOBE_DOTS.map(([x, y, s, d], i) => <circle key={i} cx={x} cy={y} r={s} fill="#ffd9a0" className="art-twinkle" style={{ animationDelay: `${d}s` }} />)}
  </>;
}

function Rings({ id }) {
  const cx = 820, cy = 375;
  return <>
    <defs>
      <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f7f2ea" /><stop offset="1" stopColor="#efe4d6" /></linearGradient>
      <pattern id={`${id}grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(19,36,59,.06)" /></pattern>
    </defs>
    <rect width="1200" height="750" fill={`url(#${id}bg)`} />
    <rect width="1200" height="750" fill={`url(#${id}grid)`} />
    {[90, 175, 260, 345].map((r, i) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(19,36,59,.16)" strokeDasharray={i % 2 ? "4 8" : undefined} />)}
    {[[175, 30], [175, 150], [260, 210], [260, 320], [345, 100], [345, 250], [90, 260]].map(([r, a], i) => <circle key={i} cx={cx + r * Math.cos((a * Math.PI) / 180)} cy={cy + r * Math.sin((a * Math.PI) / 180)} r="7" fill="#b8bfca" />)}
    <g className="art-orbit" style={{ transformOrigin: `${cx}px ${cy}px` }}><circle cx={cx + 260} cy={cy} r="9" fill="#13243b" /></g>
    <circle cx={cx} cy={cy} r="30" fill="none" stroke="#c55420" strokeWidth="2" className="art-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
    <circle cx={cx} cy={cy} r="30" fill="none" stroke="#c55420" strokeWidth="2" className="art-ping" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: "1.2s" }} />
    <circle cx={cx} cy={cy} r="26" fill="#c55420" />
    <circle cx={cx} cy={cy} r="9" fill="#fff" />
  </>;
}

function Packs({ id }) {
  const pack = (x, w, h, fill, band, delay) => <g className="art-bob" style={{ animationDelay: delay }}>
    <rect x={x} y={560 - h} width={w} height={h} rx="18" fill={fill} />
    <rect x={x} y={560 - h * .62} width={w} height={h * .2} fill={band} opacity=".9" />
    <rect x={x + w * .2} y={560 - h * .88} width={w * .6} height="10" rx="5" fill={band} opacity=".55" />
  </g>;
  return <>
    <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbeadb" /><stop offset="1" stopColor="#f3cfb2" /></linearGradient></defs>
    <rect width="1200" height="750" fill={`url(#${id}bg)`} />
    <circle cx="880" cy="250" r="230" fill="#fff" opacity=".35" />
    <ellipse cx="820" cy="566" rx="330" ry="22" fill="#13243b" opacity=".1" />
    {pack(560, 150, 300, "#13243b", "#c55420", "0s")}
    {pack(740, 190, 380, "#c55420", "#fff", ".4s")}
    {pack(960, 120, 210, "#fffaf4", "#13243b", ".8s")}
    <g className="art-swing" style={{ transformOrigin: "1040px 150px" }}>
      <path d="M1040 150 L1040 220" stroke="#13243b" strokeWidth="3" />
      <path d="M990 220h100l-12 90h-76z" fill="#fff" stroke="#13243b" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="1040" cy="240" r="7" fill="none" stroke="#13243b" strokeWidth="3" />
      <rect x="1012" y="265" width="56" height="8" rx="4" fill="#c55420" />
      <rect x="1020" y="283" width="40" height="8" rx="4" fill="#13243b" opacity=".4" />
    </g>
  </>;
}

function Sprint({ id }) {
  const nodes = [[260, 590], [520, 460], [780, 350], [1020, 190]];
  const path = "M120 660C220 620 230 600 260 590S440 500 520 460 700 380 780 350 940 250 1020 190";
  return <>
    <defs>
      <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0e2236" /><stop offset="1" stopColor="#1c3a4e" /></linearGradient>
      <radialGradient id={`${id}glow`} cx="85%" cy="25%" r="40%"><stop offset="0" stopColor="#ec7a3f" stopOpacity=".4" /><stop offset="1" stopColor="#ec7a3f" stopOpacity="0" /></radialGradient>
      <pattern id={`${id}dots`} width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="rgba(255,255,255,.08)" /></pattern>
    </defs>
    <rect width="1200" height="750" fill={`url(#${id}bg)`} />
    <rect width="1200" height="750" fill={`url(#${id}dots)`} />
    <rect width="1200" height="750" fill={`url(#${id}glow)`} />
    <path d={path} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <path d={path} fill="none" stroke="#f0a879" strokeWidth="3" strokeDasharray="10 14" className="art-march" />
    {nodes.map(([x, y], i) => i < 3
      ? <g key={i}><circle cx={x} cy={y} r="30" fill="#0e2236" stroke="#f0a879" strokeWidth="2.5" /><circle cx={x} cy={y} r="9" fill="#f0a879" className="art-twinkle" style={{ animationDelay: `${i * .7}s` }} /></g>
      : <g key={i}><circle cx={x} cy={y} r="44" fill="#ec7a3f" opacity=".25" className="art-breathe" /><circle cx={x} cy={y} r="32" fill="#ec7a3f" /><path d={`M${x - 10} ${y + 10}L${x + 11} ${y - 11}M${x - 6} ${y - 11}H${x + 11}V${y + 6}`} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>)}
  </>;
}

const ART = { globe: Globe, rings: Rings, packs: Packs, sprint: Sprint };

export default function BlogArt({ name, className = "" }) {
  const id = useId().replace(/:/g, "");
  const Art = ART[name] ?? Globe;
  return <svg className={`blog-art ${className}`} viewBox="0 0 1200 750" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><Art id={id} /></svg>;
}

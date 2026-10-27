import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { INDIA_STATES, projectIndia } from "./indiaMap";
import "./WhyIndia.css";

const STATS = [
  { to: 1.4, decimals: 1, suffix: "B", title: "People, young and aspirational", text: "65% under 35, one of the world's youngest consumer markets.", icon: "people" },
  { to: 6.5, decimals: 1, suffix: "%", title: "Fast-growing economy", text: "Among the world's fastest major economies (IMF, 2025).", icon: "growth" },
  { to: 850, decimals: 0, suffix: "M+", title: "Digital consumers", text: "One of the world's largest internet user bases.", icon: "phone" },
  { from: 2, to: 3, decimals: 0, prefix: "2–", suffix: "x", title: "Lower cost of customer acquisition", text: "Compared to US/EU, with higher LTV potential.", icon: "cart" },
];
// Callouts: anchor city [lon, lat], label point in map units, label side.
const SIGNALS = [
  { title: "Growing middle class", text: "300M+ by 2030", at: [80.95, 26.85], label: [395, 40], side: "r" },
  { title: "Digital-first consumers", text: "850M+ internet users", at: [77.2, 28.6], label: [30, 120], side: "l" },
  { title: "Favourable policy environment", text: "Production linked incentives, lower taxes, easier market entry", at: [91.74, 26.14], label: [610, 140], side: "r" },
  { title: "Diverse cultures", text: "Many markets, many opportunities", at: [72.88, 19.08], label: [30, 430], side: "l" },
  { title: "Lower operating costs", text: "Competitive supply chain and talent base", at: [88.36, 22.57], label: [610, 318], side: "r" },
  { title: "Global brands are winning here", text: "From D2C to retail, India is a key growth market for global consumer brands.", at: [78.49, 17.39], label: [560, 480], side: "r" },
  { title: "Rising incomes", text: "Per capita income 3x by 2030", at: [77.59, 12.97], label: [80, 565], side: "l" },
];
const CATEGORIES = [
  ["Food & Beverage", "food"], ["Beauty & Personal Care", "lotus"], ["Home & Furniture", "home"], ["Pets & Animal Care", "paw"], ["Mom, Baby & Kids", "bottle"], ["Stationery & Creative Living", "book"], ["Specialty Foods & Nutrition", "bowl"],
  ["Fashion & Accessories", "bag"], ["Consumer Electronics", "laptop"], ["Mobility & Auto Accessories", "car"], ["Education & Learning", "cap"], ["Travel & Experiences", "plane"], ["Home Improvement & DIY", "hammer"], ["Clean Energy & Sustainability", "leaf"],
];
// Major markets [name, lon, lat, weight]; brightest lights on the globe.
const CITIES = [
  ["Delhi", 77.2, 28.6, 3], ["Mumbai", 72.88, 19.08, 3], ["Kolkata", 88.36, 22.57, 2.4], ["Bengaluru", 77.59, 12.97, 2.6], ["Chennai", 80.27, 13.08, 2.2], ["Hyderabad", 78.49, 17.39, 2.2],
  ["Ahmedabad", 72.57, 23.02, 1.8], ["Pune", 73.86, 18.52, 1.8], ["Jaipur", 75.79, 26.91, 1.4], ["Lucknow", 80.95, 26.85, 1.6], ["Guwahati", 91.74, 26.14, 1], ["Kochi", 76.27, 9.93, 1.2],
  ["Patna", 85.14, 25.6, 1.4], ["Nagpur", 79.09, 21.15, 1], ["Indore", 75.86, 22.72, 1], ["Chandigarh", 76.78, 30.73, 1], ["Bhubaneswar", 85.82, 20.3, .9], ["Coimbatore", 76.96, 11.02, .9],
];
const LINKS = [[0, 1], [0, 2], [0, 3], [1, 3], [1, 5], [5, 4], [3, 4], [2, 10], [0, 8], [0, 9], [6, 1], [7, 5], [2, 4], [0, 6], [3, 11]];
const WIDE_BOX = [-170, -80, 985, 840];
const NARROW_BOX = [-30, -70, 660, 830];
const GLOBE = { cx: 300, cy: 660, r: 700 };

const NODES = CITIES.slice(0, 12).map(([name, lon, lat]) => [name, ...projectIndia(lon, lat)]);
const ARCS = LINKS.map(([a, b]) => {
  const [, x1, y1] = NODES[a], [, x2, y2] = NODES[b];
  const bend = .16, mx = (x1 + x2) / 2 + (y2 - y1) * bend, my = (y1 + y2) / 2 - (x2 - x1) * bend;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
});

// Orthographic graticule for the globe, so the sphere reads as a planet rather than a disc.
const GRATICULE = (() => {
  const tilt = (24 * Math.PI) / 180, { cx, cy, r } = GLOBE, lines = [];
  const pt = (lon, lat) => {
    const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180;
    const x = Math.cos(p) * Math.sin(l), y = Math.sin(p), z = Math.cos(p) * Math.cos(l);
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    return z2 > 0 ? [cx + x * r, cy - y2 * r] : null;
  };
  const trace = (fn) => { let d = "", pen = false; for (let t = 0; t <= 180; t++) { const p = fn(t); if (!p) { pen = false; continue; } d += `${pen ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`; pen = true; } return d; };
  for (let lon = -90; lon <= 90; lon += 15) lines.push(trace((t) => pt(lon, -90 + t)));
  for (let lat = -60; lat <= 75; lat += 15) lines.push(trace((t) => pt(-90 + t, lat)));
  return lines.filter(Boolean);
})();

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// City lights: clustered around major markets, scattered elsewhere, all kept inside India's outline.
function useLights() {
  return useMemo(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    const india = new Path2D(INDIA_STATES.join(""));
    const rand = rng(7), hubs = CITIES.map(([, lon, lat, w]) => [...projectIndia(lon, lat), w]);
    const total = hubs.reduce((s, h) => s + h[2], 0);
    const [ox, oy] = projectIndia(77.2, 28.6);
    const lights = [];
    for (let tries = 0; lights.length < 560 && tries < 9000; tries++) {
      let x, y;
      if (rand() < .58) {
        let pick = rand() * total, h = hubs[0];
        for (const hub of hubs) { pick -= hub[2]; if (pick <= 0) { h = hub; break; } }
        const a = rand() * Math.PI * 2, m = Math.sqrt(-2 * Math.log(rand() + 1e-9)) * (10 + h[2] * 6);
        x = h[0] + Math.cos(a) * m; y = h[1] + Math.sin(a) * m;
      } else { x = rand() * 600; y = rand() * 673; }
      if (!ctx.isPointInPath(india, x, y)) continue;
      const big = rand();
      lights.push({ x, y, r: big > .96 ? 2.1 : big > .8 ? 1.4 : .85, o: .45 + rand() * .55, d: .5 + Math.hypot(x - ox, y - oy) / 520, tw: rand() < .16 });
    }
    // Faint glow from neighbouring land, so India sits on a living planet.
    const far = [];
    for (let i = 0; far.length < 150 && i < 4000; i++) {
      const x = -200 + rand() * 1000, y = -40 + rand() * 360;
      if (Math.hypot(x - GLOBE.cx, y - GLOBE.cy) > GLOBE.r - 6 || ctx.isPointInPath(india, x, y) || (y > 180 && x > 30 && x < 470)) continue;
      far.push({ x, y, r: rand() > .85 ? 1.2 : .7, o: .12 + rand() * .3 });
    }
    const stars = [];
    for (let i = 0; stars.length < 46 && i < 3000; i++) {
      const x = -200 + rand() * 1050, y = -90 + rand() * 300;
      if (Math.hypot(x - GLOBE.cx, y - GLOBE.cy) < GLOBE.r + 30) continue;
      stars.push({ x, y, r: rand() > .9 ? 1.3 : .7, o: .2 + rand() * .5 });
    }
    return { lights, far, stars };
  }, []);
}

const ic = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const ICONS = {
  people: <svg {...ic}><circle cx="12" cy="8" r="3" /><circle cx="5.5" cy="10" r="2.2" /><circle cx="18.5" cy="10" r="2.2" /><path d="M6.5 19c.5-3 2.7-5 5.5-5s5 2 5.5 5M2 18c.3-2 1.6-3.4 3.5-3.4M22 18c-.3-2-1.6-3.4-3.5-3.4" /></svg>,
  growth: <svg {...ic}><path d="M4 20h16M7 17v-3M11 17v-5M15 17v-7M19 17V8" /><path d="m5 11 5-4 3 2 6-5M16 4h3v3" /></svg>,
  phone: <svg {...ic}><rect x="6.5" y="2.5" width="11" height="19" rx="2.2" /><path d="M10.5 18.5h3" /></svg>,
  cart: <svg {...ic}><path d="M3 4h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" /><circle cx="9.5" cy="19.5" r="1.2" /><circle cx="17" cy="19.5" r="1.2" /></svg>,
  food: <svg {...ic}><path d="M6 3v6a2 2 0 0 0 2 2v10M10 3v6a2 2 0 0 1-2 2M8 3v5M16 21V3c2.2 1 3.5 3.5 3.5 7 0 2-1.2 3-3.5 3" /></svg>,
  bag: <svg {...ic}><path d="M5 8h14l-1 12.5H6z" /><path d="M9 10V6.5a3 3 0 0 1 6 0V10" /></svg>,
  laptop: <svg {...ic}><rect x="4.5" y="5" width="15" height="10" rx="1.2" /><path d="M2.5 18.5h19" /></svg>,
  car: <svg {...ic}><path d="M4 16v-4l2-5h12l2 5v4z" /><path d="M4 12h16M7.5 14h1.5M15 14h1.5M6 16v2.5M18 16v2.5" /></svg>,
  cap: <svg {...ic}><path d="m2.5 9.5 9.5-5 9.5 5-9.5 5z" /><path d="M6.5 11.6V16c1.5 1.6 3.5 2.5 5.5 2.5s4-.9 5.5-2.5v-4.4M21.5 9.5v5" /></svg>,
  plane: <svg {...ic}><path d="M21 3.5c-1-1-2.6-.6-3.6.4L14 7.3 5.5 5 4 6.5l7 4-3.2 3.3-3-.6-1.3 1.3 3.2 1.6 1.6 3.2 1.3-1.3-.6-3 3.3-3.2 4 7 1.5-1.5-2.3-8.5 3.4-3.4c1-1 1.4-2.6.4-3.6z" /></svg>,
  hammer: <svg {...ic}><path d="m14.5 6.5-11 11 3 3 11-11" /><path d="m12.5 4.5 3-1.5 5.5 5.5-2 2-2-1-1.5 1.5-3-3z" /></svg>,
  leaf: <svg {...ic}><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19 13 11" /></svg>,
  lotus: <svg {...ic}><path d="M12 19c-2.5-2-3.5-5-3.5-8S10 5.5 12 4c2 1.5 3.5 4 3.5 7s-1 6-3.5 8z" /><path d="M12 19c-3-.3-6.5-2.5-8-7 2-.5 4.4 0 5.4 1M12 19c3-.3 6.5-2.5 8-7-2-.5-4.4 0-5.4 1" /></svg>,
  home: <svg {...ic}><path d="m3.5 11 8.5-7 8.5 7" /><path d="M5.5 9.5V20h13V9.5M10 20v-5h4v5" /></svg>,
  paw: <svg {...ic}><circle cx="6" cy="10" r="1.8" /><circle cx="9.5" cy="5.8" r="1.8" /><circle cx="14.5" cy="5.8" r="1.8" /><circle cx="18" cy="10" r="1.8" /><path d="M12 11.5c-2.8 0-5 3.2-5 5.5 0 1.8 1.4 2.5 2.8 2.5 1 0 1.4-.5 2.2-.5s1.2.5 2.2.5c1.4 0 2.8-.7 2.8-2.5 0-2.3-2.2-5.5-5-5.5z" /></svg>,
  bottle: <svg {...ic}><path d="M10 2.5h4M10.5 2.5v2.5L9 6.5h6L13.5 5V2.5" /><rect x="8" y="6.5" width="8" height="15" rx="2.5" /><path d="M8 11h3M8 14.5h3" /></svg>,
  book: <svg {...ic}><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20" /></svg>,
  bowl: <svg {...ic}><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0zM9 20.3h6" /><path d="M12 12c0-3 1.5-5.5 4.5-6.5-.2 3-1.8 5.5-4.5 6.5zM12 12c-.5-2-2-3.5-4-4 .2 2 1.6 3.5 4 4z" /></svg>,
};

function useNarrow(query = "(max-width: 760px)") {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => { const mq = window.matchMedia(query); const on = () => setNarrow(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, [query]);
  return narrow;
}

// Scroll reveal: every [data-in] element animates in on its own as it scrolls into view.
function useScrollReveal(ref) {
  useEffect(() => {
    const items = ref.current.querySelectorAll("[data-in]");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px", threshold: .15 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

function format(value, { decimals, prefix = "", suffix = "" }) {
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

function CountUp({ stat, delay }) {
  const ref = useRef(null);
  const run = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const final = format(stat.to, stat);
  const [text, setText] = useState(() => format(stat.from ?? 0, stat));
  useEffect(() => {
    if (!run) return;
    if (reduce) { setText(final); return; }
    const controls = animate(stat.from ?? 0, stat.to, { duration: 1.4, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setText(format(v, stat)) });
    return () => controls.stop();
  }, [run, reduce]);
  return <span ref={ref} className="why-count" aria-label={final}><span className="why-count__ghost" aria-hidden="true">{final}</span><span className="why-count__live" aria-hidden="true">{text}</span></span>;
}

function IndiaGlobe({ narrow }) {
  const ref = useRef(null), spin = useRef(null);
  const reduce = useReducedMotion();
  const { lights, far, stars } = useLights();
  const [bx, by, bw, bh] = narrow ? NARROW_BOX : WIDE_BOX;
  const pct = (x, y) => [((x - bx) / bw) * 100, ((y - by) / bh) * 100];
  // Scroll-linked: the globe drifts up, settles from a slight zoom, and its grid turns as you scroll past.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const scale = useTransform(scrollYProgress, [0, .45], reduce ? [1, 1] : [1.12, 1]);
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (!reduce) spin.current?.setAttribute("transform", `rotate(${(v - .5) * 14} ${GLOBE.cx} ${GLOBE.cy})`); });
  const { cx, cy, r } = GLOBE;
  return <motion.div ref={ref} data-in className="why-globe" style={{ aspectRatio: `${bw} / ${bh}`, y, scale }}>
    <svg viewBox={`${bx} ${by} ${bw} ${bh}`} role="img" aria-label="Night view of India on the globe, its state borders glowing and its cities lit up and connected">
      <defs>
        <radialGradient id="whyOcean" cx="50%" cy="25%" r="62%"><stop offset="0" stopColor="#173a66" /><stop offset=".38" stopColor="#0d2446" /><stop offset="1" stopColor="#040b18" /></radialGradient>
        <radialGradient id="whyRim" cx="50%" cy="50%" r="50%"><stop offset=".9" stopColor="#3d8bff" stopOpacity="0" /><stop offset=".985" stopColor="#5aa2ff" stopOpacity=".42" /><stop offset="1" stopColor="#a8d0ff" stopOpacity=".75" /></radialGradient>
        <radialGradient id="whyLand" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#1d2a3c" /><stop offset="1" stopColor="#0d1626" /></radialGradient>
        <radialGradient id="whyCity"><stop offset="0" stopColor="#fff4e0" /><stop offset=".3" stopColor="#ffb966" stopOpacity=".85" /><stop offset="1" stopColor="#f08a3c" stopOpacity="0" /></radialGradient>
        <filter id="whyBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="whyGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="whyAtmo" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14" /></filter>
        <clipPath id="whySphere"><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      <g className="why-globe__stars" aria-hidden="true">{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />)}</g>
      <g className="why-globe__planet">
        <circle cx={cx} cy={cy} r={r + 6} className="why-globe__atmo" filter="url(#whyAtmo)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#whyOcean)" />
        <g clipPath="url(#whySphere)">
          <g ref={spin}>
            <g className="why-globe__grid">{GRATICULE.map((d, i) => <path key={i} d={d} />)}</g>
            <g className="why-globe__far">{far.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />)}</g>
          </g>
        </g>
        <circle cx={cx} cy={cy} r={r} fill="url(#whyRim)" />
      </g>
      <g className="why-globe__land">{INDIA_STATES.map((d, i) => <path key={i} d={d} />)}</g>
      <g className="why-globe__halo" filter="url(#whyBlur)">{INDIA_STATES.map((d, i) => <path key={i} d={d} />)}</g>
      <g className="why-globe__borders">{INDIA_STATES.map((d, i) => <path key={i} d={d} pathLength="1" />)}</g>
      <g className="why-globe__lights">{lights.map((l, i) => <circle key={i} cx={l.x.toFixed(1)} cy={l.y.toFixed(1)} r={l.r} className={l.tw ? "tw" : undefined} style={{ "--o": l.o, "--d": `${l.d.toFixed(2)}s`, animationDelay: l.tw ? `${(i % 9) * .7}s` : undefined }} />)}</g>
      <g className="why-globe__arcs">{ARCS.map((d, i) => <path key={i} d={d} pathLength="1" style={{ "--d": `${1.3 + i * .06}s` }} />)}</g>
      <g className="why-globe__pulses">{ARCS.map((d, i) => <path key={i} d={d} pathLength="1" style={{ animationDelay: `${2.6 + (i * 1.7) % 7}s` }} />)}</g>
      <g className="why-globe__nodes">{NODES.map(([name, x, y], i) => <g key={name} style={{ "--d": `${1.1 + i * .07}s` }}><circle cx={x} cy={y} r="14" fill="url(#whyCity)" /><circle cx={x} cy={y} r="2.6" className="why-globe__core" /></g>)}</g>
      {!narrow && <g className="why-globe__leaders">{SIGNALS.map(({ title, at, label: [lx, ly] }, i) => {
        const [ax, ay] = projectIndia(...at);
        const qx = (ax + lx) / 2, qy = Math.min(ay, ly) - 12;
        return <g key={title} style={{ "--d": `${1.7 + i * .12}s` }}><path d={`M${ax} ${ay}Q${qx} ${qy} ${lx} ${ly}`} pathLength="1" /><circle cx={lx} cy={ly} r="4" /><circle cx={ax} cy={ay} r="2.4" /></g>;
      })}</g>}
    </svg>
    {!narrow && SIGNALS.map(({ title, text, label: [lx, ly], side }, i) => {
      const [left, top] = pct(lx, ly);
      const pos = side === "r" ? { left: `calc(${left}% + 12px)`, top: `${top}%` } : { right: `calc(${100 - left}% + 12px)`, top: `${top}%` };
      return <div key={title} className={`why-signal why-signal--${side}`} style={{ ...pos, "--d": `${1.8 + i * .12}s` }}><strong>{title}</strong><span>{text}</span></div>;
    })}
  </motion.div>;
}

export default function WhyIndia({ onBook }) {
  const ref = useRef(null);
  const narrow = useNarrow();
  useScrollReveal(ref);
  return <section id="why-india" ref={ref} className="why-fold">
    <div className="why-fold__inner">
      <div className="why-head">
        <span className="why-eyebrow" data-in>Why India, why now</span>
        <h2 className="why-title" data-in>
          <span className="why-line"><span style={{ "--d": ".05s" }}>The world's largest</span></span>{" "}
          <span className="why-line"><span style={{ "--d": ".17s" }}>opportunity to build</span></span>{" "}
          <span className="why-line"><em style={{ "--d": ".29s" }}>consumer brands.</em></span>
        </h2>
        <p data-in style={{ "--d": ".15s" }}>A young population, rising incomes, digital-first consumers and a lower cost base make India the most exciting market for global brands in 2026 and beyond.</p>
      </div>

      <div className="why-cta" data-in>
        <button type="button" className="why-btn why-btn--primary" onClick={onBook}>Book an India Readiness Call</button>
        <a className="why-btn why-btn--ghost" href="#services">Explore services</a>
      </div>

      <div className="why-stats">
        {STATS.map((stat, i) => <div className="why-stat" data-in key={stat.title} style={{ "--d": `${(i % 2) * .12}s` }}>
          <span className="why-stat__icon">{ICONS[stat.icon]}</span>
          <div>
            <div className="why-stat__num"><CountUp stat={stat} delay={.15 + (i % 2) * .12} /></div>
            <h3>{stat.title}</h3>
            <p>{stat.text}</p>
          </div>
        </div>)}
      </div>

      <div className="why-visual">
        <IndiaGlobe narrow={narrow} />
        {narrow && <ul className="why-signals-list">{SIGNALS.map(({ title, text }, i) => <li key={title} data-in style={{ "--d": `${(i % 2) * .1}s` }}><strong>{title}</strong><span>{text}</span></li>)}</ul>}
      </div>

      <div className="why-cats" data-in>
        <div className="why-cats__head"><span>High-growth categories</span><span>Consumers are spending more on a better life</span></div>
        <ul>{CATEGORIES.map(([label, icon], i) => <li key={label} style={{ "--d": `${.1 + i * .06}s` }}>{ICONS[icon]}<span>{label}</span></li>)}</ul>
      </div>
    </div>
  </section>;
}

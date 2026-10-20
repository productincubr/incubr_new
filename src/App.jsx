import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "./App.css";
import WhyIndia from "./WhyIndia";

const NAV_LINKS = [
  { id: "approach", label: "Approach" },
  { id: "services", label: "Services" },
  { id: "why-india", label: "Why India" },
  { id: "founder", label: "Founder" },
];
const COMPARISON = [
  ["Leadership", "Managed from afar", "On the ground, every week"],
  ["Scope", "Full range, launched nationwide", "One market, fewer products"],
  ["Pace", "Plan for a year, then launch", "Execute, learn and adjust in short sprints"],
  ["Success", "A launch event", "Product-market fit, proven in real sales"],
];
const APPROACH_STEPS = [
  ["1", "Pick one market", "One city, one channel, one customer we can win."],
  ["2", "Launch a hero range", "Fewer products, with an India-fit price and pack."],
  ["3", "Execute and learn", "Micro execution every week. Fix what doesn't sell."],
  ["4", "Prove fit, then scale", "Product-market fit first. New cities and channels after."],
];
const SERVICE_OPTIONS = [
  ["For global brands", "India market entry", "A partner on the ground from first insight to first sale in India.", [["Validate", "Market validation, channel research, competitive positioning"], ["Localize", "Product localization, CMO and strategic sourcing, quality and compliance"], ["Launch", "Brand and packaging adaptation, go-to-market and sales, market enablement"]]],
  ["For founders and new products", "Sprint incubation", "A one-stop sprint that takes a product idea to market-ready.", [["Validate", "Product validation, category validation, marketplace research"], ["Build", "Competitive positioning, product development, CMO management"], ["Launch-ready", "Bespoke brand and packaging, quality assurance, go-to-market"]]],
];
const CHAPTERS = [
  ["Chapter 1", "The Builder", "Built brands from zero to one: product development, positioning and customer experience."],
  ["Chapter 2", "The Operator", "Ran the country business for a major brand across India and the UAE, leading sales and opening new markets."],
  ["Chapter 3", "The Connector", "Built networks in contract manufacturing and strategic sourcing, plus R&D ties at government institutes."],
  ["Now", "The Enabler", "Brings it all together at Incubr, as a one-stop sprint for founders and global brands."],
];
const CAPABILITIES = [
  ["Build", ["Zero-to-one brand building", "Brand positioning", "Product development", "UX curation"], "box", "right"],
  ["Sell", ["Country management", "Sales leadership", "Market enablement"], "cart", "down"],
  ["Source", ["CMO management", "Strategic sourcing", "Quality assurance"], "nodes", "up"],
  ["Lead", ["Sprint business creation", "Social entrepreneur", "Avid learner"], "people", "left"],
];
const capIcon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const CAP_ICONS = {
  box: <svg {...capIcon}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>,
  cart: <svg {...capIcon}><path d="M3 4h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" /><circle cx="9.5" cy="19.5" r="1.2" /><circle cx="17" cy="19.5" r="1.2" /></svg>,
  nodes: <svg {...capIcon}><circle cx="12" cy="6" r="2.5" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" /><path d="m10.8 8.2-4 7M13.2 8.2l4 7M8 17.5h8" /></svg>,
  people: <svg {...capIcon}><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.3c.6-.2 1.3-.3 2-.3 2.3 0 4 1.5 4.5 4.3" /></svg>,
};
const PHASES = [
  ["01", "Validate", "Analyse the opportunity and validate the market fit.", "search"],
  ["02", "Build or localize", "Develop, adapt, or localize the product for India.", "gear"],
  ["03", "Launch", "Go to market with the right strategy and support.", "rocket"],
];
const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const PHASE_ICONS = {
  search: <svg {...iconProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  gear: <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  rocket: <svg {...iconProps}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
};
const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Reveal({ children, className = "", variants = fadeUp }) {
  return <motion.div className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>{children}</motion.div>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <motion.header className={`nav ${scrolled || open ? "nav--scrolled" : ""}`} initial={{ y: -90 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease }}><div className="container nav__inner"><a href="#top" className="logo" aria-label="Incubr home" onClick={(event) => { event.preventDefault(); navigateTo("/"); }}><img src="/logo.png" alt="Incubr" /></a><nav className="nav__links">{NAV_LINKS.map((link) => <a key={link.id} href={`/#${link.id}`}>{link.label}</a>)}</nav><button className="nav__book" onClick={() => navigateTo("/book-a-call")}>Book a Call <span aria-hidden="true">→</span></button><button className={`burger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label="Toggle menu"><span /><span /></button></div>{open && <nav className="mobile-menu">{NAV_LINKS.map((link) => <a key={link.id} href={`/#${link.id}`} onClick={() => setOpen(false)}>{link.label}</a>)}<button className="nav__book mobile-book" onClick={() => { setOpen(false); navigateTo("/book-a-call"); }}>Book a Call <span aria-hidden="true">→</span></button></nav>}</motion.header>;
}

function Hero() {
  return <section id="top" className="hero-new"><div className="hero-new__glow" /><div className="container hero-new__inner"><Reveal className="hero-new__content"><span className="eyebrow">Incubr Tech Pvt Ltd · Sprint incubation and India market entry</span><h1>From idea to<br />market-ready.<br />From global<br />brand to India.</h1><p>Incubr takes consumer products <strong>from zero to one</strong>, and brings global brands into India, one market at a time.</p><div className="hero-new__actions"><button className="btn" onClick={() => navigateTo("/book-a-call")}>Book an India Readiness Call <span aria-hidden="true">→</span></button><a href="#services" className="btn btn--ghost">Explore services <span aria-hidden="true">→</span></a></div></Reveal><Reveal className="hero-new__orb" variants={{ hidden: { opacity: 0, scale: .7 }, show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease } } }}><div className="orb-core"><span>ONE<br />MARKET</span></div><div className="orb-ring orb-ring--one" /><div className="orb-ring orb-ring--two" /><span className="orb-label orb-label--one">Validate</span><span className="orb-label orb-label--two">Build</span><span className="orb-label orb-label--three">Launch</span></Reveal><Reveal className="hero-new__proof" variants={stagger}><motion.div className="proof-count" variants={fadeUp}><span className="proof-count__glow" aria-hidden="true" /><div className="proof-count__num">09<i aria-hidden="true" /></div><span className="proof-count__label">Services under one roof</span></motion.div><motion.ol className="proof-phases" variants={fadeUp}>{PHASES.map(([no, title, text, icon]) => <li key={no} className="proof-phase"><span className="proof-phase__no">{no}</span><div className="proof-phase__body"><h3>{title}</h3><p>{text}</p></div><span className="proof-phase__icon" aria-hidden="true">{PHASE_ICONS[icon]}</span></li>)}</motion.ol><motion.div className="proof-lead" variants={fadeUp}><span className="proof-lead__target" aria-hidden="true"><i /></span><p>Led by a <em>former country lead</em> for a major brand in India and the UAE.</p></motion.div></Reveal></div></section>;
}

function TerrainVisual() {
  return <Reveal className="terrain" variants={{ hidden: { opacity: 0, scale: .85 }, show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease } } }}>
    <div className="terrain__ring terrain__ring--outer"><i className="terrain__dot terrain__dot--a" /><i className="terrain__dot terrain__dot--b" /></div>
    <div className="terrain__ring terrain__ring--mid"><i className="terrain__dot terrain__dot--c" /></div>
    <div className="terrain__ring terrain__ring--inner" />
    <svg className="terrain__tail" viewBox="0 0 100 100" aria-hidden="true"><path d="M33 64 C 28 74, 24 82, 18 92" /><circle cx="18" cy="92" r="1.1" /></svg>
    <div className="terrain__disc">
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="tSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f1ec" /><stop offset="1" stopColor="#e4e1da" /></linearGradient>
          <linearGradient id="tFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9c6bf" /><stop offset="1" stopColor="#e8e5df" /></linearGradient>
          <linearGradient id="tMid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8d8a84" /><stop offset=".55" stopColor="#d5d2cb" /><stop offset="1" stopColor="#efede8" /></linearGradient>
          <linearGradient id="tNear" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#efede8" /><stop offset=".45" stopColor="#9a968f" /><stop offset="1" stopColor="#56534e" /></linearGradient>
          <pattern id="tGrain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#3b3935" opacity=".22" /><circle cx="4" cy="4" r=".5" fill="#3b3935" opacity=".15" /></pattern>
        </defs>
        <rect width="400" height="400" fill="url(#tSky)" />
        <path d="M0 130 L60 95 L110 118 L170 70 L230 112 L290 88 L350 120 L400 100 V220 H0Z" fill="url(#tFar)" />
        <path d="M0 210 C 40 170, 80 150, 120 160 L170 130 L215 175 C 250 190, 300 180, 330 160 L400 150 V270 H0Z" fill="url(#tMid)" />
        <path d="M0 210 C 40 170, 80 150, 120 160 L170 130 L215 175 C 250 190, 300 180, 330 160 L400 150 V270 H0Z" fill="url(#tGrain)" />
        <path d="M0 250 C 60 220, 110 205, 160 225 C 200 240, 230 260, 260 250 L320 205 L360 230 L400 215 V400 H0Z" fill="#e9e6e0" />
        <path d="M150 400 C 190 340, 230 320, 260 300 L310 245 L345 270 L400 240 V400Z" fill="url(#tNear)" />
        <path d="M150 400 C 190 340, 230 320, 260 300 L310 245 L345 270 L400 240 V400Z" fill="url(#tGrain)" />
        <path d="M0 330 C 40 300, 80 290, 120 310 L170 345 L210 400 H0Z" fill="#cfccc5" />
        <path d="M0 330 C 40 300, 80 290, 120 310 L170 345 L210 400 H0Z" fill="url(#tGrain)" />
      </svg>
      <svg className="terrain__route" viewBox="0 0 400 400" aria-hidden="true"><path d="M86 320 C 120 280, 190 260, 200 230 C 210 200, 140 190, 150 150 C 160 115, 220 115, 232 82" /><circle className="terrain__stop" cx="86" cy="320" r="7" /><circle className="terrain__stop" cx="196" cy="236" r="5" /><circle className="terrain__stop" cx="150" cy="150" r="5" /></svg>
    </div>
    <div className="terrain__pin" aria-hidden="true"><span className="terrain__pin-glow" /><svg viewBox="0 0 48 64"><path d="M24 2C12 2 3 11 3 23c0 15 21 37 21 37s21-22 21-37C45 11 36 2 24 2z" /><circle cx="24" cy="22" r="8" /></svg></div>
  </Reveal>;
}

const PLAYBOOK = [
  ["01", "Market Understanding", "Deep dive into the market, consumers and competitive landscape.", "/playbook/insight.jpg", ["Category analysis", "Brand positioning", "Consumer interactions", "Actual market data & insights"]],
  ["02", "Entry Strategy", "Design a clear, actionable plan for successful market entry.", "/playbook/strategy.jpg", ["Sales plan", "Market road map", "Universe study (opportunity sizing)", "Entry strategy & go-to-market model"]],
  ["03", "Partner & Deal Execution", "Get the right partners, drive discussions and close deals.", "/playbook/deal.jpg", ["Meetings with key stakeholders", "Pitches & presentations", "Partner selection", "Negotiations", "Commercial closures"]],
  ["04", "Launch & Measure", "Execute a focused launch and track real outcomes to scale.", "/playbook/launch.jpg", ["Soft launch (pilot)", "Performance measurement", "Consumer feedback & iteration", "Scale what works"]],
];

function Playbook() {
  return <section id="playbook" className="section content-section playbook"><span className="playbook__orbit" aria-hidden="true"><i /></span><div className="container"><div className="playbook__head"><Reveal className="section-head" variants={stagger}><motion.span className="eyebrow" variants={fadeUp}>Our market entry playbook</motion.span><motion.h2 variants={fadeUp}>From insight to impact,<br />in <span className="approach-hl">four steps<svg className="approach-hl__swash" viewBox="0 0 520 24" preserveAspectRatio="none" aria-hidden="true"><path d="M2 18 C 140 4, 330 2, 518 12" /></svg></span>.</motion.h2></Reveal><Reveal className="playbook__intro"><p>A practical, end-to-end approach to enter and scale in India, backed by real data, on-ground execution and continuous learning.</p></Reveal></div><Reveal className="playbook__steps" variants={stagger}>{PLAYBOOK.map(([no, title, text, img, items], i) => <motion.article key={no} className="play-step" variants={fadeUp}><div className="play-step__top"><span className="play-step__no">{no}</span><div className="play-step__photo"><img src={img} alt="" loading="lazy" /></div>{i < PLAYBOOK.length - 1 ? <span className="play-step__link" aria-hidden="true"><i /></span> : <span className="play-step__end" aria-hidden="true" />}</div><h3>{title}</h3><p>{text}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></motion.article>)}</Reveal></div></section>;
}

function Approach() {
  return <section id="approach" className="section content-section approach-new"><div className="container"><div className="approach-hero"><Reveal className="section-head approach-hero__text" variants={stagger}><motion.span className="eyebrow approach-pill" variants={fadeUp}>Our <b>unconventional</b> approach</motion.span><motion.h2 variants={fadeUp}>Market entry is a<br /><span className="approach-hl">contact sport<svg className="approach-hl__swash" viewBox="0 0 520 24" preserveAspectRatio="none" aria-hidden="true"><path d="M2 18 C 140 4, 330 2, 518 12" /></svg></span>. We<br />play it on the ground.</motion.h2><motion.p className="section-lead" variants={fadeUp}>No year-long plans written from afar. We win one market with a focused range, learn every week, and scale only once product-market fit is proven in real sales.</motion.p></Reveal><TerrainVisual /></div><Reveal className="approach-steps" variants={stagger}>{APPROACH_STEPS.map(([number, title, text]) => <motion.article className="approach-step" key={number} variants={fadeUp} whileHover={{ y: -8 }}><span className="approach-step__number">{number}</span><h3>{title}</h3><p>{text}</p></motion.article>)}</Reveal><Reveal className="compare" variants={stagger}><motion.div className="compare__row compare__head" variants={fadeUp}><div /><div>Typical market entry</div><div>The Incubr way</div></motion.div>{COMPARISON.map(([label, usual, ours]) => <motion.div key={label} className="compare__row" variants={fadeUp}><div className="compare__label">{label}</div><div className="compare__usual"><small>Typical market entry</small>{usual}</div><div className="compare__ours"><span className="check">&#10003;</span>{ours}</div></motion.div>)}</Reveal></div></section>;
}

function Services() {
  return <section id="services" className="section content-section services-new"><div className="container"><Reveal className="section-head"><span className="eyebrow">Services</span><h2>Two ways to<br />work with Incubr</h2><p className="section-lead">Both run as sprints, with one team covering validation, development, manufacturing, branding, quality and launch.</p></Reveal><div className="service-options">{SERVICE_OPTIONS.map(([eyebrow, title, text, rows]) => <Reveal key={title} className="service-option"><span className="eyebrow">{eyebrow}</span><h3>{title}</h3><p>{text}</p><div className="service-rows">{rows.map(([label, detail]) => <div className="service-row" key={label}><strong>{label}</strong><span>{detail}</span></div>)}</div></Reveal>)}</div></div></section>;
}



function Founder() {
  return <section id="founder" className="section content-section founder-new"><div className="container"><Reveal className="founder-heading"><span className="eyebrow">Founder</span><h2>Led by an operator<br />who has done it before</h2></Reveal><div className="founder-profile"><Reveal className="founder__media"><div className="founder__frame"><img src="/founder.jpg" alt="Gopal Batra, Founder of Incubr Tech" loading="lazy" decoding="async" /></div><p className="founder__caption">Former country lead for a major brand, India and the UAE</p></Reveal><Reveal className="founder__text"><h3>Gopal Batra</h3><p className="founder__role">Founder, Incubr Tech Pvt Ltd</p><p className="founder__lead">A brand builder and country operator who has spent his career on the hardest stretch for any brand: the first mile in a new market.</p></Reveal></div><Reveal className="chapters" variants={stagger}>{CHAPTERS.map(([label, title, text], i) => <motion.article className="chapter" key={title} variants={fadeUp} whileHover={{ y: -6 }}><div className="chapter__mark"><span className="chapter__no">{String(i + 1).padStart(2, "0")}</span></div><span className="chapter__label">{label}</span><h3>{title}</h3><p>{text}</p></motion.article>)}</Reveal><Reveal className="capabilities" variants={stagger}>{CAPABILITIES.map(([title, [lead, ...items], icon, flow]) => <motion.div className={`capability capability--${title.toLowerCase()}`} key={title} variants={fadeUp} whileHover={{ y: -6 }}><span className={`cap-flow cap-flow--${flow}`} aria-hidden="true"><i /></span><div className="capability__head"><span className="capability__icon" aria-hidden="true">{CAP_ICONS[icon]}</span><div><span className="eyebrow">{title}</span><h3>{lead}</h3></div></div><ul>{items.map((item) => <li key={item}>{item}<span aria-hidden="true">→</span></li>)}</ul></motion.div>)}</Reveal></div></section>;
}

function BookingPage() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function submitBooking(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/book-call", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : { message: "The booking service is unavailable. Please try again shortly." };
      if (!response.ok) throw new Error(result.message || "We could not submit your request.");
      setStatus("success");
      event.currentTarget.reset();
    } catch (submitError) {
      setStatus("error");
      setError(submitError.message);
    }
  }
  return <div className="booking-page"><Navbar /><main className="booking-main"><div className="container booking-layout"><Reveal className="booking-intro"><span className="eyebrow">Book a call</span><h1>Book an<br />India Readiness<br />Call</h1><p>A 30-minute consultation to understand your brand, goals and India opportunity, and see how Incubr can help.</p><div className="booking-benefits"><div><span className="benefit-icon">▤</span><span><strong>Strategic discussion</strong>Understand your business, category and India opportunity</span></div><div><span className="benefit-icon">▥</span><span><strong>Practical insights</strong>Get an initial view on market potential, channels and go-to-market approach</span></div><div><span className="benefit-icon">♧</span><span><strong>Next steps</strong>See how Incubr can support you and agree on a clear way forward</span></div></div></Reveal><Reveal className="booking-card"><span className="eyebrow">Book a call</span><h2>Tell us a bit about you</h2>{status === "success" ? <div className="booking-success"><span>✓</span><h3>Request received</h3><p>Thank you. We will be in touch shortly to schedule your call.</p><button type="button" className="btn" onClick={() => navigateTo("/")}>Back to Incubr</button></div> : <form onSubmit={submitBooking}><div className="form-grid"><label>Full name *<input name="fullName" required placeholder="Your name" /></label><label>Business email *<input name="email" required type="email" placeholder="you@company.com" /></label><label>Company name *<input name="company" required placeholder="Your company name" /></label><label>What best describes you? *<select name="profile" required defaultValue=""><option value="" disabled>Select an option</option><option>Global brand</option><option>Founder / new product</option><option>Investor / partner</option><option>Other</option></select></label><label>Target timeline *<select name="timeline" required defaultValue=""><option value="" disabled>Select an option</option><option>Within 30 days</option><option>1-3 months</option><option>3-6 months</option><option>Just exploring</option></select></label><label className="form-full">Anything specific you'd like to discuss? <textarea name="message" rows="4" maxLength="300" placeholder="Product category, target customer, current stage, key questions" /></label></div>{status === "error" && <p className="form-error">{error}</p>}<button className="btn booking-submit" type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending..." : "Book My Call →"}</button><small className="form-note">🔒 Your information is secure and will only be used to schedule this call.</small></form>}</Reveal></div></main><Footer /></div>;
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);
  if (path === "/book-a-call") return <BookingPage />;
  return <><motion.div className="progress" style={{ scaleX }} /><Navbar /><main><Hero /><Approach /><Playbook /><Services /><WhyIndia onBook={() => navigateTo("/book-a-call")} /><Founder /></main><Footer /></>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container">
      <Reveal className="site-footer__cta">
        <div><span className="eyebrow">Ready when you are</span><h2>Let's take your brand<br />to <em>India</em>, one market at a time.</h2></div>
        <button className="btn" onClick={() => navigateTo("/book-a-call")}>Book an India Readiness Call <span aria-hidden="true">→</span></button>
      </Reveal>
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <a href="/" className="site-footer__logo" onClick={(event) => { event.preventDefault(); navigateTo("/"); }}><img src="/logo.png" alt="Incubr" /></a>
          <p>Sprint incubation and India market entry for founders and global consumer brands.</p>
        </div>
        <nav className="site-footer__col" aria-label="Explore"><h3>Explore</h3>{[...NAV_LINKS, { id: "playbook", label: "Playbook" }].map((link) => <a key={link.id} href={`/#${link.id}`}>{link.label}</a>)}</nav>
        <div className="site-footer__col"><h3>Services</h3><a href="/#services">India market entry</a><a href="/#services">Sprint incubation</a><a href="/#playbook">Market entry playbook</a></div>
        <div className="site-footer__col"><h3>Get in touch</h3><a href="mailto:products@incubr.com">products@incubr.com</a><a href="/book-a-call" onClick={(event) => { event.preventDefault(); navigateTo("/book-a-call"); }}>Book a call</a><span>India · UAE</span></div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Incubr Tech Pvt Ltd. All rights reserved.</span>
        <button type="button" className="site-footer__top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <span aria-hidden="true">↑</span></button>
      </div>
    </div>
  </footer>;
}

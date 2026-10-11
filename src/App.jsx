import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "./App.css";

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
const SERVICE_OPTIONS = [
  ["For global brands", "India market entry", "A partner on the ground from first insight to first sale in India.", [["Validate", "Market validation, channel research, competitive positioning"], ["Localize", "Product localization, CMO and strategic sourcing, quality and compliance"], ["Launch", "Brand and packaging adaptation, go-to-market and sales, market enablement"]]],
  ["For founders and new products", "Sprint incubation", "A one-stop sprint that takes a product idea to market-ready.", [["Validate", "Product validation, category validation, marketplace research"], ["Build", "Competitive positioning, product development, CMO management"], ["Launch-ready", "Bespoke brand and packaging, quality assurance, go-to-market"]]],
];
const INDIA_STATS = [
  ["#4", "Largest economy", "Nominal GDP of about $4.19 trillion in 2025, ahead of Japan."],
  ["5%", "GST on packaged foods", "GST 2.0 (Sep 2025) cut sauces, pasta, chocolates, coffee and more to 5%."],
  ["₹12L", "Tax-free income", "From FY26, incomes up to ₹12 lakh pay no income tax."],
  ["24.5B", "UPI payments a month", "A record in August 2026, up 22% year on year."],
];
const CHAPTERS = [
  ["Chapter 1", "The Builder", "Built brands from zero to one: product development, positioning and customer experience."],
  ["Chapter 2", "The Operator", "Ran the country business for a major brand across India and the UAE, leading sales and opening new markets."],
  ["Chapter 3", "The Connector", "Built networks in contract manufacturing and strategic sourcing, plus R&D ties at government institutes."],
  ["Now", "The Enabler", "Brings it all together at Incubr, as a one-stop sprint for founders and global brands."],
];
const CAPABILITIES = [
  ["Build", ["Zero-to-one brand building", "Brand positioning", "Product development", "UX curation"]],
  ["Sell", ["Country management", "Sales leadership", "Market enablement"]],
  ["Source", ["CMO management", "Strategic sourcing", "Quality assurance"]],
  ["Lead", ["Sprint business creation", "Social entrepreneur", "Avid learner"]],
];
const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function Reveal({ children, className = "", variants = fadeUp }) {
  return <motion.div className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>{children}</motion.div>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <motion.header className={`nav ${scrolled || open ? "nav--scrolled" : ""}`} initial={{ y: -90 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease }}><div className="container nav__inner"><a href="#approach" className="logo">INCU<span>B</span>R</a><nav className="nav__links">{NAV_LINKS.map((link) => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}</nav><button className={`burger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label="Toggle menu"><span /><span /></button></div>{open && <nav className="mobile-menu">{NAV_LINKS.map((link) => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link.label}</a>)}</nav>}</motion.header>;
}

function Approach() {
  return <section id="approach" className="section content-section"><div className="container"><Reveal className="section-head"><span className="eyebrow">Approach</span><h2>Not the usual way<br />to enter a market</h2></Reveal><Reveal className="compare" variants={stagger}><motion.div className="compare__row compare__head" variants={fadeUp}><div /><div>The usual way</div><div>The Incubr way</div></motion.div>{COMPARISON.map(([label, usual, ours]) => <motion.div key={label} className="compare__row" variants={fadeUp}><div className="compare__label">{label}</div><div className="compare__usual"><small>The usual way</small>{usual}</div><div className="compare__ours"><span className="check">&#10003;</span>{ours}</div></motion.div>)}</Reveal></div></section>;
}

function Services() {
  return <section id="services" className="section content-section services-new"><div className="container"><Reveal className="section-head"><span className="eyebrow">Services</span><h2>Two ways to<br />work with Incubr</h2><p className="section-lead">Both run as sprints, with one team covering validation, development, manufacturing, branding, quality and launch.</p></Reveal><div className="service-options">{SERVICE_OPTIONS.map(([eyebrow, title, text, rows]) => <Reveal key={title} className="service-option"><span className="eyebrow">{eyebrow}</span><h3>{title}</h3><p>{text}</p><div className="service-rows">{rows.map(([label, detail]) => <div className="service-row" key={label}><strong>{label}</strong><span>{detail}</span></div>)}</div></Reveal>)}</div></div></section>;
}

function WhyIndia() {
  return <section id="why-india" className="section content-section why-new"><div className="container"><Reveal className="section-head"><span className="eyebrow">Why India, why now</span><h2>The world's fourth-<br />largest economy is<br />lowering the cost of entry</h2><p className="section-lead">Tax cuts, a growing middle class and digital payment rails make 2026 a strong window for consumer brands.</p></Reveal><Reveal className="india-stats" variants={stagger}>{INDIA_STATS.map(([big, title, text]) => <motion.div className="india-stat" key={title} variants={fadeUp}><div className="india-stat__big">{big}</div><h3>{title}</h3><p>{text}</p></motion.div>)}</Reveal><p className="sources">Sources: IMF World Economic Outlook, Apr 2025 (via Gulf News); GST Council, Sep 2025 (via WION); Union Budget 2025-26 (via Business Today); NPCI, Aug 2026 (via StartupTalky).</p></div></section>;
}

function Founder() {
  return <section id="founder" className="section content-section founder-new"><div className="container"><Reveal className="founder-heading"><span className="eyebrow">Founder</span><h2>Led by an operator<br />who has done it before</h2></Reveal><div className="founder-profile"><Reveal className="founder__media"><div className="founder__frame"><img src="/founder.jpg" alt="Gopal Batra, Founder of Incubr Tech" /></div><p className="founder__caption">Former country lead for a major brand, India and the UAE</p></Reveal><Reveal className="founder__text"><h3>Gopal Batra</h3><p className="founder__role">Founder, Incubr Tech Pvt Ltd</p><p className="founder__lead">A brand builder and country operator who has spent his career on the hardest stretch for any brand: the first mile in a new market.</p></Reveal></div><Reveal className="chapters" variants={stagger}>{CHAPTERS.map(([label, title, text]) => <motion.article className="chapter" key={title} variants={fadeUp}><span>{label}</span><h3>{title}</h3><p>{text}</p></motion.article>)}</Reveal><div className="capabilities">{CAPABILITIES.map(([title, items]) => <div className="capability" key={title}><span className="eyebrow">{title}</span>{items.map((item) => <p key={item}>{item}</p>)}</div>)}</div></div></section>;
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <><motion.div className="progress" style={{ scaleX }} /><Navbar /><main><Approach /><Services /><WhyIndia /><Founder /></main></>;
}

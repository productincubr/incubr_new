import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import "./App.css";

const CONTACT_EMAIL = "contact@yourdomain.com"; // Keeping the contact email for reference
const NAV_LINKS = [
  { id: "approach", label: "Approach" },
  { id: "services", label: "Services" },
  { id: "why-india", label: "Why India" },
  { id: "founder", label: "Founder" },
  { id: "contact", label: "Contact" },
];
const COMPARISON = [
  { label: "Leadership", usual: "Managed from afar", ours: "On the ground, every week" },
  { label: "Scope", usual: "Full range, launched nationwide", ours: "One market, fewer products" },
  { label: "Pace", usual: "Plan for a year, then launch", ours: "Execute, learn and adjust in short sprints" },
  { label: "Success", usual: "A launch event", ours: "Product-market fit, proven in real sales" },
];
const SERVICES = [
  { no: "01", title: "Market Entry Strategy", text: "Pick the right city, channel and hero products before spending big." },
  { no: "02", title: "Go-to-Market & Launch", text: "Pricing, positioning and a focused launch plan built for Indian buyers." },
  { no: "03", title: "Distribution & Partners", text: "Find and manage distributors, retailers and marketplace partners." },
  { no: "04", title: "Country Operations", text: "Hands-on, week-to-week leadership so execution never stalls." },
  { no: "05", title: "Sales & Growth", text: "Turn early traction into repeatable sales, then scale market by market." },
  { no: "06", title: "Brand Localisation", text: "Adapt messaging, packaging and campaigns without losing what makes you, you." },
];
const WHY_INDIA = [
  { big: "1.4B+", title: "People", text: "The world's most populous country and a vast consumer base." },
  { big: "Young", title: "Demographics", text: "A large, young and digitally connected population." },
  { big: "Fast", title: "Growth", text: "One of the fastest-growing major economies in the world." },
  { big: "Digital", title: "Commerce", text: "UPI payments and e-commerce have changed how India buys." },
];
const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

function Reveal({ children, className = "", variants = fadeUp }) {
  return <motion.div className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>{children}</motion.div>;
}
function SectionHead({ eyebrow, title, light = false }) {
  return <Reveal variants={stagger} className={`section-head ${light ? "light" : ""}`}><motion.span variants={fadeUp} className="eyebrow">{eyebrow}</motion.span><motion.h2 variants={fadeUp}>{title}</motion.h2></Reveal>;
}
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <motion.header className={`nav ${scrolled || open ? "nav--scrolled" : ""}`} initial={{ y: -90 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease }}>
    <div className="container nav__inner"><a href="#top" className="logo">INCU<span>B</span>R</a><nav className="nav__links">{NAV_LINKS.map((link) => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}</nav><a href="#contact" className="btn btn--small nav__cta">Let's Talk</a><button className={`burger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label="Toggle menu"><span /><span /></button></div>
    <AnimatePresence>{open && <motion.nav className="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>{NAV_LINKS.map((link) => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link.label}</a>)}</motion.nav>}</AnimatePresence>
  </motion.header>;
}
function SprintLoop() {
  const steps = ["Execute", "Learn", "Adjust"];
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = setInterval(() => setActive((value) => (value + 1) % 3), 1800); return () => clearInterval(timer); }, []);
  return <motion.div className="loop" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 1, ease }}><div className="loop__ring" /><div className="loop__ring loop__ring--inner" /><div className="loop__center"><small>Short</small><strong>Sprints</strong></div><motion.div className="loop__dot" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5.4, ease: "linear" }}><i /></motion.div>{steps.map((step, index) => <div key={step} className={`loop__node loop__node--${index} ${active === index ? "is-active" : ""}`}><span>0{index + 1}</span>{step}</div>)}</motion.div>;
}
function Hero() {
  const words = ["Win", "India", "the", "right", "way."];
  return <section className="hero" id="top"><div className="grid-bg" /><div className="blob blob--1" /><div className="blob blob--2" /><div className="container hero__inner"><div className="hero__text"><motion.span className="eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>Market entry for global brands</motion.span><h1>{words.map((word, index) => <span className="word-wrap" key={word}><motion.span className={`word ${word === "India" ? "accent" : ""}`} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.4 + index * 0.1, duration: 0.9, ease }}>{word}</motion.span></span>)}</h1><motion.p className="hero__sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease }}>Incubr helps international brands launch and grow in India - with an operator on the ground, a focused market and short sprints that lead to real sales.</motion.p><motion.div className="hero__ctas" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8, ease }}><a href="#contact" className="btn">Start a conversation <span aria-hidden="true">-&gt;</span></a><a href="#approach" className="btn btn--ghost">See our approach</a></motion.div></div><SprintLoop /></div><a href="#approach" className="scroll-hint" aria-label="Scroll down"><span /></a></section>;
}
function Approach() { return <section id="approach" className="section"><div className="container"><SectionHead eyebrow="Approach" title={< >Not the usual way<br />to enter a market</>} /><Reveal className="compare" variants={stagger}><motion.div className="compare__row compare__head" variants={fadeUp}><div /><div>The usual way</div><div>The Incubr way</div></motion.div>{COMPARISON.map((row) => <motion.div key={row.label} className="compare__row" variants={fadeUp}><div className="compare__label">{row.label}</div><div className="compare__usual"><small>The usual way</small>{row.usual}</div><div className="compare__ours"><span className="check">&#10003;</span>{row.ours}</div></motion.div>)}</Reveal></div></section>; }
function Services() { return <section id="services" className="section services"><div className="container"><SectionHead light eyebrow="Services" title={< >Everything a brand needs<br />to land in India</>} /><Reveal className="services__grid" variants={stagger}>{SERVICES.map((service) => <motion.div key={service.no} className="service" variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}><span className="service__arrow">&#8599;</span><span className="service__no">{service.no}</span><h3>{service.title}</h3><p>{service.text}</p></motion.div>)}</Reveal></div></section>; }
function WhyIndia() { return <section id="why-india" className="section"><div className="container"><SectionHead eyebrow="Why India" title={< >The biggest opportunity<br />of the decade</>} /><Reveal><p className="why__intro">India rewards brands that show up properly. The prize is huge - but so is the gap between a launch and a business that actually works.</p></Reveal><Reveal className="why__grid" variants={stagger}>{WHY_INDIA.map((item) => <motion.div key={item.title} className="why__card" variants={fadeUp} whileHover={{ y: -6 }}><div className="why__big">{item.big}</div><h3>{item.title}</h3><p>{item.text}</p></motion.div>)}</Reveal></div></section>; }
function Founder() { const slideIn = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 1, ease } } }; return <section id="founder" className="section founder"><div className="container founder__inner"><Reveal className="founder__media" variants={slideIn}><div className="founder__frame"><img src="/founder.jpg" alt="Gopal Batra, Founder of Incubr Tech" /></div><div className="founder__badge">India - UAE</div><p className="founder__caption">Former country lead for a major brand, India and the UAE</p></Reveal><Reveal className="founder__text" variants={stagger}><motion.span variants={fadeUp} className="eyebrow">Founder</motion.span><motion.h2 variants={fadeUp}>Led by an operator<br />who has done it before</motion.h2><motion.h3 variants={fadeUp}>Gopal Batra</motion.h3><motion.p variants={fadeUp} className="founder__role">Founder, Incubr Tech Pvt Ltd</motion.p><motion.p variants={fadeUp} className="founder__lead">A brand builder and country operator who has spent his career on the hardest stretch for any brand - turning a new market into a working, profitable business.</motion.p><motion.div variants={fadeUp} className="tags"><span>Country Leadership</span><span>Brand Building</span><span>Market Entry</span><span>India &amp; UAE</span></motion.div></Reveal></div></section>; }
function Contact() { const [sent, setSent] = useState(false); return <section id="contact" className="section contact"><div className="container contact__inner"><Reveal variants={stagger} className="contact__text"><motion.span variants={fadeUp} className="eyebrow">Contact</motion.span><motion.h2 variants={fadeUp}>Thinking about India?<br />Let's talk.</motion.h2><motion.p variants={fadeUp}>Tell us about your brand and where you are today. We'll come back with an honest view of whether - and how - India can work for you.</motion.p><motion.a variants={fadeUp} href={`mailto:${CONTACT_EMAIL}`} className="contact__mail">{CONTACT_EMAIL}</motion.a></Reveal><Reveal className="contact__card"><AnimatePresence mode="wait">{sent ? <motion.div key="thanks" className="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}><div className="thanks__icon">&#10003;</div><h3>Thank you!</h3><p>We'll be in touch shortly.</p></motion.div> : <motion.form key="form" exit={{ opacity: 0, y: -20 }} onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Name<input required placeholder="Your full name" /></label><label>Email<input required type="email" placeholder="you@company.com" /></label><label>Company<input placeholder="Brand / company name" /></label><label>Message<textarea rows="4" placeholder="Tell us about your brand..." /></label><button className="btn btn--full" type="submit">Send message <span aria-hidden="true">-&gt;</span></button></motion.form>}</AnimatePresence></Reveal></div></section>; }
function Footer() { return <footer className="footer"><div className="container footer__inner"><a href="#top" className="logo">INCU<span>B</span>R</a><p>&copy; {new Date().getFullYear()} Incubr Tech Pvt Ltd. All rights reserved.</p></div></footer>; }
export default function App() { const { scrollYProgress } = useScroll(); const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 }); return <><motion.div className="progress" style={{ scaleX }} /><Navbar /><main><Hero /><Approach /><Services /><WhyIndia /><Founder /><Contact /></main><Footer /></>; }

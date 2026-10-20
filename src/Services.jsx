import { motion, useReducedMotion } from "framer-motion";
import "./Services.css";

const OFFERS = [
  {
    no: "01", audience: "For established global brands", title: "India market entry", note: ["Already have", "a brand?", "Start here."], profile: "Global brand",
    text: "Your partner on the ground to understand India, adapt your offering and build a route to market.",
    rows: [["search", "Validate", "Market opportunity, customer research, competition and channel strategy."], ["globe", "Localize", "Product adaptation, sourcing, compliance and local positioning."], ["chart", "Launch", "Brand and packaging adaptation, distribution, go-to-market and sales enablement."]],
    cta: "Explore India market entry", solid: true,
  },
  {
    no: "02", audience: "For founders, entrepreneurs & new products", title: "Sprint incubation", note: ["Starting with", "an idea?", "Let's build it."], profile: "Founder / new product",
    text: "From an early-stage idea to a market-ready product, we bring the strategy, product development and execution together.",
    rows: [["bulb", "Validate", "Customer demand, category opportunity and product-market fit."], ["gear", "Build", "Product formulation or development, positioning, sourcing and brand creation."], ["rocket", "Go to market", "Packaging, quality assurance, manufacturing and launch planning."]],
    cta: "Explore sprint incubation",
  },
];

const ic = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const ICONS = {
  search: <svg {...ic}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></svg>,
  globe: <svg {...ic}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>,
  chart: <svg {...ic} fill="currentColor" stroke="none"><rect x="4" y="13" width="4" height="7" rx=".6" /><rect x="10" y="9" width="4" height="11" rx=".6" /><rect x="16" y="4" width="4" height="16" rx=".6" /></svg>,
  bulb: <svg {...ic}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" /><path d="M12 1v.5M4.2 4.2l.4.4M19.8 4.2l-.4.4M2 11h.6M21.4 11h.6" /></svg>,
  gear: <svg {...ic}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" /><circle cx="12" cy="12" r="6.6" /></svg>,
  rocket: <svg {...ic}><path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9A2.2 2.2 0 0 0 5 15z" /><path d="m12 15-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 21 3c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-3 1z" /><path d="M9 12H5s.5-3 2-4c1.6-1 5 0 5 0M12 15v4s3-.5 4-2c1-1.6 0-5 0-5" /></svg>,
  chat: <svg {...ic} width="26" height="26"><path d="M14.5 4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1v3l3.5-3h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><path d="M16.5 8H19a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-3.5-3H11a2 2 0 0 1-1.6-.8" /><path d="M7 9h.01M10 9h.01M13 9h.01" strokeWidth="2.2" /></svg>,
};

const ease = [0.22, 1, 0.36, 1];
const view = { once: true, amount: 0.25 };
const up = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } } };
const stagger = (gap = 0.1, delay = 0) => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } });
// Handwriting appears left to right, then its arrow draws itself.
const write = { hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0% 0 0)", transition: { duration: 1.1, ease: "easeInOut" } } };
const draw = (delay) => ({ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 0.7, ease: "easeInOut", delay }, opacity: { duration: 0.01, delay } } } });

function Note({ lines, arrow, className, delay = 0.6 }) {
  return <motion.div className={`svc-note ${className}`} aria-hidden="true" initial="hidden" whileInView="show" viewport={view} variants={stagger(0, delay)}>
    <motion.span className="svc-note__text" variants={write}>{lines.map((line) => <span key={line}>{line}</span>)}</motion.span>
    <svg className="svc-note__arrow" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d={arrow[0]} variants={draw(1)} />
      <motion.path d={arrow[1]} variants={draw(1.55)} />
    </svg>
  </motion.div>;
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Services() {
  const reduce = useReducedMotion();
  const lift = reduce ? undefined : { y: -6 };
  return <section id="services" className="svc">
    <div className="container">
      <motion.div className="svc-head" initial="hidden" whileInView="show" viewport={view} variants={stagger(0.12)}>
        <motion.span className="svc-eyebrow" variants={up}>Services</motion.span>
        <motion.h2 variants={up}>Two ways to work with Incubr</motion.h2>
        <motion.p variants={up}>Different starting points. One team to take your product from opportunity to market.</motion.p>
      </motion.div>

      <motion.div className="svc-cards" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger(0.18)}>
        {OFFERS.map((offer, i) => <motion.article key={offer.no} className="svc-card" variants={up} whileHover={lift} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
          <Note lines={offer.note} className={`svc-note--card svc-note--${i + 1}`} delay={0.5 + i * 0.25}
            arrow={i === 0 ? ["M48 4c8 12 4 28-20 36", "M28 40l9-1M28 40l4-8"] : ["M50 6c6 14-2 28-24 34", "M26 40l9 0M26 40l5-8"]} />
          <div className="svc-card__tag"><span>{offer.no}</span><i aria-hidden="true" /><span>{offer.audience}</span></div>
          <h3>{offer.title}</h3>
          <p className="svc-card__text">{offer.text}</p>
          <motion.ul className="svc-rows" variants={stagger(0.12, 0.35)}>
            {offer.rows.map(([icon, label, text]) => <motion.li key={label} variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } }}>
              <motion.span className="svc-rows__icon" variants={{ hidden: { scale: 0.4, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 18 } } }}>{ICONS[icon]}</motion.span>
              <div><strong>{label}</strong><span>{text}</span></div>
            </motion.li>)}
          </motion.ul>
          <button type="button" className={`svc-btn ${offer.solid ? "svc-btn--solid" : "svc-btn--line"}`} onClick={() => navigate(`/book-a-call?profile=${encodeURIComponent(offer.profile)}`)}>
            {offer.cta}<span className="svc-btn__arrow" aria-hidden="true">→</span>
          </button>
        </motion.article>)}
      </motion.div>

      <motion.div className="svc-help" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={up}>
        <span className="svc-help__icon">{ICONS.chat}</span>
        <div className="svc-help__text">
          <span>Not sure which path is right for you?</span>
          <p>Tell us what you're building or where you want to expand. We'll help you find the right starting point.</p>
        </div>
        <button type="button" className="svc-btn svc-btn--solid svc-help__btn" onClick={() => navigate("/book-a-call")}>Let's talk<span className="svc-btn__arrow" aria-hidden="true">→</span></button>
        <Note lines={["A short conversation", "can save you months."]} className="svc-note--help" delay={0.5} arrow={["M58 22C44 18 28 20 8 26", "M8 26l8-6M8 26l9 3"]} />
      </motion.div>
    </div>
  </section>;
}

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { CATEGORIES, POSTS, formatDate, readingTime, slugify } from "./blogPosts";
import "./Blog.css";

const ease = [0.22, 1, 0.36, 1];
const up = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const AUTHOR = "Incubr Team";
const SITE = "Incubr";

// SEO: per-page title, description, canonical URL, social preview tags and structured data.
// Previous values are restored on unmount so the homepage keeps its own tags.
function useSeo({ title, description, type = "website", image, jsonLd }) {
  useEffect(() => {
    const url = window.location.origin + window.location.pathname;
    const restore = [];
    const set = (selector, create, attr, value) => {
      let el = document.head.querySelector(selector);
      if (!el) { el = create(); document.head.appendChild(el); restore.push(() => el.remove()); }
      else { const old = el.getAttribute(attr); restore.push(() => el.setAttribute(attr, old)); }
      el.setAttribute(attr, value);
    };
    const meta = (key, value, by = "name") => set(`meta[${by}="${key}"]`, () => { const m = document.createElement("meta"); m.setAttribute(by, key); return m; }, "content", value);
    const oldTitle = document.title;
    document.title = title;
    meta("description", description);
    meta("og:title", title, "property"); meta("og:description", description, "property"); meta("og:type", type, "property"); meta("og:url", url, "property"); meta("og:site_name", SITE, "property");
    meta("twitter:card", image ? "summary_large_image" : "summary"); meta("twitter:title", title); meta("twitter:description", description);
    if (image) { const src = `${window.location.origin}${image.src}-1600.webp`; meta("og:image", src, "property"); meta("og:image:alt", image.alt, "property"); meta("twitter:image", src); }
    set('link[rel="canonical"]', () => { const l = document.createElement("link"); l.rel = "canonical"; return l; }, "href", url);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", ...jsonLd, ...(image && { image: `${window.location.origin}${image.src}-1600.webp` }), url });
    document.head.appendChild(script);
    return () => { document.title = oldTitle; script.remove(); restore.reverse().forEach((fn) => fn()); };
  }, [title, description, type, image, jsonLd]);
}

// Internal link: a real href (so open-in-new-tab works) that navigates in-app on a normal click.
function Link({ to, navigate, className, children, ...rest }) {
  return <a href={to} className={className} {...rest} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; event.preventDefault(); navigate(to); }}>{children}</a>;
}

function Meta({ post }) {
  return <span className="blog-meta"><span>{AUTHOR}</span><i aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time><i aria-hidden="true" /><span>{readingTime(post)} min read</span></span>;
}

// Responsive photo: WebP at 800 and 1600px, a tone-coloured placeholder, and a soft fade once it has loaded.
function Photo({ image, sizes, priority = false, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  return <img
    className={`blog-photo${loaded ? " is-loaded" : ""} ${className}`}
    src={`${image.src}-1600.webp`}
    srcSet={`${image.src}-800.webp 800w, ${image.src}-1600.webp 1600w`}
    sizes={sizes}
    width={image.w}
    height={image.h}
    alt={image.alt}
    loading={priority ? "eager" : "lazy"}
    fetchPriority={priority ? "high" : "auto"}
    decoding="async"
    style={{ objectPosition: image.position, backgroundColor: image.tone }}
    ref={(el) => { if (el?.complete && !loaded) setLoaded(true); }}
    onLoad={() => setLoaded(true)}
  />;
}

function Credit({ image, className = "" }) {
  const [author, licence, page] = image.credit;
  return <p className={`blog-credit ${className}`}>Photo: <a href={page} target="_blank" rel="noreferrer">{author}</a>, {licence}, via Wikimedia Commons</p>;
}

// Each card animates itself; the index grid is keyed by the filter, so a filter change remounts it and the cards animate in again.
function PostCard({ post, navigate, index = 0 }) {
  return <motion.article className="blog-card" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease, delay: (index % 3) * 0.1 } } }}>
    <Link to={`/blog/${post.slug}`} navigate={navigate} className="blog-card__link">
      <div className="blog-card__img">
        <motion.div className="blog-card__art" variants={{ hidden: { scale: 1.18 }, show: { scale: 1, transition: { duration: 1.4, ease, delay: (index % 3) * 0.1 } } }}><Photo image={post.image} sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 380px" /></motion.div>
        <span className="blog-tag">{post.category}</span>
      </div>
      <div className="blog-card__body">
        <h3><span>{post.title}</span></h3>
        <p>{post.excerpt}</p>
        <div className="blog-card__foot"><Meta post={post} /><span className="blog-card__arrow" aria-hidden="true">→</span></div>
      </div>
    </Link>
  </motion.article>;
}

function BookBand({ navigate }) {
  return <motion.aside className="blog-band" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={stagger}>
    <span className="blog-band__ring" aria-hidden="true" />
    <motion.div variants={up}><span className="blog-eyebrow">Planning an India launch?</span><h2>Turn these ideas into a plan for your brand.</h2></motion.div>
    <motion.button variants={up} type="button" className="blog-btn" onClick={() => navigate("/book-a-call")}>Book an India Readiness Call</motion.button>
  </motion.aside>;
}

// Headline words rise in one after another from behind a mask.
function Words({ text, delay = 0 }) {
  // The space sits outside the masked span; inside an inline-block it would collapse.
  return text.split(" ").map((word, i, all) => <Fragment key={i}><span className="blog-word"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease, delay: delay + i * 0.05 }}>{word}</motion.span></span>{i < all.length - 1 ? " " : null}</Fragment>);
}

function Featured({ post, navigate }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);
  return <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.45 }}>
    <Link to={`/blog/${post.slug}`} navigate={navigate} className="blog-featured">
      <motion.div className="blog-featured__art" style={{ y }}><Photo image={post.image} sizes="(max-width: 1200px) 100vw, 1160px" priority /></motion.div>
      <div className="blog-featured__shade" aria-hidden="true" />
      <div className="blog-featured__body">
        <span className="blog-featured__label"><b>Featured</b>{post.category}</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="blog-featured__foot"><Meta post={post} /><span className="blog-featured__cta">Read article</span></div>
      </div>
    </Link>
  </motion.div>;
}

const INDEX_LD = { "@type": "Blog", name: "Incubr blog", description: "Practical insights on India market entry, product launches and growing a consumer brand.", blogPost: POSTS.map((post) => ({ "@type": "BlogPosting", headline: post.title, datePublished: post.date, url: `/blog/${post.slug}` })) };

export function BlogIndex({ navigate }) {
  const featured = POSTS.find((post) => post.featured) ?? POSTS[0];
  useSeo({ title: "Blog: India market entry and brand launch insights | Incubr", description: "Practical insights on India market entry, product launches and growing a consumer brand, from the Incubr team.", image: featured.image, jsonLd: INDEX_LD });
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const filtering = category !== "All" || query.trim() !== "";
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((post) => (filtering || post !== featured) && (category === "All" || post.category === category) && (!q || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(q)));
  }, [category, query, filtering, featured]);

  return <main className="blog">
    <section className="blog-hero">
      <span className="blog-hero__orb blog-hero__orb--a" aria-hidden="true" />
      <span className="blog-hero__orb blog-hero__orb--b" aria-hidden="true" />
      <div className="container">
        <div className="blog-hero__text">
          <motion.span className="blog-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>Incubr blog</motion.span>
          <h1><Words text="Ideas for building and launching" delay={0.1} />{" "}<em><Words text="brands in India." delay={0.35} /></em></h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.5 }}>Practical insights on India market entry, product launches and growing a consumer brand, from the team that does it on the ground.</motion.p>
          <motion.div className="blog-hero__stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }}><span><b>{POSTS.length}</b> articles</span><span><b>{CATEGORIES.length - 1}</b> topics</span><span>Updated {formatDate(POSTS[0].date)}</span></motion.div>
        </div>
        {!filtering && <Featured post={featured} navigate={navigate} />}
      </div>
    </section>

    <section className="blog-list" aria-label="All articles">
      <div className="container">
        <div className="blog-tools">
          <div className="blog-chips" role="group" aria-label="Filter by topic">
            {CATEGORIES.map((name) => <button key={name} type="button" aria-pressed={category === name} className={`blog-chip${category === name ? " is-active" : ""}`} onClick={() => setCategory(name)}>
              {category === name && <motion.span layoutId="blog-chip" className="blog-chip__bg" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span>{name}</span>
            </button>)}
          </div>
          <label className="blog-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></svg>
            <input type="search" placeholder="Search articles" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search articles" />
            {query && <button type="button" className="blog-search__clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </label>
        </div>
        <p className="blog-count" aria-live="polite">{filtering ? `${list.length} ${list.length === 1 ? "article" : "articles"} found` : "Latest articles"}</p>

        <div className="blog-grid" key={`${category}|${query.trim()}`}>
          {list.map((post, i) => <PostCard key={post.slug} post={post} navigate={navigate} index={i} />)}
        </div>
        {list.length === 0 && <motion.div className="blog-empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p>No articles match that yet.</p><button type="button" className="blog-chip" onClick={() => { setQuery(""); setCategory("All"); }}><span>Show all articles</span></button></motion.div>}

        <BookBand navigate={navigate} />
        <details className="blog-credits"><summary>Photo credits</summary><ul>{POSTS.map((post) => <li key={post.slug}><Credit image={post.image} /></li>)}</ul></details>
      </div>
    </section>
  </main>;
}

function Block({ block: [type, value], first }) {
  if (type === "h2") return <h2 id={slugify(value)}>{value}</h2>;
  if (type === "quote") return <blockquote><p>{value}</p></blockquote>;
  if (type === "list") return <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul>;
  return <p className={first ? "blog-lede" : undefined}>{value}</p>;
}

// Scrollspy: the heading nearest the top of the reading area is the active one.
function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -70% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function Toc({ headings, active, mobile }) {
  const go = (event, id) => { event.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${id}`); };
  const items = <ol>{headings.map(([id, text], i) => <li key={id} className={active === id ? "is-active" : undefined}><a href={`#${id}`} onClick={(event) => go(event, id)}><span>{String(i + 1).padStart(2, "0")}</span>{text}</a></li>)}</ol>;
  if (mobile) return <details className="blog-toc blog-toc--mobile"><summary>On this page</summary>{items}</details>;
  return <nav className="blog-toc blog-toc--side" aria-label="On this page"><span className="blog-toc__title">On this page</span>{items}</nav>;
}

function Share({ post }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ } };
  return <div className="blog-share">
    <span>Share this article</span>
    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
    <a href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
    <button type="button" onClick={copy} aria-label="Copy link">{copied ? "Link copied ✓" : "Copy link"}</button>
  </div>;
}

export function BlogPost({ slug, navigate }) {
  const post = POSTS.find((item) => item.slug === slug);
  const headings = useMemo(() => (post ? post.body.filter(([type]) => type === "h2").map(([, text]) => [slugify(text), text]) : []), [post]);
  const ids = useMemo(() => headings.map(([id]) => id), [headings]);
  const active = useActiveHeading(ids);
  const jsonLd = useMemo(() => (post ? { "@type": "BlogPosting", headline: post.title, description: post.excerpt, datePublished: post.date, dateModified: post.date, articleSection: post.category, author: { "@type": "Organization", name: SITE }, publisher: { "@type": "Organization", name: SITE } } : { "@type": "WebPage" }), [post]);
  useSeo({ title: post ? `${post.title} | Incubr blog` : "Article not found | Incubr", description: post ? post.excerpt : "This article could not be found.", type: post ? "article" : "website", image: post?.image, jsonLd });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  if (!post) return <main className="blog blog-missing"><div className="container"><span className="blog-eyebrow">404</span><h1>We couldn't find that article.</h1><Link to="/blog" navigate={navigate} className="blog-btn">Back to the blog</Link></div></main>;

  const index = POSTS.indexOf(post);
  const related = [...POSTS.slice(index + 1), ...POSTS.slice(0, index)].slice(0, 2);
  const firstP = post.body.findIndex(([type]) => type === "p");
  return <main className="blog blog-post">
    <motion.div className="blog-progress" style={{ scaleX: progress }} />
    <header className="blog-post__head">
      <div className="container">
        <motion.div className="blog-post__hero" initial={{ opacity: 0, clipPath: "inset(6% 4% 6% 4% round 24px)" }} animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 24px)" }} transition={{ duration: 1.1, ease }}>
          <motion.div className="blog-post__photo" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease }}><Photo image={post.image} sizes="(max-width: 1200px) 100vw, 1160px" priority /></motion.div>
          <div className="blog-post__shade" aria-hidden="true" />
          <motion.div className="blog-post__intro" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}>
            <motion.nav variants={up} className="blog-crumbs" aria-label="Breadcrumb"><Link to="/blog" navigate={navigate}>Blog</Link><span aria-hidden="true">/</span><span>{post.category}</span></motion.nav>
            <h1><Words text={post.title} delay={0.45} /></h1>
            <motion.div variants={up}><Meta post={post} /></motion.div>
          </motion.div>
        </motion.div>
        <Credit image={post.image} className="blog-credit--hero" />
        <motion.p className="blog-post__dek" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.8 }}>{post.excerpt}</motion.p>
      </div>
    </header>

    <div className="container blog-post__layout">
      <aside className="blog-post__aside"><Toc headings={headings} active={active} /></aside>
      <article className="blog-prose">
        <Toc headings={headings} active={active} mobile />
        {post.body.map((block, i) => <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease }}><Block block={block} first={i === firstP} /></motion.div>)}
        <Share post={post} />
        <motion.div className="blog-author" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, ease }}>
          <span className="blog-author__mark"><img src="/logo.png" alt="" /></span>
          <div><strong>Written by the {AUTHOR}</strong><p>Incubr runs sprint incubation and India market entry for founders and global consumer brands, on the ground in India and the UAE.</p></div>
        </motion.div>
      </article>
    </div>

    <section className="blog-list blog-list--more">
      <div className="container">
        <BookBand navigate={navigate} />
        <div className="blog-more__head"><span className="blog-eyebrow">Keep reading</span><Link to="/blog" navigate={navigate} className="blog-back">All articles <span aria-hidden="true">→</span></Link></div>
        <div className="blog-grid blog-grid--two">
          {related.map((item, i) => <PostCard key={item.slug} post={item} navigate={navigate} index={i} />)}
        </div>
      </div>
    </section>
  </main>;
}

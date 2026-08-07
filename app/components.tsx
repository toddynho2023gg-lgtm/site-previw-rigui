"use client";

/* Local WebP brand assets avoid an image-optimization runtime dependency. */
/* eslint-disable @next/next/no-img-element */

import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Copy,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Smile,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  mapsUrl,
  navigationItems,
  whatsappUrl,
  type ClinicUnit,
  type Procedure,
} from "./data";
import {
  assets,
  beforeAfter,
  clinic,
  faq,
  featureFlags,
  formatClinicText,
  isConfiguredAsset,
  primaryWhatsappUrl,
  treatments,
  units,
  type IconName,
} from "../src/config/clinic";

type OpenSelector = (source: HTMLElement) => void;
type CustomStyle = CSSProperties & Record<`--${string}`, string | number>;

const navItems = navigationItems;

const iconMap: Record<IconName, LucideIcon> = {
  building: Building2,
  message: MessageCircle,
  heartHandshake: HeartHandshake,
  shield: ShieldCheck,
  book: BookOpen,
  heartPulse: HeartPulse,
  mapPin: MapPin,
  smile: Smile,
  sparkles: Sparkles,
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function useFocusTrap(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>,
) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const first = containerRef.current?.querySelector<HTMLElement>(
        focusableSelector,
      );
      first?.focus();
    }, 20);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) return;
      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus && document.contains(previousFocus)) {
        window.setTimeout(() => previousFocus.focus(), 0);
      }
    };
  }, [containerRef, open, returnFocusRef]);
}

function useReveal<T extends HTMLElement>(threshold = 0.06) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px 90px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, visible]);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CustomStyle}
    >
      {children}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-logo ${compact ? "brand-logo--compact" : ""}`}>
      <img
        src={assets.logo}
        alt={`Logotipo da ${clinic.name}`}
        width={assets.dimensions.logo.width}
        height={assets.dimensions.logo.height}
      />
    </span>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function Header({ onOpenSelector }: { onOpenSelector: OpenSelector }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(
    menuOpen,
    menuRef,
    () => setMenuOpen(false),
    menuButtonRef,
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner container-shell">
        <a
          className="header-brand"
          href="#inicio"
          aria-label={`${clinic.shortName} — início`}
        >
          <Logo compact />
          <span className="header-brand-copy">
            <strong>{clinic.shortName}</strong>
            <small>{clinic.categoryLabel}</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label={clinic.accessibility.primaryNavigation}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={active === item.id ? "is-active" : ""}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="button button--header"
            onClick={(event) => onOpenSelector(event.currentTarget)}
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>{clinic.actions.schedule}</span>
          </button>
          <button
            type="button"
            className="header-whatsapp-mobile"
            aria-label={clinic.actions.chooseUnitAria}
            onClick={(event) => onOpenSelector(event.currentTarget)}
          >
            <MessageCircle size={19} aria-hidden="true" />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="menu-toggle"
            aria-label={clinic.accessibility.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={`mobile-menu-overlay ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div
          ref={menuRef}
          id="mobile-menu"
          className="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label={clinic.accessibility.mainMenu}
        >
          <div className="mobile-menu-top">
            <a
              href="#inicio"
              onClick={closeMenu}
              aria-label={`${clinic.shortName} — início`}
            >
              <Logo />
            </a>
            <button type="button" onClick={closeMenu} aria-label={clinic.accessibility.closeMenu}>
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={clinic.accessibility.mobileNavigation}>
            {navItems.map((item, index) => (
              <a key={item.id} href={item.href} onClick={closeMenu}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
                <ChevronRight size={20} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="button button--primary button--full"
            onClick={(event) => {
              const source = event.currentTarget;
              closeMenu();
              window.setTimeout(() => onOpenSelector(source), 30);
            }}
          >
            {clinic.actions.scheduleLong}
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          <p>{clinic.slogan}</p>
        </div>
      </div>
    </header>
  );
}

export function Hero({ onOpenSelector }: { onOpenSelector: OpenSelector }) {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      if (frame || reduced.matches || window.innerWidth < 900) return;
      frame = window.requestAnimationFrame(() => {
        const rect = heroRef.current?.getBoundingClientRect();
        if (rect && rect.bottom > 0) {
          const offset = Math.max(0, -rect.top) * 0.11;
          image.style.transform = `translate3d(0, ${offset}px, 0) scale(1.24)`;
        }
        frame = 0;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <img
          ref={imageRef}
          src={assets.hero}
          alt={clinic.hero.imageAlt}
          width={assets.dimensions.hero.width}
          height={assets.dimensions.hero.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <span className="hero-glow hero-glow--one" aria-hidden="true" />
      <span className="hero-glow hero-glow--two" aria-hidden="true" />

      <div className="hero-content container-shell">
        <div className="hero-eyebrow hero-sequence hero-sequence--one">
          <span />
          {clinic.hero.eyebrow}
        </div>
        <div className="title-mask hero-sequence hero-sequence--two">
          <h1 id="hero-title">
            {clinic.hero.titlePrefix} <em>{clinic.hero.titleHighlight}</em>{" "}
            {clinic.hero.titleSuffix}
          </h1>
        </div>
        <p className="hero-copy hero-sequence hero-sequence--three">
          {clinic.hero.description}
        </p>
        <div className="hero-buttons hero-sequence hero-sequence--four">
          <button
            type="button"
            className="button button--primary"
            onClick={(event) => onOpenSelector(event.currentTarget)}
          >
            {clinic.hero.primaryCta}
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          {featureFlags.units && units.length > 0 && (
            <a className="button button--glass" href={clinic.hero.secondaryHref}>
              {clinic.hero.secondaryCta}
              <MapPin size={18} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <a className="hero-scroll" href="#proposta">
        <span className="hero-scroll-icon">
          <ArrowDown size={17} aria-hidden="true" />
        </span>
        <span>{clinic.hero.scrollLabel}</span>
      </a>
    </section>
  );
}

export function BenefitsPanel() {
  return (
    <div className="benefits-wrap container-shell" aria-label={clinic.benefitsLabel}>
      <div className="benefits-panel">
        {clinic.benefits.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <div className="benefit-item" key={item.title}>
              <span className="benefit-icon">
                <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span>
                <strong>{formatClinicText(item.title)}</strong>
                <small>{formatClinicText(item.copy)}</small>
              </span>
              {index < clinic.benefits.length - 1 && (
                <i aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  const items = clinic.marquee.map((item) => formatClinicText(item));

  const loop = (hidden = false) => (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={`${hidden ? "copy" : "main"}-${item}`}>
          {item}
          <i aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="brand-marquee" aria-label={items.join(", ")}>
      <div className="marquee-track">
        {loop()}
        {loop(true)}
      </div>
    </div>
  );
}

export function CultureSection() {
  return (
    <section id="proposta" className="culture-section section-pad" aria-labelledby="culture-title">
      <span className="culture-orb culture-orb--one" aria-hidden="true" />
      <span className="culture-orb culture-orb--two" aria-hidden="true" />
      <div className="culture-layout container-shell">
        <div className="culture-intro">
          <Reveal>
            <p className="eyebrow eyebrow--dark">
              <Sparkles size={16} aria-hidden="true" />
              {clinic.culture.eyebrow}
            </p>
            <h2 id="culture-title">{clinic.culture.title}</h2>
            <p className="section-lead">
              {clinic.culture.description}
            </p>
          </Reveal>
        </div>
        <div className="culture-list">
          {clinic.culture.items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <Reveal key={item.number} delay={index * 110}>
                <article className="culture-card">
                  <span className="culture-number" aria-hidden="true">
                    {item.number}
                  </span>
                  <div className="culture-card-icon">
                    <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="culture-kicker">
                      {item.number} — {clinic.culture.cardKicker}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                  <span className="culture-arrow" aria-hidden="true">
                    <ArrowUpRight size={21} />
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BeforeAfterSlider({ procedure }: { procedure: Procedure }) {
  const [value, setValue] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  const updateFromPointer = useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.max(0, Math.min(100, Math.round(next))));
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) updateFromPointer(event.clientX);
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <article className="procedure-card">
      <div
        ref={sliderRef}
        className="before-after"
        style={{ "--split": `${value}%` } as CustomStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <img
          className="comparison-image comparison-image--before"
          src={procedure.before}
          alt={`${clinic.beforeAfterSection.beforeLabel} — ${procedure.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {procedure.placeholder && (
          <span className="placeholder-copy placeholder-copy--before">
            {clinic.beforeAfterSection.beforePlaceholder}
          </span>
        )}

        <div className="after-layer" aria-hidden="true">
          <img
            className="comparison-image comparison-image--after"
            src={procedure.after}
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          {procedure.placeholder && (
            <span className="placeholder-copy placeholder-copy--after">
              {clinic.beforeAfterSection.afterPlaceholder}
            </span>
          )}
        </div>

        <span className="comparison-label comparison-label--before">
          {clinic.beforeAfterSection.beforeLabel}
        </span>
        <span className="comparison-label comparison-label--after">
          {clinic.beforeAfterSection.afterLabel}
        </span>
        <span className="comparison-line" aria-hidden="true">
          <span className="comparison-handle">
            <ArrowLeftRight size={21} strokeWidth={2.2} />
          </span>
        </span>

        <input
          ref={inputRef}
          className="comparison-range"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label={formatClinicText(clinic.accessibility.compareProcedure, {
            procedureName: procedure.title,
          })}
          aria-valuetext={formatClinicText(clinic.accessibility.afterVisible, {
            value: String(value),
          })}
        />
      </div>
      <div className="procedure-copy">
        <span className="procedure-dot" aria-hidden="true" />
        <div>
          <h3>{procedure.title}</h3>
          <p>{procedure.description}</p>
        </div>
      </div>
    </article>
  );
}

export function ProceduresSection() {
  const configuredProcedures = beforeAfter.filter(
    (procedure) =>
      procedure.placeholder ||
      (isConfiguredAsset(procedure.before) && isConfiguredAsset(procedure.after)),
  );

  if (configuredProcedures.length === 0) return null;

  return (
    <section id="resultados" className="procedures-section section-pad" aria-labelledby="procedures-title">
      <span className="procedures-grid-bg" aria-hidden="true" />
      <div className="container-shell">
        <Reveal className="procedures-heading">
          <p className="eyebrow eyebrow--light">
            <ArrowLeftRight size={16} aria-hidden="true" />
            {clinic.beforeAfterSection.eyebrow}
          </p>
          <div className="section-heading-row section-heading-row--light">
            <h2 id="procedures-title">{clinic.beforeAfterSection.title}</h2>
            <p>{clinic.beforeAfterSection.description}</p>
          </div>
        </Reveal>

        <div className="procedures-grid">
          {configuredProcedures.map((procedure, index) => (
            <Reveal key={procedure.id} delay={index * 100} className="procedure-reveal">
              <BeforeAfterSlider procedure={procedure} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="procedures-disclaimer">
            <CircleCheck size={18} aria-hidden="true" />
            {clinic.beforeAfterSection.disclaimer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function TreatmentsSection() {
  if (treatments.length === 0) return null;

  return (
    <section
      id="tratamentos"
      className="optional-content-section section-pad"
      aria-labelledby="treatments-title"
    >
      <div className="container-shell">
        <Reveal className="optional-content-heading">
          <p className="eyebrow eyebrow--dark">
            <Sparkles size={16} aria-hidden="true" />
            {clinic.treatmentsSection.eyebrow}
          </p>
          <div className="section-heading-row">
            <h2 id="treatments-title">{clinic.treatmentsSection.title}</h2>
            <p>{clinic.treatmentsSection.description}</p>
          </div>
        </Reveal>
        <div className="optional-content-grid">
          {treatments.map((treatment, index) => {
            const Icon = iconMap[treatment.icon];
            return (
              <Reveal key={treatment.id} delay={index * 90}>
                <article className="optional-content-card">
                  <span><Icon size={24} aria-hidden="true" /></span>
                  <h3>{treatment.title}</h3>
                  <p>{treatment.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GallerySection() {
  const gallery = assets.gallery.filter((item) => isConfiguredAsset(item.src));
  if (gallery.length === 0) return null;

  return (
    <section id="galeria" className="gallery-section section-pad" aria-labelledby="gallery-title">
      <div className="container-shell">
        <Reveal className="optional-content-heading">
          <p className="eyebrow eyebrow--light">{clinic.gallerySection.eyebrow}</p>
          <div className="section-heading-row section-heading-row--light">
            <h2 id="gallery-title">{clinic.gallerySection.title}</h2>
            <p>{clinic.gallerySection.description}</p>
          </div>
        </Reveal>
        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <Reveal key={item.src} delay={index * 80}>
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (rect) {
          const start = window.innerHeight * 0.78;
          const finish = window.innerHeight * 0.22;
          const raw = (start - rect.top) / Math.max(1, rect.height + start - finish);
          setProgress(Math.max(0, Math.min(1, raw * 1.45)));
        }
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experiencia"
      className="experience-section section-pad"
      aria-labelledby="experience-title"
      style={{ "--timeline-progress": progress } as CustomStyle}
    >
      <div className="container-shell">
        <Reveal className="experience-heading">
          <p className="eyebrow eyebrow--dark">
            <HeartHandshake size={16} aria-hidden="true" />
            {clinic.experience.eyebrow}
          </p>
          <h2 id="experience-title">{clinic.experience.title}</h2>
        </Reveal>

        <div className="timeline">
          <div className="timeline-track" aria-hidden="true">
            <span />
          </div>
          {clinic.experience.steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            const active = progress >= index * 0.28;
            return (
              <article
                className={`timeline-step ${active ? "is-active" : ""}`}
                key={step.number}
              >
                <div className="timeline-marker">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <span className="timeline-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

function UnitCard({ unit, index }: { unit: ClinicUnit; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyText(unit.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Reveal delay={index * 120} className="unit-reveal">
      <article className={`unit-card unit-card--${unit.accent}`}>
        <span className="unit-big-number" aria-hidden="true">
          {unit.number}
        </span>
        <span className="unit-glow" aria-hidden="true" />
        <div className="unit-card-top">
          <span className="unit-pin">
            <MapPin size={24} aria-hidden="true" />
          </span>
          <span className="unit-label">
            {clinic.unitsSection.unitLabel} {unit.number}
          </span>
        </div>
        <h3>{unit.name}</h3>
        <div className="unit-address-row">
          <p>{unit.address}</p>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={formatClinicText(clinic.unitsSection.copyAddressAria, {
              unitName: unit.name,
            })}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <span className="copy-status" aria-live="polite">
          {copied ? clinic.unitsSection.addressCopied : ""}
        </span>
        <div className="unit-contact-line">
          <span>
            <Phone size={16} aria-hidden="true" />
            {unit.phone}
          </span>
          <span>
            <MessageCircle size={16} aria-hidden="true" />
            {unit.whatsapp}
          </span>
        </div>
        <div className="unit-actions">
          <a
            className="button button--whatsapp"
            href={whatsappUrl(unit)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {clinic.actions.whatsapp}
          </a>
          <a
            className="unit-icon-action"
            href={unit.phoneHref}
            aria-label={formatClinicText(clinic.accessibility.callUnit, {
              unitName: unit.name,
            })}
          >
            <Phone size={19} aria-hidden="true" />
            <span>{clinic.actions.call}</span>
          </a>
          <a
            className="unit-icon-action"
            href={mapsUrl(unit)}
            target="_blank"
            rel="noreferrer"
            aria-label={formatClinicText(clinic.accessibility.mapsRoute, {
              unitName: unit.name,
            })}
          >
            <Navigation size={19} aria-hidden="true" />
            <span>{clinic.actions.directions}</span>
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function UnitsSection() {
  return (
    <section id="unidades" className="units-section section-pad" aria-labelledby="units-title">
      <div className="units-wave" aria-hidden="true" />
      <div className="container-shell">
        <Reveal className="units-heading">
          <p className="eyebrow eyebrow--light">
            <MapPin size={16} aria-hidden="true" />
            {formatClinicText(clinic.unitsSection.eyebrow)}
          </p>
          <div className="section-heading-row section-heading-row--light">
            <h2 id="units-title">{formatClinicText(clinic.unitsSection.title)}</h2>
            <p>{clinic.unitsSection.description}</p>
          </div>
        </Reveal>

        <div className="units-grid">
          {units.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="duvidas" className="faq-section section-pad" aria-labelledby="faq-title">
      <div className="container-shell faq-layout">
        <Reveal className="faq-heading">
          <p className="eyebrow eyebrow--dark">{clinic.faqSection.eyebrow}</p>
          <h2 id="faq-title">{clinic.faqSection.title}</h2>
          <p>{clinic.faqSection.description}</p>
          <span className="faq-decoration" aria-hidden="true">
            <span>?</span>
          </span>
        </Reveal>

        <Reveal className="accordion" delay={100}>
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;
            return (
              <div className={`accordion-item ${isOpen ? "is-open" : ""}`} key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.question}</strong>
                    <i aria-hidden="true">
                      <ChevronDown size={20} />
                    </i>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="accordion-panel"
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTA({ onOpenSelector }: { onOpenSelector: OpenSelector }) {
  return (
    <section className="final-cta-section" aria-labelledby="final-cta-title">
      <div className="final-cta-orb final-cta-orb--one" aria-hidden="true" />
      <div className="final-cta-orb final-cta-orb--two" aria-hidden="true" />
      <div className="final-cta-pattern" aria-hidden="true" />
      <div className="container-shell final-cta-inner">
        <Reveal>
          <p className="eyebrow eyebrow--light">
            <Sparkles size={16} aria-hidden="true" />
            {clinic.finalCta.eyebrow}
          </p>
          <h2 id="final-cta-title">{clinic.finalCta.title}</h2>
          <p>{formatClinicText(clinic.finalCta.description)}</p>
          <button
            type="button"
            className="button button--light"
            onClick={(event) => onOpenSelector(event.currentTarget)}
          >
            {clinic.finalCta.button}
            <ArrowUpRight size={20} aria-hidden="true" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

export function UnitSelector({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, dialogRef, onClose, returnFocusRef);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="unit-selector"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-selector-title"
      >
        <div className="dialog-handle" aria-hidden="true" />
        <div className="unit-selector-header">
          <div>
            <span className="dialog-kicker">{clinic.unitSelector.kicker}</span>
            <h2 id="unit-selector-title">{clinic.unitSelector.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={clinic.unitSelector.closeAria}>
            <X size={23} aria-hidden="true" />
          </button>
        </div>
        <p className="unit-selector-intro">
          {clinic.unitSelector.intro}
        </p>
        <div className="unit-selector-list">
          {units.map((unit) => (
            <article key={unit.id} className="selector-unit">
              <span className="selector-unit-number">{unit.number}</span>
              <div className="selector-unit-copy">
                <h3>{unit.name}</h3>
                <span>{unit.neighborhood}</span>
                <p>{unit.shortAddress}</p>
                <small>{unit.whatsapp}</small>
              </div>
              <a
                className="button button--selector"
                href={whatsappUrl(unit)}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
              >
                {clinic.actions.whatsappNow}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <p className="dialog-note">
          <ShieldCheck size={16} aria-hidden="true" />
          {clinic.unitSelector.note}
        </p>
      </div>
    </div>
  );
}

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const directHref =
    units.length === 1 ? whatsappUrl(units[0]) : units.length === 0 ? primaryWhatsappUrl() : null;

  if (directHref) {
    return (
      <div className="whatsapp-float">
        <a
          className="whatsapp-button"
          href={directHref}
          target="_blank"
          rel="noreferrer"
          aria-label={clinic.actions.whatsappAria}
        >
          <MessageCircle size={26} aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="whatsapp-float">
      <div className={`whatsapp-menu ${open ? "is-open" : ""}`} role="menu" aria-hidden={!open}>
        <span>{clinic.unitSelector.menuLabel}</span>
        {units.map((unit) => (
          <a
            key={unit.id}
            href={whatsappUrl(unit)}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <span>
              <strong>{unit.name}</strong>
              <small>{unit.whatsapp}</small>
            </span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        ))}
      </div>
      <button
        type="button"
        className="whatsapp-button"
        aria-label={clinic.actions.whatsappAria}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={26} aria-hidden="true" />}
      </button>
    </div>
  );
}

function MobileBookingBar({ onOpenSelector }: { onOpenSelector: OpenSelector }) {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.02 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`mobile-booking-bar ${footerVisible ? "is-hidden" : ""}`}>
      <button type="button" onClick={(event) => onOpenSelector(event.currentTarget)}>
        <MessageCircle size={18} aria-hidden="true" />
        {clinic.actions.schedule}
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="site-footer" className="site-footer">
      <div className="container-shell footer-grid">
        <div className="footer-brand">
          <a href="#inicio" aria-label={clinic.accessibility.backHome}>
            <Logo />
            <span>
              <strong>{clinic.name}</strong>
              <small>{clinic.slogan}</small>
            </span>
          </a>
          <p>{formatClinicText(clinic.footer.description)}</p>
        </div>

        <div className="footer-links">
          <h2>{clinic.footer.navigationTitle}</h2>
          {navItems.slice(1).map((item) => (
            <a href={item.href} key={item.id}>
              {item.label}
            </a>
          ))}
        </div>

        {units.map((unit) => (
          <div className="footer-unit" key={unit.id}>
            <h2>{unit.name}</h2>
            <p>{unit.shortAddress}</p>
            <a href={unit.phoneHref}>
              <Phone size={15} aria-hidden="true" />
              {unit.phone}
            </a>
            <a href={whatsappUrl(unit)} target="_blank" rel="noreferrer">
              <MessageCircle size={15} aria-hidden="true" />
              {unit.whatsapp}
            </a>
          </div>
        ))}
      </div>
      <div className="container-shell footer-bottom">
        <p>
          © {clinic.copyrightYear} {clinic.name}. {clinic.footer.copyrightSuffix}
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={clinic.actions.backToTop}
        >
          {clinic.actions.backToTop}
          <ArrowUp size={17} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  const openSelector = useCallback((source: HTMLElement) => {
    if (units.length <= 1) {
      const href = units.length === 1 ? whatsappUrl(units[0]) : primaryWhatsappUrl();
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    triggerRef.current = source;
    setSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => setSelectorOpen(false), []);

  return (
    <>
      <ScrollProgress />
      <Header onOpenSelector={openSelector} />
      <main>
        <Hero onOpenSelector={openSelector} />
        <BenefitsPanel />
        <BrandMarquee />
        <CultureSection />
        {featureFlags.treatments && treatments.length > 0 && <TreatmentsSection />}
        {featureFlags.beforeAfter && beforeAfter.length > 0 && <ProceduresSection />}
        {featureFlags.gallery && assets.gallery.length > 0 && <GallerySection />}
        {featureFlags.timeline && <ExperienceTimeline />}
        {featureFlags.units && units.length > 0 && <UnitsSection />}
        {featureFlags.faq && faq.length > 0 && <FAQ />}
        <FinalCTA onOpenSelector={openSelector} />
      </main>
      <Footer />
      {featureFlags.floatingWhatsApp && <WhatsAppFloat />}
      {featureFlags.mobileBookingBar && (
        <MobileBookingBar onOpenSelector={openSelector} />
      )}
      {units.length > 1 && (
        <UnitSelector
          open={selectorOpen}
          onClose={closeSelector}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}

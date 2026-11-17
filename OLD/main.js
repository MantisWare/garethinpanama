// ============ Gareth in Panama — Rio-style interactions ============
// Lenis smooth scroll + GSAP ScrollTrigger/SplitText scroll effects.

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===================== I18N =====================
  const I18N = {
    en: {
      "meta.title": "Gareth in Panama — Property Management & Sales",
      "meta.desc": "Gareth in Panama — property management, sales and investment advisory across Panama City, the Pacific beaches and the highlands. Your partner on the ground.",
      "nav.services": "Services",
      "nav.deals": "Deals",
      "nav.laws": "Laws",
      "nav.cta": "Get in Touch",
      "aria.burger": "Menu",
      "aria.toTop": "Back to top",
      "aria.theme": "Toggle dark mode",
      "hero.h1": "Gareth in Panama — Live your Best Life!",
      "hero.r1": "Gareth",
      "hero.r2a": "in Panama",
      "hero.r2b": "Live your",
      "hero.r3": "Best Life!",
      "hero.l1": "Property Management",
      "hero.l2": "Sales",
      "hero.l3": "Advisory",
      "hero.sub.a": "We manage, sell and scout property",
      "hero.sub.b": "across Panama.",
      mq1: "Property Management",
      mq2: "Property Sales",
      mq3: "Investment Advisory",
      mq4: "Casco Viejo · Panama City",
      mq5: "Pacific Beaches · Pedasí",
      mq6: "Highlands · Boquete",
      "intro.title": "You're probably here to see what we actually do.",
      "intro.p": "We are a property management and sales practice based in Panama. We look after apartments, houses and land for owners abroad — and we source, value and sell property for buyers and investors. Bilingual, local, and allergic to hype.",
      "intro.cta": "See our services",
      "per.kicker": "What matters depends on who you are",
      "per.title": "One of these? You're in the right place.",
      p1t: "Buyers",
      p1d: "You need good options, clear numbers and a deal that holds together.",
      p2t: "Sellers",
      p2d: "You need the right price and a buyer who actually completes.",
      p3t: "Owners",
      p3d: "You need steady rental income and a property that's cared for like your own.",
      p4t: "Investors",
      p4d: "You need someone local who tells you what a comparable won't.",
      "serv.kicker": "Services",
      "serv.title": "What we actually do.",
      s1t: "Property Management",
      s1d: "Hands-off ownership. Tenants placed, rent collected, maintenance done, and monthly reports in plain English or Spanish.",
      s1g1: "Tenant screening", s1g2: "Rent collection", s1g3: "Maintenance", s1g4: "Short & long-term rentals",
      s2t: "Property Sales",
      s2d: "From Casco Viejo apartments to Pedasí land: sourcing, valuation, negotiation and closing — with the paperwork in order.",
      s2g1: "Sourcing", s2g2: "Valuation", s2g3: "Negotiation", s2g4: "Closing",
      s3t: "Investment & Relocation",
      s3d: "Local market sense for investors, and a soft landing for people moving to Panama — residency routes included.",
      s3g1: "Due diligence", s3g2: "Market research", s3g3: "Residency guidance", s3g4: "Portfolio strategy",
      "deals.kicker": "Done deals",
      "deals.title": "A few we've helped clients close.",
      d1loc: "Costa del Este", d1name: "Ocean Golf Residences", d1type: "Apartment", d1status: "Sold",
      d2loc: "Casco Viejo", d2name: "Casa Antigua", d2type: "Colonial house", d2status: "Sold",
      d3loc: "Punta Paitilla", d3name: "Paitilla Sky Tower", d3type: "Apartment", d3status: "Managed",
      d4loc: "Pedasí", d4name: "Venao Hills Lot", d4type: "Land", d4status: "Sold",
      d5loc: "San Francisco", d5name: "Vía España Flat", d5type: "Apartment", d5status: "Leased",
      d6loc: "Bocas del Toro", d6name: "Isla Colón Lot", d6type: "Beach lot", d6status: "Sold",
      "laws.kicker": "When you do a lot of deals, you start to notice patterns.",
      "laws.title": "Gareth's Laws of Property",
      law1a: "A deal that is 99% done is not done.", law1b: "That 1% is everything.",
      law2a: "The Casco Viejo buyer and the Costa del Este buyer are not the same person.", law2b: "Strategy changes with the street.",
      law3a: "Your broker should know the zoning, the yield and the exit.", law3b: "Not just the beach nearby.",
      law4a: "If you have to lean off the balcony to see the ocean, it's not an ocean view.", law4b: "A good view should not require imagination.",
      law5a: "Client matters are not public matters.", law5b: "Discretion is part of the service.",
      law6a: "If the lease is not understood, the asset is not understood.", law6b: "The real value is in the fine print.",
      law7a: "The most expensive mistake is rushing.", law7b: "The second most expensive is hesitating.",
      law8a: "Most deals don't fail on price.", law8b: "They fail on expectations.",
      law9a: "\"Not in a rush\" usually means \"not at that price.\"", law9b: "Timing hides the real objection.",
      law10a: "Never make the listing prettier than the building.", law10b: "Tell the truth in words and photos.",
      "off.title": "We don't list our properties on purpose.",
      "off.p": "Portals are useful. We use them too. But many of our best opportunities are off-market or privately shared. Tell us what you're looking for and we'll show you more.",
      "off.cta": "Get in touch",
      "off.cap": "Boquete, Chiriquí — from the highlands to the ocean, we cover Panama.",
      "cont.kicker": "Let's talk",
      "cont.title": "Tell us what you're looking for.",
      "cont.p": "Every inquiry gets a personal response — usually within a day.",
      "cont.email": "Email",
      "cont.web": "Website",
      "cont.loc": "Location",
      "cont.locv": "Panama City · serving clients worldwide",
      "form.name": "Name *",
      "form.email": "Email *",
      "form.phone": "Phone / WhatsApp",
      "form.interest": "I'm interested in",
      "form.message": "Message *",
      "form.submit": "Send Message",
      "form.sending": "Sending…",
      "form.o1": "Property Management",
      "form.o2": "Buying a Property",
      "form.o3": "Selling a Property",
      "form.o4": "Investment / Relocation",
      "form.o5": "Something Else",
      "form.ph.name": "Your full name",
      "form.ph.email": "you@email.com",
      "form.ph.message": "Tell us a little about your property or what you're looking for...",
      "form.success": "Thank you! Your message has been sent — we'll be in touch shortly.",
      "form.error": "Something went wrong. Please email us directly at info@garethinpanama.com.",
      "form.subject": "New inquiry — garethinpanama.com",
      "footer.text": "Gareth in Panama — Live your Best Life!",
      "footer.credit": "Photography via Wikimedia Commons",
      "dl.guide": "Panama Guidebook",
      "dl.guide.sub": "PDF · 100 pages",
      "dl.brochure": "Real Estate Brochure",
      "dl.brochure.sub": "PDF · 13 pages",
    },
    es: {
      "meta.title": "Gareth in Panama — Administración y Venta de Propiedades",
      "meta.desc": "Gareth in Panama — administración, venta y asesoría de propiedades en Ciudad de Panamá, las playas del Pacífico y las tierras altas. Tu socio en el terreno.",
      "nav.services": "Servicios",
      "nav.deals": "Tratos",
      "nav.laws": "Leyes",
      "nav.cta": "Contáctanos",
      "aria.burger": "Menú",
      "aria.toTop": "Volver arriba",
      "aria.theme": "Cambiar modo oscuro",
      "hero.h1": "Gareth in Panama — ¡Vive tu mejor vida!",
      "hero.r1": "Gareth",
      "hero.r2a": "in Panama",
      "hero.r2b": "¡Vive tu",
      "hero.r3": "mejor vida!",
      "hero.l1": "Administración de Propiedades",
      "hero.l2": "Ventas",
      "hero.l3": "Asesoría",
      "hero.sub.a": "Administramos, vendemos y buscamos propiedades",
      "hero.sub.b": "en todo Panamá.",
      mq1: "Administración de Propiedades",
      mq2: "Venta de Propiedades",
      mq3: "Asesoría de Inversión",
      mq4: "Casco Antiguo · Ciudad de Panamá",
      mq5: "Playas del Pacífico · Pedasí",
      mq6: "Tierras Altas · Boquete",
      "intro.title": "Seguramente vienes a ver qué hacemos realmente.",
      "intro.p": "Somos una firma de administración y venta de propiedades con base en Panamá. Cuidamos apartamentos, casas y terrenos para propietarios en el extranjero — y buscamos, valoramos y vendemos propiedades para compradores e inversionistas. Bilingües, locales y alérgicos al humo.",
      "intro.cta": "Ver nuestros servicios",
      "per.kicker": "Lo que importa depende de quién eres",
      "per.title": "¿Eres uno de estos? Estás en el lugar correcto.",
      p1t: "Compradores",
      p1d: "Necesitas buenas opciones, números claros y un trato que se sostenga.",
      p2t: "Vendedores",
      p2d: "Necesitas el precio correcto y un comprador que de verdad cierre.",
      p3t: "Propietarios",
      p3d: "Necesitas renta estable y una propiedad cuidada como si fuera tuya.",
      p4t: "Inversionistas",
      p4d: "Necesitas alguien local que te diga lo que un comparativo no dice.",
      "serv.kicker": "Servicios",
      "serv.title": "Lo que realmente hacemos.",
      s1t: "Administración de Propiedades",
      s1d: "Propiedad sin dolores de cabeza. Inquilinos colocados, renta cobrada, mantenimiento al día e informes mensuales claros, en inglés o en español.",
      s1g1: "Selección de inquilinos", s1g2: "Cobro de renta", s1g3: "Mantenimiento", s1g4: "Renta corta y larga",
      s2t: "Venta de Propiedades",
      s2d: "Desde apartamentos en Casco Antiguo hasta terrenos en Pedasí: búsqueda, valoración, negociación y cierre — con los papeles en orden.",
      s2g1: "Búsqueda", s2g2: "Valoración", s2g3: "Negociación", s2g4: "Cierre",
      s3t: "Inversión y Reubicación",
      s3d: "Sentido de mercado local para inversionistas, y un aterrizaje suave para quienes se mudan a Panamá — incluyendo rutas de residencia.",
      s3g1: "Due diligence", s3g2: "Investigación de mercado", s3g3: "Orientación de residencia", s3g4: "Estrategia de portafolio",
      "deals.kicker": "Tratos cerrados",
      "deals.title": "Algunos tratos que hemos ayudado a cerrar.",
      d1loc: "Costa del Este", d1name: "Residencias Ocean Golf", d1type: "Apartamento", d1status: "Vendido",
      d2loc: "Casco Antiguo", d2name: "Casa Antigua", d2type: "Casa colonial", d2status: "Vendida",
      d3loc: "Punta Paitilla", d3name: "Paitilla Sky Tower", d3type: "Apartamento", d3status: "Administrado",
      d4loc: "Pedasí", d4name: "Lote Venao Hills", d4type: "Terreno", d4status: "Vendido",
      d5loc: "San Francisco", d5name: "Apartamento Vía España", d5type: "Apartamento", d5status: "Rentado",
      d6loc: "Bocas del Toro", d6name: "Lote Isla Colón", d6type: "Lote de playa", d6status: "Vendido",
      "laws.kicker": "Cuando cierras muchos tratos, empiezas a notar patrones.",
      "laws.title": "Las Leyes de Gareth",
      law1a: "Un trato completado al 99% no está completado.", law1b: "Ese 1% lo es todo.",
      law2a: "El comprador de Casco Antiguo y el de Costa del Este no son la misma persona.", law2b: "La estrategia cambia con la calle.",
      law3a: "Tu asesor debe conocer el uso de suelo, el rendimiento y la salida.", law3b: "No solo la playa cercana.",
      law4a: "Si tienes que asomarte del balcón para ver el mar, no es vista al mar.", law4b: "Una buena vista no debe requerir imaginación.",
      law5a: "Los asuntos de los clientes no son asuntos públicos.", law5b: "La discreción es parte del servicio.",
      law6a: "Si el contrato de renta no se entiende, el activo no se entiende.", law6b: "El valor real está en la letra pequeña.",
      law7a: "El error más caro es tener prisa.", law7b: "El segundo más caro es dudar.",
      law8a: "La mayoría de los tratos no fallan por el precio.", law8b: "Fallan por las expectativas.",
      law9a: "\"No tengo prisa\" suele significar \"no a ese precio.\"", law9b: "El tiempo esconde la verdadera objeción.",
      law10a: "Nunca hagas que el anuncio se vea mejor que el edificio.", law10b: "Di la verdad en palabras y fotos.",
      "off.title": "No publicamos nuestras propiedades a propósito.",
      "off.p": "Los portales son útiles. Nosotros también los usamos. Pero muchas de nuestras mejores oportunidades están fuera del mercado o se comparten en privado. Cuéntanos qué buscas y te mostraremos más.",
      "off.cta": "Contáctanos",
      "off.cap": "Boquete, Chiriquí — de las tierras altas al océano, cubrimos todo Panamá.",
      "cont.kicker": "Hablemos",
      "cont.title": "Cuéntanos qué buscas.",
      "cont.p": "Cada consulta recibe una respuesta personal — normalmente en un día.",
      "cont.email": "Correo",
      "cont.web": "Sitio web",
      "cont.loc": "Ubicación",
      "cont.locv": "Ciudad de Panamá · atendemos clientes en todo el mundo",
      "form.name": "Nombre *",
      "form.email": "Correo *",
      "form.phone": "Teléfono / WhatsApp",
      "form.interest": "Me interesa",
      "form.message": "Mensaje *",
      "form.submit": "Enviar mensaje",
      "form.sending": "Enviando…",
      "form.o1": "Administración de Propiedades",
      "form.o2": "Comprar una propiedad",
      "form.o3": "Vender una propiedad",
      "form.o4": "Inversión / Reubicación",
      "form.o5": "Otra cosa",
      "form.ph.name": "Tu nombre completo",
      "form.ph.email": "tu@correo.com",
      "form.ph.message": "Cuéntanos un poco sobre tu propiedad o lo que buscas...",
      "form.success": "¡Gracias! Tu mensaje ha sido enviado — nos pondremos en contacto muy pronto.",
      "form.error": "Algo salió mal. Escríbenos directamente a info@garethinpanama.com.",
      "form.subject": "Nueva consulta — garethinpanama.com",
      "footer.text": "Gareth in Panama — ¡Vive tu mejor vida!",
      "footer.credit": "Fotografías vía Wikimedia Commons",
      "dl.guide": "Guía de Panamá",
      "dl.guide.sub": "PDF · 100 páginas",
      "dl.brochure": "Folleto Inmobiliario",
      "dl.brochure.sub": "PDF · 13 páginas",
    },
  };

  const LANG_KEY = "gip-lang";
  const THEME_KEY = "gip-theme";
  const langBtns = Array.from(document.querySelectorAll(".lang-switch button"));
  let lang = "en";
  try {
    lang =
      localStorage.getItem(LANG_KEY) ||
      ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
  } catch (e) {
    lang = ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
  }
  if (!I18N[lang]) lang = "en";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";
  }

  const form = document.getElementById("contactForm");

  function applyLang() {
    document.documentElement.setAttribute("lang", lang);
    document.title = t("meta.title");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));

    // keep the social embed (Open Graph / Twitter) in sync with the language
    [["og:title", "meta.title"], ["og:description", "meta.desc"],
     ["twitter:title", "meta.title"], ["twitter:description", "meta.desc"]].forEach(
      ([sel, key]) => {
        const m =
          document.querySelector(`meta[property="${sel}"]`) ||
          document.querySelector(`meta[name="${sel}"]`);
        if (m) m.setAttribute("content", t(key));
      }
    );

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-ph"));
      if (value) el.setAttribute("placeholder", value);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-aria"));
      if (value) el.setAttribute("aria-label", value);
    });

    langBtns.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    const subject = form.querySelector('input[name="_subject"]');
    if (subject) subject.value = t("form.subject");
  }

  // ===================== THEME (light / dark) =====================
  const themeToggle = document.getElementById("themeToggle");
  let theme = "light";
  try {
    theme =
      localStorage.getItem(THEME_KEY) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (e) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(next) {
    theme = next;
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
  }
  applyTheme(theme);
  themeToggle.addEventListener("click", () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  });

  // ===================== LENIS SMOOTH SCROLL =====================
  let lenis = null;
  const hasLenis = typeof window.Lenis === "function" && !reducedMotion;
  if (hasLenis) {
    lenis = new window.Lenis();
  }

  // ===================== NAV / MENU =====================
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      toTop.classList.toggle("show", window.scrollY > 600);
    },
    { passive: true }
  );

  function scrollToTarget(target, immediate) {
    if (lenis) {
      lenis.scrollTo(target, {
        duration: immediate ? 0 : 1.4,
        offset: typeof target === "number" ? 0 : -72,
      });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  toTop.addEventListener("click", () => scrollToTarget(0));

  function closeMenu() {
    document.body.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
  }
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  // downloads start in the background — close the overlay so the user isn't stuck behind it
  document.querySelectorAll(".menu-dl").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });

  // ===================== GSAP SCROLL EFFECTS =====================
  const hasGSAP =
    typeof window.gsap === "object" &&
    window.gsap &&
    window.ScrollTrigger &&
    window.SplitText &&
    !reducedMotion;

  let splitInstances = [];
  let animsBuilt = false;
  let animCtx = null;

  // Kill all tweens/ScrollTriggers and restore the un-split DOM.
  // Must run BEFORE applyLang() on a language switch: SplitText.revert()
  // restores the content captured at split time, so translating first
  // and reverting afterwards would resurrect the old language's text.
  function revertAnims() {
    if (animCtx) animCtx.revert();
    animCtx = null;
    splitInstances.forEach((s) => s.revert());
    splitInstances = [];
  }

  function buildAnims() {
    if (!hasGSAP) return;

    // rebuild (e.g. after language switch): revert everything to clean state
    revertAnims();

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    const SplitText = window.SplitText;
    gsap.registerPlugin(ST, SplitText);

    animCtx = gsap.context(() => {
      // Like Rio's engine: on phones we skip split/transform effects and keep
      // only cheap opacity fades — smooth scrolling on low-power devices.
      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
      // ---- hero splits ----
      const heroCharSplits = [];
      document.querySelectorAll('[data-split="chars"][data-anim-load]').forEach((el) => {
        const split = SplitText.create(el, { type: "chars", mask: "chars" });
        splitInstances.push(split);
        heroCharSplits.push(split);
      });
      const heroLineSplits = [];
      document.querySelectorAll('[data-split="lines"][data-anim-load]').forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines" });
        splitInstances.push(split);
        heroLineSplits.push(split);
      });

      // ---- hero entrance (Rio preloader sequence, exact values) ----
      // chars slide in horizontally from the right, rows offset by 0.1s each
      // (runs at 2x speed so everything lands before the user scrolls away)
      const intro = gsap.timeline({ delay: 0.15 }).timeScale(2);
      heroCharSplits.forEach((s, i) => {
        intro.from(
          s.chars,
          { xPercent: 100, duration: 1.5, ease: "expo.out", stagger: { each: 0.125 } },
          i === 0 ? 0 : "+=0.1"
        );
      });
      // big brand emblem: slides in from the left (mirrors the text from the right)
      const heroLogo = document.querySelector(".hero-logo");
      if (heroLogo) {
        intro.from(
          heroLogo,
          { xPercent: -130, autoAlpha: 0, duration: 1.5, ease: "expo.out" },
          "+=0.15"
        );
        // gentle idle float once the entrance settles
        gsap.to(heroLogo, {
          y: -8,
          duration: 3.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 2.2,
        });
      }

      // side paragraphs: lines slide in from the right, scaled up from 0.5
      if (heroLineSplits[0]) {
        intro.from(
          heroLineSplits[0].lines,
          { xPercent: 100, scale: 0.5, duration: 1.75, ease: "expo.out", stagger: { each: 0.125 } },
          "+=0.3"
        );
      }
      if (heroLineSplits[1]) {
        intro.from(
          heroLineSplits[1].lines,
          { xPercent: 100, scale: 0.5, duration: 1.75, ease: "expo.out", stagger: { each: 0.125 } },
          "<"
        );
      }

      // ---- hero on scroll (Rio data-home-hero): rows fly apart horizontally
      // while the background zooms toward the viewer, then the page scrolls on.
      const row1 = document.querySelector(".hero-row:not(.hero-row-split):not(.hero-row-end)");
      const row2a = document.querySelector(".hero-row-split > span:first-child");
      const row2b = document.querySelector(".hero-knows");
      const row3 = document.querySelector(".hero-row-end");
      const heroAside = document.querySelector(".hero-aside");
      const heroCopy = document.querySelector(".hero-copy");
      const heroOverlay = document.querySelector(".hero-overlay");
      const heroBg = document.querySelector(".hero-bg");

      const fly = gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom center", scrub: 0.5 },
      });
      if (row1) fly.to(row1, { xPercent: -175 }, 0);
      if (row2a) fly.to(row2a, { xPercent: -125 }, 0);
      if (row2b) fly.to(row2b, { xPercent: 150 }, 0);
      if (row3) fly.to(row3, { xPercent: 125 }, 0);
      if (heroAside) fly.to(heroAside, { xPercent: -125 }, 0);
      if (heroCopy) fly.to(heroCopy, { xPercent: 300 }, 0);
      if (heroOverlay) fly.to(heroOverlay, { opacity: 0, ease: "power2.inOut" }, 0);
      if (heroBg) fly.to(heroBg, { scale: 1.45, ease: "none" }, 0);
      }

      // ---- scroll reveals — words / lines (Rio values, desktop only) ----
      document.querySelectorAll('[data-anim-scroll="words"], [data-anim-scroll="lines"]').forEach((el) => {
        if (isMobile) return;
        const mode = el.dataset.animScroll === "words" ? "words" : "lines";
        const split = SplitText.create(el, { type: mode, mask: mode });
        splitInstances.push(split);
        gsap.from(split[mode + "s"], {
          yPercent: mode === "words" ? 115 : 125,
          delay: mode === "words" ? 0 : 0.125,
          duration: 2,
          ease: "expo.out",
          stagger: { each: (+(el.dataset.number || 50)) / 1000 },
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 90%",
            toggleActions: "none play none reset",
          },
        });
      });

      // ---- scroll reveals — fade (Rio: opacity only) ----
      document.querySelectorAll('[data-anim-scroll="fade"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          duration: 1.66,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 90%",
            toggleActions: "none play none reset",
          },
        });
      });

      // ---- scroll reveals — children-fade (Rio values) ----
      document.querySelectorAll('[data-anim-scroll="children-fade"]').forEach((el) => {
        gsap.from(el.children, {
          opacity: 0,
          yPercent: isMobile ? 0 : 15,
          duration: 1.66,
          ease: "power3.out",
          stagger: { each: 0.125 },
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 90%",
            toggleActions: "none play none reset",
          },
        });
      });

      // ---- scroll reveals — scaleX borders (Rio values) ----
      document.querySelectorAll('[data-anim-scroll="scaleX"]').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 2,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 90%",
            toggleActions: "none play none reset",
          },
        });
      });

      // ---- scroll scrub — image zoom (Rio scrub-scale: from 1.25) ----
      document.querySelectorAll('[data-anim-scroll="scrub-scale"]').forEach((el) => {
        if (isMobile) return;
        gsap.from(el, {
          scale: 1.25,
          ease: "power1.out",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
        });
      });
    });

    animsBuilt = true;
  }

  // Lenis ↔ GSAP integration (standard)
  if (hasGSAP && hasLenis) {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    lenis.on("scroll", ST.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else if (hasLenis) {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // rebuild when crossing the phone breakpoint (rotation, resize)
  const phoneMQ = window.matchMedia("(max-width: 768px)");
  if (typeof phoneMQ.addEventListener === "function") {
    phoneMQ.addEventListener("change", () => buildAnims());
  } else if (typeof phoneMQ.addListener === "function") {
    phoneMQ.addListener(() => buildAnims());
  }

  // build once fonts are ready (splits need final metrics), rebuild on language switch
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(() => buildAnims());
  } else {
    buildAnims();
  }

  langBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
      revertAnims(); // un-split first (see note on revertAnims)
      applyLang();   // translate the clean DOM
      buildAnims();   // re-split the translated text + rebuild effects
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    })
  );
  applyLang();

  // ===================== MARQUEE (velocity-reactive) =====================
  const track = document.getElementById("marqueeTrack");
  if (track && !reducedMotion) {
    track.classList.remove("css-anim");
    let x = 0;
    let velocity = 0;
    let lastScroll = window.scrollY;

    window.addEventListener(
      "scroll",
      () => {
        const delta = window.scrollY - lastScroll;
        lastScroll = window.scrollY;
        velocity += Math.min(Math.abs(delta) * 0.05, 6);
      },
      { passive: true }
    );

    (function marqueeTick() {
      requestAnimationFrame(marqueeTick);
      const half = track.scrollWidth / 2;
      if (half > 0) {
        x -= 0.55 + velocity;
        velocity *= 0.92;
        if (x <= -half) x += half;
        track.style.transform = `translateX(${x.toFixed(2)}px)`;
      }
    })();
  } else if (track) {
    track.classList.add("css-anim");
  }

  // ===================== FOOTER YEAR =====================
  document.getElementById("year").textContent = new Date().getFullYear();

  // ===================== FORM =====================
  const status = document.getElementById("formStatus");

  // Preferred: our own PHP endpoint (send.php) on PHP-capable hosting.
  // If it isn't reachable (static hosting), fall back to the FormSubmit relay.
  async function sendViaPHP(data) {
    const res = await fetch("send.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        action: "contact",
        lang,
        name: data.get("name") || "",
        email: data.get("email") || "",
        phone: data.get("phone") || "",
        interest: data.get("interest") || "",
        message: data.get("message") || "",
        _honey: data.get("_honey") || "",
      }),
    });
    const json = await res.json();
    if (json && typeof json.ok === "boolean") return json; // endpoint answered: honor it
    throw new Error("bad json");
  }

  async function sendViaRelay(data) {
    const res = await fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("relay failed");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const swap = btn.querySelector(".btn-swap-text > span");
    const label = swap || btn;
    btn.disabled = true;
    label.textContent = t("form.sending");
    status.className = "form-status";

    const data = new FormData(form);
    try {
      let result;
      try {
        result = await sendViaPHP(data);
      } catch (phpErr) {
        await sendViaRelay(data);
        result = { ok: true, message: t("form.success") };
      }
      if (result.ok) {
        status.textContent = result.message || t("form.success");
        status.className = "form-status success";
        form.reset();
      } else {
        status.textContent = result.message || t("form.error");
        status.className = "form-status error";
      }
    } catch (err) {
      status.textContent = t("form.error");
      status.className = "form-status error";
    } finally {
      btn.disabled = false;
      label.textContent = t("form.submit");
    }
  });
})();

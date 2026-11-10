"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useEffect, useState, type CSSProperties, type TouchEvent } from "react";
import { supabase } from "@/lib/supabase";

// ==========================================
// TYPES & DONNÉES STATIQUES
// ==========================================

type Service = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  size: string;
  length: string;
  active?: boolean;
};

type Review = {
  id?: number | string;
  name: string;
  service: string;
  text: string;
  rating?: number;
  category?: string;
};

const SERVICES: Service[] = [
  {
    id: "knotless",
    name: "Knotless braids",
    category: "Knotless",
    description: "Des tresses légères et protectrices, personnalisées selon votre style.",
    price: 85,
    image: "https://res.cloudinary.com/kzg6foiy/image/upload/v1794185187/mouams-hairstyle/v1dalofdyf9m9m69icot.jpg",
    size: "Moyenne",
    length: "Épaules",
    active: true,
  },
  {
    id: "boho",
    name: "Boho braids",
    category: "Braids",
    description: "Un mélange de tresses et de boucles pour une finition souple et aérienne.",
    price: 120,
    image: "https://res.cloudinary.com/kzg6foiy/image/upload/v1794185179/mouams-hairstyle/rsdorkxm44z6kxk9avxp.jpg",
    size: "Fine",
    length: "Mi-dos",
    active: true,
  },
  {
    id: "fulani",
    name: "Fulani braids",
    category: "Tresses",
    description: "Une coiffure graphique et élégante avec des détails qui attirent le regard.",
    price: 95,
    image: "https://res.cloudinary.com/kzg6foiy/image/upload/v1794185195/mouams-hairstyle/qq6y9ztpvukdm3hbdl61.jpg",
    size: "Moyenne",
    length: "Longues",
    active: true,
  },
  {
    id: "signature",
    name: "Tresses signature",
    category: "Tresses",
    description: "Une création sur mesure, pensée avec vous pour vous ressembler.",
    price: 75,
    image: "https://res.cloudinary.com/kzg6foiy/image/upload/v1794185171/mouams-hairstyle/awp7nvp0smmpgiztfzqr.jpg",
    size: "Large",
    length: "Mi-dos",
    active: true,
  },
];

const TIME_SLOTS = ["08:00", "10:30", "13:00", "15:30", "18:00"];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Aïcha",
    service: "Knotless braids",
    text: "Un moment doux, une coiffure magnifique et beaucoup de soin dans chaque détail.",
  },
  {
    id: 2,
    name: "Mélissa",
    service: "Boho braids",
    text: "Mouam's a parfaitement compris ce que je voulais. Je suis repartie ravie.",
  },
  {
    id: 3,
    name: "Sarah",
    service: "Fulani braids",
    text: "Une vraie parenthèse beauté. Les tresses sont encore plus belles que dans mon inspiration.",
  },
];

const COUNTRY_CODES = [
  { code: "+32", name: "Belgique" },
  { code: "+33", name: "France" },
  { code: "+352", name: "Luxembourg" },
  { code: "+41", name: "Suisse" },
  { code: "+49", name: "Allemagne" },
];

const SCHOOL_HOLIDAY_RANGES = [
  ["2026-10-26", "2026-11-01"],
  ["2026-12-21", "2027-01-03"],
  ["2027-02-15", "2027-02-21"],
  ["2027-03-29", "2027-04-11"],
  ["2027-07-01", "2027-08-31"],
];

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function isSchoolHoliday(date: string) {
  return SCHOOL_HOLIDAY_RANGES.some(([start, end]) => date >= start && date <= end);
}

function getCategories(category: string) {
  return category.split(",").map((item) => item.trim()).filter(Boolean);
}

function getTodayIsoDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function isBookableDate(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return date >= getTodayIsoDate() && (day === 0 || day === 6 || isSchoolHoliday(date));
}

// ==========================================
// SOUS-COMPOSANT : CALENDRIER
// ==========================================

function WeekendCalendar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const today = getTodayIsoDate();
  const minimumMonth = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, 1);
  const [month, setMonth] = useState(() => (value ? new Date(`${value}T12:00:00`) : minimumMonth));

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthLabel = month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const isBeforeMinimumMonth = month < minimumMonth;

  const dateForDay = (day: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="weekend-calendar">
      <div className="calendar-header">
        <button
          type="button"
          disabled={isBeforeMinimumMonth}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Mois précédent"
        >
          ←
        </button>
        <strong>{monthLabel}</strong>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-days">
        {Array.from({ length: firstDay }, (_, index) => (
          <span className="calendar-empty" key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const isoDate = dateForDay(day);
          const past = isoDate < today;
          const holiday = isSchoolHoliday(isoDate);
          const selectable = isBookableDate(isoDate);

          return (
            <button
              type="button"
              key={isoDate}
              disabled={!selectable}
              className={`
                ${selectable ? "calendar-weekend" : "calendar-weekday"} 
                ${past ? "calendar-past" : ""} 
                ${holiday ? "calendar-holiday" : ""} 
                ${value === isoDate ? "selected" : ""}
              `}
              onClick={() => onChange(isoDate)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export default function Home() {
  // États globaux & locaux
  const [siteServices, setSiteServices] = useState<Service[]>(SERVICES);
  const [filters, setFilters] = useState<string[]>(["Tout voir", "Knotless", "Braids", "Tresses"]);
  const [filter, setFilter] = useState("Tout voir");
  const [activeService, setActiveService] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<Service | null>(null);

  // États de réservation
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [countryCode, setCountryCode] = useState("+32");
  const [bookingStyle, setBookingStyle] = useState<Service>(SERVICES[0]);
  const [withHair, setWithHair] = useState(true);

  // États des avis
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewCategory, setReviewCategory] = useState(SERVICES[0].category);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeReview, setActiveReview] = useState(0);

  // UI & Navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [siteSlots, setSiteSlots] = useState<string[]>(TIME_SLOTS);
  const [galleryPage, setGalleryPage] = useState(0);
  const [serviceTouchStart, setServiceTouchStart] = useState<number | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Variables calculées
  const unavailableSlots = blockedSlots;
  const visibleStyles = filter === "Tout voir" ? siteServices : siteServices.filter((s) => getCategories(s.category).includes(filter));
  const galleryPageSize = 6;
  const galleryPageCount = Math.max(1, Math.ceil(visibleStyles.length / galleryPageSize));
  const displayedStyles = visibleStyles.slice(galleryPage * galleryPageSize, (galleryPage + 1) * galleryPageSize);
  const galleryColumns = Array.from({ length: 4 }, (_, columnIndex) =>
    displayedStyles.filter((_, index) => index % 4 === columnIndex)
  );
  const currentService = siteServices[activeService] ?? siteServices[0];
  const bookingPrice = bookingStyle ? bookingStyle.price : 0;
  const isBookingComplete = customerName.trim() !== "" && customerWhatsapp.trim() !== "" && selectedDate !== "" && selectedSlot !== "";

  // Chargement des données partagées depuis Supabase.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const loadPublicData = async () => {
      const [servicesResult, slotsResult, reviewsResult] = await Promise.all([
        client.from("services").select("*").eq("active", true).order("created_at"),
        client.from("time_slots").select("time, is_blocked, sort_order").order("sort_order").order("time"),
        client.from("reviews").select("id, name, service, comment, rating, category").eq("approved", true).order("created_at"),
      ]);
      if (!servicesResult.error && servicesResult.data?.length) {
        const services = servicesResult.data.map((service) => ({
          ...service,
          image: service.image_url,
          price: Number(service.price),
        })) as Service[];
        setSiteServices(services);
        setBookingStyle((current) => services.find((service) => service.name === current.name) ?? services[0]);
        setFilters(["Tout voir", ...Array.from(new Set(services.flatMap((service) => getCategories(service.category))))]);
      }
      if (!slotsResult.error && slotsResult.data?.length) {
        setSiteSlots(slotsResult.data.map((slot) => slot.time));
        setBlockedSlots(slotsResult.data.filter((slot) => slot.is_blocked).map((slot) => slot.time));
      }
      if (!reviewsResult.error && reviewsResult.data?.length) {
        setDisplayedReviews([
          ...INITIAL_REVIEWS,
          ...reviewsResult.data.map((review) => ({ ...review, text: review.comment })) as Review[],
        ]);
      }
    };

    void loadPublicData();
    const channel = client
      .channel("public-catalogue")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, loadPublicData)
      .on("postgres_changes", { event: "*", schema: "public", table: "time_slots" }, loadPublicData)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, loadPublicData)
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  // Gestion du scroll progress
  useEffect(() => {
    function updateScrollProgress() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0);
    }

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  // Actions de soumission
  async function submitBooking() {
    if (!isBookingComplete) return;
    if (!supabase) return;
    setBookingSubmitting(true);
    setBookingError("");
    const { error } = await supabase.from("appointments").insert({
      name: customerName.trim(),
      whatsapp: `${countryCode} ${customerWhatsapp.trim()}`,
      service: bookingStyle.name,
      date: selectedDate,
      time: selectedSlot,
      status: "En attente",
    });
    if (error) {
      setBookingError("La demande n’a pas pu être envoyée. Réessayez dans un instant.");
      setBookingSubmitting(false);
      return;
    }

    // Reset
    setCustomerName("");
    setCustomerWhatsapp("");
    setSelectedDate("");
    setSelectedSlot("");
    setDateError("");
    setBookingOpen(false);
    setBookingSubmitting(false);
  }

  async function submitReview() {
    if (!reviewName.trim() || !reviewComment.trim() || reviewRating === 0) return;
    if (!supabase) return;
    const { error } = await supabase.from("reviews").insert({
      name: reviewName.trim(),
      comment: reviewComment.trim(),
      rating: reviewRating,
      service: bookingStyle.name,
      category: reviewCategory,
      approved: false,
    });
    if (error) return;

    // Reset
    setReviewName("");
    setReviewComment("");
    setReviewRating(0);
    setReviewSent(true);
  }

  function openBooking(service = bookingStyle) {
    setBookingStyle(service);
    setSelectedStyle(null);
    setBookingOpen(true);
  }

  function changeService(direction: number) {
    if (siteServices.length === 0) return;
    setActiveService((current) => (current + direction + siteServices.length) % siteServices.length);
  }

  function handleServiceTouchStart(event: TouchEvent<HTMLDivElement>) {
    setServiceTouchStart(event.changedTouches[0]?.clientX ?? null);
  }

  function handleServiceTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (serviceTouchStart === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? serviceTouchStart) - serviceTouchStart;
    if (Math.abs(distance) >= 45) changeService(distance < 0 ? 1 : -1);
    setServiceTouchStart(null);
  }

  function chooseDate(value: string) {
    if (!value) {
      setSelectedDate("");
      setDateError("");
      return;
    }
    if (!isBookableDate(value)) {
      setSelectedDate("");
      setDateError("Cette date est passée ou fermée. Les rendez-vous sont disponibles le week-end et tous les jours pendant les vacances.");
      return;
    }
    setSelectedDate(value);
    setDateError("");
  }

  return (
    <div className="site-shell">
      {/* HEADER */}
      <header className="nav-wrap">
        <a href="#accueil" className="brand">
          <img src="https://res.cloudinary.com/kzg6foiy/image/upload/v1794185189/mouams-hairstyle/z45zcmscf2zxxuwwfkkq.jpg" alt="Mouam's Hairstyle" width={72} height={72} />
          <span className="brand-name">
            Mouam&apos;s<br />
            <em>Hairstyle</em>
          </span>
        </a>
        <nav className={`main-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <a href="#galerie" onClick={() => setMobileMenuOpen(false)}>Galerie</a>
          <a href="#prestations" onClick={() => setMobileMenuOpen(false)}>Prestations</a>
          <a href="#apropos" onClick={() => setMobileMenuOpen(false)}>À propos</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <a className="mobile-booking" href="#reservation" onClick={() => setMobileMenuOpen(false)}>
            Prendre rendez-vous <span>↗</span>
          </a>
        </nav>
        <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          {mobileMenuOpen ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
        </button>
        <a className="nav-cta" href="#reservation">Prendre rendez-vous <span>↗</span></a>
      </header>

      <main>
        {/* HERO */}
        <section id="accueil" className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Coiffeuse afro · <strong>Liège</strong></p>
            <h1>Votre style.<br /><i>Votre couronne.</i></h1>
            <p className="hero-text">Des tresses pensées pour vous, réalisées avec soin dans un espace chaleureux à <strong>Liège</strong>.</p>
            <div className="hero-actions">
              <button className="button button-dark hero-button" onClick={() => openBooking()}>Réserver ma séance <span>↗</span></button>
              <a className="text-link" href="#galerie">Voir les coiffures <span>↓</span></a>
            </div>
          </div>
          <div className="hero-image" style={{ "--image-background": "url(https://res.cloudinary.com/kzg6foiy/image/upload/v1794185185/mouams-hairstyle/dtqsfrj1odjxkqtrtbn9.jpg)" } as CSSProperties}>
            <img src="https://res.cloudinary.com/kzg6foiy/image/upload/v1794185185/mouams-hairstyle/dtqsfrj1odjxkqtrtbn9.jpg" alt="Modèle portant de longues tresses" />
            <div className="hero-stamp">Mouam&apos;s<br /><span>Hairstyle</span><small>depuis Liège •</small></div>
          </div>
          <div className="hero-note">Tresses qui<br /><span>racontent</span><br />votre histoire <b>✳</b></div>
        </section>

        {/* GALERIE */}
        <section id="galerie" className="section gallery-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Le book</p>
              <h2>Inspirations <i>à porter.</i></h2>
            </div>
            <p>Chaque création est unique.<br />Trouvez celle qui vous ressemble.</p>
          </div>
          <div className="filters">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => { setFilter(item); setGalleryPage(0); }}>{item}</button>
            ))}
          </div>
          <div className="gallery-grid">
            {galleryColumns.map((column, columnIndex) => (
              <div className="gallery-column" key={`gallery-column-${columnIndex}`}>
                {column.map((service, itemIndex) => (
                  <button className={`gallery-card card-${(columnIndex + itemIndex) % 4 + 1}`} key={service.id ?? `${service.name}-${columnIndex}-${itemIndex}`} onClick={() => setSelectedStyle(service)}>
                    <img src={service.image} alt={service.name} />
                    <span className="card-overlay"><strong>{service.name}</strong><small>{service.price} € avec mèches</small></span>
                    <span className="card-arrow">↗</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          {galleryPageCount > 1 && (
            <div className="gallery-pagination" aria-label="Pagination de la galerie">
              <button type="button" onClick={() => setGalleryPage((page) => Math.max(0, page - 1))} disabled={galleryPage === 0} aria-label="Page précédente">←</button>
              <span>{galleryPage + 1} / {galleryPageCount}</span>
              <button type="button" onClick={() => setGalleryPage((page) => Math.min(galleryPageCount - 1, page + 1))} disabled={galleryPage === galleryPageCount - 1} aria-label="Page suivante">→</button>
            </div>
          )}
          <p className="gallery-note">Les images sont des inspirations. Les coiffures réalisées peuvent être conservées dans le book de Mouam&apos;s au fil des rendez-vous.</p>
        </section>

        {/* PRESTATIONS */}
        <section id="prestations" className="section pricing-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Les prestations</p>
              <h2>Le détail qui<br /><i>change tout.</i></h2>
            </div>
            <p>Faites défiler les créations<br />et trouvez votre prochaine coiffure.</p>
          </div>
          {currentService && (
            <div className="service-showcase" key={currentService.id ?? currentService.name} onTouchStart={handleServiceTouchStart} onTouchEnd={handleServiceTouchEnd}>
              <div className="service-preview" style={{ "--image-background": `url(${currentService.image})` } as CSSProperties}>
                <img src={currentService.image} alt={currentService.name} />
                <span className="service-index">{String(activeService + 1).padStart(2, "0")} / {String(siteServices.length).padStart(2, "0")}</span>
              </div>
              <div className="service-details">
                <p className="eyebrow light">{getCategories(currentService.category).join(" · ")}</p>
                <h3>{currentService.name}</h3>
                <p>{currentService.description}</p>
                <div className="service-price">dès <strong>{currentService.price} €</strong><small>avec mèches</small></div>
                <div className="feature-tags">
                  <span>Taille {currentService.size}</span>
                  <span>Longueur {currentService.length}</span>
                  <span>Mèches incluses</span>
                </div>
                <button className="button button-dark full" onClick={() => openBooking(currentService)}>Choisir cette coiffure <span>↗</span></button>
                <div className="service-controls">
                  <button onClick={() => changeService(-1)} aria-label="Prestation précédente">←</button>
                  <div>
                    {siteServices.map((service, index) => (
                      <button key={service.id ?? `${service.name}-${index}`} className={activeService === index ? "active" : ""} onClick={() => setActiveService(index)} aria-label={`Voir ${service.name}`} />
                    ))}
                  </div>
                  <button onClick={() => changeService(1)} aria-label="Prestation suivante">→</button>
                </div>
              </div>
            </div>
          )}
          <p className="hair-note"><b>Bon à savoir</b> — Vous pouvez fournir vos propres mèches. Elles devront être déposées au moins <b>2 jours avant</b> la prestation. L’acompte de 20 € est obligatoire et déduit du solde.</p>
        </section>

        {/* À PROPOS */}
        <section id="apropos" className="about-section">
          <div className="about-image" style={{ "--image-background": "url(https://res.cloudinary.com/kzg6foiy/image/upload/v1794185203/mouams-hairstyle/noc0qoxrin1ihzzaeep0.jpg)" } as CSSProperties}>
            <img src="https://res.cloudinary.com/kzg6foiy/image/upload/v1794185203/mouams-hairstyle/noc0qoxrin1ihzzaeep0.jpg" alt="Portrait de la coiffeuse Mouam's Hairstyle" />
          </div>
          <div className="about-copy">
            <p className="eyebrow">L&apos;intention</p>
            <h2>Prendre soin<br /><i>de vous.</i></h2>
            <p>Chez Mouam&apos;s, chaque rendez-vous est un moment pour ralentir, échanger et repartir avec une coiffure dans laquelle vous vous sentez pleinement vous-même.</p>
            <div className="location">✦ Liège · haute école · disponible le week-end pendant les cours et pendant les vacances</div>
          </div>
        </section>

        {/* RÉSERVATION */}
        <section id="reservation" className="booking-section">
          <div className="booking-intro">
            <p className="eyebrow">Les rendez-vous</p>
            <h2>Votre prochaine<br /><i>couronne commence ici.</i></h2>
            <p>Les créneaux sont ouverts le week-end, de 8h à 19h. Choisissez votre coiffure et votre moment, nous vous confirmerons le rendez-vous.</p>
          </div>
          <div className="booking-card">
            <div className="booking-top"><span>Étape 01 / 02</span><strong>Votre réservation</strong></div>

            <label htmlFor="customer-name">Votre nom</label>
            <input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Prénom et nom" required />

            <label htmlFor="customer-whatsapp">Votre WhatsApp</label>
            <div className="whatsapp-field">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} aria-label="Indicatif du pays">
                {COUNTRY_CODES.map((country) => <option value={country.code} key={country.code}>{country.code} · {country.name}</option>)}
              </select>
              <input id="customer-whatsapp" value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ""))} placeholder="470 00 00 00" required />
            </div>

            <label htmlFor="booking-style">Coiffure</label>
            <select id="booking-style" value={bookingStyle.name} onChange={(e) => setBookingStyle(siteServices.find((s) => s.name === e.target.value) ?? SERVICES[0])}>
              {siteServices.map((service, index) => <option key={service.id ?? `${service.name}-${index}`}>{service.name}</option>)}
            </select>

            <div className="booking-summary">
              <strong>{bookingStyle.name}</strong>
              <span>{bookingPrice} € · {withHair ? "mèches incluses" : "sans mèches"}</span>
            </div>

            <label>Options mèches</label>
            <div className="hair-options">
              <button className={withHair ? "selected" : ""} onClick={() => setWithHair(true)}>Avec mèches <small>{bookingStyle.price} €</small></button>
              <button className={!withHair ? "selected" : ""} onClick={() => setWithHair(false)}>Sans mèches</button>
            </div>

            <label htmlFor="date">Votre date <small className="field-hint">samedi ou dimanche</small></label>
            <WeekendCalendar value={selectedDate} onChange={chooseDate} />
            {dateError && <p className="date-error">{dateError}</p>}

            <label>Heure disponible <small className="field-hint">gris = déjà réservé</small></label>
            <div className="slots">
              {siteSlots.map((slot) => {
                const unavailable = unavailableSlots.includes(slot);
                return (
                  <button key={slot} className={`${selectedSlot === slot ? "selected" : ""} ${unavailable ? "unavailable" : ""}`} disabled={unavailable} onClick={() => setSelectedSlot(slot)}>
                    {slot}
                  </button>
                );
              })}
            </div>

            <button className="button button-dark full rounded-action" onClick={submitBooking} disabled={!isBookingComplete || bookingSubmitting}>
              {bookingSubmitting ? "Envoi..." : "Effectuer la réservation"} <span>↗</span>
            </button>
            <small className="deposit">Acompte obligatoire de 20 € · Confirmation manuelle par WhatsApp</small>
          </div>
        </section>

        {/* FAQ & AVIS */}
        <section id="faq" className="faq-section">
          <div>
            <p className="eyebrow">Questions &amp; avis</p>
            <h2>Tout est<br /><i>clair.</i></h2>
            <p className="review-intro">Une question ou une expérience à partager ? Laissez un message, Mouam&apos;s pourra vous répondre.</p>
          </div>

          <div className="faq-list">
            <details open>
              <summary>Où se déroule la prestation ? <span>+</span></summary>
              <p>Les rendez-vous se déroulent chez Mouam&apos;s à Liège. Des prestations à domicile sont possibles occasionnellement sur demande.</p>
            </details>
            <details>
              <summary>Les mèches sont-elles comprises ? <span>+</span></summary>
              <p>Oui, les prix affichés incluent les mèches. Vous pouvez aussi fournir les vôtres au moins deux jours avant.</p>
            </details>
            <details>
              <summary>Comment fonctionne l&apos;acompte ? <span>+</span></summary>
              <p>Un acompte fixe de 20 € est demandé pour confirmer chaque réservation. Il me permet de réserver votre créneau.</p>
            </details>

            {/* AVIS */}
            {displayedReviews.length > 0 && (
              <div className="review-carousel">
                <div className="review-stars" aria-label="5 étoiles">★ ★ ★ ★ ★</div>
                <blockquote key={activeReview}>{displayedReviews[activeReview]?.text}</blockquote>
                <strong>{displayedReviews[activeReview]?.name}</strong>
                <small>{displayedReviews[activeReview]?.service}</small>
                <div className="review-controls">
                  <button onClick={() => setActiveReview((activeReview - 1 + displayedReviews.length) % displayedReviews.length)} aria-label="Avis précédent">←</button>
                  <span>{activeReview + 1} / {displayedReviews.length}</span>
                  <button onClick={() => setActiveReview((activeReview + 1) % displayedReviews.length)} aria-label="Avis suivant">→</button>
                </div>
              </div>
            )}

            {/* FORMULAIRE AVIS */}
            <div className="review-form">
              <strong>Laisser un avis</strong>
              <div className="review-rating" aria-label="Choisir une note">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button type="button" className={rating <= reviewRating ? "selected" : ""} key={rating} onClick={() => setReviewRating(rating)} aria-label="étoile">★</button>
                ))}
              </div>
              <select value={reviewCategory} onChange={(e) => setReviewCategory(e.target.value)} aria-label="Catégorie de la coiffure">
                {filters.filter((item) => item !== "Tout voir").map((cat) => <option value={cat} key={cat}>{cat}</option>)}
              </select>
              <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Votre prénom" />
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Votre commentaire" rows={3} />
              <button className="button button-dark" onClick={submitReview} disabled={!reviewName.trim() || !reviewComment.trim() || reviewRating === 0}>
                {reviewSent ? "Avis envoyé ✓" : "Envoyer mon avis ↗"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="brand footer-brand">
          <img src="https://res.cloudinary.com/kzg6foiy/image/upload/v1794185189/mouams-hairstyle/z45zcmscf2zxxuwwfkkq.jpg" alt="" width={56} height={56} />
          <span className="brand-name">Mouam&apos;s<br /><em>Hairstyle</em></span>
        </div>
        <p>Une coiffure. Une énergie.<br />Une histoire à vous.</p>
        <div className="socials">
          <a href="https://wa.me/32490212945" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /> +32 490 21 29 45</a>
          <a href="https://www.facebook.com/profile.php?id=61553016847073" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook size={18} /> Mouam&apos;s Hairstyle</a>
          <a href="https://www.tiktok.com/@mouamshairstyle" target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok size={18} /> Mouam&apos;s Hairstyle</a>
          <a href="https://www.instagram.com/mouamshairstyle" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram size={18} /> Mouam&apos;s Hairstyle</a>
        </div>
        <small>© 2026 Mouam&apos;s Hairstyle. Tous droits réservés.</small>
      </footer>

      {/* MODAL STYLE DÉTAIL */}
      {selectedStyle && (
        <div className="modal-backdrop" onClick={() => setSelectedStyle(null)}>
          <div className="style-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStyle(null)}>×</button>
            <div className="modal-image">
              <img src={selectedStyle.image} alt={selectedStyle.name} />
            </div>
            <div className="modal-content">
              <p className="eyebrow">{selectedStyle.category}</p>
              <h2>{selectedStyle.name}</h2>
              <p>{selectedStyle.description}</p>
              <div className="feature-tags">
                <span>Taille {selectedStyle.size}</span>
                <span>Longueur {selectedStyle.length}</span>
                <span>Mèches incluses</span>
              </div>
              <strong className="modal-price">{selectedStyle.price} € avec mèches</strong>
              <button className="button button-dark full" onClick={() => openBooking(selectedStyle)}>Prendre rendez-vous <span>↗</span></button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RÉSERVATION */}
      {bookingOpen && (
        <div className="modal-backdrop booking-backdrop" onClick={() => setBookingOpen(false)}>
          <div className="confirm-modal booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBookingOpen(false)}>×</button>
            <p className="eyebrow">Demande de rendez-vous</p>
            <h2>On réserve votre<br /><i>moment beauté.</i></h2>

            <label htmlFor="modal-customer-name">Votre nom</label>
            <input id="modal-customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Prénom et nom" required />

            <label htmlFor="modal-customer-whatsapp">Votre WhatsApp</label>
            <div className="whatsapp-field">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} aria-label="Indicatif du pays">
                {COUNTRY_CODES.map((country) => <option value={country.code} key={country.code}>{country.code} · {country.name}</option>)}
              </select>
              <input id="modal-customer-whatsapp" value={customerWhatsapp} onChange={(e) => setCustomerWhatsapp(e.target.value.replace(/\D/g, ""))} placeholder="470 00 00 00" required />
            </div>

            <label htmlFor="modal-booking-style">Coiffure</label>
            <select id="modal-booking-style" value={bookingStyle.name} onChange={(e) => setBookingStyle(siteServices.find((s) => s.name === e.target.value) ?? SERVICES[0])}>
              {siteServices.map((service, index) => <option key={service.id ?? `${service.name}-${index}`}>{service.name}</option>)}
            </select>

            <div className="booking-summary">
              <strong>{bookingStyle.name}</strong>
              <span>{bookingPrice} € · {withHair ? "mèches incluses" : "sans mèches"}</span>
            </div>

            <label>Options mèches</label>
            <div className="hair-options">
              <button className={withHair ? "selected" : ""} onClick={() => setWithHair(true)}>Avec mèches</button>
              <button className={!withHair ? "selected" : ""} onClick={() => setWithHair(false)}>Sans mèches</button>
            </div>

            <label htmlFor="modal-date">Votre date <small className="field-hint">samedi ou dimanche</small></label>
            <WeekendCalendar value={selectedDate} onChange={chooseDate} />
            {dateError && <p className="date-error">{dateError}</p>}

            <label>Créneau disponible</label>
            <div className="slots">
              {siteSlots.map((slot) => {
                const unavailable = unavailableSlots.includes(slot);
                return (
                  <button key={slot} className={`${selectedSlot === slot ? "selected" : ""} ${unavailable ? "unavailable" : ""}`} disabled={unavailable} onClick={() => setSelectedSlot(slot)}>
                    {slot}
                  </button>
                );
              })}
            </div>

            <button className="button button-dark full rounded-action" disabled={!isBookingComplete} onClick={submitBooking}>
              {bookingSubmitting ? "Envoi..." : "Envoyer ma demande"} <span>↗</span>
            </button>
            {bookingError && <p className="date-error" role="alert">{bookingError}</p>}
            <small className="deposit">Acompte obligatoire de 20 € · Confirmation manuelle par WhatsApp</small>
          </div>
        </div>
      )}

      {/* PROGRESS BAR */}
      <a className="scroll-progress" href="#accueil" style={{ "--scroll-progress": scrollProgress } as CSSProperties} aria-label="Retourner en haut de la page">
        <span className="afro-head" aria-hidden="true"></span>
      </a>
    </div>
  );
}
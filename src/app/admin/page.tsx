"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import "./admin.css";
import {
  CalendarDays,
  Check,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Plus,
  Scissors,
  Settings2,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ==========================================
// TYPES & CONSTANTES
// ==========================================

type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  priceWithHair?: number;
  priceWithoutHair?: number;
  image: string;
  size: string;
  length: string;
  active: boolean;
};

type Appointment = {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  date: string;
  time: string;
  status: "En attente" | "Confirmé" | "Annulé";
};

const serviceSizes = ["Court", "Moyen", "Long"];
const serviceLengths = ["Bob", "Épaule", "Dos", "Mi-dos", "Fesses"];

const defaultServices: Service[] = [
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
];

const defaultAppointments: Appointment[] = [
  {
    id: "demo-1",
    name: "Aïcha M.",
    whatsapp: "+32 470 00 00 00",
    service: "Knotless braids",
    date: "2026-11-07",
    time: "13:00",
    status: "En attente",
  },
];

const defaultSlots = ["08:00", "10:30", "13:00", "15:30", "18:00"];

function normalizeCategories(category: string) {
  return Array.from(new Set(category.split(",").map((item) => item.trim()).filter(Boolean))).join(", ");
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

async function optimizeImage(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Optimisation impossible"))),
      "image/jpeg",
      0.82
    );
  });
}

function stored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

// ==========================================
// COMPOSANT PRINCIPAL DE PAGE ADMIN
// ==========================================

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [logged, setLogged] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("overview");

  const [services, setServices] = useState<Service[]>(defaultServices);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments);
  const [blocked, setBlocked] = useState<string[]>(["10:30"]);
  const [availableSlots, setAvailableSlots] = useState<string[]>(defaultSlots);
  const [editing, setEditing] = useState<Service | null>(null);
  const [notice, setNotice] = useState("");
  const [loginFeedback, setLoginFeedback] = useState("");

  const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const setServicesAndSave = (value: Service[]) => {
    const normalized = value.map((service) => ({ ...service, price: Number(service.price) }));
    setServices(normalized);
    save("mouams-services", normalized);
  };

  const setAppointmentsAndSave = (value: Appointment[]) => {
    setAppointments(value);
    save("mouams-appointments", value);
  };

  const setBlockedAndSave = (value: string[]) => {
    setBlocked(value);
    save("mouams-blocked-slots", value);
  };

  const setAvailableSlotsAndSave = (value: string[]) => {
    setAvailableSlots(value);
    save("mouams-time-slots", value);
  };

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (code === "Mouam2026") {
      sessionStorage.setItem("mouams-admin", "true");
      setLoginFeedback("Connexion réussie.");
      window.setTimeout(() => setLogged(true), 550);
    } else {
      setLoginFeedback("Le code d’accès est incorrect.");
    }
  };

  // Lecture du stockage navigateur après le montage (évite l'erreur d'hydratation)
  useEffect(() => {
    setLogged(sessionStorage.getItem("mouams-admin") === "true");
    setServices(
      stored<Service[]>("mouams-services", defaultServices).map((service: Service) => ({
        ...service,
        price: Number(service.price ?? service.priceWithHair ?? 0),
      }))
    );
    setAppointments(stored("mouams-appointments", defaultAppointments));
    setBlocked(stored("mouams-blocked-slots", ["10:30"]));
    setAvailableSlots(stored("mouams-time-slots", defaultSlots));
    setMounted(true);
  }, []);

  useEffect(() => {
    function syncSharedData() {
      setAppointments(stored("mouams-appointments", appointments));
      setServices(
        stored<Service[]>("mouams-services", services).map((service: Service) => ({
          ...service,
          price: Number(service.price ?? service.priceWithHair ?? 0),
        }))
      );
      setAvailableSlots(stored("mouams-time-slots", availableSlots));
      setBlocked(stored("mouams-blocked-slots", blocked));
    }
    window.addEventListener("storage", syncSharedData);
    return () => window.removeEventListener("storage", syncSharedData);
  }, [appointments, availableSlots, blocked, services]);

  if (!mounted) return <main className="admin-login" aria-busy="true" />;

  // Écran de Connexion
  if (!logged) {
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <div className="admin-mark">
            <Scissors size={23} />
          </div>
          <p className="eyebrow">Mouam&apos;s Hairstyle</p>
          <h1>
            Espace<br />
            <i>administrateur.</i>
          </h1>
          <p>Gérez vos prestations, votre galerie et vos rendez-vous depuis un seul endroit.</p>
          <form onSubmit={login}>
            <label htmlFor="admin-code">Code d&apos;accès</label>
            <input
              id="admin-code"
              type="password"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setLoginFeedback("");
              }}
              placeholder="Votre code"
              autoFocus
            />
            {loginFeedback && (
              <p
                className={loginFeedback === "Connexion réussie." ? "admin-success" : "admin-error"}
                role="status"
              >
                {loginFeedback}
              </p>
            )}
            <button className="admin-primary" type="submit">
              Ouvrir mon espace <span>↗</span>
            </button>
          </form>
          <a className="admin-back" href="/">
            ← Retour au site
          </a>
        </div>
      </main>
    );
  }

  const pending = appointments.filter((item) => item.status === "En attente").length;
  const navigate = (next: string) => setTab(next);

  return (
    <main className="admin-shell">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="admin-logo">
            <Scissors size={18} />
          </span>
          <span>
            Mouam&apos;s<br />
            <em>Admin</em>
          </span>
        </a>
        <nav className="admin-nav">
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => navigate("overview")}
          >
            <LayoutDashboard size={17} />
            Vue d&apos;ensemble
          </button>
          <button
            className={tab === "services" ? "active" : ""}
            onClick={() => navigate("services")}
          >
            <ImagePlus size={17} />
            Prestations &amp; galerie
          </button>
          <button
            className={tab === "calendar" ? "active" : ""}
            onClick={() => navigate("calendar")}
          >
            <CalendarDays size={17} />
            Disponibilités
          </button>
          <button
            className={tab === "appointments" ? "active" : ""}
            onClick={() => navigate("appointments")}
          >
            <Users size={17} />
            Rendez-vous {pending > 0 && <b>{pending}</b>}
          </button>
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/">
            <X size={15} />
            Voir le site
          </a>
          <button
            onClick={() => {
              sessionStorage.removeItem("mouams-admin");
              setLogged(false);
            }}
          >
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu Principal */}
      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Espace privé</p>
            <h1>Bonjour, Mouam&apos;s.</h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            Voir le site ↗
          </a>
        </header>

        {notice && (
          <div className="admin-notice">
            <Check size={16} />
            {notice}
          </div>
        )}

        {tab === "overview" && (
          <Overview
            pending={pending}
            services={services}
            appointments={appointments}
            go={navigate}
          />
        )}

        {tab === "services" && (
          <Services
            services={services}
            editing={editing}
            setEditing={setEditing}
            saveServices={setServicesAndSave}
            flash={flash}
          />
        )}

        {tab === "calendar" && (
          <Calendar
            blocked={blocked}
            setBlocked={setBlockedAndSave}
            slots={availableSlots}
            setSlots={setAvailableSlotsAndSave}
            appointments={appointments}
          />
        )}

        {tab === "appointments" && (
          <Appointments
            appointments={appointments}
            setAppointments={setAppointmentsAndSave}
          />
        )}
      </section>
    </main>
  );
}

// ==========================================
// SECTIONS & SOUS-COMPOSANTS
// ==========================================

function Overview({
  pending,
  services,
  appointments,
  go,
}: {
  pending: number;
  services: Service[];
  appointments: Appointment[];
  go: (tab: string) => void;
}) {
  return (
    <div className="admin-page-body">
      <div className="admin-stats">
        <button onClick={() => go("appointments")}>
          <span>Demandes à traiter</span>
          <strong>{pending}</strong>
          <small>Voir les demandes →</small>
        </button>
        <button onClick={() => go("services")}>
          <span>Prestations actives</span>
          <strong>{services.filter((item) => item.active).length}</strong>
          <small>Gérer le book →</small>
        </button>
        <button onClick={() => go("calendar")}>
          <span>Créneaux ouverts</span>
          <strong>4</strong>
          <small>Modifier les horaires →</small>
        </button>
      </div>

      <div className="admin-columns">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">À traiter</p>
              <h2>Dernières demandes</h2>
            </div>
            <button onClick={() => go("appointments")}>Tout voir →</button>
          </div>
          {appointments.map((item) => (
            <AppointmentRow key={item.id} item={item} />
          ))}
        </section>

        <section className="admin-panel admin-quick">
          <p className="eyebrow">Raccourcis</p>
          <h2>Gérer votre espace</h2>
          <button onClick={() => go("services")}>
            <ImagePlus size={18} />
            Ajouter une coiffure <span>→</span>
          </button>
          <button onClick={() => go("calendar")}>
            <CalendarDays size={18} />
            Bloquer un créneau <span>→</span>
          </button>
          <button onClick={() => go("appointments")}>
            <Users size={18} />
            Voir l&apos;agenda <span>→</span>
          </button>
        </section>
      </div>
    </div>
  );
}

function Services({
  services,
  editing,
  setEditing,
  saveServices,
  flash,
}: {
  services: Service[];
  editing: Service | null;
  setEditing: (service: Service | null) => void;
  saveServices: (services: Service[]) => void;
  flash: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const add = () => {
    setUploadError("");
    setEditing({
      id: `service-${Date.now()}`,
      name: "",
      category: "",
      description: "",
      price: 0,
      image: "",
      size: "",
      length: "",
      active: true,
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || !Number.isFinite(editing.price) || editing.price < 0) return;

    const savedService = { ...editing, category: normalizeCategories(editing.category), price: Number(editing.price) };
    saveServices(
      services.some((item) => item.id === editing.id)
        ? services.map((item) => (item.id === editing.id ? savedService : item))
        : [...services, savedService]
    );

    setEditing(null);
    flash("Prestation enregistrée");
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editing) return;

    setUploadError("");
    setUploading(true);

    try {
      const optimized = await optimizeImage(file);
      const body = new FormData();
      body.append("file", optimized, `${file.name.replace(/\.[^.]+$/, "")}.jpg`);

      const response = await fetch("/api/cloudinary", { method: "POST", body });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "Upload impossible");

      setEditing({ ...editing, image: result.url });
      flash("Image importée");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Impossible d’importer l’image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const displayedServices = services.map((service) =>
    service.id === editing?.id ? { ...service, image: editing.image } : service
  );

  return (
    <div className="admin-page-body">
      <div className="panel-heading page-heading">
        <div>
          <p className="eyebrow">Le book</p>
          <h2>Vos coiffures</h2>
        </div>
        <button className="admin-primary small" onClick={add}>
          <Plus size={16} />
          Ajouter une prestation
        </button>
      </div>

      <div className="admin-service-grid">
        {displayedServices.map((service) => (
          <article className="admin-service-card" key={service.id}>
            <div className="admin-service-image">
              <img src={service.image} alt={service.name} />
              <span>{service.active ? "Publié" : "Masqué"}</span>
            </div>
            <div className="admin-service-info">
              <p className="eyebrow">{service.category}</p>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <strong>{service.price} €</strong>
              <small>Prix de la prestation · mèches incluses</small>
              <div className="admin-card-actions">
                <button onClick={() => setEditing(service)}>
                  <Settings2 size={14} />
                  Modifier
                </button>
                <button
                  onClick={() =>
                    saveServices(
                      services.map((item) =>
                        item.id === service.id ? { ...item, active: !item.active } : item
                      )
                    )
                  }
                >
                  {service.active ? "Masquer" : "Publier"}
                </button>
                <button
                  className="danger"
                  onClick={() => saveServices(services.filter((item) => item.id !== service.id))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && typeof document !== "undefined"
        ? createPortal(
            <div className="admin-editor-backdrop">
              <form className="admin-editor" onSubmit={submit}>
                <button type="button" className="editor-close" onClick={() => setEditing(null)}>
                  <X size={18} />
                </button>
                <p className="eyebrow">
                  {editing.name ? "Modifier le book" : "Nouvelle prestation"}
                </p>
                <h2>{editing.name || "Décrivez votre nouvelle prestation"}</h2>

                <div className={`editor-image ${editing.image ? "has-image" : "is-empty"}`}>
                  {editing.image ? (
                    <img src={editing.image} alt="Aperçu" />
                  ) : (
                    <div className="editor-image-placeholder">
                      <ImagePlus size={28} />
                      <span>Ajoutez une image de votre coiffure</span>
                      <small>JPG, PNG ou WEBP</small>
                    </div>
                  )}
                  <label className={uploading ? "uploading" : ""}>
                    <Upload size={15} />
                    {uploading
                      ? "Optimisation et import..."
                      : editing.image
                      ? "Changer l’image"
                      : "Ajouter une image"}
                    <input type="file" accept="image/*" disabled={uploading} onChange={upload} />
                  </label>
                </div>

                {uploadError && (
                  <p className="admin-error" role="alert">
                    {uploadError}
                  </p>
                )}

                <div className="editor-grid">
                  <label>
                    Nom
                    <input
                      value={editing.name}
                      placeholder="Ex. Knotless braids"
                      onChange={(event) =>
                        setEditing({ ...editing, name: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Catégorie
                    <input
                      value={editing.category}
                      placeholder="Ex. Knotless, Braids, Protectrices"
                      onChange={(event) =>
                        setEditing({ ...editing, category: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Prix
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editing.price || ""}
                      placeholder="Ex. 85"
                      onChange={(event) =>
                        setEditing({ ...editing, price: Number(event.target.value) })
                      }
                      required
                    />
                  </label>
                  <label>
                    Taille
                    <select
                      value={editing.size}
                      onChange={(event) =>
                        setEditing({ ...editing, size: event.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Choisir une taille
                      </option>
                      {serviceSizes.map((size) => (
                        <option key={size}>{size}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Longueur
                    <select
                      value={editing.length}
                      onChange={(event) =>
                        setEditing({ ...editing, length: event.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Choisir une longueur
                      </option>
                      {serviceLengths.map((length) => (
                        <option key={length}>{length}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    value={editing.description}
                    placeholder="Décrivez la coiffure et son style..."
                    rows={3}
                    onChange={(event) =>
                      setEditing({ ...editing, description: event.target.value })
                    }
                    required
                  />
                </label>

                <button className="admin-primary" type="submit" disabled={uploading}>
                  Enregistrer <Check size={16} />
                </button>
              </form>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function Calendar({
  blocked,
  setBlocked,
  slots,
  setSlots,
  appointments,
}: {
  blocked: string[];
  setBlocked: (slots: string[]) => void;
  slots: string[];
  setSlots: (slots: string[]) => void;
  appointments: Appointment[];
}) {
  const [draft, setDraft] = useState("");
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const saveSlot = () => {
    const value = draft.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value) || slots.includes(value)) return;
    setSlots([...slots, value].sort());
    setDraft("");
  };

  const removeSlot = (slot: string) => {
    setSlots(slots.filter((item) => item !== slot));
    setBlocked(blocked.filter((item) => item !== slot));
  };

  const renameSlot = (slot: string) => {
    const value = draft.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value) || slots.includes(value)) return;
    setSlots(slots.map((item) => (item === slot ? value : item)).sort());
    setBlocked(blocked.map((item) => (item === slot ? value : item)));
    setEditingSlot(null);
    setDraft("");
  };

  return (
    <div className="admin-page-body">
      <div className="panel-heading page-heading">
        <div>
          <p className="eyebrow">Organisation</p>
          <h2>Week-ends disponibles</h2>
        </div>
      </div>

      <section className="admin-panel calendar-editor">
        <div className="calendar-intro">
          <CalendarDays size={24} />
          <div>
            <h3>Horaires habituels</h3>
            <p>Les rendez-vous sont ouverts le week-end pendant les cours et tous les jours pendant les vacances.</p>
          </div>
        </div>

        <div className="slot-editor">
          <p className="eyebrow">Créneaux personnalisés</p>
          <div className="slot-create">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ex. 09:30"
              aria-label="Nouveau créneau"
            />
            {editingSlot ? (
              <button onClick={() => renameSlot(editingSlot)}>Enregistrer</button>
            ) : (
              <button onClick={saveSlot}>Ajouter un créneau</button>
            )}
          </div>

          <div className="slot-list">
            {slots.map((slot) => (
              <div className="slot-row" key={slot}>
                <button
                  className={blocked.includes(slot) ? "blocked" : "open"}
                  onClick={() =>
                    setBlocked(
                      blocked.includes(slot)
                        ? blocked.filter((item) => item !== slot)
                        : [...blocked, slot]
                    )
                  }
                >
                  <span>{slot}</span>
                  <small>{blocked.includes(slot) ? "Bloqué" : "Disponible"}</small>
                </button>
                <button
                  onClick={() => {
                    setEditingSlot(slot);
                    setDraft(slot);
                  }}
                >
                  Modifier
                </button>
                <button onClick={() => removeSlot(slot)}>Supprimer</button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-info">
          <strong>À retenir</strong>
          <p>
            Seuls les créneaux disponibles apparaissent sur le site. Les rendez-vous confirmés ou en attente sont répartis dans l&apos;agenda par horaire.
          </p>
        </div>

        <div className="slot-appointments">
          <p className="eyebrow">Rendez-vous par créneau</p>
          {slots.map((slot) => (
            <div className="slot-appointment-group" key={slot}>
              <strong>{slot}</strong>
              <span>
                {appointments.filter((item) => item.time === slot).length} demande(s)
              </span>
              {appointments
                .filter((item) => item.time === slot)
                .map((item) => (
                  <small key={item.id}>
                    {item.name} · {item.status}
                  </small>
                ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Appointments({
  appointments,
  setAppointments,
}: {
  appointments: Appointment[];
  setAppointments: (items: Appointment[]) => void;
}) {
  const update = (id: string, status: Appointment["status"]) =>
    setAppointments(appointments.map((item) => (item.id === id ? { ...item, status } : item)));

  const confirm = (item: Appointment) => {
    update(item.id, "Confirmé");
    const message = encodeURIComponent(
      `Bonjour ${item.name}, votre rendez-vous pour ${item.service} est confirmé le ${item.date} à ${item.time}. À bientôt chez Mouam's Hairstyle.`
    );
    const clientNumber = item.whatsapp.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${clientNumber}?text=${message}`, "_blank");
    window.open(`https://wa.me/32490212945?text=${message}`, "_blank");
  };

  return (
    <div className="admin-page-body">
      <div className="panel-heading page-heading">
        <div>
          <p className="eyebrow">Votre agenda</p>
          <h2>Demandes de rendez-vous</h2>
        </div>
        <span className="admin-count">{appointments.length} demandes</span>
      </div>

      <section className="admin-panel appointments-list">
        {appointments.map((item) => (
          <AppointmentRow key={item.id} item={item} update={update} confirm={confirm} />
        ))}
      </section>
    </div>
  );
}

function AppointmentRow({
  item,
  update,
  confirm,
}: {
  item: Appointment;
  update?: (id: string, status: Appointment["status"]) => void;
  confirm?: (item: Appointment) => void;
}) {
  return (
    <article className="appointment-row">
      <div className="appointment-date">
        <strong>
          {new Date(`${item.date}T12:00:00`).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </strong>
        <span>{item.time}</span>
      </div>
      <div className="appointment-main">
        <strong>{item.name}</strong>
        <span>{item.service}</span>
        <small>{item.whatsapp}</small>
      </div>
      <span className={`appointment-status ${item.status}`}>{item.status}</span>
      {update && (
        <div className="appointment-actions">
          {item.status !== "Confirmé" && (
            <button onClick={() => (confirm ? confirm(item) : update(item.id, "Confirmé"))}>
              <Check size={14} />
              Confirmer
            </button>
          )}
          {item.status !== "Annulé" && (
            <button className="cancel" onClick={() => update(item.id, "Annulé")}>
              Refuser
            </button>
          )}
        </div>
      )}
    </article>
  );
}
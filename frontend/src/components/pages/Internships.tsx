import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaSearch, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaBuilding,
  FaFilter, FaList, FaMap, FaLocationArrow, FaSpinner, FaGraduationCap,
  FaChevronDown, FaTimes
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// TODO: move this to an environment variable (e.g. import.meta.env.VITE_API_URL)
const API_BASE = "http://localhost:8000";

// Leaflet's default marker images reference paths that don't survive bundling.
// Pointing them at a CDN avoids having to copy image assets into /public.
const internshipIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  className: "saturate-200 hue-rotate-90" // crude tint so the user's own marker reads differently
});

interface Internship {
  id: number;
  title: string;
  description: string;
  location: string;
  duration: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  slots: number;
  status: string;
  internship_type: string;
  payment_type: string;
  salary: number | null;
  department: string | null;
  latitude: number | null;
  longitude: number | null;
  organization: {
    organisation_name: string;
    location: string;
    logo_path: string | null;
  } | null;
}

interface InternshipWithDistance extends Internship {
  distance: number | null; // km, null if either side is missing coordinates
}

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

// Yaoundé — used only as a map fallback center when we don't know the student's position
const DEFAULT_CENTER: [number, number] = [3.848, 11.5021];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Recenters the map the first time the student's position becomes available
function RecenterOnLocate({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 12);
  }, [position, map]);
  return null;
}

interface CityOption {
  name: string;
  count: number;
}

// Custom city autocomplete: free typing + styled suggestion list with counts,
// keyboard navigation, click-to-select, and click-outside-to-close.
// Looks identical across browsers (unlike the native <datalist>).
function CityCombobox({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: CityOption[];
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [value, options]);

  // Close the dropdown when clicking anywhere outside the component
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && suggestions[highlight]) {
        e.preventDefault();
        select(suggestions[highlight].name);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Yaoundé, Douala..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la ville"
          >
            <FaTimes className="text-xs" />
          </button>
        ) : (
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
        )}
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">Aucune ville trouvée</li>
          ) : (
            suggestions.map((o, idx) => (
              <li
                key={o.name}
                // onMouseDown (not onClick) fires before the input's blur, so selection works reliably
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(o.name);
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center ${
                  idx === highlight ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{o.name}</span>
                <span className="text-xs text-gray-400">{o.count}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function Internships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    payment: "",
    department: "",
    organization: "",
    duration: "", // "0-3" | "4-6" | "7+" | ""
    city: "" // free-text city name, "" = all cities
  });

  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  useEffect(() => {
    fetchInternships();
    requestLocation();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/internships`);
      if (response.ok) {
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : data.data || []);
      } else {
        setInternships([]);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
      Swal.fire({ icon: "error", title: "Erreur", text: "Impossible de charger les stages" });
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus("granted");
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocationStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const departments = useMemo(
    () => Array.from(new Set(internships.map((i) => i.department).filter(Boolean))) as string[],
    [internships]
  );

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(internships.map((i) => i.organization?.organisation_name).filter(Boolean))
      ) as string[],
    [internships]
  );

  // Unique cities (part of `location` before the first comma) with how many
  // internships each has — e.g. { name: "Yaoundé", count: 3 }. Feeds the combobox.
  const cityOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    internships.forEach((i) => {
      const city = i.location?.split(",")[0]?.trim();
      if (city) counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [internships]);

  const withDistance: InternshipWithDistance[] = useMemo(() => {
    return internships.map((i) => ({
      ...i,
      distance:
        userPosition && i.latitude != null && i.longitude != null
          ? haversineKm(userPosition[0], userPosition[1], i.latitude, i.longitude)
          : null
    }));
  }, [internships, userPosition]);

  const filtered = useMemo(() => {
    let list = withDistance.filter((i) => {
      const haystack = `${i.title} ${i.location} ${i.organization?.organisation_name || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      const matchesType = !filters.type || i.internship_type === filters.type;
      const matchesPayment = !filters.payment || i.payment_type === filters.payment;
      const matchesDept = !filters.department || i.department === filters.department;
      const matchesOrg = !filters.organization || i.organization?.organisation_name === filters.organization;

      const matchesDuration =
        !filters.duration ||
        (filters.duration === "0-3" && i.duration_months <= 3) ||
        (filters.duration === "4-6" && i.duration_months >= 4 && i.duration_months <= 6) ||
        (filters.duration === "7+" && i.duration_months >= 7);

      const matchesCity =
        !filters.city || i.location.toLowerCase().includes(filters.city.toLowerCase());

      return matchesSearch && matchesType && matchesPayment && matchesDept && matchesOrg && matchesDuration && matchesCity;
    });

    if (userPosition) {
      list = [...list].sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return list;
  }, [withDistance, searchTerm, filters, userPosition]);

  const mappable = filtered.filter((i) => i.latitude != null && i.longitude != null);
  const unmappableCount = filtered.length - mappable.length;

  const resetFilters = () =>
    setFilters({ type: "", payment: "", department: "", organization: "", duration: "", city: "" });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="font-bold text-2xl text-[#16A34A] hover:opacity-80 transition">
              Intern<span className="text-[#059669]">flow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Accueil</Link>
              <Link to="/internships" className="text-[#16A34A] font-medium">Stages</Link>
              <Link to="/companies" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Entreprises</Link>
              <Link to="/login" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Connexion</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-linear-to-r from-green-700 to-green-500 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Trouvez votre stage idéal</h1>
          <p className="text-lg opacity-90">Découvrez les offres de stage autour de vous</p>
        </div>
      </div>

      {/* Search + location status */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Titre du stage, entreprise, localisation..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FaFilter /> Réinitialiser
            </button>
          </div>

          {/* Geolocation status row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {locationStatus === "loading" && (
              <span className="flex items-center gap-2 text-gray-500">
                <FaSpinner className="animate-spin" /> Détection de votre position...
              </span>
            )}
            {locationStatus === "granted" && (
              <span className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                <FaLocationArrow /> Position détectée — résultats triés par distance
              </span>
            )}
            {(locationStatus === "denied" || locationStatus === "unavailable") && (
              <span className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                <FaMapMarkerAlt />
                {locationStatus === "denied"
                  ? "Localisation refusée — activez-la pour voir les stages les plus proches."
                  : "Localisation indisponible sur cet appareil."}
                <button onClick={requestLocation} className="underline font-medium hover:text-amber-900">
                  Réessayer
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters + results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Filtres</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de stage</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Tous</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="academique">Académique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rémunération</label>
                <select
                  value={filters.payment}
                  onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Toutes</option>
                  <option value="paid">Payé</option>
                  <option value="unpaid">Non payé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Toutes</option>
                  <option value="0-3">1 à 3 mois</option>
                  <option value="4-6">4 à 6 mois</option>
                  <option value="7+">7 mois et +</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domaine / Département</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Tous</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <select
                  value={filters.organization}
                  onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Toutes</option>
                  {organizations.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <CityCombobox
                  value={filters.city}
                  onChange={(v) => setFilters({ ...filters, city: v })}
                  options={cityOptions}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{filtered.length} stage(s) trouvé(s)</p>
              <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition ${
                    view === "list" ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaList /> Liste
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition ${
                    view === "map" ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaMap /> Carte
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-green-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FaSearch className="text-gray-300 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun stage trouvé</h3>
                <p className="text-gray-500">Essayez avec d'autres critères de recherche</p>
              </div>
            ) : view === "list" ? (
              <div className="space-y-4">
                {filtered.map((internship) => (
                  <div key={internship.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{internship.title}</h3>
                        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaBuilding className="text-green-600" />
                            {internship.organization?.organisation_name || "Entreprise"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-green-600" />
                            {internship.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-green-600" />
                            {internship.duration}
                          </span>
                          {internship.distance !== null && (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                              <FaLocationArrow /> à {formatDistance(internship.distance)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{internship.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                            <FaGraduationCap />
                            {internship.internship_type === "professionnel" ? "Stage Professionnel" : "Stage Académique"}
                          </span>
                          {internship.payment_type === "paid" ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                              <FaMoneyBillWave /> {internship.salary?.toLocaleString()} FCFA/mois
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Non payé</span>
                          )}
                          {internship.department && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {internship.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/internships/${internship.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap font-medium"
                      >
                        Voir l'offre
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {unmappableCount > 0 && (
                  <p className="text-xs text-gray-400 mb-2">
                    {unmappableCount} offre(s) sans localisation précise ne sont pas affichées sur la carte.
                  </p>
                )}
                <div className="rounded-xl overflow-hidden shadow-sm h-150">
                  <MapContainer
                    center={userPosition || DEFAULT_CENTER}
                    zoom={userPosition ? 12 : 7}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterOnLocate position={userPosition} />

                    {userPosition && (
                      <Marker position={userPosition} icon={userIcon}>
                        <Popup>Votre position</Popup>
                      </Marker>
                    )}

                    {mappable.map((internship) => (
                      <Marker
                        key={internship.id}
                        position={[internship.latitude as number, internship.longitude as number]}
                        icon={internshipIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold mb-1">{internship.title}</p>
                            <p className="text-gray-600 mb-1">{internship.organization?.organisation_name}</p>
                            {internship.distance !== null && (
                              <p className="text-green-700 mb-2">à {formatDistance(internship.distance)}</p>
                            )}
                            <Link to={`/internships/${internship.id}`} className="text-green-700 font-medium underline">
                              Voir l'offre
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
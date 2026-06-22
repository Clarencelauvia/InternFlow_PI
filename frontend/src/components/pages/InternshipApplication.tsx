import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGraduationCap,
  FaBuilding, FaCalendarAlt, FaUsers, FaArrowLeft, FaSpinner,
  FaCheckCircle, FaExclamationTriangle, FaLock, FaPaperPlane,
  FaHourglassHalf, FaListUl, FaGift, FaLayerGroup, FaFilePdf,
  FaUpload, FaUserCircle, FaLinkedin, FaGithub, FaGlobe, FaEdit, FaCheck
} from "react-icons/fa";

// TODO: move to an environment variable (import.meta.env.VITE_API_URL)
const API_BASE = "http://localhost:8000";
const MIN_COVER_LETTER_LENGTH = 30;

interface OrganizationInfo {
  organisation_name: string;
  location: string;
  logo_path: string | null;
}

interface InternshipDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  quartier: string | null;
  duration: string;
  start_date: string;
  end_date: string;
  slots: number;
  status: string;
  internship_type: string;
  payment_type: string;
  salary: number | null;
  department: string | null;
  requirements: string | null;
  benefits: string | null;
  expires_at: string | null;
  created_at: string;
  organization: OrganizationInfo | null;
}

interface StudentProfile {
  location?: string | null;
  skills?: string | null;
  university?: string | null;
  department?: string | null;
  course?: string | null;
  year?: string | null;
  resume_path?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  student_profile?: StudentProfile | null;
}

interface StudentApplication {
  id: number;
  internship_id: number;
  status: string;
  created_at: string;
}

export default function InternshipApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myApplication, setMyApplication] = useState<StudentApplication | null>(null);

  // Application form fields
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");

  const [phase, setPhase] = useState<"form" | "review">("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // CV upload (when the profile has none)
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchInternship(id);
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchProfileAndApplications(token, id);
    } else {
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInternship = async (internshipId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/internships/${internshipId}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (res.ok) setInternship(await res.json());
      else setNotFound(true);
    } catch (err) {
      console.error("Error fetching internship:", err);
      setNotFound(true);
    }
  };

  const fetchProfileAndApplications = async (token: string, internshipId: string) => {
    try {
      const profileRes = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        setProfile(await profileRes.json());
      } else if (profileRes.status === 401) {
        localStorage.clear();
        setIsAuthenticated(false);
      }

      const appsRes = await fetch(`${API_BASE}/api/student/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (appsRes.ok) {
        const apps: StudentApplication[] = await appsRes.json();
        const existing = apps.find((a) => a.internship_id === Number(internshipId));
        if (existing) setMyApplication(existing);
      }
    } catch (err) {
      console.error("Error fetching profile/applications:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setProfile(await res.json());
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Non precise";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
  };

  const role = profile?.role ?? null;
  const sp = profile?.student_profile ?? null;
  const fullLocation = internship
    ? internship.quartier ? `${internship.quartier}, ${internship.location}` : internship.location
    : "";

  const isExpired = internship?.expires_at
    ? new Date(internship.expires_at).getTime() < Date.now() : false;
  const isClosed = internship ? internship.status !== "open" : false;
  const daysLeft = internship?.expires_at
    ? Math.ceil((new Date(internship.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const hasCV = !!sp?.resume_path;
  // Profile considered complete enough to apply when it has a location, skills and a CV
  const profileComplete = !!(sp?.location && sp?.skills);

  const canApply =
    isAuthenticated && role === "student" && !!internship &&
    !isClosed && !isExpired && !myApplication;

  const goToStudentLogin = () => {
    if (id) localStorage.setItem("redirectAfterLogin", `/internships/${id}`);
    navigate("/login/studentLogin");
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    setCvUploading(true);
    setCvError(null);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("resume", cvFile);
      const res = await fetch(`${API_BASE}/api/upload/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        await refreshProfile();
        setCvFile(null);
      } else if (res.status === 422 && data.errors) {
        const first = Object.values(data.errors)[0];
        setCvError(Array.isArray(first) ? String(first[0]) : "Fichier invalide.");
      } else {
        setCvError(data.error || "Echec du televersement du CV.");
      }
    } catch (err) {
      console.error("CV upload error:", err);
      setCvError("Impossible de televerser le CV. Verifiez votre connexion.");
    } finally {
      setCvUploading(false);
    }
  };

  const goToReview = () => {
    setSubmitError(null);
    if (coverLetter.trim().length < MIN_COVER_LETTER_LENGTH) {
      setSubmitError(`Votre lettre de motivation doit contenir au moins ${MIN_COVER_LETTER_LENGTH} caracteres.`);
      return;
    }
    if (!availabilityConfirmed) {
      setSubmitError("Veuillez confirmer votre disponibilite pour les dates du stage.");
      return;
    }
    setPhase("review");
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!internship) return;

    const token = localStorage.getItem("token");
    if (!token) { goToStudentLogin(); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/api/internships/${internship.id}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          cover_letter: coverLetter,
          message: message || null,
          availability_confirmed: availabilityConfirmed,
          available_from: availableFrom || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        if (data.application) setMyApplication(data.application);
      } else if (res.status === 422 && data.errors) {
        const first = Object.values(data.errors)[0];
        setSubmitError(Array.isArray(first) ? String(first[0]) : "Donnees invalides.");
        setPhase("form");
      } else {
        setSubmitError(data.error || "Une erreur est survenue lors de l'envoi.");
        setPhase("form");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setSubmitError("Impossible d'envoyer votre candidature. Verifiez votre connexion.");
      setPhase("form");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      open: { label: "Ouvert aux candidatures", classes: "bg-green-100 text-green-700" },
      closed: { label: "Ferme", classes: "bg-red-100 text-red-700" },
      in_progress: { label: "En cours", classes: "bg-blue-100 text-blue-700" }
    };
    const e = map[status] || { label: status, classes: "bg-gray-100 text-gray-700" };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${e.classes}`}>{e.label}</span>;
  };

  const applicationStatusBadge = (status: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      pending: { label: "En attente de reponse", classes: "bg-amber-100 text-amber-700" },
      accepted: { label: "Candidature acceptee", classes: "bg-green-100 text-green-700" },
      rejected: { label: "Candidature refusee", classes: "bg-red-100 text-red-700" }
    };
    const e = map[status] || { label: status, classes: "bg-gray-100 text-gray-700" };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${e.classes}`}>{e.label}</span>;
  };

  const TopBar = () => (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="font-bold text-2xl text-[#16A34A] hover:opacity-80 transition">
            Intern<span className="text-[#059669]">flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/internships" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Tous les stages</Link>
            {isAuthenticated ? (
              <Link to="/dashboard/studDashboard" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md">Mon tableau de bord</Link>
            ) : (
              <>
                <Link to="/login/studentLogin" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Connexion</Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  if (pageLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-green-600" /></div>;
  }

  if (notFound || !internship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="pt-32 max-w-xl mx-auto px-4 text-center">
          <FaExclamationTriangle className="text-5xl text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Stage introuvable</h1>
          <p className="text-gray-600 mb-6">Cette offre n'existe plus ou a ete retiree.</p>
          <Link to="/internships" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold">
            <FaArrowLeft /> Voir toutes les offres
          </Link>
        </div>
      </div>
    );
  }

  // What the employer will see — reused in the panel and the review step
  const EmployerPreview = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
        <FaUserCircle /> Ce que l'entreprise verra
      </p>
      <div className="space-y-1.5 text-sm">
        <p className="font-semibold text-gray-800">{profile?.name}</p>
        <p className="text-gray-500">{profile?.email}</p>
        {(sp?.university || sp?.department) && (
          <p className="text-gray-600">{[sp?.university, sp?.department].filter(Boolean).join(" - ")}</p>
        )}
        {(sp?.course || sp?.year) && (
          <p className="text-gray-600">{[sp?.course, sp?.year].filter(Boolean).join(", ")}</p>
        )}
        {sp?.skills && <p className="text-gray-600"><span className="text-gray-400">Competences : </span>{sp.skills}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          {sp?.resume_path && (
            <a href={`${API_BASE}/storage/${sp.resume_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-red-600 hover:underline text-xs font-medium">
              <FaFilePdf /> CV
            </a>
          )}
          {sp?.linkedin_url && <a href={sp.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"><FaLinkedin /> LinkedIn</a>}
          {sp?.github_url && <a href={sp.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gray-700 hover:underline text-xs"><FaGithub /> GitHub</a>}
          {sp?.portfolio_url && <a href={sp.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-700 hover:underline text-xs"><FaGlobe /> Portfolio</a>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        <Link to="/internships" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 transition mb-6 text-sm font-medium">
          <FaArrowLeft /> Retour aux offres
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2">{statusBadge(internship.status)}</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{internship.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-1.5"><FaBuilding className="text-green-600" />{internship.organization?.organisation_name || "Entreprise"}</span>
                <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-green-600" />{fullLocation}</span>
              </div>
            </div>
            {internship.organization?.logo_path && (
              <img src={`${API_BASE}/storage/${internship.organization.logo_path}`} alt={internship.organization.organisation_name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
            )}
          </div>

          {internship.expires_at && !isExpired && internship.status === "open" && (
            <div className="mt-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <FaHourglassHalf className="text-amber-600 shrink-0" />
              <p className="text-amber-800 text-sm">
                Candidatures ouvertes jusqu'au <strong>{formatDate(internship.expires_at)}</strong>
                {daysLeft !== null && daysLeft >= 0 && <> &mdash; {daysLeft === 0 ? "dernier jour" : `${daysLeft} jour(s) restant(s)`}</>}
              </p>
            </div>
          )}
          {isExpired && (
            <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <FaExclamationTriangle className="text-red-600 shrink-0" />
              <p className="text-red-800 text-sm">La date limite ({formatDate(internship.expires_at)}) est depassee.</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center"><FaClock className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Duree</p><p className="font-semibold">{internship.duration}</p></div>
                <div className="text-center"><FaCalendarAlt className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Debut</p><p className="font-semibold text-sm">{formatDate(internship.start_date)}</p></div>
                <div className="text-center"><FaCalendarAlt className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Fin</p><p className="font-semibold text-sm">{formatDate(internship.end_date)}</p></div>
                <div className="text-center"><FaGraduationCap className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Type</p><p className="font-semibold">{internship.internship_type === "professionnel" ? "Professionnel" : "Academique"}</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center"><FaMoneyBillWave className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Remuneration</p><p className="font-semibold text-sm">{internship.payment_type === "paid" ? `${internship.salary?.toLocaleString()} FCFA` : "Non paye"}</p></div>
                <div className="text-center"><FaUsers className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Places</p><p className="font-semibold">{internship.slots}</p></div>
                <div className="text-center"><FaLayerGroup className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Departement</p><p className="font-semibold text-sm">{internship.department || "Tous"}</p></div>
                <div className="text-center"><FaMapMarkerAlt className="text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Quartier</p><p className="font-semibold text-sm">{internship.quartier || internship.location}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Description du poste</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{internship.description}</p>
            </div>

            {internship.requirements && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaListUl className="text-green-600" /> Prerequis &amp; competences</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{internship.requirements}</p>
              </div>
            )}

            {internship.benefits && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaGift className="text-green-600" /> Avantages</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{internship.benefits}</p>
              </div>
            )}
          </div>

          {/* Application column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Postuler a ce stage</h2>

              {/* Not a logged-in student */}
              {(!isAuthenticated || (role && role !== "student")) && !isClosed && !isExpired && (
                <div className="text-center py-4">
                  <FaLock className="text-3xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm mb-4">
                    {isAuthenticated ? "Seuls les comptes etudiants peuvent postuler." : "Connectez-vous avec votre compte etudiant pour postuler."}
                  </p>
                  <button onClick={goToStudentLogin} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold">
                    <FaPaperPlane /> Postuler
                  </button>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-400 mt-3">Pas encore de compte ? <Link to="/register/student" className="text-green-700 hover:underline">Inscrivez-vous</Link></p>
                  )}
                </div>
              )}

              {/* Already applied */}
              {isAuthenticated && role === "student" && myApplication && !submitSuccess && (
                <div className="text-center py-4">
                  <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">Vous avez deja postule</p>
                  <div className="mb-3">{applicationStatusBadge(myApplication.status)}</div>
                  <p className="text-xs text-gray-400">Envoyee le {formatDate(myApplication.created_at)}</p>
                </div>
              )}

              {/* Closed / expired */}
              {isAuthenticated && role === "student" && !myApplication && (isClosed || isExpired) && (
                <div className="text-center py-4">
                  <FaExclamationTriangle className="text-3xl text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">{isExpired ? "La date limite est depassee." : "Cette offre n'accepte plus de candidatures."}</p>
                </div>
              )}

              {/* Success */}
              {submitSuccess && (
                <div className="text-center py-4">
                  <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                  <p className="text-gray-800 font-semibold mb-1">Candidature envoyee !</p>
                  <p className="text-gray-500 text-sm mb-4">L'entreprise examinera votre profil et reviendra vers vous.</p>
                  <Link to="/dashboard/studDashboard" className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold">Voir mes candidatures</Link>
                </div>
              )}

              {/* Eligible to apply */}
              {canApply && !submitSuccess && (
                <>
                  {/* Gate 1: incomplete profile */}
                  {!profileComplete && (
                    <div className="text-center py-4">
                      <FaExclamationTriangle className="text-3xl text-amber-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Completez votre profil</p>
                      <p className="text-gray-500 text-sm mb-4">Ajoutez au minimum votre localisation et vos competences avant de postuler.</p>
                      <Link to="/dashboard/CompleteProfile" className="block w-full text-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold">Completer mon profil</Link>
                    </div>
                  )}

                  {/* Gate 2: no CV (only once profile is otherwise complete) */}
                  {profileComplete && !hasCV && (
                    <div className="py-2">
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                        <FaFilePdf className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-amber-800 text-sm">Un CV est obligatoire pour postuler. Ajoutez-le ci-dessous (il sera aussi enregistre sur votre profil).</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 mb-3"
                      />
                      {cvError && <p className="text-red-600 text-xs mb-2">{cvError}</p>}
                      <button
                        onClick={handleUploadCV}
                        disabled={!cvFile || cvUploading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50"
                      >
                        {cvUploading ? <FaSpinner className="animate-spin" /> : <><FaUpload /> Televerser mon CV</>}
                      </button>
                    </div>
                  )}

                  {/* Form / Review */}
                  {profileComplete && hasCV && phase === "form" && (
                    <form onSubmit={(e) => { e.preventDefault(); goToReview(); }} className="space-y-4">
                      <EmployerPreview />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation *</label>
                        <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6}
                          placeholder="Expliquez pourquoi vous etes un bon candidat..."
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none" />
                        <p className={`text-xs ${coverLetter.length < MIN_COVER_LETTER_LENGTH ? "text-gray-400" : "text-green-600"}`}>
                          {coverLetter.length} / {MIN_COVER_LETTER_LENGTH} caracteres minimum
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message a l'entreprise <span className="text-gray-400 font-normal">(optionnel)</span></label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                          placeholder="Une note courte, si vous le souhaitez..."
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none" />
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={availabilityConfirmed} onChange={(e) => setAvailabilityConfirmed(e.target.checked)} className="mt-1 w-4 h-4 text-green-600 rounded" />
                          <span className="text-sm text-gray-700">Je confirme etre disponible pour la periode du <strong>{formatDate(internship.start_date)}</strong> au <strong>{formatDate(internship.end_date)}</strong>.</span>
                        </label>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Disponible a partir du <span className="text-gray-400">(optionnel)</span></label>
                          <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none" />
                        </div>
                      </div>

                      {submitError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0 text-sm" />
                          <p className="text-red-700 text-sm">{submitError}</p>
                        </div>
                      )}

                      <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold">
                        <FaCheck /> Verifier ma candidature
                      </button>
                    </form>
                  )}

                  {/* Review / confirm step */}
                  {profileComplete && hasCV && phase === "review" && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-800">
                        Verifiez votre candidature avant l'envoi. Une candidature ne peut pas etre annulee.
                      </div>
                      <EmployerPreview />
                      <div className="text-sm">
                        <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Lettre de motivation</p>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{coverLetter}</p>
                      </div>
                      {message && (
                        <div className="text-sm">
                          <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Message</p>
                          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{message}</p>
                        </div>
                      )}
                      <div className="text-sm flex items-center gap-2 text-green-700">
                        <FaCheckCircle /> Disponibilite confirmee{availableFrom ? ` (a partir du ${formatDate(availableFrom)})` : ""}
                      </div>

                      {submitError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0 text-sm" />
                          <p className="text-red-700 text-sm">{submitError}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => setPhase("form")} disabled={submitting}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium disabled:opacity-50">
                          <FaEdit /> Modifier
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50">
                          {submitting ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Confirmer et envoyer</>}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
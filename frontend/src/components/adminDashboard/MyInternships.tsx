import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase, faMapMarkerAlt, faClock, faUsers, faEye, 
  faEdit, faTrashAlt, faPlus, faSearch, faFilter, 
  faCheckCircle, faTimesCircle, faSpinner, faClock as faClockIcon,
  faBuilding, faCalendarAlt, faMoneyBillWave, faGraduationCap,
  faChevronLeft, faChevronRight
} from "@fortawesome/free-solid-svg-icons";

interface Internship {
  id: number;
  title: string;
  description: string;
  location: string;
  duration: string;
  start_date: string;
  end_date: string;
  slots: number;
  status: string;
  internship_type: string;
  payment_type: string;
  salary: number;
  department: string;
  requirements: string;
  benefits: string;
  applications_count: number;
  created_at: string;
}

export default function MyInternships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statuses = [
    { value: "all", label: "Tous", color: "gray" },
    { value: "open", label: "Actifs", color: "green" },
    { value: "closed", label: "Fermés", color: "red" },
    { value: "in_progress", label: "En cours", color: "blue" }
  ];

  const types = [
    { value: "all", label: "Tous" },
    { value: "professionnel", label: "Professionnel" },
    { value: "academique", label: "Académique" }
  ];

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [internships, searchTerm, statusFilter, typeFilter]);

  const fetchInternships = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/organisation");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/organization/internships", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInternships(data);
      } else if (response.status === 401) {
        localStorage.clear();
        navigate("/login/organisation");
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger vos stages"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInternships = () => {
    let filtered = [...internships];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(internship => internship.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(internship => internship.internship_type === typeFilter);
    }

    setFilteredInternships(filtered);
  };

  const handleDeleteInternship = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: "Supprimer le stage",
      text: `Êtes-vous sûr de vouloir supprimer "${title}" ? Cette action est irréversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8000/api/internships/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Supprimé",
            text: "Le stage a été supprimé avec succès",
            timer: 2000,
            showConfirmButton: false
          });
          fetchInternships();
        } else {
          throw new Error();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer le stage"
        });
      }
    }
  };

  const updateInternshipStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/internships/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Statut mis à jour",
          text: `Le stage est maintenant ${newStatus === "open" ? "actif" : newStatus === "closed" ? "fermé" : "en cours"}`,
          timer: 2000,
          showConfirmButton: false
        });
        fetchInternships();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de mettre à jour le statut"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Actif</span>;
      case "closed":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Fermé</span>;
      case "in_progress":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><FontAwesomeIcon icon={faClockIcon} className="mr-1" /> En cours</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getStatusActions = (internship: Internship) => {
    switch (internship.status) {
      case "open":
        return (
          <>
            <button
              onClick={() => updateInternshipStatus(internship.id, "in_progress")}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
            >
              Passer en cours
            </button>
            <button
              onClick={() => updateInternshipStatus(internship.id, "closed")}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
            >
              Fermer
            </button>
          </>
        );
      case "in_progress":
        return (
          <>
            <button
              onClick={() => updateInternshipStatus(internship.id, "closed")}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
            >
              Fermer
            </button>
          </>
        );
      case "closed":
        return (
          <button
            onClick={() => updateInternshipStatus(internship.id, "open")}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
          >
            Rouvrir
          </button>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: internships.length,
    active: internships.filter(i => i.status === "open").length,
    inProgress: internships.filter(i => i.status === "in_progress").length,
    closed: internships.filter(i => i.status === "closed").length,
    totalApplications: internships.reduce((sum, i) => sum + (i.applications_count || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-green-700 to-green-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/admindashboard/organisationDashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition">
                <FontAwesomeIcon icon={faChevronLeft} /> Retour au tableau de bord
              </Link>
              <h1 className="text-3xl font-bold">Mes stages</h1>
              <p className="text-white/80 mt-1">Gérez toutes vos offres de stage</p>
            </div>
            <Link
              to="/admindashboard/organisationDashboard"
              onClick={(e) => {
                e.preventDefault();
                const dashboard = document.querySelector('button[data-tab="internships"]');
                if (dashboard) {
                  // This would need to trigger the modal from dashboard
                  // For now, just go back
                }
                navigate("/admindashboard/organisationDashboard");
              }}
              className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} /> Publier un stage
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total stages</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Actifs</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">En cours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
            <p className="text-xs text-gray-500">Fermés</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalApplications}</p>
            <p className="text-xs text-gray-500">Candidatures</p>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, localisation ou département..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none"
              >
                {types.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Internships List */}
          {filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faBriefcase} className="text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? "Aucun stage ne correspond à vos critères"
                  : "Vous n'avez pas encore publié de stage"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Essayez avec d'autres filtres"
                  : "Commencez par publier votre première offre de stage"}
              </p>
              <Link
                to="/admindashboard/organisationDashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              >
                <FontAwesomeIcon icon={faPlus} /> Publier une offre
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInternships.map((internship) => (
                <div key={internship.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800 hover:text-green-600 transition">
                          {internship.title}
                        </h3>
                        {getStatusBadge(internship.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" /> {internship.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} className="text-green-600" /> {internship.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faGraduationCap} className="text-green-600" />
                          {internship.internship_type === 'professionnel' ? 'Professionnel' : 'Académique'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600" />
                          {internship.payment_type === 'paid' ? `${internship.salary?.toLocaleString()} FCFA` : 'Non payé'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                          {internship.applications_count || 0} candidature(s)
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{internship.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedInternship(internship);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" /> Voir détails
                        </button>
                        {getStatusActions(internship)}
                        <button
                          onClick={() => handleDeleteInternship(internship.id, internship.title)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="mr-1" /> Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>📅 Publié le</p>
                      <p className="font-medium">{new Date(internship.created_at).toLocaleDateString()}</p>
                      <p className="mt-2">📊 {internship.slots} place(s)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Internship Details Modal */}
      {showDetailsModal && selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Détails du stage</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedInternship.title}</h3>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                    <span>Votre entreprise</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                    <span>{selectedInternship.location}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {getStatusBadge(selectedInternship.status)}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <FontAwesomeIcon icon={faClock} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Durée</p>
                  <p className="font-semibold">{selectedInternship.duration}</p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Période</p>
                  <p className="font-semibold text-sm">
                    {new Date(selectedInternship.start_date).toLocaleDateString()} - {new Date(selectedInternship.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">
                    {selectedInternship.internship_type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'}
                  </p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Rémunération</p>
                  <p className="font-semibold">
                    {selectedInternship.payment_type === 'paid' 
                      ? `${selectedInternship.salary?.toLocaleString()} FCFA/mois` 
                      : 'Stage non payé'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Description du poste</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInternship.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedInternship.requirements && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Prérequis & Compétences requises</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInternship.requirements}</p>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedInternship.benefits && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Avantages</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInternship.benefits}</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4 bg-blue-50 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-600">📊 Nombre de places</p>
                  <p className="font-semibold text-gray-800">{selectedInternship.slots} place(s) disponible(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">📅 Date de publication</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedInternship.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">🎓 Département cible</p>
                  <p className="font-semibold text-gray-800">{selectedInternship.department || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">👥 Candidatures reçues</p>
                  <p className="font-semibold text-gray-800">{selectedInternship.applications_count || 0}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Link
                  to={`/admindashboard/organisationDashboard`}
                  className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-2" /> Voir les candidatures
                </Link>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
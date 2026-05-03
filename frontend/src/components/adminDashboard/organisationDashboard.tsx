import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faSignOutAlt, faEdit, faChartLine, faBriefcase, 
  faFileUpload, faCheckCircle, faClock, faArrowTrendUp, 
  faStar, faSearch, faList, faChartPie, faChevronRight, 
  faBuilding, faCalendarAlt, faSave, faTimes, faPhone, 
  faEnvelope, faGlobe, faUsers, faPlus, faTrashAlt,
  faExclamationTriangle, faMapMarkerAlt, faEye, faEyeSlash,
  faSuitcase, faGraduationCap, faFilter, faDownload,
  faMoneyBillWave, faBook, faFileAlt, 
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { 
  FaLinkedin, FaTwitter, FaFacebook, FaInstagram,
  FaMapMarkerAlt as FaMapMarkerAltIcon
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  contact: string;
}

interface OrganizationProfile {
  organisation_name: string;
  domain: string;
  location: string;
  postal_code: string;
  official_number: string;
  description?: string;
  logo_path?: string;
  website?: string;
  sector?: string;
  company_size?: string;
  founded_year?: number;
  mission_statement?: string;
  recruitment_email?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

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
  internship_type?: string;
  payment_type?: string;
  salary?: number;
  department?: string;
  expires_at?: string;
  requirements?: string;
  benefits?: string;
  applications_count?: number;
}

interface Application {
  id: number;
  student_name: string;
  student_email: string;
  status: string;
  cover_letter: string;
  created_at: string;
  internship_title: string;
}

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "internships" | "applications" | "profile">("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<OrganizationProfile>>({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newInternship, setNewInternship] = useState({
    title: "",
    description: "",
    location: "",
    duration: "",
    start_date: "",
    end_date: "",
    slots: "",
    internship_type: "",
    payment_type: "",
    salary: "",
    department: "",
    expires_at: "",
    requirements: "",
    benefits: "",
  });

  const profileCompletionPercentage = useMemo(() => {
    if (!profile) return 0;
    
    const fields = [
      profile.sector,
      profile.company_size,
      profile.description,
      profile.mission_statement,
      profile.recruitment_email,
      profile.website,
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  }, [profile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/organisation");
      return;
    }
    fetchUserData();
    fetchInternships();
    fetchApplications();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/organisation");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/profile", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setProfile(data.organization_profile);
        setEditedProfile(data.organization_profile || {});
      } else if (response.status === 401) {
        localStorage.clear();
        navigate("/login/organisation");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/organization/internships", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInternships(data);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/organization/applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Déconnexion",
      text: "Êtes-vous sûr de vouloir vous déconnecter ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16A34A",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (token) {
          await fetch("http://localhost:8000/api/logout", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
        }
        localStorage.clear();
        navigate("/login/organisation");
      }
    });
  };

  const handlePostInternship = async () => {
    const token = localStorage.getItem("token");
    
    if (!newInternship.title || !newInternship.description || !newInternship.location || 
        !newInternship.duration || !newInternship.start_date || !newInternship.end_date || !newInternship.slots) {
      Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires (*)", "error");
      return;
    }
    
    if (newInternship.payment_type === 'paid' && !newInternship.salary) {
      Swal.fire("Erreur", "Veuillez indiquer le montant pour le stage payé", "error");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/internships", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newInternship.title,
          description: newInternship.description,
          location: newInternship.location,
          duration: newInternship.duration,
          start_date: newInternship.start_date,
          end_date: newInternship.end_date,
          slots: parseInt(newInternship.slots),
          internship_type: newInternship.internship_type,
          payment_type: newInternship.payment_type,
          salary: newInternship.payment_type === 'paid' ? parseFloat(newInternship.salary) : null,
          department: newInternship.department,
          expires_at: newInternship.expires_at,
          requirements: newInternship.requirements,
          benefits: newInternship.benefits,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire("Succès", "Stage publié avec succès", "success");
        setShowPostModal(false);
        setNewInternship({
          title: "", description: "", location: "", duration: "",
          start_date: "", end_date: "", slots: "", internship_type: "",
          payment_type: "", salary: "", department: "", expires_at: "",
          requirements: "", benefits: ""
        });
        fetchInternships();
      } else {
        const errorMessage = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : data.error || "Une erreur est survenue";
        Swal.fire("Erreur", errorMessage, "error");
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible de publier le stage", "error");
    }
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/organization/profile/complete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        Swal.fire("Succès", "Profil mis à jour", "success");
        fetchUserData();
        setIsEditing(false);
      } else {
        const data = await response.json();
        Swal.fire("Erreur", data.error || "Impossible de mettre à jour le profil", "error");
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible de mettre à jour le profil", "error");
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        Swal.fire("Succès", `Candidature ${status === "accepted" ? "acceptée" : "refusée"}`, "success");
        fetchApplications();
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible de mettre à jour le statut", "error");
    }
  };

  const stats = {
    totalInternships: internships.length,
    totalApplications: applications.length,
    profileCompletion: profileCompletionPercentage,
    pendingApplications: applications.filter(a => a.status === "pending").length,
    acceptedApplications: applications.filter(a => a.status === "accepted").length,
    rejectedApplications: applications.filter(a => a.status === "rejected").length,
    activeInternships: internships.filter(i => i.status === "open").length
  };

  const applicationTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Candidatures reçues',
      data: [5, 8, 12, 9, 15, 10],
      borderColor: '#16A34A',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const applicationStatusData = {
    labels: ['En attente', 'Acceptées', 'Refusées'],
    datasets: [{
      data: [stats.pendingApplications, stats.acceptedApplications, stats.rejectedApplications],
      backgroundColor: ['#eab308', '#22c55e', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-gray-100 to-green-50">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-br from-[#0D5D2E] to-[#16A34A] text-white flex flex-col shadow-xl fixed h-full overflow-y-auto">
        <div className="p-6 text-center border-b border-green-400/30">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.logo_path ? (
              <img 
                src={`http://localhost:8000/storage/${profile.logo_path}`} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <FontAwesomeIcon icon={faBuilding} className="text-white text-xl" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-wide">InternFlow</h1>
          <p className="text-xs text-green-200 mt-1">Espace Recruteur</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faChartLine} className="w-5" /> Tableau de bord
          </button>
          <button onClick={() => setActiveTab("internships")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "internships" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faBriefcase} className="w-5" /> Mes stages
            {internships.length > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-white/20 rounded-full text-xs flex items-center justify-center">{internships.length}</span>}
          </button>
          <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "applications" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faFileUpload} className="w-5" /> Candidatures
            {stats.pendingApplications > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-yellow-400/30 rounded-full text-xs flex items-center justify-center">{stats.pendingApplications}</span>}
          </button>
          <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "profile" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faUser} className="w-5" /> Mon profil
          </button>
        </nav>

        <div className="p-4 border-t border-green-400/30">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-red-500/80 hover:bg-red-600 px-4 py-3 rounded-lg transition font-medium">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="bg-linear-to-r from-[#16A34A] to-[#059669] h-2"></div>
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bonjour, <span className="text-[#16A34A]">{profile?.organisation_name?.split(' ')[0] || 'Recruteur'} !</span>
              </h1>
              <p className="text-gray-500 mt-1">Gérez vos offres de stage et trouvez les meilleurs talents</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#16A34A] to-[#059669] flex items-center justify-center overflow-hidden">
                {profile?.logo_path ? (
                  <img 
                    src={`http://localhost:8000/storage/${profile.logo_path}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{profile?.organisation_name || 'Entreprise'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faBriefcase} className="text-[#16A34A] text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.totalInternships}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Stages publiés</p>
                  <p className="text-xs text-green-600 mt-2">{stats.activeInternships} actifs</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileUpload} className="text-blue-600 text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.totalApplications}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Candidatures reçues</p>
                  <p className="text-xs text-blue-600 mt-2">{stats.pendingApplications} en attente</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.acceptedApplications}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Candidatures acceptées</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faStar} className="text-orange-600 text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.profileCompletion}%</span>
                  </div>
                  <p className="text-gray-500 text-sm">Complétion du profil</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des candidatures</h3>
                  <div className="h-80"><Line data={applicationTrendData} options={chartOptions} /></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Statut des candidatures</h3>
                  <div className="h-80"><Pie data={applicationStatusData} options={chartOptions} /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Stages récents</h3>
                  <button onClick={() => setActiveTab("internships")} className="text-[#16A34A] text-sm hover:underline">Voir tous</button>
                </div>
                <div className="space-y-3">
                  {internships.slice(0, 3).map((internship) => (
                    <div key={internship.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{internship.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> {internship.location}</span>
                          <span><FontAwesomeIcon icon={faClock} className="mr-1" /> {internship.duration}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        internship.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {internship.status === "open" ? "Actif" : "Fermé"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === "internships" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Mes offres de stage</h2>
                <button onClick={() => setShowPostModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#059669] transition">
                  <FontAwesomeIcon icon={faPlus} /> Publier une offre
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Titre</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Type</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Rémunération</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Localisation</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Durée</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Places</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Candidatures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internships.map((internship) => (
                      <tr key={internship.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-800">{internship.title}</td>
                        <td className="p-4 text-gray-600">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {internship.internship_type === 'professionnel' ? 'Professionnel' : 'Académique'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {internship.payment_type === 'paid' ? `${internship.salary?.toLocaleString()} FCFA` : 'Non payé'}
                        </td>
                        <td className="p-4 text-gray-600">{internship.location}</td>
                        <td className="p-4 text-gray-600">{internship.duration}</td>
                        <td className="p-4 text-gray-600">{internship.slots}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            internship.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {internship.status === "open" ? "Actif" : "Fermé"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{internship.applications_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Candidatures reçues</h2>

              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Étudiant</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Stage</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Statut</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-800">{app.student_name}</p>
                            <p className="text-xs text-gray-500">{app.student_email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{app.internship_title}</td>
                        <td className="p-4 text-gray-600">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === "accepted" ? "bg-green-100 text-green-700" :
                            app.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {app.status === "accepted" ? "Acceptée" : app.status === "rejected" ? "Refusée" : "En attente"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                Swal.fire({
                                  title: "Lettre de motivation",
                                  text: app.cover_letter,
                                  icon: "info",
                                  confirmButtonColor: "#16A34A"
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            {app.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => updateApplicationStatus(app.id, "accepted")}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                                <button 
                                  onClick={() => updateApplicationStatus(app.id, "rejected")}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
                <div className="flex gap-3">
                  {(!profile?.sector || !profile?.company_size) && (
                    <button onClick={() => navigate("/organization/profile/complete")} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
                      <FontAwesomeIcon icon={faEdit} /> Compléter mon profil
                    </button>
                  )}
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#059669] transition">
                      <FontAwesomeIcon icon={faEdit} /> Modifier
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={updateProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                        <FontAwesomeIcon icon={faSave} /> Enregistrer
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition">
                        <FontAwesomeIcon icon={faTimes} /> Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(!profile?.sector || !profile?.company_size) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-800">Profil incomplet</p>
                      <p className="text-sm text-orange-600">Complétez votre profil pour attirer plus de candidats</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/organization/profile/complete")} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">Compléter maintenant</button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#16A34A] to-[#059669] flex items-center justify-center overflow-hidden">
                      {profile?.logo_path ? (
                        <img src={`http://localhost:8000/storage/${profile.logo_path}`} alt="Logo" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <FontAwesomeIcon icon={faBuilding} className="text-white text-4xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{profile?.organisation_name}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-[#16A34A] mt-1">Entreprise</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Complétion du profil</span>
                      <span className="text-sm font-medium text-[#16A34A]">{profileCompletionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#16A34A] rounded-full h-2 transition-all duration-500" style={{ width: `${profileCompletionPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faBriefcase} className="mr-2 text-[#16A34A]" /> Secteur</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.sector || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faUsers} className="mr-2 text-[#16A34A]" /> Taille</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.company_size || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#16A34A]" /> Localisation</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.location || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faGlobe} className="mr-2 text-[#16A34A]" /> Site web</label>
                      {profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline block bg-gray-50 p-3 rounded-xl">{profile.website}</a>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">Non renseigné</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faPhone} className="mr-2 text-[#16A34A]" /> Téléphone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.official_number || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faEnvelope} className="mr-2 text-[#16A34A]" /> Email recrutement</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.recruitment_email || 'Non renseigné'}</p>
                    </div>
                  </div>

                  {profile?.description && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{profile.description}</p>
                    </div>
                  )}

                  {profile?.mission_statement && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Mission & Valeurs</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{profile.mission_statement}</p>
                    </div>
                  )}

                  {(profile?.social_links?.linkedin || profile?.social_links?.twitter || profile?.social_links?.facebook) && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Réseaux sociaux</h4>
                      <div className="flex gap-3">
                        {profile.social_links?.linkedin && <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-80"><FaLinkedin size={24} /></a>}
                        {profile.social_links?.twitter && <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80"><FaTwitter size={24} /></a>}
                        {profile.social_links?.facebook && <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877f2] hover:opacity-80"><FaFacebook size={24} /></a>}
                        {profile.social_links?.instagram && <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:opacity-80"><FaInstagram size={24} /></a>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

   {/* Post Internship Modal */}
{showPostModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Header*/}
      <div className="bg-linear-to-r from-[#16A34A] to-[#059669] h-1"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Publier une offre de stage</h2>
            <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous pour publier votre offre</p>
          </div>
          <button 
            onClick={() => setShowPostModal(false)} 
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
          </button>
        </div>
        
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-[#16A34A]" />
              Titre du stage *
            </label>
            <input 
              type="text" 
              value={newInternship.title} 
              onChange={(e) => setNewInternship({...newInternship, title: e.target.value})} 
              placeholder="Ex: Développeur Full Stack"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-[#16A34A]" />
              Description *
            </label>
            <textarea 
              rows={5} 
              value={newInternship.description} 
              onChange={(e) => setNewInternship({...newInternship, description: e.target.value})} 
              placeholder="Décrivez les missions, responsabilités et objectifs du stage..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
            />
          </div>
          
          {/* Type de stage & Payment */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-[#16A34A]" />
                Type de stage *
              </label>
              <select 
                value={newInternship.internship_type} 
                onChange={(e) => setNewInternship({...newInternship, internship_type: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
              >
                <option value="">Sélectionnez le type de stage</option>
                <option value="professionnel">Stage Professionnel</option>
                <option value="academique">Stage Académique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-[#16A34A]" />
                Rémunération *
              </label>
              <select 
                value={newInternship.payment_type} 
                onChange={(e) => setNewInternship({...newInternship, payment_type: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
              >
                <option value="">Sélectionnez le type de rémunération</option>
                <option value="paid">Payé</option>
                <option value="unpaid">Non payé</option>
              </select>
            </div>
          </div>
          
          {/* Salary (conditional) */}
          {newInternship.payment_type === 'paid' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-[#16A34A]" />
                Montant (FCFA) *
              </label>
              <input 
                type="number" 
                value={newInternship.salary} 
                onChange={(e) => setNewInternship({...newInternship, salary: e.target.value})}
                placeholder="Ex: 150000"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
          )}
          
          {/* Location & Duration */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#16A34A]" />
                Localisation *
              </label>
              <input 
                type="text" 
                value={newInternship.location} 
                onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                placeholder="Ex: Douala, Cameroun"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2 text-[#16A34A]" />
                Durée *
              </label>
              <select 
                value={newInternship.duration} 
                onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
              >
                <option value="">Sélectionnez la durée</option>
                <option value="2 mois">2 mois</option>
                <option value="3 mois">3 mois</option>
                <option value="4 mois">4 mois</option>
                <option value="6 mois">6 mois</option>
                <option value="9 mois">9 mois</option>
                <option value="12 mois">12 mois</option>
              </select>
            </div>
          </div>
          
          {/* Department & Slots */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-[#16A34A]" />
                Département cible
              </label>
              <input 
                type="text" 
                value={newInternship.department} 
                onChange={(e) => setNewInternship({...newInternship, department: e.target.value})}
                placeholder="Ex: Informatique, Marketing..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faUsers} className="mr-2 text-[#16A34A]" />
                Nombre de places *
              </label>
              <input 
                type="number" 
                min="1" 
                value={newInternship.slots} 
                onChange={(e) => setNewInternship({...newInternship, slots: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
          </div>
          
          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#16A34A]" />
                Date de début *
              </label>
              <input 
                type="date" 
                value={newInternship.start_date} 
                onChange={(e) => setNewInternship({...newInternship, start_date: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#16A34A]" />
                Date de fin *
              </label>
              <input 
                type="date" 
                value={newInternship.end_date} 
                onChange={(e) => setNewInternship({...newInternship, end_date: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
              />
            </div>
          </div>
          
          {/* Expiration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-[#16A34A]" />
              Date d'expiration de l'offre
            </label>
            <input 
              type="datetime-local" 
              value={newInternship.expires_at} 
              onChange={(e) => setNewInternship({...newInternship, expires_at: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">Laissez vide pour une offre sans date d'expiration</p>
          </div>
          
          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-[#16A34A]" />
              Prérequis / Compétences requises
            </label>
            <textarea 
              rows={3} 
              value={newInternship.requirements} 
              onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
              placeholder="Listez les compétences, formations ou expériences requises..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
            />
          </div>
          
          {/* Benefits */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faStar} className="mr-2 text-[#16A34A]" />
              Avantages
            </label>
            <textarea 
              rows={2} 
              value={newInternship.benefits} 
              onChange={(e) => setNewInternship({...newInternship, benefits: e.target.value})}
              placeholder="Ex: Tickets restaurant, transport, formation..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
            />
          </div>
        </form>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={() => setShowPostModal(false)} 
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            Annuler
          </button>
          <button 
            onClick={handlePostInternship} 
            className="px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Publier l'offre
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
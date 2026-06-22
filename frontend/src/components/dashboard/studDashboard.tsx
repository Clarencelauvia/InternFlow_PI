import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faSignOutAlt, faEdit, faChartLine, faBriefcase, 
  faFileUpload, faCheckCircle, faClock, faArrowTrendUp, 
  faStar, faSearch, faList, faChartPie, faChevronRight, 
  faBuilding, faCalendarAlt, faSave, faTimes, faPhone, 
  faUniversity, faBook, faGraduationCap, faIdCard, 
  faExclamationTriangle, faMapMarkerAlt, faEye, faFilter,
  faSpinner, faArrowRight, faMoneyBillWave, faPaperPlane
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
import { FaMapMarkerAlt as FaMapMarkerAltIcon } from "react-icons/fa";

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

interface StudentProfile {
  university: string;
  department: string;
  course: string;
  year: string;
  student_id: string;
  guardian_name: string;
  guardian_contact: string;
  profile_picture?: string;
  location?: string;
  bio?: string;
  skills?: string;
  preferred_work_type?: string;
  internship_type?: string;
  preferred_duration_min?: number;
  preferred_duration_max?: number;
  languages?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
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
  internship_type: string;
  payment_type: string;
  salary: number;
  department?: string;
  requirements?: string;
  benefits?: string;
  created_at: string;
  organization: {
    organisation_name: string;
  };
}

interface Application {
  id: number;
  internship_id: number;
  status: string;
  cover_letter: string;
  created_at: string;
  internship: Internship;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "internships" | "applications" | "profile">("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [selectedInternshipDetail, setSelectedInternshipDetail] = useState<Internship | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const profileCompletionPercentage = useMemo(() => {
    if (!profile) return 0;
    
    const fields = [
      profile.location,
      profile.skills,
      profile.preferred_work_type,
      profile.internship_type,
      profile.languages,
      profile.bio,
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  }, [profile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/studentLogin");
      return;
    }
    fetchUserData();
    fetchInternships();
    fetchApplications();
  }, []);

// Update the fetchUserData function to properly load profile data
const fetchUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login/studentLogin");
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
      setProfile(data.student_profile);
      // Make sure editedProfile has all existing data
      setEditedUser({ name: data.name, contact: data.contact });
      setEditedProfile({
        ...(data.student_profile || {}),
        location: data.student_profile?.location || '',
        skills: data.student_profile?.skills || '',
        preferred_work_type: data.student_profile?.preferred_work_type || '',
        internship_type: data.student_profile?.internship_type || '',
        languages: data.student_profile?.languages || '',
        bio: data.student_profile?.bio || '',
        linkedin_url: data.student_profile?.linkedin_url || '',
        github_url: data.student_profile?.github_url || '',
        portfolio_url: data.student_profile?.portfolio_url || '',
      });
    } else if (response.status === 401) {
      localStorage.clear();
      navigate("/login/studentLogin");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchInternships = async () => {
    setLoadingInternships(true);
    try {
      const token = localStorage.getItem("token");
      // Sending the token makes the backend personalize results to the student's
      // profile (location, preferred duration, internship type) via index().
      const response = await fetch("http://localhost:8000/api/internships", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoadingInternships(false);
    }
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/student/applications", {
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
        navigate("/login/studentLogin");
      }
    });
  };

  const viewInternshipDetails = (internship: Internship) => {
    setSelectedInternshipDetail(internship);
    setShowDetailModal(true);
  };


  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      if (editedUser.name || editedUser.contact) {
        await fetch("http://localhost:8000/api/profile", {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editedUser)
        });
      }
      
      const profileResponse = await fetch("http://localhost:8000/api/profile/complete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedProfile)
      });

      if (profileResponse.ok) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Profil mis à jour",
          timer: 1500,
          showConfirmButton: false
        });
        fetchUserData();
        setIsEditing(false);
      } else {
        const data = await profileResponse.json();
        Swal.fire("Erreur", data.error || "Impossible de mettre à jour le profil", "error");
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible de mettre à jour le profil", "error");
    }
  };

  const filteredInternships = internships.filter(internship =>
    internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.organization?.organisation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalInternships: internships.length,
    totalApplications: applications.length,
    profileCompletion: profileCompletionPercentage,
    pendingApplications: applications.filter(a => a.status === "pending").length,
    acceptedApplications: applications.filter(a => a.status === "accepted").length,
    rejectedApplications: applications.filter(a => a.status === "rejected").length
  };

  const applicationTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Candidatures',
      data: [2, 4, 3, 5, 7, stats.totalApplications],
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
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.profile_picture ? (
              <img 
                src={`http://localhost:8000/storage/${profile.profile_picture}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-xl" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-wide">InternFlow</h1>
          <p className="text-xs text-green-200 mt-1">Espace Étudiant</p>
        </div>

<nav className="flex-1 flex flex-col gap-1 p-4">
  <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
    <FontAwesomeIcon icon={faChartLine} className="w-5" /> Tableau de bord
  </button>
  <button onClick={() => setActiveTab("internships")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "internships" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
    <FontAwesomeIcon icon={faBriefcase} className="w-5" /> Stages disponibles
    {internships.length > 0 && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
        {internships.length > 9 ? '9+' : internships.length}
      </span>
    )}
  </button>
  <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "applications" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
    <FontAwesomeIcon icon={faFileUpload} className="w-5" /> Mes candidatures
    {applications.filter(a => a.status === "pending").length > 0 && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-white">
        {applications.filter(a => a.status === "pending").length > 9 ? '9+' : applications.filter(a => a.status === "pending").length}
      </span>
    )}
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
                Bienvenue, <span className="text-[#16A34A]">{user?.name?.split(' ')[0] || 'Étudiant'} !</span>
              </h1>
              <p className="text-gray-500 mt-1">Gérez vos candidatures et trouvez le stage idéal</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#16A34A] to-[#059669] rounded-full flex items-center justify-center overflow-hidden">
                {profile?.profile_picture ? (
                  <img src={`http://localhost:8000/storage/${profile.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'Étudiant'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'student@example.com'}</p>
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
                  <p className="text-gray-500 text-sm">Stages disponibles</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileUpload} className="text-blue-600 text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.totalApplications}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Candidatures envoyées</p>
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
                  <Link to="/internships" className="text-[#16A34A] text-sm hover:underline inline-flex items-center gap-1">
                    Voir tous les stages <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {internships.slice(0, 3).map((internship) => (
                    <div key={internship.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{internship.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span><FontAwesomeIcon icon={faBuilding} className="mr-1" /> {internship.organization?.organisation_name}</span>
                          <span><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> {internship.location}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => viewInternshipDetails(internship)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === "internships" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Stages recommandés pour vous</h2>
                  <p className="text-gray-500 mt-1">
                    {profile?.location || profile?.internship_type
                      ? `Basé sur votre profil${profile?.location ? ` (${profile.location})` : ""} — ${filteredInternships.length} stage(s)`
                      : `${filteredInternships.length} stage(s) trouvé(s)`}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 pr-4 py-2 border rounded-xl focus:border-[#16A34A] focus:ring-2 focus:ring-green-200 outline-none w-64" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#16A34A] text-white" : "bg-gray-100"}`}>
                      <FontAwesomeIcon icon={faChartPie} />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#16A34A] text-white" : "bg-gray-100"}`}>
                      <FontAwesomeIcon icon={faList} />
                    </button>
                  </div>
                  <button
                    onClick={() => navigate("/internships")}
                    className="flex items-center gap-2 px-5 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#059669] transition font-medium"
                  >
                    <FontAwesomeIcon icon={faBriefcase} /> Voir tous les stages
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                Ces offres sont filtrées selon votre profil. Pour explorer toutes les offres et la carte interactive, utilisez « Voir tous les stages ».
              </div>

              {loadingInternships ? (
                <div className="flex justify-center py-12">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-[#16A34A]" />
                </div>
              ) : filteredInternships.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faBriefcase} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun stage trouvé</h3>
                  <p className="text-gray-500">Aucun stage ne correspond à vos critères de recherche</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInternships.map((internship) => (
                    <div key={internship.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">{internship.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {internship.internship_type === 'professionnel' ? 'Pro' : 'Académique'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                          <span>{internship.organization?.organisation_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAltIcon className="text-green-600" />
                          <span>{internship.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} className="text-green-600" />
                          <span>{internship.duration}</span>
                        </div>
                        {internship.payment_type === 'paid' && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span>{internship.salary?.toLocaleString()} FCFA/mois</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => viewInternshipDetails(internship)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" /> Voir détails
                        </button>
                        <button 
                          onClick={() => navigate(`/internships/${internship.id}`)}
                          className="flex-1 px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-[#059669] transition text-sm"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-1" /> Postuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInternships.map((internship) => (
                    <div key={internship.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{internship.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faBuilding} className="text-green-600" /> 
                              {internship.organization?.organisation_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAltIcon className="text-green-600" /> 
                              {internship.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="text-green-600" /> 
                              {internship.duration}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2 line-clamp-2">{internship.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {internship.internship_type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'}
                            </span>
                            {internship.payment_type === 'paid' ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" /> {internship.salary?.toLocaleString()} FCFA/mois
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Non payé</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => viewInternshipDetails(internship)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" /> Voir détails
                          </button>
                          <button 
                            onClick={() => navigate(`/internships/${internship.id}`)}
                            className="px-6 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-[#059669] transition"
                          >
                            <FontAwesomeIcon icon={faPaperPlane} className="mr-1" /> Postuler
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Mes candidatures</h2>
              {applications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faFileUpload} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune candidature</h3>
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore postulé à des stages</p>
                  <button onClick={() => setActiveTab("internships")} className="px-6 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#059669] transition">
                    Découvrir les stages
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-xl shadow-sm p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{app.internship?.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{app.internship?.organization?.organisation_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status === 'accepted' ? 'Acceptée' : 
                           app.status === 'rejected' ? 'Refusée' : 'En attente'}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          Candidature envoyée le: {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
                  <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
                </div>
                <div className="flex gap-3">
                  {(!profile?.location || !profile?.skills) && (
                    <button onClick={() => navigate("/dashboard/CompleteProfile")} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
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

              {(!profile?.location || !profile?.skills) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-800">Profil incomplet</p>
                      <p className="text-sm text-orange-600">Complétez votre profil pour augmenter vos chances de trouver un stage</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/dashboard/CompleteProfile")} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
                    Compléter maintenant
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-24 h-24 bg-linear-to-br from-[#16A34A] to-[#059669] rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.profile_picture ? (
                        <img src={`http://localhost:8000/storage/${profile.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-white text-4xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-[#16A34A] mt-1">Étudiant</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-[#16A34A]" /> Téléphone
                      </label>
                      {isEditing ? (
                        <input value={editedUser.contact || ""} onChange={(e) => setEditedUser({ ...editedUser, contact: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{user?.contact || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FaMapMarkerAltIcon className="inline mr-2 text-[#16A34A]" /> Localisation</label>
                      {isEditing ? (
                        <input value={editedProfile.location || ""} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} className="w-full border rounded-xl px-3 py-2" />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.location || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faUniversity} className="mr-2 text-[#16A34A]" /> Université</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.university || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faBook} className="mr-2 text-[#16A34A]" /> Département</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.department || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-[#16A34A]" /> Cours</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.course || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#16A34A]" /> Année</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.year || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faIdCard} className="mr-2 text-[#16A34A]" /> Numéro étudiant</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.student_id || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Internship Details Modal */}
      {showDetailModal && selectedInternshipDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Détails du stage</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedInternshipDetail.title}</h3>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                    <span>{selectedInternshipDetail.organization?.organisation_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAltIcon className="text-green-600" />
                    <span>{selectedInternshipDetail.location}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedInternshipDetail.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedInternshipDetail.status === 'open' ? 'Stage actif' : 'Stage fermé'}
                </span>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <FontAwesomeIcon icon={faClock} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Durée</p>
                  <p className="font-semibold">{selectedInternshipDetail.duration}</p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Période</p>
                  <p className="font-semibold text-sm">
                    {new Date(selectedInternshipDetail.start_date).toLocaleDateString()} - {new Date(selectedInternshipDetail.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">
                    {selectedInternshipDetail.internship_type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'}
                  </p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Rémunération</p>
                  <p className="font-semibold">
                    {selectedInternshipDetail.payment_type === 'paid' 
                      ? `${selectedInternshipDetail.salary?.toLocaleString()} FCFA/mois` 
                      : 'Stage non payé'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Description du poste</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInternshipDetail.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedInternshipDetail.requirements && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Prérequis & Compétences requises</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInternshipDetail.requirements}</p>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedInternshipDetail.benefits && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Avantages</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInternshipDetail.benefits}</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4 bg-blue-50 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-600">📊 Nombre de places</p>
                  <p className="font-semibold text-gray-800">{selectedInternshipDetail.slots} place(s) disponible(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">📅 Date de publication</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedInternshipDetail.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">🎓 Département cible</p>
                  <p className="font-semibold text-gray-800">{selectedInternshipDetail.department || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">📍 Localisation</p>
                  <p className="font-semibold text-gray-800">{selectedInternshipDetail.location}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/internships/${selectedInternshipDetail.id}`);
                  }}
                  className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" /> Postuler maintenant
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
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
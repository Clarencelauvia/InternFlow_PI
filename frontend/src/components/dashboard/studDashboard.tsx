import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faSignOutAlt, faEdit, faChartLine, faBriefcase, 
  faFileUpload, faCheckCircle, faClock, faArrowTrendUp, 
  faStar, faSearch, faList, faChartPie, faChevronRight, 
  faBuilding, faCalendarAlt, faSave, faTimes, faPhone, 
  faUniversity, faBook, faGraduationCap, faIdCard, 
  faExclamationTriangle, faMapMarkerAlt, 
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
import { FaMapMarkerAlt as FaMapMarkerAltIcon, FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";

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
      navigate("/login/student");
      return;
    }
    fetchUserData();
    fetchInternships();
    fetchApplications();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/student");
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
        setEditedUser({ name: data.name, contact: data.contact });
        setEditedProfile(data.student_profile || {});
      } else if (response.status === 401) {
        localStorage.clear();
        navigate("/login/student");
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
      const response = await fetch("http://localhost:8000/api/internships", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInternships(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const fetchApplications = async () => {
    
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
        navigate("/login/student");
      }
    });
  };

  const handleApply = async (internshipId: number) => {
    const token = localStorage.getItem("token");
    const { value: coverLetter } = await Swal.fire({
      title: "Lettre de motivation",
      input: "textarea",
      inputPlaceholder: "Rédigez votre lettre de motivation...",
      showCancelButton: true,
      confirmButtonText: "Envoyer",
      cancelButtonText: "Annuler"
    });

    if (coverLetter) {
      try {
        const response = await fetch(`http://localhost:8000/api/internships/${internshipId}/apply`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ cover_letter: coverLetter })
        });

        if (response.ok) {
          Swal.fire("Succès", "Candidature envoyée avec succès", "success");
          fetchApplications();
        } else {
          const data = await response.json();
          Swal.fire("Erreur", data.error || "Une erreur est survenue", "error");
        }
      } catch (error) {
        Swal.fire("Erreur", "Impossible d'envoyer la candidature", "error");
      }
    }
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      // Update user info
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
      
      // Update student profile
      const profileResponse = await fetch("http://localhost:8000/api/profile/complete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedProfile)
      });

      if (profileResponse.ok) {
        Swal.fire("Succès", "Profil mis à jour", "success");
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
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.organization?.organisation_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      data: [2, 4, 3, 5, 7, 4],
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
            {internships.length > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-white/20 rounded-full text-xs flex items-center justify-center">{internships.length > 9 ? '9+' : internships.length}</span>}
          </button>
          <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "applications" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faFileUpload} className="w-5" /> Mes candidatures
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
                Bienvenue, <span className="text-[#16A34A]">{user?.name?.split(' ')[1] || 'Étudiant'} !</span>
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
                <p className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[1] || 'Étudiant'}</p>
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
                  <button onClick={() => setActiveTab("internships")} className="text-[#16A34A] text-sm hover:underline">Voir tous</button>
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
                      <button onClick={() => handleApply(internship.id)} className="px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-[#059669] transition text-sm">Postuler</button>
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
                <h2 className="text-2xl font-bold text-gray-800">Stages disponibles</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-xl focus:border-[#16A34A] focus:ring-2 focus:ring-green-200 outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#16A34A] text-white" : "bg-gray-100"}`}><FontAwesomeIcon icon={faChartPie} /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#16A34A] text-white" : "bg-gray-100"}`}><FontAwesomeIcon icon={faList} /></button>
                  </div>
                </div>
              </div>
              {filteredInternships.length === 0 && <div className="text-center py-12 text-gray-500">Aucun stage trouvé</div>}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FontAwesomeIcon icon={faFileUpload} className="text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune candidature</h3>
              <p className="text-gray-500 mb-4">Vous n'avez pas encore postulé à des stages</p>
              <button onClick={() => setActiveTab("internships")} className="px-6 py-2 bg-[#16A34A] text-white rounded-xl hover:bg-[#059669] transition">Découvrir les stages</button>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
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
                  <button onClick={() => navigate("/dashboard/CompleteProfile")} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">Compléter maintenant</button>
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

                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Informations personnelles</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><FontAwesomeIcon icon={faPhone} className="mr-2 text-[#16A34A]" /> Téléphone</label>
                        {isEditing ? (
                          <input value={editedUser.contact || ""} onChange={(e) => setEditedUser({ ...editedUser, contact: e.target.value })} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A]" />
                        ) : (
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{user?.contact || 'Non renseigné'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><FaMapMarkerAltIcon className="inline mr-2 text-[#16A34A]" size={14} /> Localisation</label>
                        {isEditing ? (
                          <input value={editedProfile.location || ""} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A]" placeholder="Ex: Douala, Cameroun" />
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

                  {(profile?.location || profile?.skills) && (
                    <>
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Préférences professionnelles</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de stage</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.internship_type === 'professionnel' ? 'Stage Professionnel' : profile?.internship_type === 'academique' ? 'Stage Académique' : 'Non renseigné'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de travail</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.preferred_work_type === 'remote' ? 'Remote' : profile?.preferred_work_type === 'onsite' ? 'Sur site' : profile?.preferred_work_type === 'hybrid' ? 'Hybride' : 'Non renseigné'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Durée préférée</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.preferred_duration_min && profile?.preferred_duration_max ? `${profile.preferred_duration_min} - ${profile.preferred_duration_max} mois` : 'Non renseigné'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Langues</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.languages || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Compétences</h4>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          {profile?.skills ? (
                            <div className="flex flex-wrap gap-2">{profile.skills.split(',').map((skill, i) => (<span key={i} className="px-2 py-1 bg-green-100 text-[#16A34A] rounded-lg text-sm">{skill.trim()}</span>))}</div>
                          ) : <p className="text-gray-500">Non renseigné</p>}
                        </div>
                      </div>

                      {profile?.bio && (
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Bio</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{profile.bio}</p>
                        </div>
                      )}

                      {(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url) && (
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Liens professionnels</h4>
                          <div className="space-y-3">
                            {profile?.linkedin_url && <div className="flex items-center gap-3"><FaLinkedin className="text-[#0077b5] text-xl" /><a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">{profile.linkedin_url}</a></div>}
                            {profile?.github_url && <div className="flex items-center gap-3"><FaGithub className="text-gray-800 text-xl" /><a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">{profile.github_url}</a></div>}
                            {profile?.portfolio_url && <div className="flex items-center gap-3"><FaGlobe className="text-[#16A34A] text-xl" /><a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">{profile.portfolio_url}</a></div>}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
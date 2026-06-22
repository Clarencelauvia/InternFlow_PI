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
  faMoneyBillWave, faBook, faFileAlt, faSync, faUserCog,
  faGears, faChevronDown, faChevronUp, faSpinner
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
import { Link } from "react-router-dom";
import { 
  FaLinkedin, FaTwitter, FaFacebook, FaInstagram
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
  id: number;
  organisation_name: string;
  domain: string;
  official_email: string;
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
  company_code?: string;
}

interface Internship {
  id: number;
  title: string;
  description: string;
  location: string;
  quartier?: string | null;
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
  created_at: Date;
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

// ============ Stats Card Component ============
const StatsCard = ({ icon, title, value, subtitle, subtitleColor, trend }: any) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 ${icon.bg} rounded-xl flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon.icon} className={`${icon.color} text-xl`} />
      </div>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
    {trend && (
      <p className={`text-xs ${trend.color} mt-2`}>
        <FontAwesomeIcon icon={trend.icon} className="mr-1" />
        {trend.text}
      </p>
    )}
    {subtitle && (
      <p className={`text-xs ${subtitleColor || 'text-blue-600'} mt-2`}>
        {subtitle}
      </p>
    )}
  </div>
);

// ============ InternshipCard Component ============
const InternshipCard = ({ internship, onViewApplications, onViewDetails }: any) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-bold text-gray-800">{internship.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
          <span>{internship.quartier ? `${internship.quartier}, ${internship.location}` : internship.location}</span>
          <FontAwesomeIcon icon={faClock} className="text-blue-500 ml-2" />
          <span>{internship.duration}</span>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
        internship.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {internship.status === 'open' ? 'Actif' : 'Fermé'}
      </span>
    </div>
    
    <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t">
      <div className="text-center">
        <p className="text-xs text-gray-500">Type</p>
        <p className="text-sm font-medium">
          {internship.internship_type === 'professionnel' ? 'Pro' : 'Académique'}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Rémunération</p>
        <p className="text-sm font-medium">
          {internship.payment_type === 'paid' ? `${internship.salary?.toLocaleString()} FCFA` : 'Non payé'}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Places</p>
        <p className="text-sm font-medium">{internship.slots}</p>
      </div>
    </div>
    
    <div className="flex gap-2 pt-3 border-t">
      <button 
        onClick={() => onViewDetails(internship)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
      >
        <FontAwesomeIcon icon={faEye} /> Voir détails
      </button>
      <button 
        onClick={() => onViewApplications(internship.id)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm"
      >
        <FontAwesomeIcon icon={faUsers} />
        Candidatures ({internship.applications_count || 0})
      </button>
      <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </div>
  </div>
);

// ============ ApplicationCard Component ============
const ApplicationCard = ({ application, onUpdateStatus, onViewLetter }: any) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{application.student_name}</h3>
            <p className="text-xs text-gray-500">{application.student_email}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium">Stage:</span> {application.internship_title}
        </p>
      </div>
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
        application.status === 'accepted' ? 'bg-green-100 text-green-700' :
        application.status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {application.status === 'accepted' ? 'Acceptée' : 
         application.status === 'rejected' ? 'Refusée' : 'En attente'}
      </span>
    </div>
    
    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
      <FontAwesomeIcon icon={faCalendarAlt} />
      <span>Soumise le: {new Date(application.created_at).toLocaleDateString()}</span>
    </div>
    
    <div className="flex gap-2 pt-3 border-t">
      <button 
        onClick={() => onViewLetter(application.cover_letter)}
        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
      >
        <FontAwesomeIcon icon={faEye} className="mr-1" /> Lettre
      </button>
      {application.status === 'pending' && (
        <>
          <button 
            onClick={() => onUpdateStatus(application.id, 'accepted')}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button 
            onClick={() => onUpdateStatus(application.id, 'rejected')}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </>
      )}
    </div>
  </div>
);

// ============ Main Dashboard Component ============
export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<OrganizationProfile>>({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<number | null>(null);
  const [viewingInternship, setViewingInternship] = useState<Internship | null>(null);
const [showViewModal, setShowViewModal] = useState(false);
  
  const [newInternship, setNewInternship] = useState({
    title: "",
    description: "",
    location: "",
    quartier: "",
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

  // Stats calculations
  const stats = {
    totalInternships: internships.length,
    totalApplications: applications.length,
    profileCompletion: profileCompletionPercentage,
    pendingApplications: applications.filter(a => a.status === "pending").length,
    acceptedApplications: applications.filter(a => a.status === "accepted").length,
    rejectedApplications: applications.filter(a => a.status === "rejected").length,
    activeInternships: internships.filter(i => i.status === "open").length,
    acceptanceRate: applications.length > 0 
      ? Math.round((applications.filter(a => a.status === "accepted").length / applications.length) * 100)
      : 0
  };

  // Chart data
  const applicationTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Candidatures reçues',
      data: [5, 8, 12, 9, 15, stats.totalApplications],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const viewInternshipDetails = (internship: Internship) => {
  setViewingInternship(internship);
  setShowViewModal(true);
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

  // Fetch functions
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

  useEffect(() => {
    fetchUserData();
    fetchInternships();
    fetchApplications();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, se déconnecter",
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
      !newInternship.quartier || !newInternship.duration || !newInternship.start_date || 
      !newInternship.end_date || !newInternship.slots) {
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
        quartier: newInternship.quartier,
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
      // Reset form
      setNewInternship({
        title: "", description: "", location: "", quartier: "", duration: "",
        start_date: "", end_date: "", slots: "", internship_type: "",
        payment_type: "", salary: "", department: "", expires_at: "",
        requirements: "", benefits: ""
      });
      // Refresh data
      await Promise.all([
        fetchInternships(),
        fetchApplications()
      ]);
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

  const viewCoverLetter = (coverLetter: string) => {
    Swal.fire({
      title: "Lettre de motivation",
      text: coverLetter,
      icon: "info",
      confirmButtonColor: "#2563eb"
    });
  };

  const filteredApplications = applications.filter(app =>
    app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.internship_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInternships = internships.filter(internship =>
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (internship.quartier || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-gray-100 to-green-50">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-br from-green-900 to-green-600 text-white flex flex-col shadow-xl fixed h-full overflow-y-auto">
        <div className="p-6 text-center border-b border-green-400/30">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.logo_path ? (
              <img 
                src={`http://localhost:8000/storage/${profile.logo_path}`} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-xl" 
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {profile?.organisation_name?.charAt(0) || 'C'}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold tracking-wide">{profile?.organisation_name || 'InternFlow'}</h1>
          <p className="text-xs text-green-200 mt-1">Espace Recruteur</p>
          {profile?.company_code && (
            <p className="text-xs bg-white/20 rounded-lg px-2 py-1 mt-2">Code: {profile.company_code}</p>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faChartLine} className="w-5" />
            Tableau de bord
          </button>
          
          <button onClick={() => setActiveTab("internships")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "internships" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faBriefcase} className="w-5" />
            Mes stages
            {stats.activeInternships > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {stats.activeInternships}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "applications" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faFileUpload} className="w-5" />
            Candidatures
            {stats.pendingApplications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {stats.pendingApplications > 9 ? '9+' : stats.pendingApplications}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "profile" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faUserCog} className="w-5" />
            Mon profil
          </button>
          
          <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "settings" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faGears} className="w-5" />
            Paramètres
          </button>
        </nav>

        <div className="p-4 border-t border-green-400/30">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-red-500/80 hover:bg-red-600 px-4 py-3 rounded-lg transition font-medium">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="bg-linear-to-r from-green-700 to-green-500 h-2"></div>
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bonjour, <span className="text-green-600">{profile?.organisation_name?.split(' ')[0] || 'Recruteur'} !</span>
              </h1>
              <p className="text-gray-500 mt-1">Gérez vos offres de stage et trouvez les meilleurs talents</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.logo_path ? (
                  <img 
                    src={`http://localhost:8000/storage/${profile.logo_path}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-lg" />
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  icon={{ icon: faBriefcase, bg: 'bg-blue-100', color: 'text-blue-600' }}
                  title="Stages publiés"
                  value={stats.totalInternships}
                  subtitle={`${stats.activeInternships} actifs`}
                  subtitleColor="text-green-600"
                />
                <StatsCard 
                  icon={{ icon: faFileUpload, bg: 'bg-purple-100', color: 'text-purple-600' }}
                  title="Candidatures reçues"
                  value={stats.totalApplications}
                  subtitle={`${stats.pendingApplications} en attente`}
                  subtitleColor="text-yellow-600"
                />
                <StatsCard 
                  icon={{ icon: faCheckCircle, bg: 'bg-green-100', color: 'text-green-600' }}
                  title="Taux d'acceptation"
                  value={`${stats.acceptanceRate}%`}
                  trend={{ icon: faArrowTrendUp, color: 'text-green-600', text: '+12% ce mois' }}
                />
                <StatsCard 
                  icon={{ icon: faStar, bg: 'bg-orange-100', color: 'text-orange-600' }}
                  title="Complétion du profil"
                  value={`${stats.profileCompletion}%`}
                />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Évolution des candidatures</h3>
                    </div>
                  </div>
                  <div className="h-80">
                    <Line data={applicationTrendData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faChartPie} className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Statut des candidatures</h3>
                  </div>
                  <div className="h-80">
                    <Pie data={applicationStatusData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Recent Internships */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBriefcase} className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Stages récents</h3>
                  </div>
                  <button onClick={() => setActiveTab("internships")} className="text-green-600 text-sm hover:underline">
                    Voir tous <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  {internships.slice(0, 3).map((internship) => (
                    <div key={internship.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:shadow transition">
                      <div>
                        <p className="font-medium text-gray-800">{internship.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-blue-500" /> {internship.quartier ? `${internship.quartier}, ${internship.location}` : internship.location}</span>
                          <span><FontAwesomeIcon icon={faClock} className="mr-1 text-blue-500" /> {internship.duration}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        internship.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {internship.status === "open" ? "Actif" : "Fermé"}
                      </span>
                    </div>
                  ))}
                  {internships.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faBriefcase} className="text-4xl mb-2 text-gray-300" />
                      <p>Aucun stage publié pour le moment</p>
                      <button onClick={() => setShowPostModal(true)} className="mt-2 text-green-600 hover:underline">
                        Publier votre première offre
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileUpload} className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Dernières candidatures</h3>
                  </div>
                  <button onClick={() => setActiveTab("applications")} className="text-green-600 text-sm hover:underline">
                    Voir toutes <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{app.student_name}</p>
                        <p className="text-xs text-gray-500">{app.internship_title}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          app.status === "accepted" ? "bg-green-100 text-green-700" :
                          app.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {app.status === "accepted" ? "Acceptée" : app.status === "rejected" ? "Refusée" : "En attente"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faFileUpload} className="text-4xl mb-2 text-gray-300" />
                      <p>Aucune candidature reçue pour le moment</p>
                      <p className="text-sm">Les candidatures apparaîtront ici une fois que des étudiants postuleront</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === "internships" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mes offres de stage</h2>
                  <p className="text-gray-500 mt-1">Gérez vos publications et suivez les candidatures</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un stage..."
                      className="pl-10 pr-4 py-2 border rounded-xl focus:border-green-500
                       focus:ring-2 focus:ring-green-200 outline-none w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                        <Link
          to="/myinternships"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
        >
          <FontAwesomeIcon icon={faList} /> Voir tous mes stages
        </Link>
                  <button onClick={() => setShowPostModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                    <FontAwesomeIcon icon={faPlus} />
                    Publier une offre
                  </button>
                </div>
              </div>

              {filteredInternships.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faBriefcase} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun stage publié"}
                  </h3>
                  <p className="text-gray-500 mb-5">
                    {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par publier votre première offre de stage"}
                  </p>
                  {!searchTerm && (
                    <button onClick={() => setShowPostModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                      <FontAwesomeIcon icon={faPlus} />
                      Publier une offre
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInternships.map((internship) => (
  <InternshipCard 
    key={internship.id} 
    internship={internship}
    onViewApplications={(id: number) => {
      setSelectedInternship(id);
      setActiveTab("applications");
    }}
    onViewDetails={viewInternshipDetails}
  />
))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Candidatures reçues</h2>
                  <p className="text-gray-500 mt-1">Consultez et gérez les candidatures des étudiants</p>
                </div>
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    className="pl-10 pr-4 py-2 border rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Toutes</button>
                <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">En attente</button>
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Acceptées</button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Refusées</button>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faFileUpload} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "Aucune candidature trouvée" : "Aucune candidature reçue"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Essayez avec d'autres termes de recherche" : "Les candidatures apparaîtront ici une fois que des étudiants postuleront"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredApplications.map((application) => (
                    <ApplicationCard 
                      key={application.id}
                      application={application}
                      onUpdateStatus={updateApplicationStatus}
                      onViewLetter={viewCoverLetter}
                    />
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
                  <p className="text-gray-500 mt-1">Gérez les informations de votre entreprise</p>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                    <FontAwesomeIcon icon={faEdit} />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={updateProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                      <FontAwesomeIcon icon={faSave} />
                      Enregistrer
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition">
                      <FontAwesomeIcon icon={faTimes} />
                      Annuler
                    </button>
                  </div>
                )}
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
                  <button onClick={() => navigate("/adminDashboard/completeOrgProfile")} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
                    Compléter maintenant
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-600 to-green-500 flex items-center justify-center overflow-hidden">
                      {profile?.logo_path ? (
                        <img src={`http://localhost:8000/storage/${profile.logo_path}`} alt="Logo" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <FontAwesomeIcon icon={faBuilding} className="text-white text-4xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{profile?.organisation_name}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-green-600 mt-1">Code: {profile?.company_code}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Complétion du profil</span>
                      <span className="text-sm font-medium text-green-600">{profileCompletionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 rounded-full h-2 transition-all duration-500" style={{ width: `${profileCompletionPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-green-600" /> Secteur
                      </label>
                      {isEditing ? (
                        <select 
                          value={editedProfile.sector || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, sector: e.target.value})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        >
                          <option value="">Sélectionnez un secteur</option>
                          <option>Technologie / IT</option>
                          <option>Finance / Assurance</option>
                          <option>Marketing / Communication</option>
                          <option>Consulting / Services</option>
                          <option>Industrie / Manufacturing</option>
                          <option>Santé / Pharmaceutique</option>
                          <option>Éducation / Formation</option>
                          <option>Autre</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.sector || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" /> Taille
                      </label>
                      {isEditing ? (
                        <select 
                          value={editedProfile.company_size || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, company_size: e.target.value})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        >
                          <option value="">Sélectionnez la taille</option>
                          <option>1-10 employés (Startup)</option>
                          <option>11-50 employés (Petite entreprise)</option>
                          <option>51-200 employés (PME)</option>
                          <option>201-500 employés</option>
                          <option>501-1000 employés</option>
                          <option>1000+ employés</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.company_size || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" /> Localisation
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.location || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faGlobe} className="mr-2 text-green-600" /> Site web
                      </label>
                      {isEditing ? (
                        <input 
                          type="url" 
                          value={editedProfile.website || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
                          placeholder="https://..."
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline block bg-gray-50 p-3 rounded-xl">{profile.website}</a>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">Non renseigné</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-600" /> Téléphone
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.official_number || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-green-600" /> Email recrutement
                      </label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          value={editedProfile.recruitment_email || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, recruitment_email: e.target.value})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.recruitment_email || 'Non renseigné'}</p>
                      )}
                    </div>
                  </div>

                  {profile?.description && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
                      {isEditing ? (
                        <textarea 
                          value={editedProfile.description || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, description: e.target.value})}
                          rows={4}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{profile.description}</p>
                      )}
                    </div>
                  )}

                  {profile?.mission_statement && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Mission & Valeurs</h4>
                      {isEditing ? (
                        <textarea 
                          value={editedProfile.mission_statement || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, mission_statement: e.target.value})}
                          rows={3}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-xl">{profile.mission_statement}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FontAwesomeIcon icon={faGears} className="text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Paramètres</h3>
              <p className="text-gray-500">Cette section est en cours de développement.</p>
            </div>
          )}
        </div>
      </main>

      {/* Post Internship Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Publier une offre de stage</h2>
                <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-green-600" />
                  Titre du stage *
                </label>
                <input 
                  type="text" 
                  value={newInternship.title} 
                  onChange={(e) => setNewInternship({...newInternship, title: e.target.value})} 
                  placeholder="Ex: Développeur Full Stack"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-green-600" />
                  Description *
                </label>
                <textarea 
                  rows={5} 
                  value={newInternship.description} 
                  onChange={(e) => setNewInternship({...newInternship, description: e.target.value})} 
                  placeholder="Décrivez les missions, responsabilités et objectifs du stage..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Type & Payment */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-green-600" />
                    Type de stage *
                  </label>
                  <select 
                    value={newInternship.internship_type} 
                    onChange={(e) => setNewInternship({...newInternship, internship_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Sélectionnez le type</option>
                    <option value="professionnel">Stage Professionnel</option>
                    <option value="academique">Stage Académique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-600" />
                    Rémunération *
                  </label>
                  <select 
                    value={newInternship.payment_type} 
                    onChange={(e) => setNewInternship({...newInternship, payment_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="paid">Payé</option>
                    <option value="unpaid">Non payé</option>
                  </select>
                </div>
              </div>
              
              {/* Salary conditional */}
              {newInternship.payment_type === 'paid' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-600" />
                    Montant (FCFA) *
                  </label>
                  <input 
                    type="number" 
                    value={newInternship.salary} 
                    onChange={(e) => setNewInternship({...newInternship, salary: e.target.value})}
                    placeholder="Ex: 150000"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              
              {/* Location & Duration */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                    Ville *
                  </label>
                  <input 
                    type="text" 
                    value={newInternship.location} 
                    onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                    placeholder="Ex: Douala"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                    Quartier *
                  </label>
                  <input 
                    type="text" 
                    value={newInternship.quartier} 
                    onChange={(e) => setNewInternship({...newInternship, quartier: e.target.value})}
                    placeholder="Ex: Akwa, Bonapriso, Bastos..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-green-600" />
                    Durée *
                  </label>
                  <select 
                    value={newInternship.duration} 
                    onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                    <FontAwesomeIcon icon={faBook} className="mr-2 text-green-600" />
                    Département cible
                  </label>
                  <input 
                    type="text" 
                    value={newInternship.department} 
                    onChange={(e) => setNewInternship({...newInternship, department: e.target.value})}
                    placeholder="Ex: Informatique, Marketing..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
                    Nombre de places *
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newInternship.slots} 
                    onChange={(e) => setNewInternship({...newInternship, slots: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-600" />
                    Date de début *
                  </label>
                  <input 
                    type="date" 
                    value={newInternship.start_date} 
                    onChange={(e) => setNewInternship({...newInternship, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-600" />
                    Date de fin *
                  </label>
                  <input 
                    type="date" 
                    value={newInternship.end_date} 
                    onChange={(e) => setNewInternship({...newInternship, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              {/* Requirements */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600" />
                  Prérequis / Compétences requises
                </label>
                <textarea 
                  rows={3} 
                  value={newInternship.requirements} 
                  onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
                  placeholder="Listez les compétences, formations ou expériences requises..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              
              {/* Benefits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faStar} className="mr-2 text-green-600" />
                  Avantages
                </label>
                <textarea 
                  rows={2} 
                  value={newInternship.benefits} 
                  onChange={(e) => setNewInternship({...newInternship, benefits: e.target.value})}
                  placeholder="Ex: Tickets restaurant, transport, formation..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              <button 
                onClick={() => setShowPostModal(false)} 
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button 
                onClick={handlePostInternship} 
                className="px-6 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                Publier l'offre
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Internship Details Modal */}
{showViewModal && viewingInternship && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Détails du stage</h2>
        <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{viewingInternship.title}</h3>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
              <span>{profile?.organisation_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
              <span>{viewingInternship.location}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            viewingInternship.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {viewingInternship.status === 'open' ? 'Stage actif' : 'Stage fermé'}
          </span>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
          <div className="text-center">
            <FontAwesomeIcon icon={faClock} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Durée</p>
            <p className="font-semibold">{viewingInternship.duration}</p>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Période</p>
            <p className="font-semibold text-sm">
              {new Date(viewingInternship.start_date).toLocaleDateString()} - {new Date(viewingInternship.end_date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Type</p>
            <p className="font-semibold">
              {viewingInternship.internship_type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'}
            </p>
          </div>
          <div className="text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Rémunération</p>
            <p className="font-semibold">
              {viewingInternship.payment_type === 'paid' 
                ? `${viewingInternship.salary?.toLocaleString()} FCFA/mois` 
                : 'Stage non payé'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Description du poste</h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{viewingInternship.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {viewingInternship.requirements && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Prérequis & Compétences requises</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{viewingInternship.requirements}</p>
            </div>
          </div>
        )}

        {/* Benefits */}
        {viewingInternship.benefits && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Avantages</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{viewingInternship.benefits}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-4 bg-blue-50 rounded-xl p-4">
          <div>
            <p className="text-sm text-gray-600">📊 Nombre de places</p>
            <p className="font-semibold text-gray-800">{viewingInternship.slots} place(s) disponible(s)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">📅 Date de publication</p>
            <p className="font-semibold text-gray-800">{new Date(viewingInternship.created_at).toLocaleDateString()}</p>
          </div>
          {viewingInternship.department && (
            <div>
              <p className="text-sm text-gray-600">🎓 Département cible</p>
              <p className="font-semibold text-gray-800">{viewingInternship.department}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => {
              setShowViewModal(false);
              setActiveTab("applications");
            }}
            className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" /> Voir les candidatures
          </button>
          <button
            onClick={() => setShowViewModal(false)}
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
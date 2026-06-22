import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faSignOutAlt, faEdit, faChartLine, faBriefcase,
  faFileUpload, faCheckCircle, faClock, faArrowTrendUp,
  faStar, faSearch, faList, faChartPie, faChevronRight,
  faBuilding, faCalendarAlt, faSave, faTimes, faPhone,
  faEnvelope, faGlobe, faUsers, faPlus, faTrashAlt,
  faExclamationTriangle, faMapMarkerAlt, faEye, faGraduationCap,
  faUniversity, faBook, faIdCard, faFilter, faDownload,
  faMoneyBillWave, faUserGraduate, faChalkboardUser,
  faAward, faTrophy, faSpinner, faChevronDown, faChevronUp,
  faSchool, faChartColumn, faPercent, faUserPlus, faFileSignature,
  faPaperPlane
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
  Filler,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface User {
  id: number;
  profile_id: number;
  name: string;
  email: string;
  role: string;
  contact: string;
}

interface UniversityProfile {
  id: number;
  university_name: string;
  domain: string;
  official_email: string;
  location: string;
  postal_code: string;
  official_number: string;
  description?: string;
  logo_path?: string;
  website?: string;
  type?: string;
  established_year?: number;
  chancellor?: string;
  vice_chancellor?: string;
  accreditation?: string;
  students_count?: number;
  departments?: string[];
  contact_person_name?: string;
  contact_person_role?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  contact: string;
  student_id: string;
  department: string;
  course: string;
  year: string;
  status: string;
  created_at: string;
  applications_count?: number;
  internships_count?: number;
}

interface Internship {
  id: number;
  title: string;
  location: string;
  duration: string;
  status: string;
  internship_type: string;
  organization_name: string;
  slots: number;
  applications_count: number;
  created_at: string;
}

interface Application {
  id: number;
  student_name: string;
  student_id: string;
  student_email: string;
  internship_title: string;
  organization_name: string;
  status: string;
  created_at: string;
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

// ============ Student Card Component ============
const StudentCard = ({ student, onViewDetails }: any) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <FontAwesomeIcon icon={faUserGraduate} className="text-green-600 text-lg" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800">{student.name}</h3>
        <p className="text-xs text-gray-500">{student.email}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {student.student_id}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {student.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div>
        <p className="text-xs text-gray-500">Département</p>
        <p className="font-medium text-gray-700">{student.department || 'Non spécifié'}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Année</p>
        <p className="font-medium text-gray-700">{student.year || 'Non spécifiée'}</p>
      </div>
    </div>
    
    <div className="flex gap-2 pt-3 border-t">
      <button 
        onClick={() => onViewDetails(student)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
      >
        <FontAwesomeIcon icon={faEye} /> Voir détails
      </button>
      <button className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm">
        <FontAwesomeIcon icon={faChartLine} /> Suivi
      </button>
    </div>
  </div>
);

// ============ InternshipCard Component ============
const InternshipCard = ({ internship, onViewApplications }: any) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-bold text-gray-800">{internship.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />
          <span>{internship.organization_name}</span>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 ml-2" />
          <span>{internship.location}</span>
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
          {internship.internship_type === 'professionnel' ? 'Professionnel' : 'Académique'}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Durée</p>
        <p className="text-sm font-medium">{internship.duration}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Places</p>
        <p className="text-sm font-medium">{internship.slots}</p>
      </div>
    </div>
    
    <div className="flex gap-2">
      <button 
        onClick={() => onViewApplications(internship.id)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm"
      >
        <FontAwesomeIcon icon={faFileSignature} />
        Candidatures ({internship.applications_count || 0})
      </button>
    </div>
  </div>
);

// ============ Main University Dashboard Component ============
export default function UniversityDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UniversityProfile>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    contact: "",
    student_id: "",
    department: "",
    course: "",
    year: "",
    password: ""
  });
  const [departments] = useState([
    "Informatique", "Génie Civil", "Génie Mécanique", "Génie Électrique",
    "Marketing", "Finance", "Ressources Humaines", "Communication",
    "Médecine", "Pharmacie", "Droit", "Économie", "Lettres Modernes"
  ]);
  const [years] = useState(["L1", "L2", "L3", "M1", "M2", "Doctorat"]);

  // Stats calculations
  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalInternships: internships.length,
    totalApplications: applications.length,
    profileCompletion: 0,
    pendingApplications: applications.filter(a => a.status === "pending").length,
    acceptedApplications: applications.filter(a => a.status === "accepted").length,
    rejectedApplications: applications.filter(a => a.status === "rejected").length,
    activeStudents: students.filter(s => s.status === "active").length,
    placementRate: students.length > 0 
      ? Math.round((students.filter(s => (s.internships_count || 0) > 0).length / students.length) * 100)
      : 0
  }), [students, internships, applications]);

  const [applicationStats, setApplicationStats] = useState<{
    monthly_trend: number[];
    monthly_labels: string[];
    placement_labels: string[];
    placement_values: number[];
  } | null>(null);

  // Chart data
  const applicationTrendData = {
    labels: applicationStats?.monthly_labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Candidatures',
      data: applicationStats?.monthly_trend || [0, 0, 0, 0, 0, 0],
      borderColor: '#16A34A',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const placementByDepartmentData = {
    labels: applicationStats?.placement_labels?.length ? applicationStats.placement_labels : ["Aucun département"],
    datasets: [{
      label: 'Stages effectués',
      data: applicationStats?.placement_values?.length ? applicationStats.placement_values : [0],
      backgroundColor: '#16A34A',
      borderRadius: 8
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

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } }
  };

  // Fetch functions
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/university");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/university/students", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const flattened: Student[] = data.map((s: any) => ({
          id: s.user_id ?? s.user?.id,
          profile_id: s.id,
          name: s.user?.name || "Nom inconnu",
          email: s.user?.email || "",
          contact: s.user?.contact || "",
          student_id: s.student_id,
          department: s.department,
          course: s.course,
          year: s.year,
          status: s.user?.status || "active",
          created_at: s.created_at,
          applications_count: s.applications_count,
          internships_count: s.internships_count,
        }));
        setStudents(flattened);
      } else if (response.status === 401) {
        localStorage.clear();
        navigate("/login/university");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/university/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchInternships = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/university/internships", {
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
      const response = await fetch("http://localhost:8000/api/university/applications", {
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

  const fetchApplicationStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/university/applications/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setApplicationStats(await response.json());
    } catch (error) {
      console.error("Error fetching application stats:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchStudents();
    fetchInternships();
    fetchApplications();
    fetchApplicationStats();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Déconnexion",
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16A34A",
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
        navigate("/login/university");
      }
    });
  };

  const handleAddStudent = async () => {
    const token = localStorage.getItem("token");
    
    if (!newStudent.name || !newStudent.email || !newStudent.student_id || !newStudent.password) {
      Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/university/students", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newStudent)
      });
      
      if (response.ok) {
        Swal.fire("Succès", "Étudiant ajouté avec succès", "success");
        setShowAddStudentModal(false);
        setNewStudent({
          name: "", email: "", contact: "", student_id: "",
          department: "", course: "", year: "", password: ""
        });
        fetchStudents();
      } else {
        const data = await response.json();
        Swal.fire("Erreur", data.error || "Une erreur est survenue", "error");
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible d'ajouter l'étudiant", "error");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedStudent || messageBody.trim().length === 0) return;
    setSendingMessage(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: selectedStudent.id,
          subject: `Message de ${profile?.university_name || "votre université"}`,
          body: messageBody
        })
      });
      if (response.ok) {
        Swal.fire("Envoyé", "Votre message a été envoyé à l'étudiant.", "success");
        setShowMessageModal(false);
        setMessageBody("");
      } else {
        const data = await response.json();
        Swal.fire("Erreur", data.error || "Impossible d'envoyer le message", "error");
      }
    } catch (error) {
      Swal.fire("Erreur", "Impossible d'envoyer le message", "error");
    } finally {
      setSendingMessage(false);
    }
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/university/profile/complete", {
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

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
    setShowTimeline(false);    
    setMessageBody(""); 
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInternships = internships.filter(internship =>
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(app =>
    app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.internship_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <FontAwesomeIcon icon={faUniversity} className="text-white text-xl" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-wide">{profile?.university_name || 'InternFlow'}</h1>
          <p className="text-xs text-green-200 mt-1">Espace Université</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faChartLine} className="w-5" />
            Tableau de bord
          </button>
          
          <button onClick={() => setActiveTab("students")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "students" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faUserGraduate} className="w-5" />
            Étudiants
            {stats.totalStudents > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {stats.totalStudents}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab("internships")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "internships" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faBriefcase} className="w-5" />
            Stages
          </button>
          
          <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium relative ${activeTab === "applications" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faFileSignature} className="w-5" />
            Candidatures
            {stats.pendingApplications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full text-xs flex items-center justify-center">
                {stats.pendingApplications > 9 ? '9+' : stats.pendingApplications}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === "profile" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-white/10"}`}>
            <FontAwesomeIcon icon={faUniversity} className="w-5" />
            Mon université
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
                Bonjour, <span className="text-green-600">{profile?.university_name?.split(' ')[0] || 'Université'} !</span>
              </h1>
              <p className="text-gray-500 mt-1">Suivez les stages et placements de vos étudiants</p>
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
                  <FontAwesomeIcon icon={faUniversity} className="text-green-600 text-lg" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{profile?.university_name || 'Université'}</p>
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
                  icon={{ icon: faUserGraduate, bg: 'bg-blue-100', color: 'text-blue-600' }}
                  title="Étudiants inscrits"
                  value={stats.totalStudents}
                  subtitle={`${stats.activeStudents} actifs`}
                  subtitleColor="text-green-600"
                />
                <StatsCard 
                  icon={{ icon: faBriefcase, bg: 'bg-purple-100', color: 'text-purple-600' }}
                  title="Stages disponibles"
                  value={stats.totalInternships}
                />
                <StatsCard 
                  icon={{ icon: faFileSignature, bg: 'bg-green-100', color: 'text-green-600' }}
                  title="Candidatures"
                  value={stats.totalApplications}
                  subtitle={`${stats.pendingApplications} en attente`}
                  subtitleColor="text-yellow-600"
                />
                <StatsCard 
                  icon={{ icon: faTrophy, bg: 'bg-orange-100', color: 'text-orange-600' }}
                  title="Taux de placement"
                  value={`${stats.placementRate}%`}
                  trend={{ icon: faArrowTrendUp, color: 'text-green-600', text: '+8% ce semestre' }}
                />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faChartLine} className="text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Évolution des candidatures</h3>
                  </div>
                  <div className="h-80">
                    <Line data={applicationTrendData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faChartPie} className="text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Statut des candidatures</h3>
                  </div>
                  <div className="h-80">
                    <Pie data={applicationStatusData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Placement by Department */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faChartColumn} className="text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Stages par département</h3>
                </div>
                <div className="h-80">
                  <Bar data={placementByDepartmentData} options={barOptions} />
                </div>
              </div>

              {/* Recent Students */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserGraduate} className="text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Étudiants récents</h3>
                  </div>
                  <button onClick={() => setActiveTab("students")} className="text-green-600 text-sm hover:underline">
                    Voir tous <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  {students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:shadow transition">
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.student_id} • {student.department || 'Non spécifié'}</p>
                      </div>
                      <button 
                        onClick={() => viewStudentDetails(student)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        Voir profil
                      </button>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-4xl mb-2 text-gray-300" />
                      <p>Aucun étudiant inscrit pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Étudiants</h2>
                  <p className="text-gray-500 mt-1">Gérez les étudiants inscrits dans votre université</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant..."
                      className="pl-10 pr-4 py-2 border rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setShowAddStudentModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                    <FontAwesomeIcon icon={faUserPlus} />
                    Ajouter un étudiant
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun étudiant inscrit"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par ajouter des étudiants à votre université"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <StudentCard 
                      key={student.id} 
                      student={student}
                      onViewDetails={viewStudentDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === "internships" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Stages disponibles</h2>
                  <p className="text-gray-500 mt-1">Consultez les stages proposés aux étudiants</p>
                </div>
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un stage..."
                    className="pl-10 pr-4 py-2 border rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredInternships.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faBriefcase} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "Aucun stage trouvé" : "Aucun stage disponible"}
                  </h3>
                  <p className="text-gray-500">
                    Les stages publiés par les organisations apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredInternships.map((internship) => (
                    <InternshipCard 
                      key={internship.id} 
                      internship={internship}
                      onViewApplications={() => setActiveTab("applications")}
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
                  <h2 className="text-2xl font-bold text-gray-800">Candidatures</h2>
                  <p className="text-gray-500 mt-1">Suivez les candidatures de vos étudiants</p>
                </div>
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une candidature..."
                    className="pl-10 pr-4 py-2 border rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <FontAwesomeIcon icon={faFileSignature} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "Aucune candidature trouvée" : "Aucune candidature"}
                  </h3>
                  <p className="text-gray-500">
                    Les candidatures de vos étudiants apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FontAwesomeIcon icon={faUserGraduate} className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{application.student_name}</h3>
                              <p className="text-xs text-gray-500">{application.student_email} • {application.student_id}</p>
                            </div>
                          </div>
                          <div className="ml-12">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Stage:</span> {application.internship_title}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Organisation:</span> {application.organization_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                              Postulé le: {new Date(application.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {application.status === 'accepted' ? 'Acceptée' : 
                             application.status === 'rejected' ? 'Refusée' : 'En attente'}
                          </span>
                        </div>
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
                  <h2 className="text-2xl font-bold text-gray-800">Mon université</h2>
                  <p className="text-gray-500 mt-1">Gérez les informations de votre établissement</p>
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

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-600 to-green-500 flex items-center justify-center overflow-hidden">
                      {profile?.logo_path ? (
                        <img src={`http://localhost:8000/storage/${profile.logo_path}`} alt="Logo" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <FontAwesomeIcon icon={faUniversity} className="text-white text-4xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{profile?.university_name}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-green-600 mt-1">{profile?.type || 'Université'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                        Localisation
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedProfile.location || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.location || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faGlobe} className="mr-2 text-green-600" />
                        Site web
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
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-600" />
                        Téléphone
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.official_number || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-green-600" />
                        Email officiel
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.official_email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-600" />
                        Année de création
                      </label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editedProfile.established_year || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, established_year: parseInt(e.target.value)})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.established_year || 'Non renseigné'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-green-600" />
                        Recteur / Président
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedProfile.vice_chancellor || ""} 
                          onChange={(e) => setEditedProfile({...editedProfile, vice_chancellor: e.target.value})}
                          className="w-full border rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{profile?.vice_chancellor || 'Non renseigné'}</p>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ajouter un étudiant</h2>
                <p className="text-sm text-gray-500 mt-1">Remplissez les informations ci-dessous</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input 
                    type="text" 
                    value={newStudent.name} 
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} 
                    placeholder="Ex: Jean Dupont"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input 
                    type="email" 
                    value={newStudent.email} 
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} 
                    placeholder="jean.dupont@univ.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro étudiant *
                  </label>
                  <input 
                    type="text" 
                    value={newStudent.student_id} 
                    onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})} 
                    placeholder="Ex: 2024-001"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input 
                    type="tel" 
                    value={newStudent.contact} 
                    onChange={(e) => setNewStudent({...newStudent, contact: e.target.value})} 
                    placeholder="Ex: 6XXXXXXXX"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Département
                  </label>
                  <select 
                    value={newStudent.department} 
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Sélectionnez un département</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filière / Cours
                  </label>
                  <input 
                    type="text" 
                    value={newStudent.course} 
                    onChange={(e) => setNewStudent({...newStudent, course: e.target.value})} 
                    placeholder="Ex: Licence Informatique"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Année d'étude
                  </label>
                  <select 
                    value={newStudent.year} 
                    onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Sélectionnez l'année</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input 
                    type="password" 
                    value={newStudent.password} 
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} 
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddStudentModal(false)} 
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddStudent} 
                className="px-6 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                Ajouter l'étudiant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Profil étudiant</h2>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-green-600 text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-gray-500">{selectedStudent.email}</p>
                  <p className="text-sm text-green-600">{selectedStudent.student_id}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-gray-500">Département</p>
                  <p className="font-medium text-gray-800">{selectedStudent.department || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Filière / Cours</p>
                  <p className="font-medium text-gray-800">{selectedStudent.course || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Année d'étude</p>
                  <p className="font-medium text-gray-800">{selectedStudent.year || 'Non spécifiée'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-800">{selectedStudent.contact || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <p className={`font-medium ${selectedStudent.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedStudent.status === 'active' ? 'Actif' : 'Inactif'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date d'inscription</p>
                  <p className="font-medium text-gray-800">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.applications_count || 0}</p>
                  <p className="text-xs text-gray-600">Candidatures</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.internships_count || 0}</p>
                  <p className="text-xs text-gray-600">Stages effectués</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                  {showTimeline ? "Masquer le suivi" : "Suivi des stages"}
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Contacter
                </button>
              </div>

              {showTimeline && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Historique des candidatures</h4>
                  {applications.filter(a => a.student_email === selectedStudent.email).length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune candidature pour cet étudiant pour le moment.</p>
                  ) : (
                    <div className="space-y-3">
                      {applications
                        .filter(a => a.student_email === selectedStudent.email)
                        .map(app => (
                          <div key={app.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{app.internship_title}</p>
                              <p className="text-xs text-gray-500">{app.organization_name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                                {new Date(app.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                              app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {app.status === 'accepted' ? 'Acceptée' : app.status === 'rejected' ? 'Refusée' : 'En attente'}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Message à {selectedStudent.name}</h3>
              <button onClick={() => { setShowMessageModal(false); setMessageBody(""); }} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={5}
              placeholder="Écrivez votre message..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none mb-4"
            />
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || messageBody.trim().length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {sendingMessage
                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                : <><FontAwesomeIcon icon={faPaperPlane} /> Envoyer</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
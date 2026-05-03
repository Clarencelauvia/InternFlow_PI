import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  FaBuilding, FaMapMarkerAlt, FaGlobe, FaUsers, FaCalendarAlt,
  FaUser, FaEnvelope, FaPhone, FaBriefcase, FaCheckCircle, 
  FaArrowRight, FaArrowLeft, FaCamera, FaSpinner, FaSave,
  FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube,
  FaFileAlt, FaChartLine, FaBullhorn, FaHandshake
} from "react-icons/fa";

export default function CompleteOrgProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    sector: "",
    company_size: "",
    founded_year: "",
    website: "",
    mission_statement: "",
    recruitment_email: "",
    contact_person_name: "",
    contact_person_role: "",
    description: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
  });

  const sectors = [
    "Technologie / IT",
    "Finance / Assurance",
    "Santé / Pharmaceutique",
    "Éducation / Formation",
    "Marketing / Communication",
    "Commerce / Distribution",
    "Industrie / Manufacturing",
    "Consulting / Services",
    "Immobilier / Construction",
    "Transport / Logistique",
    "Énergie / Environnement",
    "Agriculture / Agroalimentaire",
    "Médias / Divertissement",
    "Autre"
  ];

  const companySizes = [
    "1-10 employés (Startup)",
    "11-50 employés (Petite entreprise)",
    "51-200 employés (PME)",
    "201-500 employés",
    "501-1000 employés",
    "1001-5000 employés",
    "5000+ employés (Grande entreprise)"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchProfile = async () => {
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
          const orgProfile = data.organization_profile;
          
          if (orgProfile) {
            setFormData({
              sector: orgProfile.sector || "",
              company_size: orgProfile.company_size || "",
              founded_year: orgProfile.founded_year?.toString() || "",
              website: orgProfile.website || "",
              mission_statement: orgProfile.mission_statement || "",
              recruitment_email: orgProfile.recruitment_email || "",
              contact_person_name: orgProfile.contact_person_name || "",
              contact_person_role: orgProfile.contact_person_role || "",
              description: orgProfile.description || "",
              linkedin: orgProfile.social_links?.linkedin || "",
              twitter: orgProfile.social_links?.twitter || "",
              facebook: orgProfile.social_links?.facebook || "",
              instagram: orgProfile.social_links?.instagram || "",
            });
          }
          
          if (orgProfile?.logo_path) {
            setLogoPreview(`http://localhost:8000/storage/${orgProfile.logo_path}`);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: "error",
          title: "Format invalide",
          text: "Veuillez sélectionner une image (JPG, PNG, GIF)"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Fichier trop volumineux",
          text: "La taille maximale est de 5MB"
        });
        return;
      }
      
      setLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const uploadLogo = async (orgId: number): Promise<string | null> => {
    if (!logo) return null;
    
    const uploadData = new FormData();
    uploadData.append('logo', logo);
    uploadData.append('organization_id', orgId.toString());
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/upload/organization-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });
      
      const data = await response.json();
      if (response.ok) {
        return data.path;
      }
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    }
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const response = await fetch('http://localhost:8000/api/organization/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sector: formData.sector,
          company_size: formData.company_size,
          founded_year: formData.founded_year,
          website: formData.website,
          mission_statement: formData.mission_statement,
          recruitment_email: formData.recruitment_email,
          contact_person_name: formData.contact_person_name,
          contact_person_role: formData.contact_person_role,
          description: formData.description,
          social_links: {
            linkedin: formData.linkedin,
            twitter: formData.twitter,
            facebook: formData.facebook,
            instagram: formData.instagram,
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (logo && user?.id) {
          await uploadLogo(user.id);
        }
        
        Swal.fire({
          icon: "success",
          title: "Profil complété !",
          text: "Votre profil a été mis à jour avec succès",
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate("/admindashboard/organisationDashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: data.error || "Une erreur est survenue"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur réseau",
        text: "Impossible de contacter le serveur"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FDF4] to-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="font-bold text-2xl text-[#16A34A] hover:scale-105 transition-transform">
              Intern<span className="text-[#059669]">flow</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-3xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-[#16A34A]/10 rounded-full mb-4">
              <span className="text-[#16A34A] font-semibold text-sm">Compléter votre profil</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#16A34A] mb-2">
              Finalisez votre inscription
            </h1>
            <p className="text-gray-600">
              Ces informations aideront les étudiants à mieux connaître votre entreprise
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 && "Présentation générale"}
                  {step === 2 && "Informations détaillées"}
                  {step === 3 && "Contact & Social"}
                </span>
              </div>
              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
              </div>
            </div>

            <div className="p-8">
              
              {/* Step 1: General Presentation */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <FaBuilding className="inline mr-2" />
                      Ces informations permettent aux étudiants de découvrir votre entreprise
                    </p>
                  </div>
                  
                  {/* Logo Upload */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div 
                        className="w-32 h-32 rounded-full bg-gray-100 border-4 border-[#16A34A] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <FaBuilding size={48} className="text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#16A34A] text-white p-2 rounded-full shadow-lg hover:bg-[#059669] transition"
                      >
                        <FaCamera size={14} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 -mt-2 mb-4">
                    Logo de l'entreprise (optionnel)
                  </p>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBriefcase className="inline mr-2 text-[#16A34A]" size={14} />
                        Secteur d'activité
                      </label>
                      <select 
                        name="sector" 
                        value={formData.sector} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez votre secteur</option>
                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUsers className="inline mr-2 text-[#16A34A]" size={14} />
                        Taille de l'entreprise
                      </label>
                      <select 
                        name="company_size" 
                        value={formData.company_size} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez la taille</option>
                        {companySizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2 text-[#16A34A]" size={14} />
                        Année de création
                      </label>
                      <select 
                        name="founded_year" 
                        value={formData.founded_year} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez l'année</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaGlobe className="inline mr-2 text-[#16A34A]" size={14} />
                        Site web
                      </label>
                      <input 
                        type="url" 
                        name="website" 
                        placeholder="https://www.votreentreprise.com" 
                        value={formData.website} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaFileAlt className="inline mr-2 text-[#16A34A]" size={14} />
                        Description de l'entreprise
                      </label>
                      <textarea 
                        name="description" 
                        rows={4}
                        placeholder="Présentez votre entreprise, ses valeurs, ses activités principales..." 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Detailed Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <p className="text-sm text-purple-800">
                      <FaBullhorn className="inline mr-2" />
                      Ces informations aident à mieux comprendre votre culture d'entreprise
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaHandshake className="inline mr-2 text-[#16A34A]" size={14} />
                        Mission & Valeurs
                      </label>
                      <textarea 
                        name="mission_statement" 
                        rows={4}
                        placeholder="Quelle est la mission de votre entreprise ? Quelles sont ses valeurs ?" 
                        value={formData.mission_statement} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaEnvelope className="inline mr-2 text-[#16A34A]" size={14} />
                        Email de recrutement
                      </label>
                      <input 
                        type="email" 
                        name="recruitment_email" 
                        placeholder="recrutement@votreentreprise.com" 
                        value={formData.recruitment_email} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                      <p className="text-xs text-gray-400 mt-1">Les candidatures seront envoyées à cette adresse</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUser className="inline mr-2 text-[#16A34A]" size={14} />
                        Personne de contact
                      </label>
                      <input 
                        type="text" 
                        name="contact_person_name" 
                        placeholder="Nom du responsable recrutement" 
                        value={formData.contact_person_name} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBriefcase className="inline mr-2 text-[#16A34A]" size={14} />
                        Fonction du contact
                      </label>
                      <input 
                        type="text" 
                        name="contact_person_role" 
                        placeholder="Ex: Responsable RH, Directeur des stages" 
                        value={formData.contact_person_role} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Social */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-sm text-green-800">
                      <FaChartLine className="inline mr-2" />
                      Connectez vos réseaux sociaux pour plus de visibilité
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaLinkedin className="inline mr-2 text-[#0077b5]" size={14} />
                        LinkedIn
                      </label>
                      <input 
                        type="url" 
                        name="linkedin" 
                        placeholder="https://linkedin.com/company/votre-entreprise" 
                        value={formData.linkedin} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaTwitter className="inline mr-2 text-[#1DA1F2]" size={14} />
                        Twitter / X
                      </label>
                      <input 
                        type="url" 
                        name="twitter" 
                        placeholder="https://twitter.com/votre-entreprise" 
                        value={formData.twitter} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaFacebook className="inline mr-2 text-[#1877f2]" size={14} />
                        Facebook
                      </label>
                      <input 
                        type="url" 
                        name="facebook" 
                        placeholder="https://facebook.com/votre-entreprise" 
                        value={formData.facebook} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaInstagram className="inline mr-2 text-[#E4405F]" size={14} />
                        Instagram
                      </label>
                      <input 
                        type="url" 
                        name="instagram" 
                        placeholder="https://instagram.com/votre-entreprise" 
                        value={formData.instagram} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    <FaArrowLeft size={16} />
                    Précédent
                  </button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Étape suivante
                    <FaArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" size={16} /> : <FaSave size={16} />}
                    {loading ? "Enregistrement..." : "Terminer"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaUniversity, 
  FaGraduationCap, FaBook, FaCalendarAlt, FaIdCard, 
  FaUsers, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaUserGraduate, FaCamera, FaSpinner, FaMapMarkerAlt,
  FaBriefcase, FaLaptopCode, FaLanguage, FaLinkedin,
  FaGithub, FaGlobe, FaSave, FaClock
} from "react-icons/fa";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    location: "",
    bio: "",
    preferredWorkType: "",
    internshipType: "",
    preferredDurationMin: "",
    preferredDurationMax: "",
    skills: "",
    languages: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  const workTypes = [
    { value: "remote", label: "Remote (Télétravail)" },
    { value: "onsite", label: "Sur site" },
    { value: "hybrid", label: "Hybride" }
  ];

  const internshipTypes = [
    { value: "professionnel", label: "Stage Professionnel" },
    { value: "academique", label: "Stage Académique" }
  ];

  const durationOptions = [
    { value: "2", label: "2 mois" },
    { value: "3", label: "3 mois" },
    { value: "4", label: "4 mois" },
    { value: "5", label: "5 mois" },
    { value: "6", label: "6 mois" },
    { value: "9", label: "9 mois" },
    { value: "12", label: "12 mois" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setProfilePicture(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const uploadProfilePicture = async (studentId: number): Promise<string | null> => {
    if (!profilePicture) return null;
    
    const uploadData = new FormData();
    uploadData.append('profile_picture', profilePicture);
    uploadData.append('student_id', studentId.toString());
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/upload/profile-picture', {
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
    
    if (step === 1) {
      if (!formData.location) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez entrer votre localisation"
        });
        return;
      }
      setStep(2);
    }
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;
      
      const response = await fetch('http://localhost:8000/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: formData.location,
          bio: formData.bio,
          preferred_work_type: formData.preferredWorkType,
          internship_type: formData.internshipType,
          preferred_duration_min: formData.preferredDurationMin,
          preferred_duration_max: formData.preferredDurationMax,
          skills: formData.skills,
          languages: formData.languages,
          linkedin_url: formData.linkedinUrl,
          github_url: formData.githubUrl,
          portfolio_url: formData.portfolioUrl,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (profilePicture && userId) {
          await uploadProfilePicture(userId);
        }
        
        Swal.fire({
          icon: "success",
          title: "Profil complété !",
          text: "Votre profil a été mis à jour avec succès",
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate("/dashboard/studDashboard");
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
              Ces informations aideront les recruteurs à mieux vous connaître
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 2</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 ? "Informations de base" : "Préférences & Compétences"}
                </span>
              </div>
              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '50%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className="p-8">
              
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <FaUserGraduate className="inline mr-2" />
                      Ces informations permettront aux entreprises de vous localiser
                    </p>
                  </div>
                  
                  {/* Profile Picture Upload */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div 
                        className="w-32 h-32 rounded-full bg-gray-100 border-4 border-[#16A34A] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {profilePicturePreview ? (
                          <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaUserGraduate size={48} className="text-gray-400" />
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
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 -mt-2 mb-4">
                    Photo de profil (optionnel)
                  </p>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-[#16A34A]" size={14} />
                        Localisation *
                      </label>
                      <input 
                        type="text" 
                        name="location" 
                        placeholder="Ex: Douala, Cameroun" 
                        value={formData.location} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUser className="inline mr-2 text-[#16A34A]" size={14} />
                        Bio / Présentation
                      </label>
                      <textarea 
                        name="bio" 
                        rows={4}
                        placeholder="Parlez-nous de vous, vos objectifs de carrière, vos passions..." 
                        value={formData.bio} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Preferences & Skills */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <p className="text-sm text-purple-800">
                      <FaBriefcase className="inline mr-2" />
                      Ces informations nous aident à vous trouver le stage idéal
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBriefcase className="inline mr-2 text-[#16A34A]" size={14} />
                        Type de stage préféré
                      </label>
                      <select 
                        name="internshipType" 
                        value={formData.internshipType} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez</option>
                        {internshipTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaLaptopCode className="inline mr-2 text-[#16A34A]" size={14} />
                        Mode de travail préféré
                      </label>
                      <select 
                        name="preferredWorkType" 
                        value={formData.preferredWorkType} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez</option>
                        {workTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaClock className="inline mr-2 text-[#16A34A]" size={14} />
                        Durée préférée (min - max)
                      </label>
                      <div className="flex gap-3">
                        <select 
                          name="preferredDurationMin" 
                          value={formData.preferredDurationMin} 
                          onChange={handleChange}
                          className="w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                        >
                          <option value="">Min</option>
                          {durationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <select 
                          name="preferredDurationMax" 
                          value={formData.preferredDurationMax} 
                          onChange={handleChange}
                          className="w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                        >
                          <option value="">Max</option>
                          {durationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaLanguage className="inline mr-2 text-[#16A34A]" size={14} />
                        Langues parlées
                      </label>
                      <input 
                        type="text" 
                        name="languages" 
                        placeholder="Ex: Français (natif), Anglais (courant)" 
                        value={formData.languages} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaGraduationCap className="inline mr-2 text-[#16A34A]" size={14} />
                        Compétences (séparées par des virgules)
                      </label>
                      <textarea 
                        name="skills" 
                        rows={3}
                        placeholder="Ex: React, Laravel, Python, Gestion de projet, Travail d'équipe, Communication..." 
                        value={formData.skills} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 font-medium mb-3">Liens professionnels</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FaLinkedin className="text-[#0077b5] text-xl" />
                            <input 
                              type="url" 
                              name="linkedinUrl" 
                              placeholder="https://linkedin.com/in/votre-profil" 
                              value={formData.linkedinUrl} 
                              onChange={handleChange} 
                              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <FaGithub className="text-gray-800 text-xl" />
                            <input 
                              type="url" 
                              name="githubUrl" 
                              placeholder="https://github.com/votre-username" 
                              value={formData.githubUrl} 
                              onChange={handleChange} 
                              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <FaGlobe className="text-[#16A34A] text-xl" />
                            <input 
                              type="url" 
                              name="portfolioUrl" 
                              placeholder="https://monportfolio.com" 
                              value={formData.portfolioUrl} 
                              onChange={handleChange} 
                              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    <FaArrowLeft size={16} />
                    Précédent
                  </button>
                )}
                
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200 ml-auto"
                  >
                    Étape suivante
                    <FaArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
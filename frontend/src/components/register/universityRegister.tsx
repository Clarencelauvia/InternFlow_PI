import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { 
  FaUniversity, FaGlobe, FaMapMarkerAlt, FaPhone, FaLock, 
  FaUser, FaEnvelope, FaBriefcase, FaCheckCircle, FaArrowRight, 
  FaArrowLeft, FaGraduationCap, FaBook, FaChalkboardTeacher,
  FaUsers, FaProjectDiagram, FaIdCard
} from "react-icons/fa";

export default function UniversityRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    universityName: "",
    domain: "",
    location: "",
    postalCode: "",
    officialNumber: "",
    password: "",
    confirmPassword: "",
    departments: [] as string[],
    specialties: [] as string[],
    adminName: "",
    adminEmail: "",
    adminContact: "",
    adminRole: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departmentOptions = [
    "Informatique & Technologies",
    "Mathématiques & Sciences",
    "Physique & Astronomie",
    "Biologie & Sciences de la Vie",
    "Économie & Gestion",
    "Droit & Sciences Politiques",
    "Lettres & Sciences Humaines",
    "Médecine & Santé",
    "Arts & Design",
    "Ingénierie & Technologies"
  ];
  
  const specialtyOptions = [
    "Intelligence Artificielle",
    "Data Science & Big Data",
    "Cybersécurité",
    "Génie Logiciel",
    "Robotique",
    "Biotechnologies",
    "Marketing Digital",
    "Finance Quantitative",
    "Droit des Affaires",
    "Économie Numérique"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSelect = (value: string, listKey: "departments" | "specialties") => {
    const list = formData[listKey];
    setFormData({
      ...formData,
      [listKey]: list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    });
  };

  const handleNext = () => {
    // Validation pour chaque étape
    if (step === 1) {
      if (!formData.universityName || !formData.domain || !formData.location || 
          !formData.postalCode || !formData.officialNumber || !formData.password) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Les mots de passe ne correspondent pas"
        });
        return;
      }
      if (!formData.domain.includes(".")) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez entrer un domaine valide (ex: univ-paris.fr)"
        });
        return;
      }
    }
    if (step === 2) {
      if (formData.departments.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez sélectionner au moins un département"
        });
        return;
      }
    }
    if (step === 3) {
      if (!formData.adminName || !formData.adminEmail || !formData.adminContact || !formData.adminRole) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez remplir tous les champs"
        });
        return;
      }
    }
    setStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  };
  
  const handlePrev = () => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    Swal.fire({
      icon: "success",
      title: "Inscription réussie",
      text: "Votre demande a été envoyée. Un email de confirmation vous parviendra sous 48h."
    });
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
            
            <div className="hidden md:flex gap-8 items-center">
              <Link to="/" className="hover:text-[#059669] transition font-medium">Accueil</Link>
              <Link to="/internships" className="hover:text-[#059669] transition font-medium">Stages</Link>
              <Link to="/companies" className="hover:text-[#059669] transition font-medium">Entreprises</Link>
              <Link to="/login" className="hover:text-[#059669] transition font-medium">Connexion</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md hover:shadow-lg">
                Inscription
              </Link>
              <Link to="/post-internship" className="px-5 py-2 rounded-full border-2 border-[#16A34A] text-[#16A34A] font-semibold hover:bg-[#16A34A] hover:text-white transition">
                Publier un stage
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-[#16A34A]/10 rounded-full mb-4">
              <span className="text-[#16A34A] font-semibold text-sm">Institution académique</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#16A34A] mb-2">
              Rejoignez le réseau universitaire
            </h1>
            <p className="text-gray-600">
              Connectez vos étudiants aux meilleures opportunités de stage
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 && "Informations institutionnelles"}
                  {step === 2 && "Offre académique"}
                  {step === 3 && "Administrateur"}
                </span>
              </div>
              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
              </div>
            </div>

            <div className="p-8">
              
              {/* Step 1: University Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-indigo-800">
                      <FaUniversity className="inline mr-2" />
                      Ces informations permettront de valider votre statut d'institution académique
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUniversity className="inline mr-2 text-[#16A34A]" size={14} />
                        Nom de l'université / Institution *
                      </label>
                      <input 
                        type="text" 
                        name="universityName" 
                        placeholder="Ex: ESBAFIM" 
                        value={formData.universityName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaGlobe className="inline mr-2 text-[#16A34A]" size={14} />
                        Domaine officiel *
                      </label>
                      <input 
                        type="text" 
                        name="domain" 
                        placeholder="Ex: esbafim-universite.cm" 
                        value={formData.domain} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2 text-[#16A34A]" size={14} />
                        Localisation *
                      </label>
                      <input 
                        type="text" 
                        name="location" 
                        placeholder="Ex: Yaoundé, Cameroun" 
                        value={formData.location} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Code postal *
                      </label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        placeholder="Ex: 75590" 
                        value={formData.postalCode} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaPhone className="inline mr-2 text-[#16A34A]" size={14} />
                        Numéro officiel *
                      </label>
                      <input 
                        type="tel" 
                        name="officialNumber" 
                        placeholder="Ex: +222 655 875" 
                        value={formData.officialNumber} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaLock className="inline mr-2 text-[#16A34A]" size={14} />
                        Mot de passe *
                      </label>
                          <div className="relative">
               <input 
               type={showPassword ? "text" : "password"} 
               name="password" 
               value={formData.password} 
               onChange={handleChange}
               className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
             />

            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
           className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
           <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
         </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaLock className="inline mr-2 text-[#16A34A]" size={14} />
                        Confirmer le mot de passe *
                      </label>
                   <div className="relative">
                        <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword" 
                        placeholder="Confirmez votre mot de passe" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                        <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
           className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
           <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </button>
                    </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Departments & Specialties */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-purple-800">
                      <FaGraduationCap className="inline mr-2" />
                      Sélectionnez les formations proposées par votre établissement
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaBook className="inline mr-2 text-[#16A34A]" size={14} />
                      Départements / Facultés * (sélectionnez au moins un)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                      {departmentOptions.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleSelect(d, "departments")}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.departments.includes(d) 
                              ? 'bg-[#16A34A] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.departments.length} département(s) sélectionné(s)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaProjectDiagram className="inline mr-2 text-[#16A34A]" size={14} />
                      Spécialités & Programmes phares
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                      {specialtyOptions.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSelect(s, "specialties")}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.specialties.includes(s) 
                              ? 'bg-[#16A34A] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.specialties.length} spécialité(s) sélectionnée(s)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Admin Info */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-amber-800">
                      <FaChalkboardTeacher className="inline mr-2" />
                      Informations de l'administrateur principal du compte institutionnel
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUser className="inline mr-2 text-[#16A34A]" size={14} />
                        Nom complet *
                      </label>
                      <input 
                        type="text" 
                        name="adminName" 
                        placeholder="Ex: Dr. John Okafor" 
                        value={formData.adminName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaEnvelope className="inline mr-2 text-[#16A34A]" size={14} />
                        Email professionnel *
                      </label>
                      <input 
                        type="email" 
                        name="adminEmail" 
                        placeholder="Ex: johnokafor@university.com" 
                        value={formData.adminEmail} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaPhone className="inline mr-2 text-[#16A34A]" size={14} />
                        Téléphone *
                      </label>
                      <input 
                        type="tel" 
                        name="adminContact" 
                        placeholder="Ex: +237 690 36 29 37" 
                        value={formData.adminContact} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2 text-[#16A34A]" size={14} />
                        Fonction / Rôle *
                      </label>
                      <input 
                        type="text" 
                        name="adminRole" 
                        placeholder="Ex: Directeur des Relations Entreprises, Responsable des Stages, etc." 
                        value={formData.adminRole} 
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
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    <FaCheckCircle size={16} />
                    Valider l'inscription
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Vous avez déjà un compte institutionnel ?{" "}
                  <Link to="/login" className="text-[#16A34A] font-semibold hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaUniversity, 
  FaGraduationCap, FaBook, FaCalendarAlt, FaIdCard, 
  FaUsers, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaBars, FaTimes, FaUserGraduate, FaChalkboardTeacher
} from "react-icons/fa";

export default function StudentRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    university: "",
    department: "",
    course: "",
    year: "",
    studentID: "",
    guardianName: "",
    guardianContact: "",
  });

  // toggle password visibility states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departments = [
    "Informatique & Technologies",
    "Mathématiques & Statistiques", 
    "Physique & Sciences",
    "Biologie & Sciences de la Vie",
    "Économie & Gestion",
    "Marketing & Communication",
    "Droit & Sciences Politiques",
    "Lettres & Sciences Humaines"
  ];
  
  const courses = [
    "Développement Web Full Stack",
    "Intelligence Artificielle",
    "Data Science & Big Data",
    "Cybersécurité",
    "Gestion de Projet",
    "Marketing Digital",
    "Finance d'Entreprise",
    "Biotechnologies"
  ];
  
  const years = [
    "1ère année (Licence 1)",
    "2ème année (Licence 2)",
    "3ème année (Licence 3)",
    "1ère année (Master 1)",
    "2ème année (Master 2)",
    "Doctorat"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Validation simple pour chaque étape
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.contact || !formData.password) {
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
      if (!formData.email.includes("@")) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez entrer un email valide"
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.university || !formData.department || !formData.course || !formData.year || !formData.studentID) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }
    }
    if (step === 3) {
      if (!formData.guardianName || !formData.guardianContact) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez remplir tous les champs obligatoires"
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
      text: "Votre compte a été créé avec succès ! Un email de confirmation vous a été envoyé."
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
              <span className="text-[#16A34A] font-semibold text-sm">Inscription étudiant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#16A34A] mb-2">
              Rejoignez la communauté étudiante
            </h1>
            <p className="text-gray-600">
              Créez votre compte et accédez aux meilleures opportunités de stage
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 && "Informations personnelles"}
                  {step === 2 && "Parcours académique"}
                  {step === 3 && "Tuteur / Référent"}
                </span>
              </div>
              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
                <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#16A34A]' : 'bg-gray-200'}`} style={{ width: '33.33%' }}></div>
              </div>
            </div>

            <div className="p-8">
              
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-blue-800">
                      <FaUserGraduate className="inline mr-2" />
                      Vos informations personnelles seront utilisées pour votre profil étudiant
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
                        name="fullName" 
                        placeholder="Ex: Malla Stephanie" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaEnvelope className="inline mr-2 text-[#16A34A]" size={14} />
                        Email *
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="Ex: mallastephanie@gmail.com" 
                        value={formData.email} 
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
                        name="contact" 
                        placeholder="Ex: +237 6 12 34 56 78" 
                        value={formData.contact} 
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

              {/* Step 2: University Info */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-purple-800">
                      <FaUniversity className="inline mr-2" />
                      Ces informations nous aident à vous proposer des stages adaptés à votre cursus
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUniversity className="inline mr-2 text-[#16A34A]" size={14} />
                        Université / École *
                      </label>
                      <input 
                        type="text" 
                        name="university" 
                        placeholder="Ex: ESBAFIM" 
                        value={formData.university} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaGraduationCap className="inline mr-2 text-[#16A34A]" size={14} />
                        Département / Filière *
                      </label>
                      <select 
                        name="department" 
                        value={formData.department} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez votre département</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBook className="inline mr-2 text-[#16A34A]" size={14} />
                        Cours / Spécialité *
                      </label>
                      <select 
                        name="course" 
                        value={formData.course} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez votre cours</option>
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2 text-[#16A34A]" size={14} />
                        Année d'étude *
                      </label>
                      <select 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition bg-white"
                      >
                        <option value="">Sélectionnez votre année</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2 text-[#16A34A]" size={14} />
                        Numéro étudiant *
                      </label>
                      <input 
                        type="text" 
                        name="studentID" 
                        placeholder="Ex: 202500123" 
                        value={formData.studentID} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Guardian Info */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-2">
                    <p className="text-sm text-amber-800">
                      <FaUsers className="inline mr-2" />
                      En cas d'urgence, nous pourrons contacter votre tuteur légal
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUser className="inline mr-2 text-[#16A34A]" size={14} />
                        Nom du tuteur / parent *
                      </label>
                      <input 
                        type="text" 
                        name="guardianName" 
                        placeholder="Ex: Malla Roger" 
                        value={formData.guardianName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaPhone className="inline mr-2 text-[#16A34A]" size={14} />
                        Contact du tuteur *
                      </label>
                      <input 
                        type="tel" 
                        name="guardianContact" 
                        placeholder="Ex: +33 6 98 76 54 32" 
                        value={formData.guardianContact} 
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
                    Terminer l'inscription
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Vous avez déjà un compte ?{" "}
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
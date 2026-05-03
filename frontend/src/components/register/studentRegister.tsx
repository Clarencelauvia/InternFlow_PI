import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import countries from "../register/countries.json";
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaUniversity, 
  FaGraduationCap, FaBook, FaCalendarAlt, FaIdCard, 
  FaUsers, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaUserGraduate, FaCamera, FaSpinner,
  FaChevronDown
} from "react-icons/fa";

export default function StudentRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countries[0].dial_code);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearch, setCountrySearch] = useState("");

  
  
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

  const filteredCountries = countries.filter(country =>
  country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
  country.dial_code.includes(countrySearch)
);
  const getFullPhoneNumber = () => {
    return `${selectedCountryCode} ${phoneNumber.replace(/\s/g, "")}`;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Remove non-digits and spaces
  let value = e.target.value;
  
  // If user pastes a number with country code, extract it
  for (const country of countries) {
    if (value.startsWith(country.dial_code)) {
      setSelectedCountryCode(country.dial_code);
      value = value.substring(country.dial_code.length);
      break;
    }
  }
  
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '');
  
  // Format the number (example: XX XX XX XX XX)
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    setPhoneNumber(`${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`);
  } else if (cleaned.length <= 10) {
    // Format as XX XX XX XX for numbers with less digits
    const parts = cleaned.match(/.{1,3}/g);
    setPhoneNumber(parts ? parts.join(' ') : cleaned);
  } else {
    setPhoneNumber(cleaned);
  }
};
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: "error",
          title: "Format invalide",
          text: "Veuillez sélectionner une image (JPG, PNG, GIF)"
        });
        return;
      }
      
      // Validate file size (max 5MB)
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
    
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);
    formData.append('student_id', studentId.toString());
    
    try {
      const response = await fetch('http://localhost:8000/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log("Upload response:", data);
      if (response.ok) {
        return data.path;
      }
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowCountryDropdown(false);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("handleNext called for step:", step);
    
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
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
      const cleanPhone =  phoneNumber.replace(/\s/g, '');
      if (!cleanPhone || cleanPhone.length<6){
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez entrer un numero de telephone valide (au moins 6 chiffres)"
        }
        );
        return;
      }
      console.log("Moving from step 1 to 2");
      setStep(2);
      return;
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
      console.log("Moving from step 2 to 3");
      setStep(3);
      return;
    }
  };
  
  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };
  
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit called - Final submission"); 
    
    if (!formData.fullName || !formData.email || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir tous les champs personnels"
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
 
   const cleanPhone = phoneNumber.replace(/\s/g, '');
     if (!cleanPhone || cleanPhone.length < 6) {
  Swal.fire({
    icon: "error",
    title: "Erreur de validation",
    text: "Veuillez entrer un numéro de téléphone valide"
  });
  return;
}
    
    if (!formData.university || !formData.department || !formData.course || !formData.year || !formData.studentID) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir tous les champs académiques"
      });
      return;
    }
    
    if (!formData.guardianName || !formData.guardianContact) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir les informations du tuteur"
      });
      return;
    }
    const fullPhoneNumber = getFullPhoneNumber();

    
    setUploading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          contact: fullPhoneNumber,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          university: formData.university,
          department: formData.department,
          course: formData.course,
          year: formData.year,
          studentID: formData.studentID,
          guardianName: formData.guardianName,
          guardianContact: formData.guardianContact,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Upload profile picture if selected
        if (profilePicture && data.user?.id) {
          const picturePath = await uploadProfilePicture(data.user.id);
          if (picturePath) {
            console.log("Profile picture uploaded successfully");
          }
        }
        
        Swal.fire({
          icon: "success",
          title: "Inscription réussie",
          text: "Votre compte a été créé avec succès ! Vous allez être redirigé vers la page de connexion.",
          timer: 3000,
          showLoaderOnConfirm: true,
          showConfirmButton: true,
          willClose: () => {
            window.location.href = "/login/studentlogin";
          }
        });
      } else {
        const errorMessage = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : data.error || "Une erreur est survenue lors de l'inscription";
        
        Swal.fire({
          icon: "error",
          title: "Erreur d'inscription",
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur réseau",
        text: "Impossible de contacter le serveur. Veuillez vérifier votre connexion et réessayer."
      });
    } finally {
      setUploading(false);
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
                    Photo de profil (optionnel, max 5MB)
                  </p>
                  
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
  <div className="relative" ref={dropdownRef}>
    {/* Country Code Button */}
    <button
      type="button"
      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
      className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 border-r border-gray-300 bg-gray-50 rounded-l-xl hover:bg-gray-100 transition z-10"
    >
      <span className="font-medium text-sm">{selectedCountryCode}</span>
      <FaChevronDown size={10} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
    </button>
    
    {/* Phone Input */}
    <input 
      type="tel" 
      name="contact"
      placeholder="673 321 819" 
      value={phoneNumber} 
      onChange={handlePhoneChange}
      className="w-full border border-gray-300 rounded-xl pl-28 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
    />
    
    {/* Dropdown Menu with Search */}
    {showCountryDropdown && (
      <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
        {/* Search Input */}
        <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* Countries List - Filtered */}
        <div className="divide-y divide-gray-100">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  setSelectedCountryCode(country.dial_code);
                  setShowCountryDropdown(false);
                  setCountrySearch(""); // Reset search after selection
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-left"
              >
                <span className="font-medium text-sm bg-gray-100 px-2 py-0.5 rounded">{country.dial_code}</span>
                <span className="text-sm text-gray-700 flex-1">{country.name}</span>
                <span className="text-xs text-gray-400">{country.code}</span>
                {selectedCountryCode === country.dial_code && (
                  <FaCheckCircle className="text-[#16A34A]" size={14} />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Aucun pays trouvé
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  <p className="text-xs text-gray-500 mt-1">
    L'indicatif pays sera automatiquement ajouté devant votre numéro
  </p>
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
             <input 
            type="text" 
            name="department" 
            list="departments-list"
            placeholder="Ex: Informatique & Technologies" 
            value={formData.department} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
           />
                  <datalist id="departments-list">
                     {departments.map(dept => (
                   <option key={dept} value={dept} />
                 ))}
            </datalist>
              </div>
                    
                   <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    <FaBook className="inline mr-2 text-[#16A34A]" size={14} />
    Cours / Spécialité *
  </label>
  <input 
    type="text" 
    name="course" 
    list="courses-list"
    placeholder="Ex: Développement Web Full Stack" 
    value={formData.course} 
    onChange={handleChange} 
    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
  />
  <datalist id="courses-list">
    {courses.map(course => (
      <option key={course} value={course} />
    ))}
  </datalist>
</div>
                    
                 <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    <FaCalendarAlt className="inline mr-2 text-[#16A34A]" size={14} />
    Année d'étude *
  </label>
  <input 
    type="text" 
    name="year" 
    list="years-list"
    placeholder="Ex: 3ème année (Licence 3)" 
    value={formData.year} 
    onChange={handleChange} 
    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
  />
  <datalist id="years-list">
    {years.map(year => (
      <option key={year} value={year} />
    ))}
  </datalist>
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
                
                {step < 3 ? (
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
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? <FaSpinner className="animate-spin" size={16} /> : <FaCheckCircle size={16} />}
                    {uploading ? "Inscription en cours..." : "Terminer l'inscription"}
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
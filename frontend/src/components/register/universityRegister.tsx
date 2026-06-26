import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import countries from "./countries.json";
import { 
  FaUniversity, FaMapMarkerAlt, FaEnvelope, FaPhone, FaLock, 
  FaUser, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaGlobe, FaGraduationCap, FaCamera, FaSpinner, FaChevronDown,
  FaIdCard, FaBuilding
} from "react-icons/fa";

export default function UniversityRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countries[0].dial_code);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearch, setCountrySearch] = useState("");  
  
  const [formData, setFormData] = useState({
    universityName: "",
    domain: "",
    location: "",
    postalCode: "",
    officialNumber: "",
    password: "",
    confirmPassword: "",
    departments: [] as string[],
    adminName: "",
    adminEmail: "",
    adminContact: "",
    adminRole: "",
    institutionCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const departmentOptions = [
    "Informatique & Technologies",
    "Mathématiques & Statistiques", 
    "Physique & Sciences",
    "Biologie & Sciences de la Vie",
    "Économie & Gestion",
    "Marketing & Communication",
    "Droit & Sciences Politiques",
    "Lettres & Sciences Humaines",
    "Médecine & Santé",
    "Ingénierie & Technologies",
    "Architecture & Design",
    "Arts & Culture"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dial_code.includes(countrySearch)
  );

  const getFullPhoneNumber = () => {
    // Remove all spaces from the phone number and prepend the selected country code
    const cleanNumber = phoneNumber.replace(/\s/g, "");
    return `${selectedCountryCode} ${cleanNumber}`;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    for (const country of countries) {
      if (value.startsWith(country.dial_code)) {
        setSelectedCountryCode(country.dial_code);
        value = value.substring(country.dial_code.length);
        break;
      }
    }
    
    const cleaned = value.replace(/\D/g, '');
    
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      setPhoneNumber(`${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`);
    } else if (cleaned.length <= 10) {
      const parts = cleaned.match(/.{1,3}/g);
      setPhoneNumber(parts ? parts.join(' ') : cleaned);
    } else {
      setPhoneNumber(cleaned);
    }
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

  const uploadLogo = async (universityId: number): Promise<string | null> => {
    if (!logo) return null;
    
    const formData = new FormData();
    formData.append('logo', logo);
    formData.append('university_id', universityId.toString());
    
    try {
      const response = await fetch('http://localhost:8000/api/upload/university-logo', {
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

  // Fixed toggleSelect - only accepts "departments" since "projects" doesn't exist in formData
  const toggleSelect = (value: string, listKey: "departments") => {
    const list = formData[listKey];
    setFormData({
      ...formData,
      [listKey]: list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    });
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.universityName || !formData.domain || !formData.location || 
          !formData.postalCode || !formData.password || !formData.institutionCode) {
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
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone || cleanPhone.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Erreur de validation",
          text: "Veuillez entrer un numéro de téléphone valide (au moins 6 chiffres)"
        });
        return;
      }
      console.log("Moving from step 1 to 2");
      setStep(2);
      return;
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
      setStep(3);
      return;
    }
  };
  
  const handlePrev = () => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
     if (step !== 3) {
    return;
  }
    
    if (!formData.universityName || !formData.domain || !formData.location || 
        !formData.postalCode || !formData.password || !formData.institutionCode) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir tous les champs de l'université"
      });
      return;
    }
    
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez entrer un numéro de téléphone valide"
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
    
    if (formData.departments.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez sélectionner au moins un département"
      });
      return;
    }
    
    if (!formData.adminName || !formData.adminEmail || !formData.adminContact || !formData.adminRole) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir tous les champs de l'administrateur"
      });
      return;
    }
    
    const fullPhoneNumber = getFullPhoneNumber();
    setUploading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/register/university", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          universityName: formData.universityName,
          domain: formData.domain,
          location: formData.location,
          postalCode: formData.postalCode,
          officialNumber: fullPhoneNumber,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          departments: formData.departments,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminContact: formData.adminContact,
          adminRole: formData.adminRole,
          institutionCode: formData.institutionCode,
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {

        if (logo && data.user?.id) {
          const logoPath = await uploadLogo(data.user.id);
          if (logoPath) {
            console.log("Logo uploaded successfully");
          }
        }
        
        Swal.fire({
          icon: "success",
          title: "Inscription réussie",
          text: "Votre compte universitaire a été créé. Un code de vérification a été envoyé à votre email. Vous allez être redirigé pour le saisir.",
          timer: 3000,
          showConfirmButton: true,
          willClose: () => {
            window.location.href = "/verifyEmail?email=" + encodeURIComponent(formData.adminEmail) + "&role=university";
          }
        });
      } else {
        console.error("Registration failed:", data);
        let errorMessage = "une erreur est survenue";
        if(data.errors){
          errorMessage = Object.values(data.errors).flat().join('\n');
        }else if(data.details){
          errorMessage = data.details;
        } else if(data.error){
          errorMessage = data.error;
        }
        Swal.fire({
          icon: "error",
          title: "Erreur d'inscription",
          text: data.message || errorMessage
        });
      }
    } catch(error) {
      console.error("Network error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur de réseau",
        text: "Une erreur de réseau est survenue. Veuillez réessayer plus tard."
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
              <span className="text-[#16A34A] font-semibold text-sm">Inscription université</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#16A34A] mb-2">
              Rejoignez notre réseau universitaire
            </h1>
            <p className="text-gray-600">
              Créez votre compte et gérez les stages de vos étudiants
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 && "Informations université"}
                  {step === 2 && "Départements"}
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
                  {/* Logo Upload */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div 
                        className="w-32 h-32 rounded-xl bg-gray-100 border-4 border-[#16A34A] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <FaUniversity size={48} className="text-gray-400" />
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
                    Logo de l'université (optionnel, max 5MB)
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaUniversity className="inline mr-2 text-[#16A34A]" size={14} />
                        Nom de l'université *
                      </label>
                      <input 
                        type="text" 
                        name="universityName" 
                        placeholder="Ex: Université de Yaoundé I" 
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
                        placeholder="Ex: univ-yaounde.cm" 
                        value={formData.domain} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaIdCard className="inline mr-2 text-[#16A34A]" size={14} />
                        Code institution *
                      </label>
                      <input 
                        type="text" 
                        name="institutionCode" 
                        placeholder="Ex: UNIV-YDE-001" 
                        value={formData.institutionCode} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition uppercase"
                      />
                      <p className="text-xs text-gray-500 mt-1">Code unique pour identifier votre établissement</p>
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
                        placeholder="Ex: 00237" 
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
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="absolute left-0 top-0 h-full flex items-center gap-1 px-3 border-r border-gray-300 bg-gray-50 rounded-l-xl hover:bg-gray-100 transition z-10"
                        >
                          <span className="font-medium text-sm">{selectedCountryCode}</span>
                          <FaChevronDown size={10} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <input 
                          type="tel" 
                          name="contact"
                          placeholder="673 321 819" 
                          value={phoneNumber} 
                          onChange={handlePhoneChange}
                          className="w-full border border-gray-300 rounded-xl pl-28 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                        />
                        
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
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
                            
                            <div className="divide-y divide-gray-100">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountryCode(country.dial_code);
                                      setShowCountryDropdown(false);
                                      setCountrySearch("");
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

              {/* Step 2: Departments */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaGraduationCap className="inline mr-2 text-[#16A34A]" size={14} />
                      Départements / Facultés * (sélectionnez au moins un)
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                </div>
              )}

              {/* Step 3: Admin Info */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-indigo-800">
                      <FaUser className="inline mr-2" />
                      Informations de l'administrateur principal du compte universitaire
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
                        placeholder="Ex: Prof. Jean Dupont" 
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
                        placeholder="Ex: contact@universite.cm" 
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
                        placeholder="Ex: +237 6 12 34 56 78" 
                        value={formData.adminContact} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 
                        focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent 
                        transition"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBuilding className="inline mr-2 text-[#16A34A]" size={14} />
                        Fonction / Rôle *
                      </label>
                      <input 
                        type="text" 
                        name="adminRole" 
                        placeholder="Ex: Doyen, Chef de département, Responsable des stages" 
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
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Link to="/login/universitylogin" className="text-[#16A34A] font-semibold hover:underline">
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
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import countries from "./countries.json";
import { 
  FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaLock, 
  FaUser, FaBriefcase, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaGlobe, FaUsers, FaProjectDiagram, FaCamera, FaSpinner, FaChevronDown
} from "react-icons/fa";

export default function OrganisationRegistration() {
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
    organisationName: "",
    domain: "",
    location: "",
    postalCode: "",
    officialNumber: "",
    password: "",
    confirmPassword: "",
    departments: [] as string[],
    projects: [] as string[],
    adminName: "",
    adminEmail: "",
    adminContact: "",
    adminRole: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const departmentOptions = [
    "Recherche & Développement",
    "Marketing & Communication",
    "Finance & Comptabilité",
    "Ressources Humaines",
    "Opérations & Logistique",
    "Informatique & IT",
    "Ventes & Business Development"
  ];
  
  const projectOptions = [
    "Intelligence Artificielle",
    "Développement Web",
    "Applications Mobiles",
    "Analyse de Données",
    "Cybersécurité",
    "Cloud Computing",
    "Marketing Digital"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const formData = new FormData();
  formData.append('logo', logo);
  formData.append('organization_id', orgId.toString());
  
  try {
    const response = await fetch('http://localhost:8000/api/upload/organization-logo', {
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

  const toggleSelect = (value: string, listKey: "departments" | "projects") => {
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
      if (!formData.organisationName || !formData.domain || !formData.location || 
          !formData.postalCode || !formData.password) {
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
    if (step === 2 && formData.departments.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez sélectionner au moins un département"
      });
      return;
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
  
  const handleSubmit = async(e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.organisationName || !formData.domain || !formData.location || 
        !formData.postalCode || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Erreur de validation",
        text: "Veuillez remplir tous les champs de l'organisation"
      });
      return;
    }
    
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if(!cleanPhone || cleanPhone.length<8){
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
      const response = await fetch("http://localhost:8000/api/register/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organisationName: formData.organisationName,
          domain: formData.domain,
          location: formData.location,
          postalCode: formData.postalCode,
          officialNumber: fullPhoneNumber,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          departments: formData.departments,
          projects: formData.projects,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminContact: formData.adminContact,
          adminRole: formData.adminRole
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
          text: "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.",
          timer: 3000,
          showConfirmButton: true,
          willClose: () => {
            window.location.href = "/login/organisation";
          }
        });
      } else {
        console.error("Registration failed:", data);
        Swal.fire({
          icon: "error",
          title: "Erreur d'inscription",
          text: data.message || "Une erreur est survenue lors de l'inscription."
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
              <span className="text-[#16A34A] font-semibold text-sm">Inscription entreprise</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#16A34A] mb-2">
              Rejoignez notre réseau d'entreprises
            </h1>
            <p className="text-gray-600">
              Créez votre compte et accédez aux meilleurs talents étudiants
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
                <span className="text-sm font-medium text-[#16A34A]">
                  {step === 1 && "Informations organisation"}
                  {step === 2 && "Départements & Projets"}
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
              
              {/* Step 1: Organisation Info */}
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
                    Logo de l'entreprise (optionnel, max 5MB)
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBuilding className="inline mr-2 text-[#16A34A]" size={14} />
                        Nom de l'organisation *
                      </label>
                      <input 
                        type="text" 
                        name="organisationName" 
                        placeholder="Ex: NextGen Tech" 
                        value={formData.organisationName} 
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
                        placeholder="Ex: techcorp.com" 
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
                        placeholder="Ex: NewBell, Douala" 
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
                        placeholder="Ex: 75001" 
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

              {/* Step 2: Departments & Projects */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaUsers className="inline mr-2 text-[#16A34A]" size={14} />
                      Départements concernés * (sélectionnez au moins un)
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaProjectDiagram className="inline mr-2 text-[#16A34A]" size={14} />
                      Projets & Technologies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {projectOptions.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleSelect(p, "projects")}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.projects.includes(p) 
                              ? 'bg-[#16A34A] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.projects.length} projet(s) sélectionné(s)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Admin Info */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <FaUser className="inline mr-2" />
                      Informations de l'administrateur principal du compte
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
                        placeholder="Ex: Siwe Edward" 
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
                        placeholder="Ex: siwe@nextgentech.com" 
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
                        placeholder="Ex: +33 6 12 34 56 78" 
                        value={formData.adminContact} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaBriefcase className="inline mr-2 text-[#16A34A]" size={14} />
                        Fonction / Rôle *
                      </label>
                      <input 
                        type="text" 
                        name="adminRole" 
                        placeholder="Ex: Responsable RH, Directeur Technique, etc." 
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
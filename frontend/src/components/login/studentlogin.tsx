import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, 
  FaBars, FaTimes, FaGraduationCap, FaShieldAlt, FaCheckCircle,
  FaFacebook, FaGoogle, FaApple, FaQuestionCircle, FaUserGraduate
} from "react-icons/fa";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "L'email est requis";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'student'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        Swal.fire({
          icon: "success",
          title: "Connexion réussie",
          text: "Bienvenue sur votre tableau de bord !",
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate("/dashboard/studDashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur de connexion",
          text: data.error || "Email ou mot de passe incorrect"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur réseau",
        text: "Impossible de contacter le serveur"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FDF4] to-white font-sans">
      {/* Navbar (same as before) */}
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
              <Link to="/login" className="text-[#16A34A] font-medium">Connexion</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md hover:shadow-lg">
                Inscription
              </Link>
              <Link to="/post-internship" className="px-5 py-2 rounded-full border-2 border-[#16A34A] text-[#16A34A] font-semibold hover:bg-[#16A34A] hover:text-white transition">
                Publier un stage
              </Link>
            </div>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-4 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-[#16A34A]/10 rounded-full mb-4">
              <FaUserGraduate className="inline mr-2 text-[#16A34A]" size={14} />
              <span className="text-[#16A34A] font-semibold text-sm">Espace Étudiant</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#16A34A] mb-2">
              Bon retour parmi nous !
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre espace personnel
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-[#16A34A]" size={14} />
                    Email étudiant *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ex: marie.mbarga@universite.fr"
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
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
                      placeholder="mot de passe"
                      className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#16A34A] rounded border-gray-300 focus:ring-[#16A34A]"
                    />
                    <span className="text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-[#16A34A] hover:underline font-medium">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Se connecter <FaArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte étudiant ?{" "}
                  <Link to="/register/student" className="text-[#16A34A] font-semibold hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
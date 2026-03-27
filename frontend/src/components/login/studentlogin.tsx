import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    // Clear error when user starts typing
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
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to student dashboard after successful login
      navigate("/student/dashboard");
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-white font-sans">
      
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

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link to="/" className="block py-2 hover:text-[#059669] transition font-medium">Accueil</Link>
              <Link to="/internships" className="block py-2 hover:text-[#059669] transition font-medium">Stages</Link>
              <Link to="/companies" className="block py-2 hover:text-[#059669] transition font-medium">Entreprises</Link>
              <Link to="/login" className="block py-2 text-[#16A34A] font-medium">Connexion</Link>
              <Link to="/register" className="block py-2 text-center rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition">
                Inscription
              </Link>
              <Link to="/post-internship" className="block py-2 text-center rounded-full border-2 border-[#16A34A] text-[#16A34A] font-semibold hover:bg-[#16A34A] hover:text-white transition">
                Publier un stage
              </Link>
            </div>
          )}
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
                    placeholder="ex: marie.dupont@universite.fr"
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
                      placeholder="••••••••"
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  <FaGoogle className="text-red-500" size={18} />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  <FaFacebook className="text-blue-600" size={18} />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Facebook</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('apple')}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  <FaApple className="text-gray-800" size={18} />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Apple</span>
                </button>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte étudiant ?{" "}
                  <Link to="/register/student" className="text-[#16A34A] font-semibold hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </div>

              {/* Security Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <FaShieldAlt size={12} />
                  <span>Connexion sécurisée SSL</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <FaCheckCircle size={12} />
                  <span>Protection des données</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <Link to="/help" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#16A34A] transition">
              <FaQuestionCircle size={14} />
              <span>Besoin d'aide ?</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
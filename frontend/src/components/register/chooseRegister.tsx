import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaGraduationCap, FaBuilding, FaArrowRight, 
  FaBars, FaTimes, FaCheckCircle, FaUsers, FaChartLine 
} from "react-icons/fa";

export default function ChoixInscription() {
  const [selected, setSelected] = useState<"student" | "org" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const options = [
    {
      id: "student",
      title: "Je suis étudiant",
      desc: "Trouvez des stages adaptés à votre profil et lancez votre carrière.",
      icon: <FaGraduationCap size={32} />,
      link: "/register/student",
      color: "from-blue-500 to-blue-600",
      features: [
        "Rechercher des stages facilement",
        "Suivre vos candidatures en temps réel",
        "Obtenir des certificats validés",
        "Accéder à des offres exclusives"
      ],
      stats: "500+ stages disponibles"
    },
    {
      id: "org",
      title: "Je suis une organisation",
      desc: "Publiez des stages et recrutez les meilleurs talents étudiants.",
      icon: <FaBuilding size={32} />,
      link: "/register/organisation",
      color: "from-purple-500 to-purple-600",
      features: [
        "Publier des offres de stage",
        "Accéder à des profils qualifiés",
        "Gérer les candidatures facilement",
        "Analyser les performances de recrutement"
      ],
      stats: "200+ entreprises partenaires"
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FDF4] to-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-lg">
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
              <Link to="/login" className="block py-2 hover:text-[#059669] transition font-medium">Connexion</Link>
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
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#16A34A]/10 rounded-full mb-4">
              <span className="text-[#16A34A] font-semibold text-sm">Rejoignez notre communauté</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#16A34A] mb-4">
              Choisissez votre <span className="text-[#059669]">profil</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Créez votre compte en quelques secondes et commencez votre parcours professionnel
            </p>
          </div>

          {/* Statistics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-[#16A34A]" size={24} />
              </div>
              <div className="text-2xl font-bold text-[#16A34A]">1000+</div>
              <div className="text-gray-600 text-sm">Étudiants inscrits</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBuilding className="text-[#16A34A]" size={24} />
              </div>
              <div className="text-2xl font-bold text-[#16A34A]">200+</div>
              <div className="text-gray-600 text-sm">Entreprises partenaires</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition border border-gray-100">
              <div className="w-12 h-12 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaChartLine className="text-[#16A34A]" size={24} />
              </div>
              <div className="text-2xl font-bold text-[#16A34A]">95%</div>
              <div className="text-gray-600 text-sm">Taux de satisfaction</div>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {options.map((opt, index) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id as any)}
                className={`group cursor-pointer rounded-2xl transition-all duration-300 transform hover:-translate-y-2
                  ${selected === opt.id 
                    ? "ring-2 ring-[#16A34A] shadow-2xl scale-[1.02]" 
                    : "hover:shadow-xl"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-full rounded-2xl bg-white shadow-md transition-all duration-300">
                  <div className="p-8">
                    {/* Icon Section */}
                    <div className={`w-16 h-16 rounded-xl bg-linear-to-r ${opt.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{opt.icon}</div>
                    </div>
                    
                    {/* Title and Description */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#065F46] mb-2">{opt.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{opt.desc}</p>
                      </div>
                      {selected === opt.id && (
                        <FaCheckCircle className="text-[#16A34A] text-xl shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">{opt.stats}</p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-8">
                      {opt.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <FaCheckCircle className="text-[#16A34A] text-xs mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <Link to={opt.link}>
                      <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300
                        ${selected === opt.id 
                          ? `bg-linear-to-r ${opt.color} text-white shadow-lg hover:shadow-xl transform hover:scale-105` 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Continuer <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Links */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-md">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-[#16A34A] font-semibold hover:underline inline-flex items-center gap-1">
                  Se connecter <FaArrowRight size={12} />
                </Link>
              </p>
              <p className="text-xs text-gray-400 mt-3">
                En créant un compte, vous acceptez nos{" "}
                <Link to="#" className="hover:underline">Conditions d'utilisation</Link> et notre{" "}
                <Link to="#" className="hover:underline">Politique de confidentialité</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
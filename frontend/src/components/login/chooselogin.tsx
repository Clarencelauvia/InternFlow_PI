import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaGraduationCap, FaBuilding, FaUniversity, FaArrowRight, 
  FaBars, FaTimes, FaLock, FaShieldAlt,
  FaUserCheck, FaCheckCircle
} from "react-icons/fa";

export default function ChoixConnexion() {
  const [selected, setSelected] = useState<"student" | "org" | "university" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const options = [
    {
      id: "student",
      title: "Étudiant",
      desc: "Accédez à votre espace personnel pour gérer vos candidatures et suivre vos stages.",
      icon: <FaGraduationCap size={32} />,
      link: "/login/student",
      color: "from-blue-500 to-blue-600",
      features: [
        "Consulter vos candidatures",
        "Suivre vos stages en cours",
        "Accéder à vos certificats",
        "Recevoir des recommandations"
      ],
      stats: "500+ stages disponibles"
    },
    {
      id: "org",
      title: "Organisation",
      desc: "Gérez vos offres de stage, consultez les candidatures et recrutez les meilleurs talents.",
      icon: <FaBuilding size={32} />,
      link: "/login/organisation",
      color: "from-purple-500 to-purple-600",
      features: [
        "Publier et gérer des offres",
        "Consulter les candidatures",
        "Accéder aux profils qualifiés",
        "Analyser vos recrutements"
      ],
      stats: "200+ entreprises partenaires"
    },
    {
      id: "university",
      title: "Université",
      desc: "Connectez vos étudiants aux entreprises et suivez leurs parcours de stage.",
      icon: <FaUniversity size={32} />,
      link: "/login/university",
      color: "from-green-500 to-green-600",
      features: [
        "Suivre les étudiants stagiaires",
        "Accéder aux rapports",
        "Gérer les conventions",
        "Consulter les statistiques"
      ],
      stats: "50+ universités partenaires"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-2xl text-[#16A34A]">
            Intern<span className="text-[#059669]">flow</span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link to="/">Accueil</Link>
            <Link to="/internships">Stages</Link>
            <Link to="/companies">Entreprises</Link>
            <Link to="/login" className="text-[#16A34A]">Connexion</Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            <Link to="/">Accueil</Link>
            <Link to="/internships">Stages</Link>
            <Link to="/companies">Entreprises</Link>
            <Link to="/login">Connexion</Link>
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="pt-28 pb-20 px-4 flex justify-center items-center">
        <div className="w-full max-w-6xl">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#16A34A]/10 rounded-full mb-4">
              <FaLock className="inline mr-2 text-[#16A34A]" size={14} />
              <span className="text-[#16A34A] font-semibold text-sm">Accès sécurisé</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#16A34A] mb-4">
              Connectez-vous à votre espace
            </h1>
            <p className="text-gray-600 text-lg">
              Choisissez votre profil
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {options.map((opt, index) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id as any)}
                className={`group cursor-pointer rounded-2xl transition-all duration-300 transform hover:-translate-y-2 relative flex flex-col
                  ${selected === opt.id 
                    ? "ring-2 ring-[#16A34A] shadow-2xl scale-[1.02]" 
                    : "hover:shadow-xl"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-full rounded-2xl bg-white transition-all duration-300 flex flex-col
                  ${selected === opt.id ? "shadow-xl" : ""}`}
                >
                  <div className="p-8 flex flex-col h-full">

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${opt.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{opt.icon}</div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#065F46] mb-2">{opt.title}</h3>
                        <p className="text-gray-600 text-sm">{opt.desc}</p>
                      </div>
                      {selected === opt.id && (
                        <FaCheckCircle className="text-[#16A34A]" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{opt.stats}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {opt.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <FaCheckCircle className="text-[#16A34A] text-xs mt-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <div className="mt-auto">
                      <Link to={opt.link}>
                        <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300
                          ${selected === opt.id 
                            ? `bg-gradient-to-r ${opt.color} text-white shadow-lg hover:shadow-xl transform hover:scale-105` 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Se connecter
                          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-[#16A34A] font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Security */}
          <div className="mt-6 text-center text-sm text-gray-500 flex justify-center items-center gap-2">
            <FaShieldAlt />
            Connexion sécurisée SSL
          </div>

        </div>
      </main>
    </div>
  );
}
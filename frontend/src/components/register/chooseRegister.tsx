import { useState } from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaBuilding, FaUniversity, FaArrowRight } from "react-icons/fa";

export default function ChoixInscription() {
  const [selected, setSelected] = useState<"student" | "org" | "university" | null>(null);

  const options = [
    {
      id: "student",
      title: "Je suis étudiant",
      desc: "Trouvez des stages adaptés à votre profil et lancez votre carrière.",
      icon: <FaGraduationCap size={28} />,
      link: "/register/student",
      features: ["Rechercher des stages facilement", "Suivre vos candidatures", "Obtenir des certificats validés"],
    },
    {
      id: "org",
      title: "Je suis une organisation",
      desc: "Publiez des stages et recrutez les meilleurs talents étudiants.",
      icon: <FaBuilding size={28} />,
      link: "/register/organisation",
      features: ["Publier des offres de stage", "Accéder à des profils qualifiés", "Gérer les candidatures facilement"],
    },
    {
      id: "university",
      title: "Je représente une université",
      desc: "Connectez vos étudiants aux meilleures opportunités et suivez leurs candidatures.",
      icon: <FaUniversity size={28} />,
      link: "/register/university",
      features: ["Publier des programmes pour étudiants", "Suivre les performances des étudiants", "Accéder aux rapports et statistiques"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-bold text-2xl text-[#16A34A]">Intern<span className="text-[#059669]">flow</span></span>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className="hover:text-[#059669]">Accueil</Link>
            <Link to="#" className="hover:text-[#059669]">À propos</Link>
            <Link to="#" className="hover:text-[#059669]">Entreprises</Link>
            <Link to="/register" className="font-semibold text-[#16A34A] hover:underline">Inscription</Link>
            <Link to="#" className="hover:text-[#059669]">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6 flex justify-center">
        <div className="max-w-6xl w-full text-center flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#16A34A] mb-4">
            Rejoignez <span className="text-[#059669]">Interflow</span>
          </h1>
          <p className="text-gray-700 mb-12 text-lg">
            Choisissez votre profil pour commencer votre parcours de stage.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id as any)}
                className={`cursor-pointer rounded-3xl border transition-all duration-300 p-8 text-left shadow-lg hover:shadow-2xl
                  ${selected === opt.id ? "border-[#16A34A] bg-[#DCFCE7]" : "border-gray-200 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/20 flex items-center justify-center text-[#16A34A]">
                    {opt.icon}
                  </div>
                  {selected === opt.id && <span className="text-[#16A34A] font-semibold text-sm">Sélectionné</span>}
                </div>
                <h3 className="text-xl font-bold text-[#065F46] mb-2">{opt.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{opt.desc}</p>
                <ul className="space-y-1 text-sm text-gray-600 mb-6">
                  {opt.features.map((f, idx) => (
                    <li key={idx}>✔ {f}</li>
                  ))}
                </ul>
                <Link to={opt.link}>
                  <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition
                    ${selected === opt.id ? "bg-[#16A34A] text-white hover:bg-[#059669]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Continuer <FaArrowRight />
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-10">
            Vous avez déjà un compte ?{" "}
            <Link to="#" className="text-[#16A34A] font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
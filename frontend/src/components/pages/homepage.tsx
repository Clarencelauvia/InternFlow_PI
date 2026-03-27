import { Link } from "react-router-dom";
import { FaGraduationCap, FaBriefcase, FaCertificate, FaChartLine, FaStar } from "react-icons/fa";

const features = [
  { icon: <FaGraduationCap size={28} />, title: "Correspondance intelligente", desc: "Trouvez des stages qui correspondent parfaitement à vos compétences et objectifs." },
  { icon: <FaCertificate size={28} />, title: "Certificats vérifiés", desc: "Obtenez des certificats fiables pour vos stages complétés." },
  { icon: <FaBriefcase size={28} />, title: "Candidatures rapides", desc: "Postulez en un clic et suivez toutes vos candidatures." },
  { icon: <FaChartLine size={28} />, title: "Tableau de bord", desc: "Suivez vos progrès et vos réalisations facilement." },
];

const testimonials = [
  { name: "Amira Kouassi", role: "Étudiant(e) Informatique", text: "Interflow a rendu la recherche de mon stage facile.", stars: 5 },
  { name: "Jean-Baptiste Mvogo", role: "Responsable RH", text: "La qualité des candidats est exceptionnelle.", stars: 5 },
  { name: "Fatou Diallo", role: "Administrateur des Affaires", text: "De l'inscription à l'offre en quelques minutes !", stars: 5 },
];

export default function HomePage() {
  return (
    <div className="font-sans bg-[#F0FDF4] text-[#065F46]">
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

      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-linear-to-r from-[#16A34A] via-[#059669] to-[#A7F3D0] px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Lancez votre carrière<br/>
            <span className="text-[#FBBF24]">Avec le stage idéal</span>
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Interflow connecte les étudiants ambitieux aux meilleures opportunités de stage, avec certificats vérifiés et tableau de bord pour suivre vos progrès.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-3 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition">Commencez</Link>
            <Link to="#" className="px-8 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#16A34A] transition font-semibold">Comment ça marche</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#F0FDF4]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-center">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-8 rounded-3xl shadow hover:shadow-lg transition">
              <div className="text-[#16A34A] mb-4">{f.icon}</div>
              <h3 className="font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-12 text-[#16A34A]">Apprécié par les étudiants et entreprises</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#F0FDF4] p-8 rounded-3xl shadow hover:shadow-lg transition">
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => <FaStar key={i} className="text-[#FBBF24]" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                <p className="font-bold text-[#16A34A]">{t.name}</p>
                <p className="text-gray-500 text-sm">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-linear-to-r from-[#059669] to-[#16A34A] text-white text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Commencez votre parcours de stage aujourd'hui</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link to="/register" className="px-8 py-3 rounded-full bg-[#FBBF24] text-[#065F46] font-semibold hover:bg-[#F59E0B] transition">Inscrivez-vous</Link>
          <Link to="#" className="px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-[#16A34A] font-semibold transition">Planifier une démo</Link>
        </div>
      </section>
    </div>
  );
}
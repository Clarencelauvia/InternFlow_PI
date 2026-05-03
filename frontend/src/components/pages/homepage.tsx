import React, { useState } from "react";
import { Link } from "react-router-dom";
import perle21 from "../images/perle21.jpeg";
import perle16 from "../images/perle16.jpeg";
import perle23 from "../images/perle23.jpeg"
import { 
  FaGraduationCap, FaBriefcase, FaCertificate, FaChartLine, FaStar, 
  FaSearch, FaUser, FaBuilding, FaCheckCircle, FaArrowRight, 
  FaBars, FaTimes, FaLinkedin, FaTwitter, FaFacebook, FaEnvelope,
  FaMapMarkerAlt, FaPhone, FaClock, FaUsers, FaTrophy, FaGlobe,
  FaRocket, FaHandshake, FaShieldAlt, FaHeart
} from "react-icons/fa";

const features = [
  { icon: <FaGraduationCap size={28} />, title: "Correspondance intelligente", desc: "Notre algorithme vous propose les stages les plus adaptés à votre profil et vos aspirations." },
  { icon: <FaCertificate size={28} />, title: "Certificats vérifiés", desc: "Valorisez votre expérience avec des attestations officielles reconnues par les entreprises." },
  { icon: <FaBriefcase size={28} />, title: "Candidatures rapides", desc: "Postulez en un clic et suivez l'évolution de vos candidatures en temps réel." },
  { icon: <FaChartLine size={28} />, title: "Tableau de bord", desc: "Visualisez vos progrès, statistiques et recommandations personnalisées." },
];

const testimonials = [
  { name: "Amira Kouassi", role: "Étudiante en Master Data Science", text: "Grâce à Interflow, j'ai décroché un stage chez une startup innovante. L'interface est intuitive et les recommandations sont toujours pertinentes !", stars: 5, image: "https://randomuser.me/api/portraits/women/1.jpg" },
  { name: "Jean-Baptiste Mvogo", role: "Responsable RH - TechCorp", text: "Nous recrutons systématiquement via Interflow. La qualité des profils est remarquable et le processus de recrutement est fluidifié.", stars: 5, image: "https://randomuser.me/api/portraits/men/2.jpg" },
  { name: "Fatou Diallo", role: "Directrice des Stages - Université Paris", text: "Une plateforme qui facilite la mise en relation entre nos étudiants et les entreprises. Un outil indispensable pour notre établissement.", stars: 5, image: "https://randomuser.me/api/portraits/women/3.jpg" },
];

const partnerCompanies = [
  { name: "Tech Corp", logo: "🏢", color: "bg-blue-50" },
  { name: "Innovation Lab", logo: "🔬", color: "bg-purple-50" },
  { name: "Digital Solutions", logo: "💻", color: "bg-green-50" },
  { name: "Future Finance", logo: "💰", color: "bg-yellow-50" },
  { name: "Creative Studio", logo: "🎨", color: "bg-pink-50" },
  { name: "Smart Analytics", logo: "📊", color: "bg-indigo-50" },
];

const featuredInternships = [
  { title: "Développeur Full Stack React/Node", company: "Tech Corp", location: "Yaoundé, Cameroun", duration: "6 mois", type: "Hybride", salary: "180-260k/mois" },
  { title: "Assistant Marketing Digital", company: "Creative Studio", location: "Douala, Cameroun", duration: "4 mois", type: "Remote", salary: "80-150K/mois" },
  { title: "Data Analyst - Business Intelligence", company: "Smart Analytics", location: "Limbe, Cameroun", duration: "6 mois", type: "Présentiel", salary: "150-250K/mois" },
];

const steps = [
  { icon: <FaUser size={28} />, title: "Créez votre profil", desc: "Inscription gratuite en 2 minutes. Complétez votre parcours et compétences." },
  { icon: <FaSearch size={28} />, title: "Explorez les offres", desc: "Parcourez des centaines d'offres filtrées selon vos critères." },
  { icon: <FaHandshake size={28} />, title: "Postulez en un clic", desc: "Envoyez votre candidature et recevez des retours rapides." },
  { icon: <FaTrophy size={28} />, title: "Validez votre stage", desc: "Obtenez votre stage et commencez votre aventure professionnelle." },
];

const stats = [
  { value: "500+", label: "Stages disponibles", icon: FaBriefcase },
  { value: "1000+", label: "Étudiants placés", icon: FaUsers },
  { value: "98%", label: "Taux de satisfaction", icon: FaHeart },
  { value: "200+", label: "Entreprises partenaires", icon: FaBuilding },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="font-bold text-2xl text-[#16A34A] hover:opacity-80 transition">
              Intern<span className="text-[#059669]">flow</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Accueil</Link>
              <Link to="/internships" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Stages</Link>
              <Link to="/companies" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Entreprises</Link>
              <Link to="/login" className="text-gray-700 hover:text-[#16A34A] transition font-medium">Connexion</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md">
                Inscription
              </Link>
              <Link to="/post-internship" className="px-5 py-2 rounded-full border-2 border-[#16A34A] text-[#16A34A] font-semibold hover:bg-[#16A34A] hover:text-white transition">
                Publier un stage
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
              <Link to="/" className="block py-2 text-gray-700 hover:text-[#16A34A] transition font-medium">Accueil</Link>
              <Link to="/internships" className="block py-2 text-gray-700 hover:text-[#16A34A] transition font-medium">Stages</Link>
              <Link to="/companies" className="block py-2 text-gray-700 hover:text-[#16A34A] transition font-medium">Entreprises</Link>
              <Link to="/login" className="block py-2 text-gray-700 hover:text-[#16A34A] transition font-medium">Connexion</Link>
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

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-linear-to-br from-[#F0FDF4] via-white to-[#F0FDF4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#16A34A]/10 rounded-full px-4 py-2 mb-6">
                <FaRocket className="text-[#16A34A]" size={16} />
                <span className="text-[#16A34A] font-semibold text-sm">La plateforme n°1 des stages</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Lancez votre carrière avec le{" "}
                <span className="text-[#16A34A]">stage idéal</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Interflow connecte les étudiants ambitieux aux meilleures opportunités de stage. 
                Certificats vérifiés, candidatures simplifiées et suivi personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-lg hover:shadow-xl">
                  Commencer gratuitement <FaArrowRight />
                </Link>
                <Link to="#" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-[#16A34A] text-[#16A34A] font-semibold hover:bg-[#16A34A] hover:text-white transition">
                  Voir comment ça marche
                </Link>
              </div>
              
              {/* Search Bar */}
              <div className="mt-8 bg-white rounded-full shadow-lg p-1">
                <div className="flex items-center">
                  <input 
                    type="text" 
                    placeholder="Rechercher un stage, une entreprise, une ville..." 
                    className="flex-1 px-6 py-3 rounded-full outline-none text-gray-700"
                  />
                  <button className="bg-[#16A34A] text-white p-3 rounded-full hover:bg-[#059669] transition">
                    <FaSearch size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#16A34A]/5 rounded-full blur-3xl"></div>
                <img 
                  src={perle21} 
                  alt="Students collaborating" 
                  className="rounded-2xl shadow-2xl relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="text-[#16A34A] text-3xl mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez votre stage idéal en 4 étapes simples
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#16A34A]/20 transition-colors">
                    <div className="text-[#16A34A] group-hover:scale-110 transition-transform">{step.icon}</div>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gray-200">
                      <div className="w-2 h-2 bg-[#16A34A] rounded-full absolute right-0 -top-0.75"></div>
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">{step.title}</div>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Stages en vedette</h2>
            <p className="text-lg text-gray-600">Découvrez les meilleures opportunités du moment</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredInternships.map((internship) => (
              <div key={internship.title} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className="h-2 bg-linear-to-r from-[#16A34A] to-[#059669]"></div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-[#16A34A] transition">{internship.title}</h3>
                  <p className="text-gray-600 mb-4">{internship.company}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt size={14} />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock size={14} />
                      <span>{internship.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBriefcase size={14} />
                      <span>{internship.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#16A34A] font-medium">
                      <span>💰 {internship.salary}</span>
                    </div>
                  </div>
                  <Link to="#" className="mt-6 inline-flex items-center gap-2 text-[#16A34A] font-semibold hover:gap-3 transition-all">
                    Voir l'offre <FaArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/internships" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#16A34A] text-white font-semibold hover:bg-[#059669] transition shadow-md">
              Voir tous les stages <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Pourquoi choisir Interflow ?</h2>
            <p className="text-lg text-gray-600">Des fonctionnalités conçues pour votre réussite</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center group">
                <div className="w-14 h-14 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#16A34A]/20 transition-colors">
                  <div className="text-[#16A34A] group-hover:scale-110 transition-transform">{feature.icon}</div>
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Ce que nos utilisateurs disent</h2>
            <p className="text-lg text-gray-600">Ils ont trouvé leur stage idéal grâce à Interflow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <FaStar key={i} className="text-[#FBBF24]" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ils nous font confiance</h2>
            <p className="text-gray-600">Plus de 200 entreprises partenaires</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partnerCompanies.map((company) => (
              <div key={company.name} className="text-center group">
                <div className={`w-20 h-20 ${company.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{company.logo}</span>
                </div>
                <p className="text-gray-700 text-sm">{company.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-linear-to-r from-[#16A34A] to-[#059669]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Rejoignez des milliers d'étudiants qui ont déjà trouvé leur stage idéal
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-[#16A34A] font-semibold hover:bg-gray-100 transition shadow-lg">
              Inscription gratuite <FaArrowRight />
            </Link>
            <Link to="#" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[#16A34A] transition">
              Demander une démo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Intern<span className="text-[#16A34A]">flow</span></h3>
              <p className="text-gray-400 mb-4">La plateforme qui connecte les talents aux opportunités de stage idéales.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><FaLinkedin size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaEnvelope size={20} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Étudiants</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition">Trouver un stage</Link></li>
                <li><Link to="#" className="hover:text-white transition">Conseils carrière</Link></li>
                <li><Link to="#" className="hover:text-white transition">Témoignages</Link></li>
                <li><Link to="#" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Entreprises</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition">Publier un stage</Link></li>
                <li><Link to="#" className="hover:text-white transition">Solutions entreprises</Link></li>
                <li><Link to="#" className="hover:text-white transition">Tarifs</Link></li>
                <li><Link to="#" className="hover:text-white transition">Recruter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><FaEnvelope /> internflow@gmail.com</li>
                <li className="flex items-center gap-2"><FaPhone /> +237 653 321 819</li>
                <li className="flex items-center gap-2"><FaMapMarkerAlt /> Yaoundé, Cameroun</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Interflow. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
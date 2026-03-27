import { useState } from "react";
import { Link } from "react-router-dom";

export default function StudentRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    password: "",
    university: "",
    department: "",
    course: "",
    year: "",
    studentID: "",
    guardianName: "",
    guardianContact: "",
  });

  const departments = ["Computer Science", "Mathematics", "Physics", "Biology"];
  const courses = ["Algorithms", "Calculus", "Quantum Mechanics", "Genetics"];
  const years = ["1", "2", "3", "4"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  const handlePrev = () => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-bold text-xl text-gray-900">
            Inter<span className="text-[#16A34A]">flow</span>
          </span>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-gray-700 hover:text-[#16A34A]">Accueil</Link>
            <Link to="#" className="text-gray-700 hover:text-[#16A34A]">À Propos</Link>
            <Link to="#" className="text-gray-700 hover:text-[#16A34A]">Entreprises</Link>
            <Link to="/register" className="text-[#16A34A] font-semibold">Inscription</Link>
            <Link to="#" className="text-gray-700 hover:text-[#16A34A]">Contact</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 flex justify-center items-start min-h-screen px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Inscription Étudiant</h1>

          {/* Progress bar */}
          <div className="flex justify-between mb-6">
            <div className={`w-1/3 h-2 rounded ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-2 rounded ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-2 rounded ${step >= 3 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Informations personnelles</h2>
              <input type="text" name="fullName" placeholder="Nom complet" value={formData.fullName} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="tel" name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
            </div>
          )}

          {/* Step 2: University Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Informations universitaires</h2>
              <input type="text" name="university" placeholder="Université" value={formData.university} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <select name="department" value={formData.department} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]">
                <option value="">Département</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="course" value={formData.course} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]">
                <option value="">Cours</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="year" value={formData.year} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]">
                <option value="">Année</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input type="text" name="studentID" placeholder="ID étudiant" value={formData.studentID} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
            </div>
          )}

          {/* Step 3: Guardian Info */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Informations du tuteur</h2>
              <input type="text" name="guardianName" placeholder="Nom du tuteur" value={formData.guardianName} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="tel" name="guardianContact" placeholder="Contact du tuteur" value={formData.guardianContact} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 1 && <button type="button" onClick={handlePrev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Précédent</button>}
            {step < 3 ? <button type="button" onClick={handleNext} className="px-4 py-2 bg-[#16A34A] text-white rounded hover:bg-[#059669]">Suivant</button> : <button type="submit" className="px-4 py-2 bg-[#16A34A] text-white rounded hover:bg-[#059669]">Terminer</button>}
          </div>

          <p className="text-center text-sm text-gray-500">Déjà un compte ? <Link to="#" className="text-[#16A34A]">Se connecter</Link></p>
        </form>
      </main>
    </div>
  );
}
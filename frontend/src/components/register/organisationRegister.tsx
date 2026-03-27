import { useState } from "react";
import { Link } from "react-router-dom";

export default function OrganisationRegistration() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    organisationName: "",
    domain: "",
    location: "",
    postalCode: "",
    officialNumber: "",
    password: "",
    departments: [] as string[],
    projects: [] as string[],
    adminName: "",
    adminEmail: "",
    adminContact: "",
    adminRole: "",
  });

  const departmentOptions = ["R&D", "Marketing", "Finance", "Operations"];
  const projectOptions = ["AI Project", "Web App", "Mobile App", "Data Analysis"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSelect = (value: string, listKey: "departments" | "projects") => {
    const list = formData[listKey];
    setFormData({
      ...formData,
      [listKey]: list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    });
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
          <h1 className="text-2xl font-bold text-gray-900 text-center">Inscription Organisation</h1>

          {/* Progress bar */}
          <div className="flex justify-between mb-6">
            <div className={`w-1/3 h-2 rounded ${step >= 1 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-2 rounded ${step >= 2 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-2 rounded ${step >= 3 ? 'bg-[#16A34A]' : 'bg-gray-200'}`}></div>
          </div>

          {/* Step 1: Organisation Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Informations de l'organisation</h2>
              <input type="text" name="organisationName" placeholder="Nom de l'organisation" value={formData.organisationName} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="text" name="domain" placeholder="Domaine officiel" value={formData.domain} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="text" name="location" placeholder="Localisation" value={formData.location} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="text" name="postalCode" placeholder="Code postal" value={formData.postalCode} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="tel" name="officialNumber" placeholder="Numéro officiel" value={formData.officialNumber} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
            </div>
          )}

          {/* Step 2: Departments & Projects */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Départements et Projets</h2>
              <div className="flex flex-wrap gap-2">
                {departmentOptions.map(d => (
                  <span key={d} onClick={() => toggleSelect(d, "departments")} className={`px-3 py-1 rounded-full border cursor-pointer ${formData.departments.includes(d) ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-gray-100 border-gray-300'}`}>{d}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {projectOptions.map(p => (
                  <span key={p} onClick={() => toggleSelect(p, "projects")} className={`px-3 py-1 rounded-full border cursor-pointer ${formData.projects.includes(p) ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-gray-100 border-gray-300'}`}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Admin Info */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-700">Informations de l'administrateur</h2>
              <input type="text" name="adminName" placeholder="Nom complet" value={formData.adminName} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="email" name="adminEmail" placeholder="Email" value={formData.adminEmail} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="tel" name="adminContact" placeholder="Contact" value={formData.adminContact} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
              <input type="text" name="adminRole" placeholder="Rôle" value={formData.adminRole} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#16A34A]" />
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
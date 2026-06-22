import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCheckCircle, FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !code) {
      Swal.fire({
        icon: "error",
        title: "Champs requis",
        text: "Veuillez entrer votre email et le code de vérification"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Compte vérifié !",
          text: "Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.",
          confirmButtonColor: "#16a34a"
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur de vérification",
          text: data.error || "Code de vérification invalide"
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur réseau",
        text: "Impossible de contacter le serveur"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Email requis",
        text: "Veuillez entrer votre email pour recevoir un nouveau code"
      });
      return;
    }
    
    if (countdown > 0) {
      Swal.fire({
        icon: "warning",
        title: "Attendez",
        text: `Veuillez attendre ${countdown} secondes avant de renvoyer un code`
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Code envoyé !",
          text: "Un nouveau code de vérification a été envoyé à votre email"
        });
        
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: data.error || "Impossible d'envoyer le code"
        });
      }
    } catch (error) {
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
    <div className="min-h-screen bg-linear-to-br from-[#F0FDF4] to-white font-sans flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-[#16A34A] to-[#059669] p-6 text-center">
            <FaCheckCircle className="text-white text-5xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Vérification de compte</h1>
          </div>
          
          <div className="p-8">
            <p className="text-gray-600 text-center mb-6">
              Un code de vérification a été envoyé à votre adresse email. Veuillez le saisir ci-dessous pour activer votre compte.
            </p>
            
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-[#16A34A]" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  readOnly={!!searchParams.get("email")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Entrez le code à 6 chiffres"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#16A34A] to-[#059669] text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? "Vérification en cours..." : "Vérifier mon compte"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Vous n'avez pas reçu le code ?{" "}
                <button
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="text-[#16A34A] font-semibold hover:underline disabled:opacity-50"
                >
                  {countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer le code"}
                </button>
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/register" className="text-sm text-gray-500 hover:text-[#16A34A] inline-flex items-center gap-1">
                <FaArrowLeft size={12} />
                Retour à l'inscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
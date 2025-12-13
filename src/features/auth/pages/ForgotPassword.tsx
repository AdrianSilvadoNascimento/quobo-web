import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import QuoboIcon from '@/assets/quobo-icon.png';
import { useAuth } from "@/contexts/AuthContext";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      setError("Erro ao enviar email");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize particles
  useEffect(() => {
    const particleCount = 15;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 100 + 50,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev =>
        prev.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          if (newX < -10 || newX > 110) particle.speedX *= -1;
          if (newY < -10 || newY > 110) particle.speedY *= -1;

          newX = Math.max(-10, Math.min(110, newX));
          newY = Math.max(-10, Math.min(110, newY));

          return { ...particle, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for gradient spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });

    // Parallax effect on card
    if (cardRef.current) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (e.clientX - rect.left - centerX) / centerX;
      const deltaY = (e.clientY - rect.top - centerY) / centerY;

      const rotateX = deltaY * 5;
      const rotateY = deltaX * 5;

      cardRef.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }
  };

  // Reset card tilt on mouse leave
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(34, 184, 230, 0.8) 0%, rgba(37, 99, 235, 0.6) 30%, rgba(30, 64, 175, 0.9) 100%)`,
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] opacity-80" />

      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-xl pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, rgba(255, 255, 255, ${particle.opacity}) 0%, transparent 70%)`,
            transform: `translate(-50%, -50%)`,
          }}
        />
      ))}

      {/* Mouse spotlight effect */}
      <div
        className="absolute rounded-full pointer-events-none blur-3xl transition-all duration-300 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex flex-col justify-center items-center text-center mb-8 animate-fade-in">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={QuoboIcon}
              alt="Quobo Icon"
              className="relative mb-2 w-24 h-auto drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500"
            />
          </div>
          <div className="ml-2">
            <h1 className="text-4xl font-bold text-white tracking-tight font-lora-bold drop-shadow-lg">
              Quobo
            </h1>
            <p className="text-white/90 mt-2 font-lora text-sm drop-shadow-md">
              Gerencie seu estoque com maestria
            </p>
          </div>
        </div>

        {/* Login Card with Glassmorphism */}
        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
          }}
        >
          {!isSent ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
                Recuperar Acesso
              </h2>
              <p className="text-sm text-slate-500 text-center mb-8">
                Digite seu email abaixo e enviaremos as instruções para redefinir sua senha.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex w-full flex-col">
                <form onSubmit={handleSubmit} className="space-y-5 mb-3">
                  {/* Email Input */}
                  <div className="group">
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                      Email Cadastrado
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Insira seu email"
                        className="w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-hover:text-blue-500" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      {isLoading ? <span className="loading loading-dots loading-md"></span> : 'Enviar Instruções'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </form>

                <div className="divider mb-4"></div>

                <div className="group flex justify-center items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all duration-300 ease-in-out" />
                  <Link
                    to="/login"
                    className="text-sm text-slate-600 font-medium decoration-2 group-hover:text-blue-500 underline-offset-2 transition-all hover:drop-shadow-xl group-hover:underline transition-all duration-300 ease-in-out"
                  >
                    Voltar para o Login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Email Enviado!</h2>
              <p className="text-sm text-slate-500 mb-6">
                Verifique sua caixa de entrada. Enviamos um link para redefinir sua senha.
              </p>
              <p className="text-xs text-slate-400 italic">
                Redirecionando para a próxima etapa...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-white/70 relative z-10 drop-shadow-md">
        © 2025 Quobo - Estoque. Todos os direitos reservados.
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;

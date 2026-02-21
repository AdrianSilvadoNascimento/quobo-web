import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import QuoboIcon from '@/assets/quobo-icon.png';
import { Button } from '@/components/ui';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Falha no login com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password, remember: rememberMe });
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
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
          className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
          }}
        >
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
            Entrar na sua conta
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Digite suas credenciais para acessar o sistema
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex w-full flex-col">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                  Email
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

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Insira sua senha"
                    className="w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-hover:text-blue-500" />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary w-5 h-5 mr-2"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Lembrar de mim
                </label>
                <Link
                  to="/forgot-password"
                  className="text-blue-500 hover:text-blue-700 font-medium hover:underline transition-all"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                variant='primary'
                type="submit"
                isLoading={isLoading}
                className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isLoading ? <span className="loading loading-dots loading-md"></span> : 'Entrar'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </form>

            <div className="divider">ou</div>

            {/* Google Sign In */}
            <Button
              variant='ghost'
              type="button"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
              className="cursor-pointer w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-md shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
              icon={<svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>}
            >
              Continuar com Google
            </Button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-8 text-white text-sm drop-shadow-lg">
          Ainda não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-white font-bold hover:underline decoration-2 underline-offset-2 transition-all hover:drop-shadow-xl"
          >
            Criar conta
          </Link>
        </p>
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
};

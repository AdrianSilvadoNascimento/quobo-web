import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { server } from '@/services/api';
import QuoboIcon from '@/assets/quobo-icon.png';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const EmailVerificationProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Animation states
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

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

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de verificação não encontrado.');
      return;
    }

    const verifyEmail = async () => {
      // Prevent multiple calls if somehow the effect runs again without cleanup
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        await server.api.post(`/auth/verify-email?token=${token}`);
        // Delay for visual effect
        setTimeout(() => {
          setStatus('success');
        }, 1500);
      } catch (error: any) {
        console.error('Verification failed', error);
        // If error is 404, it might mean already verified in a race condition or truly invalid
        // But for safety, we show error. 
        // Ideally backend could handle "already verified" if we passed email, but we only have token.
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Falha ao verificar email. O link pode ter expirado ou é inválido.');
      }
    };

    // Use a small timeout to handle React 18 Strict Mode double-invocation in development.
    // The first "ghost" mount will be cancelled by the cleanup function before the timeout fires.
    const timeoutId = setTimeout(() => {
      verifyEmail();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/login');
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
          </div>
        </div>

        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out text-center"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
          }}
        >

          {status === 'verifying' && (
            <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Verificando...</h2>
              <p className="text-sm text-slate-500">Estamos validando seu link de confirmação.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Email Confirmado!</h2>
              <p className="text-sm text-slate-500 mb-8">
                Sua conta foi ativada com sucesso. Agora você pode acessar o sistema.
              </p>

              <button
                onClick={handleGoToLogin}
                className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Ir para Login
                </div>
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Erro na Verificação</h2>
              <p className="text-sm text-slate-500 mb-8">
                {errorMessage}
              </p>

              <button
                onClick={handleGoToLogin}
                className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-xs text-white/70 relative z-10 drop-shadow-md">
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

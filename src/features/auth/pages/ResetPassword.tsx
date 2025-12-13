import type React from "react";
import { useEffect, useRef, useState } from "react";

import QuoboIcon from "@/assets/quobo-icon.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth.service";
import { AlertModal, type AlertType } from "@/components/AlertModal";
import { ArrowRight, CheckCircle, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [step, setSteps] = useState<'CODE' | 'PASSWORD' | 'SUCCESS'>('CODE');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [token, setToken] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  const { isActive, formattedTime, restart } = useCountdown(60, { autoStart: false, storageKey: 'reset_password_resend_timer' });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as AlertType,
  });

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

  const handleCheckToken = () => {
    if (!email || !token || token.length !== 6) return;

    setIsCheckingToken(true);

    setTimeout(() => {
      setIsCheckingToken(false);
      setSteps('PASSWORD');
    }, 1500)
  }

  const handleResendCode = async () => {
    if (isActive || !email) return;

    setIsResending(true);

    try {
      await authService.resendToken(email);
      restart();
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao reenviar código',
        type: 'error'
      });
    } finally {
      setIsResending(false);
    }
  }

  const handleSavePassword = async () => {
    if (
      !email ||
      !token ||
      token.length !== 6 ||
      password.length < 8 ||
      passwordConfirmation.length < 8
    ) return;

    if (password !== passwordConfirmation) return;

    setIsSavingPassword(true);

    try {
      await authService.resetPassword({ email, token, password, passwordConfirmation });
      debugger
      setSteps('SUCCESS');
      setAlertModal({
        isOpen: true,
        title: 'Sucesso',
        message: 'Senha salva com sucesso',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error: any) {
      console.error(error)
      setAlertModal({
        isOpen: true,
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao salvar senha',
        type: 'error'
      });

      if (error.response.data.message === 'Código inválido ou expirado') {
        setSteps('CODE');
      }
    } finally {
      setIsSavingPassword(false);
    }
  }

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

  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  return (
    <>
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

          <div
            ref={cardRef}
            className="bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
            }}
          >
            {/* --- STEP 1: CODE VERIFICATION --- */}
            {step === 'CODE' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Verifique seu email</h2>
                  <p className="text-sm text-slate-400">
                    Insira o código de 6 dígitos que enviamos para o seu email para continuar.
                  </p>
                </div>

                <form className="space-y-6">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\s/g, ''))}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-200 transition-colors"
                      autoFocus
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckToken}
                    disabled={token.length !== 6 || isCheckingToken}
                    className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCheckingToken ? <span className="loading loading-dots loading-md" /> : 'Verificar Código'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  {isActive ? (
                    <p className="text-sm text-slate-400 font-medium">
                      Reenviar código em <span className="text-slate-600 tabular-nums">{formattedTime}</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="flex items-center justify-center gap-2 cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isResending && <span className="loading loading-dots loading-md" />}
                      <RefreshCw className="w-5 h-5" />
                      Reenviar novo código
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* --- STEP 2: RESET PASSWORD --- */}
            {step === 'PASSWORD' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Criar nova senha</h2>
                <p className="text-sm text-slate-400 text-center mb-8">
                  Código verificado! Agora defina sua nova senha segura.
                </p>

                <form className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo de 8 caracteres"
                        className="w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md border-slate-200"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer absolute right-3 top-4 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        type={showPasswordConfirmation ? "text" : "password"}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md border-slate-200"
                        required
                      />
                      <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="cursor-pointer absolute right-3 top-4 text-slate-400 hover:text-slate-600">
                        {showPasswordConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSavePassword}
                      disabled={isSavingPassword || !password || !passwordConfirmation || password !== passwordConfirmation}
                      className="flex items-center justify-center gap-2 cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSavingPassword ? (
                        <>
                          <span className="loading loading-dots loading-md" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          Redefinir Senha
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- STEP 3: SUCCESS --- */}
            {step === 'SUCCESS' && (
              <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Senha Alterada!</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Sua senha foi redefinida com sucesso. Você será redirecionado para o login automaticamente.
                </p>
                <span className="loading loading-dots loading-md mx-auto text-brand-500" />
              </div>
            )}

          </div>
        </div>
      </div>
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={handleAlertClose}
      />
    </>
  );
}

export default ResetPassword;

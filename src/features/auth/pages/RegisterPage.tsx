import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Building, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth.service';
import { AlertModal, type AlertType } from '../../../components/AlertModal';
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

export const RegisterPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; type: AlertType }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
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

      const rotateX = deltaY * 2; // Reduced rotation for larger card
      const rotateY = deltaX * 2;

      cardRef.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    }
  };

  // Reset card tilt on mouse leave
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const getFormErrors = (data: typeof formData) => {
    const newErrors: Record<string, string> = {};

    if (!data.name || data.name.length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!data.password) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      if (data.password.length < 8) {
        newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
      } else if (data.password.length > 32) {
        newErrors.password = 'Senha deve ter no máximo 32 caracteres';
      } else if (!/(?=.*[a-z])/.test(data.password)) {
        newErrors.password = 'Senha deve conter letra minúscula';
      } else if (!/(?=.*[A-Z])/.test(data.password)) {
        newErrors.password = 'Senha deve conter letra maiúscula';
      } else if (!/(?=.*\d)/.test(data.password)) {
        newErrors.password = 'Senha deve conter número';
      } else if (!/(?=.*[\W_])/.test(data.password)) {
        newErrors.password = 'Senha deve conter caractere especial';
      }
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (!data.terms) {
      newErrors.terms = 'Você deve aceitar os termos';
    }

    return newErrors;
  };

  const validateForm = () => {
    const newErrors = getFormErrors(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = Object.keys(getFormErrors(formData)).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        business_name: formData.business_name || undefined
      });

      setAlert({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Conta criada com sucesso. Redirecionando para login...',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      setAlert({
        isOpen: true,
        title: 'Erro',
        message: Array.isArray(message) ? message.join(', ') : message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // loginWithGoogle handles navigation/state update on success
    } catch (error) {
      console.error(error);
      setAlert({
        isOpen: true,
        title: 'Erro',
        message: 'Falha no login com Google. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
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

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Content */}
      <div className="w-full max-w-lg relative z-10">
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

        {/* Register Card with Glassmorphism */}
        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
          }}
        >
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
            Criar sua conta
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Preencha os campos e comece a gerenciar seu estoque
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              {/* Name Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Nome Completo</label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  <User className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-hover:text-blue-500" />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Preencha seu email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-hover:text-blue-500" />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Company Input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Empresa (Opcional)</label>
                <div className="relative">
                  <input
                    id="business_name"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={formData.business_name}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md"
                  />
                  <Building className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-hover:text-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Input */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Senha</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors duration-300 group-hover:text-blue-500">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}

                  {/* Password Requirements */}
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">A senha deve conter:</p>
                    <ul className="space-y-1">
                      <li className={`text-xs flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Mínimo de 8 caracteres
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Letra minúscula
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Letra maiúscula
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Número
                      </li>
                      <li className={`text-xs flex items-center gap-2 ${/(?=.*[\W_])/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[\W_])/.test(formData.password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Caractere especial
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-4 pr-10 py-3.5 text-sm text-slate-700 bg-slate-50/50 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:border-slate-300 hover:bg-white group-hover:shadow-md ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 transition-colors duration-300 group-hover:text-blue-500">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="checkbox checkbox-primary w-5 h-5 mr-2"
                />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  Li e concordo com os <a href="#" className="text-blue-600 hover:underline">termos de uso</a> e <a href="#" className="text-blue-600 hover:underline">política de privacidade</a>.
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 mt-1 ml-7">{errors.terms}</p>}
            </div>

            <Button
              variant='primary'
              type="submit"
              isLoading={loading}
              disabled={loading || !isFormValid}
              className="w-full group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          <div className="divider">ou</div>

          <Button
            variant='ghost'
            type="button"
            onClick={handleGoogleLogin}
            isLoading={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-md shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
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
            Registrar com Google
          </Button>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Já possui uma conta? <Link to="/login" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-2 transition-all">Entrar</Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-white/70 relative z-10 drop-shadow-md text-center">
          © 2025 Quobo - Estoque. Todos os direitos reservados.
        </div>
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

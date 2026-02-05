import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, Building2, Shield, Clock, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { publicInviteService } from '../services/public-invite.service';
import type { InviteValidationResponse } from '../services/public-invite.service';

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

type PageState = 'loading' | 'valid' | 'invalid' | 'expired' | 'accepted' | 'error';

export const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const _navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  const [pageState, setPageState] = useState<PageState>('loading');
  const [inviteData, setInviteData] = useState<InviteValidationResponse['data'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setPageState('error');
        setErrorMessage('Token de convite não fornecido');
        return;
      }

      try {
        const response = await publicInviteService.validateToken(token);

        if (response.success && response.data.valid) {
          setInviteData(response.data);
          setPageState('valid');
        } else if (response.data?.invite?.status === 'EXPIRED') {
          setInviteData(response.data);
          setPageState('expired');
        } else if (response.data?.invite?.status === 'ACCEPTED') {
          setPageState('accepted');
        } else {
          setPageState('invalid');
          setErrorMessage(response.message || 'Convite inválido');
        }
      } catch (error: any) {
        setPageState('error');
        setErrorMessage(error?.response?.data?.message || 'Erro ao validar convite');
      }
    };

    validateToken();
  }, [token]);

  // Track mouse position for gradient spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });

    if (cardRef.current) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (e.clientX - rect.left - centerX) / centerX;
      const deltaY = (e.clientY - rect.top - centerY) / centerY;

      const rotateX = deltaY * 3;
      const rotateY = deltaX * 3;

      cardRef.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== passwordConfirmation) {
      setFormError('As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!name.trim() || !lastname.trim()) {
      setFormError('Preencha seu nome e sobrenome');
      return;
    }

    setIsSubmitting(true);

    try {
      await publicInviteService.acceptInvite(token!, {
        name: name.trim(),
        lastname: lastname.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      setPageState('accepted');
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Erro ao aceitar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateRole = (role: string): string => {
    const translations: Record<string, string> = {
      'STORE_MANAGER': 'Gerente de Loja',
      'STOCKIST': 'Estoquista',
      'CASHIER': 'Caixa',
      'SELLER': 'Vendedor',
      'ADMIN': 'Administrador',
    };
    return translations[role] || role;
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
            <p className="mt-4 text-slate-600">Validando convite...</p>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Convite Expirado</h2>
            <p className="text-slate-600 mb-6">
              Este convite expirou. Entre em contato com quem te convidou para solicitar um novo convite.
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ir para Login
            </Link>
          </div>
        );

      case 'invalid':
      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Convite Inválido</h2>
            <p className="text-slate-600 mb-6">
              {errorMessage || 'Este convite não é válido ou já foi utilizado.'}
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ir para Login
            </Link>
          </div>
        );

      case 'accepted':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo à equipe!</h2>
            <p className="text-slate-600 mb-6">
              Sua conta foi criada com sucesso. Agora você pode fazer login para acessar o sistema.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        );

      case 'valid':
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              Você foi convidado!
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Complete seu cadastro para aceitar o convite
            </p>

            {/* Invite Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">Empresa</span>
                    <p className="font-semibold text-slate-800">{inviteData?.invite?.account?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">Função</span>
                    <p className="font-semibold text-slate-800">{translateRole(inviteData?.invite?.role || '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">Convidado por</span>
                    <p className="font-semibold text-slate-800">
                      {inviteData?.invite?.invitedBy?.name} {inviteData?.invite?.invitedBy?.lastname}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">Seu email</span>
                    <p className="font-semibold text-slate-800">{inviteData?.invite?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                    Nome
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      className="w-full pl-4 pr-10 py-3 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                    Sobrenome
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Seu sobrenome"
                      className="w-full pl-4 pr-10 py-3 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      required
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                    />
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Crie uma senha"
                    className="w-full pl-4 pr-10 py-3 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirme sua senha"
                    className="w-full pl-4 pr-10 py-3 text-sm text-slate-700 bg-slate-50/50 border-2 border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    required
                    minLength={6}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="loading loading-dots loading-md"></span>
                ) : (
                  'Aceitar Convite e Criar Conta'
                )}
              </button>
            </form>
          </>
        );
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] opacity-80" />

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
        <div className="flex flex-col justify-center items-center text-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={QuoboIcon}
              alt="Quobo Icon"
              className="relative mb-2 w-20 h-auto drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            Quobo
          </h1>
        </div>

        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/30 transition-all duration-300 ease-out"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1) inset',
          }}
        >
          {renderContent()}
        </div>

        <p className="text-center mt-6 text-white/80 text-sm drop-shadow-lg">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-white font-bold hover:underline"
          >
            Fazer Login
          </Link>
        </p>
      </div>

      <div className="mt-6 text-xs text-white/70 relative z-10 drop-shadow-md">
        © 2025 Quobo - Estoque. Todos os direitos reservados.
      </div>
    </div>
  );
};

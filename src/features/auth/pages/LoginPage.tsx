import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import QuoboIcon from '@/assets/quobo-icon.png';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    // Redirect is handled by the Router based on isAuthenticated state
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#22B8E6] via-[#2563EB] to-[#1E40AF]">
      <div className="w-full max-w-md">
        <div className="flex flex-col justify-center items-center text-center mb-6">
          <img src={QuoboIcon} alt="Quobo Icon" className="mb-2 w-24 h-auto" />
          <div className="ml-2">
            <h1 className="text-3xl font-bold text-white tracking-tight font-lora-bold">Quobo</h1>
            <p className="text-white/80 mt-2 font-lora">Gerencie seu estoque com maestria</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Entrar na sua conta</h2>
          <p className="text-sm text-slate-400 text-center mb-8">Digite suas credenciais para acessar o sistema</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Insira seu email"
                  className="w-full pl-4 pr-10 py-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
                <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Insira sua senha"
                  className="w-full pl-4 pr-10 py-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
                <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded-sm checkbox checkbox-primary mr-2" />
                Lembrar de mim
              </label>
              <a href="#" className="text-slate-600 hover:text-brand-700 font-medium">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary cursor-pointer hover:bg-primary text-white font-semibold py-3 rounded-lg shadow-md transition-all transform active:scale-95"
            >
              Entrar
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">ou</span>
            </div>
          </div>

          <button className="w-full bg-brand-500 cursor-pointer hover:bg-brand-600 text-slate-600 font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar com Google
          </button>
        </div>

        <p className="text-center mt-6 text-white text-md">
          Ainda não tem uma conta? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Criar conta</Link>
        </p>
      </div>

      <div className="mt-8 text-xs text-slate-400">
        © 2025 Quobo - Estoque. Todos os direitos reservados.
      </div>
    </div>
  );
};

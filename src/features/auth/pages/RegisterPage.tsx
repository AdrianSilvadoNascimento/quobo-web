import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Mail, User, Building, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Box className="w-8 h-8 text-white fill-brand-600 p-1 rounded-lg" />
          <span className="text-2xl font-bold text-slate-800">Quobo</span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Criar sua conta</h2>
          <p className="text-sm text-slate-400 mt-1">Preencha os campos e comece a gerenciar seu estoque</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Preencha seu email"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Empresa (Opcional)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome da sua empresa"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <Building className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start mt-4">
            <input id="terms" type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
              Li e concordo com os <a href="#" className="text-brand-600 hover:underline">termos de uso</a> e <a href="#" className="text-brand-600 hover:underline">política de privacidade</a>.
            </label>
          </div>

          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg shadow-md transition-all mt-6">
            Cadastrar
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">ou continue com</span>
            </div>
          </div>

          <button className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Já possui uma conta? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Entrar</Link>
        </p>
      </div>

      <div className="mt-8 text-xs text-slate-400">
        © 2025 Quobo - Estoque. Todos os direitos reservados.
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, FileText, Save, CreditCard } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { accountApi } from '../../../services/accountApi';
import { cpfCnpjMask, phoneMask, removeMask } from '../../../utils/masks';
import { validateEmail, validateCPFOrCNPJ, validatePhone } from '../../../utils/validations';

export const AccountInfoSection: React.FC = () => {
  const { user, account } = useAuth();

  // Only show for ADMIN or OWNER users
  if (!user || (user.type !== 'ADMIN' && user.type !== 'OWNER')) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: account?.name || '',
    email: account?.email || '',
    cpf_cnpj: cpfCnpjMask(account?.cpf_cnpj || ''),
    phone_number: phoneMask(account?.phone_number || ''),
    type: account?.type || 'INDIVIDUAL',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        email: account.email || '',
        cpf_cnpj: cpfCnpjMask(account.cpf_cnpj || ''),
        phone_number: phoneMask(account.phone_number || ''),
        type: account.type || 'INDIVIDUAL',
      });
    }
  }, [account]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCpfCnpjChange = (value: string) => {
    const masked = cpfCnpjMask(value);
    handleInputChange('cpf_cnpj', masked);
  };

  const handlePhoneChange = (value: string) => {
    const masked = phoneMask(value);
    handleInputChange('phone_number', masked);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Nome fantasia é obrigatório';
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, insira um email válido';
    }

    // Validate CPF/CNPJ
    if (!validateCPFOrCNPJ(formData.cpf_cnpj)) {
      newErrors.cpf_cnpj = 'Por favor, insira um CPF ou CNPJ válido';
    }

    // Validate phone (optional, but if provided must be valid)
    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      newErrors.phone_number = 'Por favor, insira um telefone válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      if (account?.id && user?.id) {
        await accountApi.updateAccount({
          account_id: account.id,
          account_user_id: user.id,
          name: formData.name,
          email: formData.email,
          cpf_cnpj: removeMask(formData.cpf_cnpj),
          phone_number: formData.phone_number ? removeMask(formData.phone_number) : undefined,
        });

        setSuccessMessage('Informações da conta atualizadas com sucesso!');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating account:', error);
      setErrors({ submit: error.response?.data?.message || 'Erro ao atualizar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    return type === 'INDIVIDUAL' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Informações da Conta
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie as informações empresariais da sua conta
        </p>
      </div>

      {/* Account Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-4 mb-6 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Nome Fantasia</p>
            <p className="text-sm font-medium text-slate-800">{account?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Conta</p>
            <p className="text-sm font-medium text-slate-800">{getAccountTypeLabel(account?.type || 'INDIVIDUAL')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">CPF/CNPJ</p>
            <p className="text-sm font-medium text-slate-800">{cpfCnpjMask(account?.cpf_cnpj || '') || '-'}</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Nome Fantasia
              </span>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 border ${errors.name ? 'border-red-300' : 'border-slate-200'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Email Empresarial
              </span>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 border ${errors.email ? 'border-red-300' : 'border-slate-200'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Tipo de Conta
              </span>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={getAccountTypeLabel(formData.type)}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Este campo não pode ser alterado</p>
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                CPF/CNPJ
              </span>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className={`w-full pl-9 pr-4 py-2 border ${errors.cpf_cnpj ? 'border-red-300' : 'border-slate-200'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {errors.cpf_cnpj && (
                <p className="text-red-500 text-xs mt-1">{errors.cpf_cnpj}</p>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label className="floating-label">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Telefone
              </span>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={`w-full pl-9 pr-4 py-2 border ${errors.phone_number ? 'border-red-300' : 'border-slate-200'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.phone_number && (
                <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
              )}
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

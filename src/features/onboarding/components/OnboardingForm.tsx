import React, { useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { viaCepService, type ViaCepResponse } from '../services/viacep.service';
import { onboardingService, type CompleteOnboardingRequest } from '../services/onboarding.service';

interface FormData {
  // Account
  name: string;
  cpf_cnpj: string;
  phone_number: string;
  birth: string;
  // Address
  postal_code: string;
  street: string;
  house_number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  country: string;
  no_house_number: boolean;
}

export const OnboardingForm: React.FC = () => {
  const { setNeedsOnboarding, checkOnboarding } = useOnboarding();
  const { user, account, updateSubscriptionStatus } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: account?.name || '',
    cpf_cnpj: account?.cpf_cnpj || '',
    phone_number: account?.phone_number || '',
    birth: account?.birth || '',
    postal_code: '',
    street: '',
    house_number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    country: 'Brasil',
    no_house_number: false,
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');

    // Format CEP as XXXXX-XXX
    let formattedCep = cleanCep;
    if (cleanCep.length > 5) {
      formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
    }

    setFormData(prev => ({ ...prev, postal_code: formattedCep }));

    if (cleanCep.length === 8) {
      try {
        setIsLoadingCep(true);
        setErrors(prev => ({ ...prev, postal_code: '' }));

        const address: ViaCepResponse = await viaCepService.buscarCep(cleanCep);

        setFormData(prev => ({
          ...prev,
          street: address.logradouro || '',
          neighborhood: address.bairro || '',
          city: address.localidade || '',
          state: address.uf || '',
          complement: address.complemento || '',
        }));
      } catch (error) {
        setErrors(prev => ({ ...prev, postal_code: 'CEP não encontrado' }));
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      // (XX) XXXX-XXXX
      return cleaned
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // (XX) XXXXX-XXXX
      return cleaned
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatCpfCnpj = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      // CPF: XXX.XXX.XXX-XX
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      handleInputChange('phone_number', cleaned);
    }
  };

  const handleCpfCnpjChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      handleInputChange('cpf_cnpj', cleaned);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';

    const cpfCnpj = formData.cpf_cnpj.replace(/\D/g, '');
    if (!cpfCnpj) {
      newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
    } else if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
      newErrors.cpf_cnpj = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Telefone é obrigatório';
    }

    if (!formData.birth.trim()) {
      newErrors.birth = 'Data de nascimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanCep = formData.postal_code.replace(/\D/g, '');
    if (!cleanCep) {
      newErrors.postal_code = 'CEP é obrigatório';
    } else if (cleanCep.length !== 8) {
      newErrors.postal_code = 'CEP deve ter 8 dígitos';
    }

    if (!formData.street.trim()) newErrors.street = 'Logradouro é obrigatório';
    if (!formData.no_house_number && !formData.house_number.trim()) {
      newErrors.house_number = 'Número é obrigatório ou marque "Sem número"';
    }
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    if (!user || !account) {
      alert('Erro: dados do usuário não encontrados');
      return;
    }

    try {
      setIsSubmitting(true);

      const data: CompleteOnboardingRequest = {
        account_user_id: user.id,
        account_id: account.id,
        name: formData.name,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        phone_number: formData.phone_number.replace(/\D/g, ''), // Remove formatting
        birth: formData.birth,
        postal_code: formData.postal_code.replace(/\D/g, ''), // Remove hyphen
        street: formData.street,
        house_number: formData.no_house_number ? undefined : formData.house_number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        complement: formData.complement,
        country: formData.country,
      };

      await onboardingService.completeOnboarding(data);

      // Update auth context
      await updateSubscriptionStatus();

      // Update onboarding status
      setNeedsOnboarding(false);
      await checkOnboarding();
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      alert(error.response?.data?.message || 'Erro ao completar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Dados Pessoais</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full transition-all ${currentStep >= 2 ? 'bg-primary w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Endereço</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Dados Pessoais</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome Completo *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
              />
              {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">CPF/CNPJ *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.cpf_cnpj ? 'input-error' : ''}`}
                value={formatCpfCnpj(formData.cpf_cnpj)}
                onChange={(e) => handleCpfCnpjChange(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
              />
              {errors.cpf_cnpj && <span className="text-error text-sm mt-1">{errors.cpf_cnpj}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Telefone *</span>
              </label>
              <input
                type="tel"
                className={`input input-bordered w-full ${errors.phone_number ? 'input-error' : ''}`}
                value={formatPhone(formData.phone_number)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              {errors.phone_number && <span className="text-error text-sm mt-1">{errors.phone_number}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Data de Nascimento *</span>
              </label>
              <input
                type="date"
                className={`input input-bordered w-full ${errors.birth ? 'input-error' : ''}`}
                value={formData.birth}
                onChange={(e) => handleInputChange('birth', e.target.value)}
              />
              {errors.birth && <span className="text-error text-sm mt-1">{errors.birth}</span>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Endereço</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">CEP *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.postal_code ? 'input-error' : ''}`}
                value={formData.postal_code}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {isLoadingCep && <span className="text-sm text-gray-500 mt-1">Buscando CEP...</span>}
              {errors.postal_code && <span className="text-error text-sm mt-1">{errors.postal_code}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Logradouro *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.street ? 'input-error' : ''}`}
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
              {errors.street && <span className="text-error text-sm mt-1">{errors.street}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Número *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.house_number ? 'input-error' : ''}`}
                value={formData.house_number}
                onChange={(e) => handleInputChange('house_number', e.target.value)}
                placeholder="123"
                disabled={formData.no_house_number}
              />
              <label className="label cursor-pointer justify-start mt-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mr-2"
                  checked={formData.no_house_number}
                  onChange={(e) => handleInputChange('no_house_number', e.target.checked)}
                />
                <span className="label-text">Sem número</span>
              </label>
              {errors.house_number && <span className="text-error text-sm mt-1">{errors.house_number}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Bairro *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.neighborhood ? 'input-error' : ''}`}
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="Bairro"
              />
              {errors.neighborhood && <span className="text-error text-sm mt-1">{errors.neighborhood}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cidade *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cidade"
                />
                {errors.city && <span className="text-error text-sm mt-1">{errors.city}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Estado *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.state ? 'input-error' : ''}`}
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
                {errors.state && <span className="text-error text-sm mt-1">{errors.state}</span>}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Complemento</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, CreditCard, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { viaCepService, type ViaCepResponse } from '@/features/onboarding/services/viacep.service';
import { customer_service } from '../services/customer.service';
import { UtilsService } from '@/utils/utils_service';
import { CustomerModel, type CustomerType, CustomerAddressEntity } from '../types/customer.model';
import { AlertModal, type AlertType } from '@/components/AlertModal';
import { Button, Loader } from '@/components/ui';

interface CustomerFormData {
  name: string;
  type: CustomerType;
  document: string;
  email: string;
  phone: string;
  gender: string;
  age: string;

  // Address
  postal_code: string;
  street: string;
  house_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { account } = useAuth();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    type: 'PERSON',
    document: '',
    email: '',
    phone: '',
    gender: '',
    postal_code: '',
    street: '',
    house_number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    age: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as AlertType,
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentChange = (value: string) => {
    const formatted = UtilsService.formatCpfCnpj(value);
    if (formatted.length <= 18) {
      handleInputChange('document', formatted);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = UtilsService.formatPhone(value);
    if (formatted.length <= 15) {
      handleInputChange('phone', formatted);
    }
  };

  const handleCepChange = async (value: string) => {
    const formatted = UtilsService.formatCep(value);
    if (formatted.length <= 9) {
      handleInputChange('postal_code', formatted);

      const cleanCep = UtilsService.unformat(formatted);
      if (cleanCep.length === 8) {
        setIsLoadingCep(true);
        try {
          const address: ViaCepResponse = await viaCepService.buscarCep(cleanCep);
          setFormData(prev => ({
            ...prev,
            street: address.logradouro || '',
            neighborhood: address.bairro || '',
            city: address.localidade || '',
            state: address.uf || '',
            complement: address.complemento || prev.complement,
          }));
          setErrors(prev => ({ ...prev, postal_code: '' }));
        } catch (error) {
          setErrors(prev => ({ ...prev, postal_code: 'CEP não encontrado' }));
        } finally {
          setIsLoadingCep(false);
        }
      }
    }
  };

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const customer = await customer_service.getCustomerById(id);
          setFormData({
            name: customer.name,
            type: customer.type,
            document: UtilsService.formatCpfCnpj(customer.document),
            email: customer.email,
            phone: UtilsService.formatPhone(customer.phone || ''),
            gender: customer.gender || '',
            age: customer.age ? customer.age.toString() : '',
            postal_code: UtilsService.formatCep(customer.address?.postal_code || ''),
            street: customer.address?.street || '',
            house_number: customer.address?.house_number ? customer.address.house_number.toString() : '',
            complement: customer.address?.complement || '',
            neighborhood: customer.address?.neighborhood || '',
            city: customer.address?.city || '',
            state: customer.address?.state || '',
          });
        } catch (error) {
          console.error('Error fetching customer:', error);
          showAlert('Erro ao carregar cliente', 'Não foi possível carregar os dados do cliente.', 'error');
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleAgeChange = (value: string) => {
    const formatted = UtilsService.formatAge(value);
    if (formatted.length <= 3) {
      handleInputChange('age', formatted);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.document.trim()) newErrors.document = 'CPF/CNPJ é obrigatório';

    // Basic validation for document length
    const cleanDoc = UtilsService.unformat(formData.document);
    if (formData.type === 'PERSON' && cleanDoc.length !== 11) newErrors.document = 'CPF inválido';
    if (formData.type === 'COMPANY' && cleanDoc.length !== 14) newErrors.document = 'CNPJ inválido';

    if (!formData.postal_code.trim()) newErrors.postal_code = 'CEP é obrigatório';
    if (!formData.street.trim()) newErrors.street = 'Rua é obrigatória';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
    if (!formData.age && (Number(formData.age) < 0 || Number(formData.age) > 120)) newErrors.age = 'Idade inválida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !account) return;

    setIsSubmitting(true);
    try {
      const customerData = new CustomerModel();
      customerData.name = formData.name;
      customerData.type = formData.type;
      customerData.document = UtilsService.unformat(formData.document);
      customerData.email = formData.email;
      customerData.phone = UtilsService.unformat(formData.phone);
      customerData.gender = formData.gender;
      customerData.age = Number(UtilsService.formatAge(formData.age));

      // Address
      const address = new CustomerAddressEntity();
      address.postal_code = UtilsService.unformat(formData.postal_code);
      address.street = formData.street;
      address.house_number = Number(formData.house_number) || 0;
      address.complement = formData.complement;
      address.neighborhood = formData.neighborhood;
      address.city = formData.city;
      address.state = formData.state;
      address.country = 'Brasil';

      customerData.address = address;

      if (id) {
        await customer_service.updateCustomer(id, customerData);
      } else {
        await customer_service.createCustomer(account.id, customerData);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      showAlert('Erro ao salvar cliente', 'Verifique os dados e tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto pb-10">
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="back"
          onClick={() => navigate('/customers')}
          icon={<ArrowLeft className="w-5 h-5 text-slate-600" />}
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{id ? 'Editar Cliente' : 'Novo Cliente'}</h1>
          <p className="text-slate-500 text-sm">{id ? 'Atualize as informações do cliente.' : 'Preencha as informações para cadastrar um novo cliente.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dados do Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-800">Dados do Cliente</h2>
            </div>

            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-500 uppercase">Nome Completo / Razão Social *</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Tipo de Pessoa</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as CustomerType)}
                  >
                    <option value="PERSON">Pessoa Física</option>
                    <option value="COMPANY">Pessoa Jurídica</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">CPF / CNPJ *</span>
                  </label>
                  <input
                    type="text"
                    placeholder={formData.type === 'PERSON' ? "000.000.000-00" : "00.000.000/0000-00"}
                    className={`input input-bordered w-full ${errors.document ? 'input-error' : ''}`}
                    value={formData.document}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                  />
                  {errors.document && <span className="text-error text-xs mt-1">{errors.document}</span>}
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-500 uppercase">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Telefone / Whatsapp</span>
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className="input input-bordered w-full"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Idade</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Idade"
                    className="input input-bordered w-full"
                    value={formData.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Gênero</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-800">Endereço</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">CEP *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      className={`input input-bordered w-full pr-10 ${errors.postal_code ? 'input-error' : ''}`}
                      value={formData.postal_code}
                      onChange={(e) => handleCepChange(e.target.value)}
                    />
                    <div className="absolute right-3 top-3 text-slate-400">
                      {isLoadingCep ? (
                        <Loader size="xs" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  {errors.postal_code && <span className="text-error text-xs mt-1">{errors.postal_code}</span>}
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Rua / Logradouro *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.street ? 'input-error' : ''}`}
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                  />
                  {errors.street && <span className="text-error text-xs mt-1">{errors.street}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Número (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.house_number ? 'input-error' : ''}`}
                    value={formData.house_number}
                    onChange={(e) => handleInputChange('house_number', e.target.value)}
                  />
                  {errors.house_number && <span className="text-error text-xs mt-1">{errors.house_number}</span>}
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Complemento</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Apto, Sala, Bloco..."
                    className="input input-bordered w-full"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Bairro *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.neighborhood ? 'input-error' : ''}`}
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  />
                  {errors.neighborhood && <span className="text-error text-xs mt-1">{errors.neighborhood}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Cidade *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                  {errors.city && <span className="text-error text-xs mt-1">{errors.city}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-slate-500 uppercase">Estado *</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.state ? 'input-error' : ''}`}
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                  {errors.state && <span className="text-error text-xs mt-1">{errors.state}</span>}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="font-bold text-slate-800 text-sm uppercase mb-6">Resumo do Cadastro</h2>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Nome</p>
                  <p className="text-sm text-slate-800 font-semibold">{formData.name || '-'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Documento</p>
                  <p className="text-sm text-slate-800 font-semibold">{formData.document || '-'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Localização</p>
                  <p className="text-sm text-slate-800 font-semibold">
                    {formData.city && formData.state ? `${formData.city} - ${formData.state}` : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                icon={<Save className="w-4 h-4" />}
                className="w-full"
              >
                Salvar Cliente
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate('/customers')}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerForm;

import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { userApi } from '../../../services/userApi';
import { phoneMask, removeMask } from '../../../utils/masks';
import { validateEmail, validateFullName, validatePhone } from '../../../utils/validations';
import { AccountInfoSection } from '../components/AccountInfoSection';
import { Button } from '@/components/ui';

export const ProfilePage: React.FC = () => {
  const { user, refreshToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync avatar preview and form data when user changes
  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || null);
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const masked = phoneMask(value);
    handleInputChange('phone_number', masked);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Por favor, selecione uma imagem válida' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'A imagem deve ter no máximo 5MB' }));
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear avatar error
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    const fullName = `${formData.name} ${formData.lastname}`.trim();
    if (!validateFullName(fullName)) {
      newErrors.name = 'Por favor, insira nome e sobrenome';
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, insira um email válido';
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
      if (user?.id) {
        let response;

        // If there's a new avatar, upload it with the user data
        if (selectedFile) {
          response = await userApi.uploadAvatar(user.id, selectedFile);
          setSelectedFile(null);

          // Update avatar preview immediately with the response
          if (response.avatar) {
            setAvatarPreview(response.avatar);
          }
        }

        // Update user data (if not already updated with avatar)
        if (!selectedFile || formData.name !== user.name || formData.lastname !== user.lastname ||
          formData.email !== user.email || removeMask(formData.phone_number || '') !== user.phone_number) {
          response = await userApi.updateUser({
            id: user.id,
            name: formData.name,
            lastname: formData.lastname,
            email: formData.email,
            phone_number: formData.phone_number ? removeMask(formData.phone_number) : undefined,
          });
        }

        setSuccessMessage('Perfil atualizado com sucesso!');

        // Refresh user data
        await refreshToken();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <img
            key={avatarPreview || 'default'}
            src={avatarPreview || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || 'User') + "&size=100&background=3b82f6&color=fff"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || 'User') + "&size=100&background=3b82f6&color=fff";
            }}
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name} {user?.lastname}</h2>
          <p className="text-slate-500 text-sm capitalize">{user?.type?.toLowerCase()}</p>
          <Button
            onClick={handleAvatarClick}
            variant="back"
            size="sm"
            icon={<Camera className="w-4 h-4" />}
            className="text-xs font-semibold mt-1"
          >
            Alterar foto
          </Button>
          {errors.avatar && (
            <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
          )}
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
                Nome
              </span>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
                Sobrenome
              </span>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => handleInputChange('lastname', e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className='floating-label'>
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Email
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
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>

      {/* Account Information Section - Only for Admin/Owner */}
      <AccountInfoSection />
    </div>
  );
};

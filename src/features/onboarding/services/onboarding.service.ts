import { server } from '../../../services/api';

export interface OnboardingStatusResponse {
  needsOnboarding: boolean;
  hasAccountData: boolean;
  hasAddressData: boolean;
  firstAccess: boolean;
}

export interface CompleteOnboardingRequest {
  account_user_id: string;
  account_id: string;
  // Account fields
  name: string;
  cpf_cnpj: string;
  phone_number: string;
  birth: string;
  // Address fields
  street: string;
  house_number?: string;
  neighborhood: string;
  postal_code: string;
  state: string;
  complement?: string;
  city: string;
  country: string;
}

class OnboardingService {
  async checkOnboardingStatus(): Promise<OnboardingStatusResponse> {
    const response = await server.api.get<OnboardingStatusResponse>(`/onboarding/status`);
    return response.data;
  }

  async completeOnboarding(data: CompleteOnboardingRequest): Promise<{ message: string }> {
    const response = await server.api.post<{ message: string }>(`/onboarding/complete`, data);
    return response.data;
  }
}

export const onboardingService = new OnboardingService();

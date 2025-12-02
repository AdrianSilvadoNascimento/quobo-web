import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './features/onboarding/contexts/OnboardingContext';
import { OnboardingGuard } from './features/onboarding/components/OnboardingGuard';
import { Router } from './routes/Router';

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OnboardingProvider>
            <OnboardingGuard>
              <Router />
            </OnboardingGuard>
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

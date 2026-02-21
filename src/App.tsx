import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './features/onboarding/contexts/OnboardingContext';
import { OnboardingGuard } from './features/onboarding/components/OnboardingGuard';
import { Router } from './routes/Router';
import { useRealtimeSocket } from './hooks/useRealtimeSocket';
import { Toaster } from 'sonner';

/**
 * Componente que inicia a conexão WebSocket assim que o usuário está autenticado.
 * Deve ficar dentro do AuthProvider para ter acesso ao contexto de autenticação.
 */
const RealtimeSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealtimeSocket();
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeSocketProvider>
          <OnboardingProvider>
            <OnboardingGuard>
              <Router />
              <Toaster position="top-right" richColors />
            </OnboardingGuard>
          </OnboardingProvider>
        </RealtimeSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

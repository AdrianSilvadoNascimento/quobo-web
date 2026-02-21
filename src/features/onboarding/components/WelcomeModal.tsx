import React from 'react';
import { OnboardingForm } from './OnboardingForm';
import { Button } from '@/components/ui';

export const WelcomeModal: React.FC = () => {
  const [showWelcome, setShowWelcome] = React.useState(true);

  if (!showWelcome) {
    return (
      <>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40" />
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl relative z-50">
            <h2 className="text-2xl font-bold mb-4">Complete seu Cadastro</h2>
            <OnboardingForm />
          </div>
        </dialog>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40" />
      <dialog open className="modal modal-open">
        <div className="modal-box max-w-2xl relative z-50">
          <h1 className="text-3xl font-bold mb-4">Bem-vindo à <span className="bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] text-transparent bg-clip-text">Quobo</span> 🎉</h1>

          <p className="text-lg mb-6">
            Estamos felizes em tê-lo(a) conosco! Para começar a utilizar nossa plataforma,
            precisamos de algumas informações importantes.
          </p>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Vamos completar seu cadastro em 2 etapas:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <div>
                  <strong>Etapa 1:</strong> Dados Pessoais
                  <p className="text-sm text-gray-600">Nome, CPF/CNPJ, telefone e data de nascimento</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <div>
                  <strong>Etapa 2:</strong> Endereço
                  <p className="text-sm text-gray-600">Endereço completo</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Você está em período de teste de 7 dias. Aproveite todos os recursos!</span>
          </div>

          <div className="modal-action">
            <Button
              onClick={() => setShowWelcome(false)}
              size="lg"
              className="w-full"
            >
              Começar Cadastro
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
};

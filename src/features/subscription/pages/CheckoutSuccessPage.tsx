import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Verificar status da sessão
    fetch(`/api/v2/checkout/session/${sessionId}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.payment_status === 'paid') {
          setStatus('success');
          // Redirecionar para dashboard após 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [sessionId, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processando pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto confirmamos sua assinatura</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Erro no pagamento</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível processar seu pagamento. Por favor, tente novamente.
          </p>
          <button
            onClick={() => navigate('/plans')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Voltar para Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>

        <p className="text-gray-600 mb-6">
          Sua assinatura foi ativada com sucesso. Você já pode aproveitar todos os
          recursos do seu plano.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Você receberá um email de confirmação em breve com todos os detalhes da
            sua assinatura.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Redirecionando para o dashboard em 3 segundos...
        </p>
      </div>
    </div>
  );
};

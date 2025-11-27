export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

class ViaCepService {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async buscarCep(cep: string): Promise<ViaCepResponse> {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }

    const response = await fetch(`${this.baseUrl}/${cepLimpo}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  }
}

export const viaCepService = new ViaCepService();

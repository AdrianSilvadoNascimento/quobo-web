import { server } from "@/services/api";

import type { PaginatedResponse } from "./paginated_response.model";

export class UtilsService {
  static async requestPaginated<T>(
    endpoint: string,
    next: number,
    limit: number,
  ): Promise<PaginatedResponse<T>> {
    try {
      const url = `/${endpoint}/paginated?page=${next}&limit=${limit}`
      const response = await server.api.get(
        url,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (![200, 201].includes(response.status)) throw new Error('Erro ao buscar dados');

      const data = await response.data;
      return {
        data: data.data,
        total: data.total,
        next: data.next,
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static sanitizeDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  static unformat(value: string): string {
    return value.replace(/\D/g, '');
  }

  static formatAge(value: string): string {
    const cleaned = this.unformat(value);
    return cleaned.replace(/\D/g, '');
  }

  static formatPhone(value: string): string {
    const cleaned = this.unformat(value);
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
  }

  static formatCpfCnpj(value: string): string {
    const cleaned = this.unformat(value);
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
  }

  static formatCep(value: string): string {
    const cleaned = this.unformat(value);
    return cleaned.replace(/^(\d{5})(\d)/, '$1-$2');
  }
}

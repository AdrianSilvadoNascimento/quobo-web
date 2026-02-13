import { server } from '../../../services/api';
import type { ImportType } from '../hooks/useImportSocket';

export interface ImportResponse {
  message: string;
  jobId: string;
  total: number;
  type: ImportType;
}

export interface ImportJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: ImportType;
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: any[];
  createdAt: string;
  completedAt?: string;
}

class ImportService {
  private readonly basePath = '/import';

  /**
   * Upload and import Excel file
   */
  async import(type: ImportType, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await server.api.post<ImportResponse>(
      `${this.basePath}/${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Get import job status
   */
  async getStatus(jobId: string): Promise<ImportJobStatus> {
    const response = await server.api.get<ImportJobStatus>(
      `${this.basePath}/status/${jobId}`
    );
    return response.data;
  }

  /**
   * Cancel an import job
   */
  async cancel(jobId: string): Promise<{ message: string; jobId: string }> {
    const response = await server.api.post<{ message: string; jobId: string }>(
      `${this.basePath}/cancel/${jobId}`
    );
    return response.data;
  }

  /**
   * Get import history
   */
  async getHistory(): Promise<ImportJobStatus[]> {
    const response = await server.api.get<ImportJobStatus[]>(
      `${this.basePath}/history`
    );
    return response.data;
  }

  /**
   * Download import template
   */
  async downloadTemplate(type: ImportType): Promise<void> {
    const response = await server.api.get(`${this.basePath}/template/${type}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template_importacao_${type}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const importService = new ImportService();

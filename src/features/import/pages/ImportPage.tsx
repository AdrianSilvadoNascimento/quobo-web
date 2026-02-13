import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileSpreadsheet,
  Package,
  FolderTree,
  Users,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import { importService } from '../services/import.service';
import {
  useImportSocket,
  type ImportType,
  type ImportCompletedEvent,
} from '../hooks/useImportSocket';
import { Button } from '@/components/ui';

const IMPORT_TYPE_OPTIONS: { value: ImportType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'full',
    label: 'Completa',
    description: 'Categorias + Produtos + Clientes',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    value: 'items',
    label: 'Produtos',
    description: 'Importar somente produtos',
    icon: <Package className="w-4 h-4" />,
  },
  {
    value: 'categories',
    label: 'Categorias',
    description: 'Importar somente categorias',
    icon: <FolderTree className="w-4 h-4" />,
  },
  {
    value: 'customers',
    label: 'Clientes',
    description: 'Importar somente clientes',
    icon: <Users className="w-4 h-4" />,
  },
];

export const ImportPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ImportType>('full');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentJob,
    completedJobs,
    isRestoringJob,
    onCompleted,
    onFailed,
    dismissActiveJob,
    startJob,
  } = useImportSocket();

  // Sync tab with active job type
  useEffect(() => {
    if (currentJob?.type) {
      setSelectedType(currentJob.type);
    }
  }, [currentJob?.type]);

  // Register callbacks
  useEffect(() => {
    onCompleted((event: ImportCompletedEvent) => {
      const parts: string[] = [];
      if (event.success > 0) parts.push(`${event.success} importados`);
      if (event.skipped > 0) parts.push(`${event.skipped} duplicados`);
      if (event.failed > 0) parts.push(`${event.failed} erros`);
      const msg = `Importação concluída: ${parts.join(', ')}`;
      if (event.failed > 0) {
        toast.warning(msg);
      } else {
        toast.success(msg);
      }
      setFile(null);
    });

    onFailed((event) => {
      toast.error(`Falha na importação: ${event.error}`);
      setFile(null);
    });
  }, [onCompleted, onFailed]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  }, []);

  const validateAndSetFile = (f: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(f.type)) {
      setUploadError('Formato inválido. Aceito apenas: .xlsx, .xls, .csv');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Limite: 10MB');
      return;
    }

    setUploadError(null);
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await importService.import(selectedType, file);
      // Immediately show progress bar (don't wait for WebSocket)
      startJob(response.jobId, selectedType, response.total);
      toast.info(`Importação iniciada: ${response.total} registros`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao iniciar importação';
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await importService.downloadTemplate(selectedType);
      toast.success('Template baixado com sucesso!');
    } catch {
      toast.error('Erro ao baixar template');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-800">Importar Dados</h1>
          </div>
          <p className="text-slate-500 text-sm">Importe seus dados via planilha Excel.</p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          size="sm"
          icon={<Download className="w-4 h-4" />}
          className="capitalize"
        >
          Baixar Template {selectedType}
        </Button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-100">
          <nav className="flex gap-4 px-6" aria-label="Tipo de importação">
            {IMPORT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                disabled={!!currentJob}
                className={`
                  cursor-pointer py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors
                  ${selectedType === option.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  ${currentJob ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-slate-500">
            {IMPORT_TYPE_OPTIONS.find(o => o.value === selectedType)?.description}
          </p>

          {/* Progress / Upload Area */}
          {isRestoringJob ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando importações em andamento...
            </div>
          ) : currentJob ? (
            <div className="space-y-4">
              {/* Processing state */}
              {(currentJob.status === 'queued' || currentJob.status === 'processing') && (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Processando importação...
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${currentJob.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{currentJob.processed} / {currentJob.total} registros</span>
                    <span>{currentJob.percentage}%</span>
                  </div>
                  {currentJob.currentEntity && (
                    <p className="text-xs text-slate-400">
                      Processando: {currentJob.currentEntity}
                    </p>
                  )}
                </>
              )}

              {/* Completed state */}
              {currentJob.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Importação concluída!
                    </div>
                    <Button
                      variant="back"
                      size="sm"
                      onClick={dismissActiveJob}
                      icon={<X className="w-4 h-4" />}
                    >
                      Fechar
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {(currentJob.processed - (currentJob.skipped || 0)) > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {currentJob.processed - (currentJob.skipped || 0)} importados
                      </span>
                    )}
                    {(currentJob.skipped || 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {currentJob.skipped} duplicados (ignorados)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full w-full" />
                  </div>
                </div>
              )}

              {/* Failed state */}
              {currentJob.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                      <AlertCircle className="w-5 h-5" />
                      Falha na importação
                    </div>
                    <Button
                      variant="back"
                      size="sm"
                      onClick={dismissActiveJob}
                      icon={<X className="w-4 h-4" />}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              )}

              {/* Errors (shown in all states) */}
              {currentJob.errors.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {currentJob.errors.length} erros encontrados
                </div>
              )}
            </div>
          ) : (
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : file
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <FileSpreadsheet className="w-10 h-10 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    className="ml-4 p-1 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="w-10 h-10 text-slate-400" />
                  <p className="text-sm text-slate-600 font-medium">
                    Arraste sua planilha aqui ou clique para selecionar
                  </p>
                  <span className="text-xs text-slate-400">
                    Formatos aceitos: .xlsx, .xls, .csv (máx. 10MB)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {uploadError}
            </div>
          )}


          {/* Upload Button */}
          {file && !currentJob && (
            <Button
              variant='primary'
              className="transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={isUploading}
              isLoading={isUploading}
              icon={<FileUp className="w-4 h-4" />}
            >
              Iniciar Importação
            </Button>
          )}
        </div>
      </div>

      {/* Recent Imports */}
      {completedJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Importações Recentes</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {completedJobs.map((job) => (
              <div key={job.jobId} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {job.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(job.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {job.success}
                  </span>
                  {job.failed > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" /> {job.failed}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{formatDuration(job.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;

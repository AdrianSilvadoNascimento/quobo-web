import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { server } from '@/services/api';
import { Scale, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';

interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation?: string;
  active: boolean;
  low_stock_threshold: number;
  is_global: boolean;
  account_id: string | null;
}

export const UnitOfMeasureSettingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const canEdit = isAdmin;

  const fetchUnits = async () => {
    try {
      const response = await server.api.get('/unit-of-measure');
      setUnits(response.data);
    } catch (error) {
      toast.error('Erro ao buscar unidades de medida');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleEditClick = (unit: UnitOfMeasure) => {
    if (!canEdit) return;
    setEditingId(unit.id);
    setEditValue(unit.low_stock_threshold);
  };

  const handleSave = async (unit: UnitOfMeasure) => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await server.api.put(`/unit-of-measure/${unit.id}`, {
        name: unit.name,
        abbreviation: unit.abbreviation,
        active: unit.active,
        low_stock_threshold: editValue,
      });
      toast.success('Unidade de medida atualizada');
      setEditingId(null);
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar unidade de medida');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-800">Unidades de Medida</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as unidades utilizadas no sistema e personalize a quantidade mínima para alerta de estoque.
        </p>
      </div>

      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold block mb-1">Permissão Restrita</span>
            Apenas o Proprietário ou Administradores podem alterar os limites mínimos de estoque.
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {units.map((unit) => (
          <div
            key={unit.id}
            className={`
              p-5 rounded-2xl border transition-all duration-200
              ${unit.is_global ? 'bg-white border-slate-200 shadow-sm hover:shadow' : 'bg-brand-50/30 border-brand-100 shadow-sm hover:border-brand-300'}
            `}
          >
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${unit.is_global ? 'bg-slate-100 text-slate-600' : 'bg-brand-100 text-brand-700'}`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {unit.name}
                    {unit.abbreviation && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {unit.abbreviation}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {unit.is_global ? 'Padrão do Sistema' : 'Personalizado para sua conta'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Estoque Mínimo
                  </div>
                  {editingId === unit.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-24 px-3 py-1.5 text-sm border border-brand-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        min="0"
                      />
                      <Button
                        onClick={() => handleSave(unit)}
                        disabled={saving}
                        isLoading={saving}
                        variant="primary"
                        size="sm"
                      >
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        disabled={saving}
                        variant="ghost"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-end">
                      <span className="font-medium text-slate-700">
                        {unit.low_stock_threshold} {unit.abbreviation || 'un'}
                      </span>
                      {canEdit && (
                        <Button
                          variant='ghost'
                          size="sm"
                          onClick={() => handleEditClick(unit)}
                          title="Editar Quatidade Mínima"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}

        {units.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nenhuma unidade de medida encontrada.
          </div>
        )}
      </div>

    </div>
  );
};

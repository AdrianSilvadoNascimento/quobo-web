import { Mail, MapPin, MoreVertical, Phone, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { CustomerModel } from "../types/customer.model";
import { UtilsService } from "@/utils/utils_service";
import { customer_service } from "../services/customer.service";
import { AlertModal, type AlertType } from "@/components/AlertModal";

export interface CustomerCardProps {
  customer: CustomerModel;
  onDelete?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as AlertType,
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    try {
      await customer_service.deleteCustomer(customer.id);
      showAlert('Cliente excluído', 'O cliente foi desativado com sucesso.', 'success');
      if (onDelete) {
        setTimeout(() => {
          onDelete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('Erro ao excluir', 'Não foi possível excluir o cliente.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#22B8E6] via-[#2563EB] to-[#1E40AF] rounded-full flex items-center justify-center text-white font-bold text-lg border border-brand-100">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{customer.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${customer.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} font-medium`}>
                {customer.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost rounded-full p-2.5 text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-5 h-5" />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-lg w-52 border border-slate-200">
              <li>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={isDeleting}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir cliente'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{customer.address?.city}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400">Cadastrado em {UtilsService.sanitizeDate(new Date(customer.created_at).toISOString())}</span>
          <button
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="btn btn-ghost text-brand-600 font-medium"
          >
            Ver detalhes
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Confirmar exclusão</h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja excluir <strong>{customer.name}</strong>? Esta ação irá desativar o cliente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CustomerCard;

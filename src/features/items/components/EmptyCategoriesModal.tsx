import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyCategoryModal: React.FC = () => {
  const navigate = useNavigate();

  const handleCloseModal = () => {
    navigate('/categories');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              Adicione uma categoria
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Antes de adicionar um produto, você precisa adicionar uma categoria.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Adicionar categoria
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmptyCategoryModal;

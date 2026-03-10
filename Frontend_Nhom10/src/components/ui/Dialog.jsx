import { X } from 'lucide-react';

export default function Dialog({ isOpen, onClose, children, title }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
                {title || "Dialog"}
            </h2>
            <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        {children}
      </div>
    </div>
  );
}

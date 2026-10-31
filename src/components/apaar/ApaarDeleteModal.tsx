import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { SyntheticStudent } from '../../services/apaarApi';

interface ApaarDeleteModalProps {
  student: SyntheticStudent;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const ApaarDeleteModal: React.FC<ApaarDeleteModalProps> = ({
  student,
  onConfirm,
  onClose
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Confirm Record Deletion
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete synthetic record:
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Record ID:</span>
              <span className="font-mono font-bold text-slate-800">{student.record_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-semibold text-slate-900">{student.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">APAAR ID:</span>
              <span className="font-mono text-indigo-700 font-bold">{student.apaar_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Institution:</span>
              <span className="text-slate-700 truncate max-w-[200px]">{student.institution_name}</span>
            </div>
          </div>

          <p className="text-[11px] text-rose-600 font-medium">
            This action cannot be undone and will affect live verification requests for this APAAR ID.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting...' : 'Delete Permanently'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../../UI/Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-raised border border-dim rounded-xl max-w-md w-full">
        {/* HEADER */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dim">
          <AlertTriangle
            className="w-4 h-4 text-err shrink-0"
            strokeWidth={1.5}
          />
          <h2 className="text-sm font-semibold text-hi">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="ml-auto text-lo hover:text-hi transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        {/* BODY */}
        <div className="px-5 py-5">
          <p className="text-sm font-medium text-hi mb-1">
            This action is permanent
          </p>
          <p className="font-mono text-xs text-lo leading-relaxed mb-6">
            Are you sure you want to delete this template?
            <br />
            All data associated with this ID will be permanently removed and
            cannot be recovered.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

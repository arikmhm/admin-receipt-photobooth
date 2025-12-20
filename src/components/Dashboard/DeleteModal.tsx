import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../UI/Button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] max-w-md w-full relative">
        
        {/* HEADER: WARNING STRIP */}
        <div className="bg-red-500 text-white p-4 border-b-4 border-black flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 fill-black text-white" strokeWidth={2.5} />
          <h2 className="text-2xl font-black uppercase tracking-wider">DANGER ZONE</h2>
        </div>

        {/* BODY */}
        <div className="p-6">
          <p className="font-bold text-lg mb-2">PERMANENT DELETION</p>
          <p className="font-mono text-sm text-gray-600 mb-6">
            Are you sure you want to delete this template? 
            <br/>
            This action cannot be undone. All data associated with this ID will be lost forever.
          </p>

          <div className="flex gap-4">
            <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 border-2"
                disabled={isDeleting}
            >
              <X className="w-4 h-4 mr-2 inline" /> CANCEL
            </Button>
            
            <Button 
                variant="destructive" 
                onClick={onConfirm} 
                className="flex-1 bg-red-600 hover:bg-red-700 border-2"
                disabled={isDeleting}
            >
              {isDeleting ? "DELETING..." : "CONFIRM DELETE"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
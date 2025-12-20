/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { templateService } from "../../services/templateService";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { DeleteModal } from "./DeleteModal"; // <--- Import Modal Baru
import { Plus, Trash2, Edit, Play, Calendar, LayoutTemplate } from "lucide-react";
import type { Template } from "../../types";

interface DashboardProps {
  onCreateNew: () => void;
  onEdit: (template: Template) => void;
  onRun: (template: Template) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onEdit, onRun }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE UNTUK MODAL DELETE ---
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // setIsLoading(true); // Opsional: matikan loading biar tidak flicker kalau refresh manual
    const data = await templateService.getAll();
    setTemplates(data);
    setIsLoading(false);
  };

  // 1. Trigger Modal
  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  // 2. Eksekusi Hapus (Real Action)
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
        await templateService.delete(deleteTargetId);
        
        // --- INSTANT UPDATE UI ---
        // Kita filter array secara lokal, jadi user langsung melihat hasilnya
        // tanpa harus menunggu 'loadData()' selesai mengambil ulang dari server.
        setTemplates((prev) => prev.filter((t) => t.id !== deleteTargetId));
        
        setDeleteTargetId(null); // Tutup modal
    } catch (error) {
        alert("Failed to delete. Check console.");
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-dot-pattern p-8 font-sans relative">
      
      {/* --- MODAL DI SINI --- */}
      <DeleteModal 
        isOpen={!!deleteTargetId} 
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-black pb-6 bg-white/50 backdrop-blur-sm p-4 border-4 shadow-neo-sm">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8" /> TEMPLATE ADMIN
            </h1>
          <p className="font-mono text-gray-500">Manage your booth layouts</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2 shadow-neo-hover">
          <Plus className="w-5 h-5" /> CREATE NEW
        </Button>
      </header>

      {/* CONTENT MAIN */}
      <main className="max-w-6xl mx-auto">
        
        {isLoading ? (
            <div className="text-center py-20 font-mono animate-pulse border-4 border-dashed border-gray-300 bg-white/50">
                CONNECTING TO CLOUD...
            </div>
        ) : templates.length === 0 ? (
            <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-lg bg-white">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">NO TEMPLATES FOUND</h2>
                <Button variant="outline" onClick={onCreateNew}>Start Creating</Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                <Card key={template.id} className="flex flex-col h-full hover:border-blue-500 transition-colors group">
                    
                    {/* PREVIEW THUMBNAIL (ASPECT RATIO FIXED) */}
                    <div className="aspect-[2/3] bg-gray-200 border-2 border-dashed border-gray-400 mb-4 overflow-hidden relative flex items-center justify-center">
                        <img 
                            src={template.backgroundData} 
                            className="w-full h-full object-cover object-top opacity-80 grayscale group-hover:grayscale-0 transition-all" 
                            alt="preview"
                        />
                        <div className="absolute bottom-2 right-2 bg-black text-white text-xs font-mono px-2 py-1 border border-white">
                            {template.slots.length} SLOTS
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="flex-1 mb-4">
                    <h3 className="text-xl font-bold uppercase truncate border-b-2 border-transparent group-hover:border-black transition-all inline-block" title={template.name}>
                        {template.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 font-mono text-xs mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                    <Button 
                        size="sm" variant="outline" className="flex-1 flex justify-center"
                        onClick={() => onEdit(template)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                        size="sm" variant="accent" className="flex-1 flex justify-center"
                        onClick={() => onRun(template)}
                    >
                        <Play className="w-4 h-4" />
                    </Button>
                    <Button 
                        size="sm" variant="destructive" 
                        // UBAH DI SINI: Panggil requestDelete, bukan handleDelete langsung
                        onClick={() => requestDelete(template.id)} 
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>

                </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};
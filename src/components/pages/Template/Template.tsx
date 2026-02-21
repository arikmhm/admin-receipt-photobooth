import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { templateService } from "../../../services/templateService";
import { CropperModal } from "./Creation/CropperModal";
import { Button } from "../../UI/Button";
import { Card } from "../../UI/Card";
import { Plus, Trash2, Edit, Play } from "lucide-react";
import type { Template } from "../../../types";
import { DeleteModal } from "../Dashboard/DeleteModal";

export const TemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tempBgImage, setTempBgImage] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await templateService.getAll();
    setTemplates(data);
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setTempBgImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = (base64: string) => {
    const newTemplate: Template = {
      id: "",
      name: "Untitled Template",
      createdAt: Date.now(),
      width: 576,
      height: 0,
      backgroundData: base64,
      slots: [],
    };
    setTempBgImage(null);
    navigate("/editor/new", { state: { template: newTemplate } });
  };

  const handleEdit = (template: Template) => {
    navigate(`/editor/${template.id}`, { state: { template } });
  };

  const handleRun = (template: Template) => {
    navigate(`/runner/${template.id}`, { state: { template } });
  };

  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await templateService.delete(deleteTargetId);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch {
      alert("Failed to delete. Check console.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 font-sans bg-surface-raised">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {tempBgImage && (
        <CropperModal
          imageSrc={tempBgImage}
          onCancel={() => setTempBgImage(null)}
          onComplete={handleCropComplete}
        />
      )}

      <DeleteModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* HEADER */}
      <header className="flex flex-col items-end justify-between gap-4 pb-5 mb-6 border-b md:flex-row border-dim">
        <div>
          <h1 className="text-xl font-semibold text-hi flex items-center gap-2.5">
            Templates
          </h1>
          <p className="font-mono text-xs text-lo mt-0.5">
            Manage your booth layouts
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> New Template
        </Button>
      </header>

      {/* CONTENT */}
      <main>
        {isLoading ? (
          <div className="py-20 font-mono text-center border border-dashed rounded-lg text-lo border-dim bg-surface">
            Connecting…
          </div>
        ) : templates.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-lg border-dim bg-surface">
            <h2 className="mb-4 text-sm font-medium text-lo">
              No templates yet
            </h2>
            <Button variant="outline" onClick={handleCreateNew}>
              Create first template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="flex flex-col h-full transition-colors hover:border-accent"
              >
                {/* PREVIEW THUMBNAIL */}
                <div className="aspect-[2/3] bg-surface-raised border border-dim overflow-hidden relative flex items-center justify-center mb-3">
                  <img
                    src={template.backgroundData}
                    className="object-cover object-top w-full h-full"
                    alt="preview"
                  />
                  {/* Slot overlays */}
                  {template.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="absolute border border-accent/60 bg-accent/10"
                      style={{
                        left: `${(slot.x / template.width) * 100}%`,
                        top: `${(slot.y / template.height) * 100}%`,
                        width: `${(slot.width / template.width) * 100}%`,
                        height: `${(slot.height / template.height) * 100}%`,
                        transform: slot.rotation
                          ? `rotate(${slot.rotation}deg)`
                          : undefined,
                      }}
                    />
                  ))}
                </div>

                {/* INFO */}
                <div className="flex-1 mb-3">
                  <h3
                    className="text-sm font-medium truncate text-hi"
                    title={template.name}
                  >
                    {template.name}
                  </h3>
                  <div className="mt-1.5">
                    <span className="bg-surface border border-dim text-lo font-mono text-[10px] px-1.5 py-0.5 rounded-sm">
                      {template.slots.length} slots
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-3 border-t border-dim">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex justify-center flex-1"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    className="flex justify-center flex-1"
                    onClick={() => handleRun(template)}
                  >
                    <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => requestDelete(template.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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

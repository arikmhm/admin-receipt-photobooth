import React, { useEffect, useState } from "react";
import { Button } from "../../UI/Button";
import { Card } from "../../UI/Card";
import { Input } from "../../UI/Input";
import {
  Monitor,
  Plus,
  Smartphone,
  Trash2,
  RefreshCw,
  Settings,
  X,
  Save,
} from "lucide-react";
import { kioskService } from "../../../services/kioskService";
import type { Kiosk } from "../../../types";
import { useToast } from "../../../contexts/ToastContext";

export const KioskManager: React.FC = () => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [priceBase, setPriceBase] = useState(25000);
  const [priceExtra, setPriceExtra] = useState(5000);
  const [priceDigital, setPriceDigital] = useState(10000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      const data = await kioskService.getAll();
      setKiosks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newName) {
      addToast("Kiosk Name is required!", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await kioskService.create({
        name: newName,
        priceBase,
        priceExtraPrint: priceExtra,
        priceDigitalCopy: priceDigital,
      });
      setIsCreating(false);
      setNewName("");
      setPriceBase(25000);
      setPriceExtra(5000);
      setPriceDigital(10000);
      addToast("Device created successfully", "success");
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create device";
      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingKiosk) return;
    setIsSubmitting(true);
    try {
      await kioskService.update(editingKiosk.id, {
        name: editingKiosk.name,
        priceBase: Number(editingKiosk.priceBase),
        priceExtraPrint: Number(editingKiosk.priceExtraPrint),
        priceDigitalCopy: Number(editingKiosk.priceDigitalCopy),
      });
      setEditingKiosk(null);
      addToast("Device updated successfully", "success");
      loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update device";
      addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm("ARE YOU SURE?\nThis device will be deactivated and deleted.")
    ) {
      await kioskService.delete(id);
      setKiosks((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleUnpair = async (id: string) => {
    if (confirm("DISCONNECT DEVICE?\nThe iPad will be logged out properly.")) {
      await kioskService.unpair(id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen p-6 pb-20 font-sans bg-surface-raised">
      {/* HEADER */}
      <header className="flex flex-col items-end justify-between gap-4 pb-5 mb-6 border-b border-dim md:flex-row">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-semibold text-hi">
            Manager
          </h1>
          <p className="font-mono text-xs text-lo mt-0.5">
            Manage pairing &amp; pricing for physical units
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="flex gap-1.5"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Device
        </Button>
      </header>

      {/* EDIT MODAL */}
      {editingKiosk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-surface-raised border-dim">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-dim">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-hi">
                <Settings className="w-4 h-4 text-accent" strokeWidth={1.5} />{" "}
                Edit Config
              </h3>
              <button
                onClick={() => setEditingKiosk(null)}
                className="transition-colors text-lo hover:text-hi"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium text-lo">
                  Kiosk Name
                </label>
                <Input
                  value={editingKiosk.name}
                  onChange={(e) =>
                    setEditingKiosk({ ...editingKiosk, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-lo">
                    Base Price
                  </label>
                  <Input
                    type="number"
                    value={editingKiosk.priceBase}
                    onChange={(e) =>
                      setEditingKiosk({
                        ...editingKiosk,
                        priceBase: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-lo">
                    Extra Print
                  </label>
                  <Input
                    type="number"
                    value={editingKiosk.priceExtraPrint}
                    onChange={(e) =>
                      setEditingKiosk({
                        ...editingKiosk,
                        priceExtraPrint: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-medium text-lo">
                    Soft Copy
                  </label>
                  <Input
                    type="number"
                    value={editingKiosk.priceDigitalCopy}
                    onChange={(e) =>
                      setEditingKiosk({
                        ...editingKiosk,
                        priceDigitalCopy: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-5 border-t border-dim">
              <Button variant="outline" onClick={() => setEditingKiosk(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="flex gap-1.5"
              >
                <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* FORM ADD NEW */}
      {isCreating && (
        <div className="mb-6">
          <Card className="border-accent/30 bg-surface-raised">
            <h3 className="flex items-center gap-2 mb-4 text-sm font-medium text-hi">
              <Smartphone className="w-4 h-4 text-accent" strokeWidth={1.5} />{" "}
              Setup New Kiosk
            </h3>
            <div className="grid items-end grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-1">
                <label className="block mb-1.5 text-xs font-medium text-lo">
                  Name / Location
                </label>
                <Input
                  placeholder="e.g. Mall Central Park"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-lo">
                  Base Price
                </label>
                <Input
                  type="number"
                  value={priceBase}
                  onChange={(e) => setPriceBase(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-lo">
                  Extra Print
                </label>
                <Input
                  type="number"
                  value={priceExtra}
                  onChange={(e) => setPriceExtra(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-lo">
                  Soft Copy
                </label>
                <Input
                  type="number"
                  value={priceDigital}
                  onChange={(e) => setPriceDigital(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Generate Code & Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
        <div className="py-20 font-mono text-xs text-center border border-dashed rounded-lg border-dim text-lo bg-surface">
          Loading devices…
        </div>
      )}

      {/* KIOSK LIST GRID */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kiosks.map((kiosk) => {
            const isPaired = !kiosk.pairingCode;
            return (
              <Card
                key={kiosk.id}
                className="relative flex flex-col h-full transition-colors group hover:border-accent/40"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 border rounded bg-surface-raised border-dim">
                    <Monitor className="w-4 h-4 text-lo" strokeWidth={1.5} />
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium font-mono rounded border flex items-center gap-1 ${
                      kiosk.isActive
                        ? "bg-ok/10 text-ok border-ok/25"
                        : "bg-err/10 text-err border-err/25"
                    }`}
                  >
                    {kiosk.isActive ? "Online" : "Offline"}
                  </span>
                </div>

                {/* INFO */}
                <div className="flex-1 mb-4">
                  <h3
                    className="text-sm font-semibold uppercase truncate text-hi"
                    title={kiosk.name}
                  >
                    {kiosk.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10px] text-lo">
                    ID: {kiosk.id.slice(0, 8)}…
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-3 mt-3 font-mono text-xs text-center border-t border-dim">
                    <div>
                      <div className="text-lo text-[9px] uppercase">Base</div>
                      <div className="font-medium text-hi">
                        {Number(kiosk.priceBase) / 1000}k
                      </div>
                    </div>
                    <div className="border-l border-dim">
                      <div className="text-lo text-[9px] uppercase">Xtra</div>
                      <div className="font-medium text-hi">
                        {Number(kiosk.priceExtraPrint) / 1000}k
                      </div>
                    </div>
                    <div className="border-l border-dim">
                      <div className="text-lo text-[9px] uppercase">Digi</div>
                      <div className="font-medium text-hi">
                        {Number(kiosk.priceDigitalCopy) / 1000}k
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAIRING STATUS */}
                <div className="relative p-4 mb-4 overflow-hidden text-center transition-colors border rounded-md bg-void border-dim group-hover:border-accent/30">
                  {isPaired ? (
                    <div className="flex flex-col items-center justify-center py-1 text-ok">
                      <Smartphone className="w-5 h-5 mb-1" strokeWidth={1.5} />
                      <span className="font-mono text-xs font-medium tracking-widest">
                        Device Paired
                      </span>
                      <span className="text-[10px] text-lo mt-0.5">
                        Secure Connection
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-lo text-[10px] font-mono mb-1">
                        Enter on iPad:
                      </p>
                      <p
                        className="text-2xl font-bold text-accent tracking-[0.2em] font-mono select-all cursor-pointer hover:text-[#1557B0] transition-colors"
                        title="Click to copy"
                        onClick={() =>
                          navigator.clipboard.writeText(kiosk.pairingCode || "")
                        }
                      >
                        {kiosk.pairingCode || "------"}
                      </p>
                    </>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-3 border-t border-dim">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    title="Edit Config"
                    onClick={() => setEditingKiosk(kiosk)}
                  >
                    <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUnpair(kiosk.id)}
                    title="Unpair Device"
                    disabled={!isPaired}
                  >
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(kiosk.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </Card>
            );
          })}
          {kiosks.length === 0 && !isCreating && (
            <div className="py-20 font-mono text-xs text-center border border-dashed rounded-lg text-lo border-dim col-span-full bg-surface">
              No devices registered. Click "Add Device" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Monitor, Plus, Server, Smartphone, Trash2, RefreshCw, Settings, X, Save } from 'lucide-react';
import { kioskService } from '../../services/kioskService';
import type { Kiosk } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export const KioskManager: React.FC = () => {
    const [kiosks, setKiosks] = useState<Kiosk[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- STATE CREATE ---
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [priceBase, setPriceBase] = useState(25000);
    const [priceExtra, setPriceExtra] = useState(5000);
    const [priceDigital, setPriceDigital] = useState(10000);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE EDIT ---
    const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);

    //  --- TOAST ---
    const { addToast } = useToast();

    // --- LOAD DATA ---
    const loadData = async () => {
        try {
            // setIsLoading(true); // Opsional: Matikan jika ingin silent refresh
            const data = await kioskService.getAll();
            setKiosks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- ACTIONS ---

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
                priceDigitalCopy: priceDigital
            });
            // Reset Form
            setIsCreating(false);
            setNewName("");
            setPriceBase(25000);
            setPriceExtra(5000);
            setPriceDigital(10000);
            addToast("Device created successfully", "success");
            loadData();
        } catch (error) {
            addToast("Failed to create device", "error");
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
                priceDigitalCopy: Number(editingKiosk.priceDigitalCopy)
            });
            setEditingKiosk(null);
            loadData();
        } catch (error) {
            alert("Failed to update kiosk");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("ARE YOU SURE?\nThis device will be deactivated and deleted.")) {
            await kioskService.delete(id);
            // Optimistic Update
            setKiosks(prev => prev.filter(k => k.id !== id));
        }
    };

    const handleUnpair = async (id: string) => {
        if(confirm("DISCONNECT DEVICE?\nThe iPad will be logged out properly.")) {
            await kioskService.unpair(id);
            loadData(); // Refresh untuk dapat pairing code baru
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 font-sans pb-20">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b-4 border-black pb-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <Server className="w-8 h-8" /> DEVICE MANAGER
                    </h1>
                    <p className="font-mono text-gray-500">Manage pairing & pricing for physical units</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="flex gap-2 shadow-neo-hover">
                    <Plus className="w-4 h-4" /> ADD NEW DEVICE
                </Button>
            </header>

            {/* --- MODAL EDIT (Muncul jika editingKiosk != null) --- */}
            {editingKiosk && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="max-w-lg w-full bg-white shadow-[8px_8px_0px_0px_rgba(255,255,0,1)] border-black">
                        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Settings className="w-6 h-6" /> EDIT CONFIG
                            </h3>
                            <button onClick={() => setEditingKiosk(null)}>
                                <X className="w-6 h-6 hover:text-red-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold block mb-1">KIOSK NAME</label>
                                <Input 
                                    value={editingKiosk.name} 
                                    onChange={(e) => setEditingKiosk({...editingKiosk, name: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1">BASE PRICE</label>
                                    <Input type="number" value={editingKiosk.priceBase} onChange={(e) => setEditingKiosk({...editingKiosk, priceBase: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">EXTRA PRINT</label>
                                    <Input type="number" value={editingKiosk.priceExtraPrint} onChange={(e) => setEditingKiosk({...editingKiosk, priceExtraPrint: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">SOFT COPY</label>
                                    <Input type="number" value={editingKiosk.priceDigitalCopy} onChange={(e) => setEditingKiosk({...editingKiosk, priceDigitalCopy: Number(e.target.value)})} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-8 border-t-2 border-black pt-4">
                            <Button variant="outline" onClick={() => setEditingKiosk(null)}>CANCEL</Button>
                            <Button onClick={handleUpdate} disabled={isSubmitting} className="flex gap-2">
                                <Save className="w-4 h-4" /> {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* FORM ADD NEW (Expanded) */}
            {isCreating && (
                <div className="mb-8 animate-in slide-in-from-top-4">
                    <Card className="bg-yellow-50 border-yellow-500 shadow-neo">
                        <h3 className="font-black mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5" /> SETUP NEW KIOSK
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold block mb-1">KIOSK NAME / LOCATION</label>
                                <Input 
                                    placeholder="Ex: Mall Central Park" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1 text-gray-500">BASE PRICE</label>
                                <Input type="number" value={priceBase} onChange={(e) => setPriceBase(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1 text-gray-500">+ EXTRA PRINT</label>
                                <Input type="number" value={priceExtra} onChange={(e) => setPriceExtra(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1 text-gray-500">+ SOFT COPY</label>
                                <Input type="number" value={priceDigital} onChange={(e) => setPriceDigital(Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreating(false)}>CANCEL</Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? "CREATING..." : "GENERATE CODE & SAVE"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
                 <div className="text-center py-20 font-mono animate-pulse border-4 border-dashed border-gray-300 bg-white/50">
                    LOADING DEVICES...
                </div>
            )}

            {/* KIOSK LIST GRID */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kiosks.map((kiosk) => {
                        // Logic: Jika pairingCode null, berarti Paired (Connected)
                        const isPaired = !kiosk.pairingCode; 

                        return (
                            <Card key={kiosk.id} className="relative group hover:border-blue-600 transition-all flex flex-col h-full bg-white">
                                
                                {/* HEADER */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-100 p-2 border-2 border-black rounded-sm">
                                        <Monitor className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`px-2 py-1 text-[10px] font-bold border border-black flex items-center gap-1 ${kiosk.isActive ? 'bg-green-300' : 'bg-red-300'}`}>
                                            {kiosk.isActive ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* INFO */}
                                <div className="mb-6 flex-1">
                                    <h3 className="text-xl font-black uppercase truncate" title={kiosk.name}>{kiosk.name}</h3>
                                    <p className="text-xs font-mono text-gray-400 mt-1">ID: {kiosk.id.slice(0,8)}...</p>
                                    
                                    {/* PRICING TABLE MINI */}
                                    <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs border-t-2 border-gray-100 pt-2">
                                        <div>
                                            <div className="text-gray-400 text-[9px]">BASE</div>
                                            <div className="font-bold">{(Number(kiosk.priceBase)/1000)}k</div>
                                        </div>
                                        <div className="border-l border-gray-200">
                                            <div className="text-gray-400 text-[9px]">XTRA</div>
                                            <div className="font-bold">{(Number(kiosk.priceExtraPrint)/1000)}k</div>
                                        </div>
                                        <div className="border-l border-gray-200">
                                            <div className="text-gray-400 text-[9px]">DIGI</div>
                                            <div className="font-bold">{(Number(kiosk.priceDigitalCopy)/1000)}k</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* PAIRING STATUS BOX */}
                                <div className="bg-gray-900 p-4 text-center border-2 border-gray-500 mb-4 relative overflow-hidden group-hover:border-blue-500 transition-colors">
                                    {isPaired ? (
                                        // STATE: PAIRED
                                        <div className="flex flex-col items-center justify-center text-green-400 py-1">
                                            <Smartphone className="w-6 h-6 mb-1" />
                                            <span className="font-mono text-sm font-bold tracking-widest">DEVICE PAIRED</span>
                                            <span className="text-[10px] text-gray-500">Secure Connection</span>
                                        </div>
                                    ) : (
                                        // STATE: WAITING FOR PAIR
                                        <>
                                            <p className="text-gray-400 text-[10px] font-mono mb-1 animate-pulse">ENTER CODE ON IPAD:</p>
                                            <p className="text-3xl font-black text-white tracking-[0.2em] font-mono select-all cursor-pointer" title="Click to copy" onClick={() => navigator.clipboard.writeText(kiosk.pairingCode || "")}>
                                                {kiosk.pairingCode || "------"}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* ACTIONS FOOTER */}
                                <div className="flex gap-2 border-t-2 border-gray-100 pt-3">
                                    <Button size="sm" variant="outline" className="flex-1" title="Edit Config" onClick={() => setEditingKiosk(kiosk)}>
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                    
                                    {/* Tombol Unpair: Hanya nyala jika Paired */}
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1" 
                                        onClick={() => handleUnpair(kiosk.id)} 
                                        title="Unpair Device"
                                        disabled={!isPaired} // Disable jika belum paired
                                    >
                                        <RefreshCw className={`w-4 h-4 ${!isPaired ? 'text-gray-300' : ''}`} />
                                    </Button>

                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(kiosk.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}

                    {kiosks.length === 0 && !isCreating && (
                        <div className="col-span-full text-center py-20 text-gray-400 font-mono border-4 border-dashed border-gray-300 bg-white/50">
                            NO DEVICES REGISTERED. CLICK "ADD NEW DEVICE".
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
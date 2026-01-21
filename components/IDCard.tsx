import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { StaffMember } from '../types';

interface IDCardProps {
    staff: StaffMember;
    onClose: () => void;
}

export const IDCard: React.FC<IDCardProps> = ({ staff, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (canvasRef.current) {
            const code = staff.loginBarcode || staff.id;
            QRCode.toCanvas(canvasRef.current, code, {
                width: 100,
                margin: 0,
                color: {
                    dark: '#0F172A',
                    light: '#FFFFFF'
                }
            }, (err) => {
                if (err) console.error("QR Generation Error:", err);
            });
        }
    }, [staff]);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            // Wait a slight delay for images to load if needed
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#0F172A'
            });

            canvas.toBlob((blob) => {
                if (!blob) {
                    alert("Card Generation Failed");
                    return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${(staff.name || 'STAFF').replace(/[^a-z0-9]/gi, '_').toUpperCase()}_ID.png`;
                link.href = url;
                document.body.appendChild(link); // Required for Firefox/some Chrome versions
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        } catch (e) {
            console.error("ID Generation failed", e);
            alert("Failed to generate ID Card.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 100));
            const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                // Web Share API requires a file object
                const file = new File([blob], `${staff.name.replace(/\s+/g, '_')}_ID.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `${staff.name} ID Card`,
                        text: 'Official Hop In Express ID Card'
                    });
                } else {
                    // Fallback to Download
                    handleDownload();
                    // Don't alert if we just triggered download, maybe just log or notify?
                    // But user clicked "Share", so an alert is helpful.
                    alert("Native sharing not available. Image downloaded instead.");
                }
            });
        } catch (e) {
            console.error(e);
            alert("Sharing failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="flex flex-col gap-8 items-center animate-in fade-in zoom-in duration-300">
                {/* The ID Card DOM Element */}
                <div ref={cardRef} className="w-[320px] h-[520px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-white border border-slate-700/50 select-none">
                    {/* Visual Elements */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

                    {/* Header */}
                    <div className="mt-10 text-center z-10">
                        <h1 className="font-black text-xl tracking-[0.2em] uppercase text-white drop-shadow-lg">HOP IN EXPRESS</h1>
                        <div className="flex items-center justify-center gap-2 mt-2 opacity-80">
                            <div className="h-[1px] w-8 bg-indigo-400"></div>
                            <p className="text-[9px] tracking-[0.3em] text-indigo-400 font-bold uppercase">COMMAND OS</p>
                            <div className="h-[1px] w-8 bg-indigo-400"></div>
                        </div>
                    </div>

                    {/* Photo Container */}
                    <div className="mt-8 z-10 relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                        <div className="w-36 h-36 rounded-3xl border-4 border-white/10 p-1 bg-white/5 shadow-2xl backdrop-blur-sm relative">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
                                {staff.photo ? (
                                    <img src={staff.photo} className="w-full h-full object-cover" crossOrigin="anonymous" alt="Staff" />
                                ) : (
                                    <span className="text-5xl">👤</span>
                                )}
                            </div>
                            {/* Status Indicator */}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center border-2 border-slate-700">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Staff Details */}
                    <div className="mt-6 text-center z-10 w-full px-6 flex-1 flex flex-col items-center">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-md line-clamp-2">{staff.name}</h2>
                        <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em]">{staff.role}</span>
                        </div>

                        <div className="mt-auto mb-4 w-full grid grid-cols-2 gap-2 text-[9px] uppercase tracking-widest text-slate-400 font-bold opacity-60">
                            <div className="text-right border-r border-slate-700 pr-2">ID: {staff.id.slice(0, 8)}</div>
                            <div className="text-left pl-2">V: 2026.1</div>
                        </div>
                    </div>

                    {/* Footer Section (White) */}
                    <div className="w-full bg-white h-32 mt-auto z-10 flex items-center justify-between px-8 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#0F172A] rotate-45 transform border-b border-r border-[#0F172A]"></div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AUTH SCAN</p>
                            <canvas ref={canvasRef} className="w-16 h-16"></canvas>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">SIGNATURE</p>
                            <div className="w-24 h-8 border-b-2 border-slate-200 flex items-end justify-end pb-1 opacity-50">
                                <span className="font-script text-slate-600 text-lg">Authorized</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-colors">
                        Close
                    </button>
                    <button onClick={handleDownload} disabled={isGenerating} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50">
                        {isGenerating ? 'Processing...' : 'Download ID'}
                    </button>
                    <button onClick={handleShare} disabled={isGenerating} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50">
                        Share
                    </button>
                </div>

                <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Secure ID Generation Module</p>
            </div>
        </div>
    );
};

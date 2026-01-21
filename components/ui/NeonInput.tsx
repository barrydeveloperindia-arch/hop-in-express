import React from 'react';
import { cn } from '../../lib/utils';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const NeonInput: React.FC<NeonInputProps> = ({ className, label, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "w-full bg-slate-950/50 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:shadow-neon disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    );
};

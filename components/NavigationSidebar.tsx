import React from 'react';
import { ViewType, UserRole } from '../types';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Landmark,
    FileText,
    Truck,
    LogOut,
    Bot,
    Info,
    HelpCircle,
    Menu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { EngLabsLogo } from '../App';
import { auth } from '../lib/firebase';

interface NavigationSidebarProps {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
    userRole: UserRole;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    roleLimit?: UserRole[];
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
    activeView,
    setActiveView,
    userRole,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) => {
    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'sales', label: 'Terminal Sales', icon: ShoppingCart },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'staff', label: 'Crew Management', icon: Users },
        { id: 'financials', label: 'Financials', icon: Landmark, roleLimit: ['Owner'] },
        { id: 'purchases', label: 'Procurement', icon: FileText, roleLimit: ['Owner', 'Manager'] },
        { id: 'suppliers', label: 'Supply Chain', icon: Truck, roleLimit: ['Owner', 'Manager'] },
        { id: 'smart-intake', label: 'AI Intake', icon: Bot, roleLimit: ['Owner'] },
    ];

    const footerItems = [
        { id: 'support', label: 'Support', icon: HelpCircle },
        { id: 'about-us', label: 'System Info', icon: Info },
    ] as const;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity",
                    isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 w-72 bg-surface-void/90 backdrop-blur-xl border-r border-white/5 z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="scale-75 origin-left">
                        <EngLabsLogo light size="sm" />
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <h1 className="text-xl font-black text-white px-2 tracking-tighter uppercase">Hop In Express</h1>
                    <p className="text-[10px] font-bold text-indigo-400 px-2 tracking-[0.3em] uppercase opacity-80">Command OS</p>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                    <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Modules
                    </div>
                    {menuItems.map((item) => {
                        if (item.roleLimit && !item.roleLimit.includes(userRole)) return null;
                        const Icon = item.icon;
                        const isActive = activeView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveView(item.id as ViewType);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-glow"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400")} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div className="mt-8 px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        System
                    </div>
                    {footerItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveView(item.id as ViewType);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold",
                                    isActive
                                        ? "bg-surface-elevated text-white border border-slate-700"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                                {item.label}
                            </button>
                        );
                    })}
                    <div className="mt-4 px-4 py-2">
                        <div className="bg-slate-900 rounded-lg p-3 border border-white/10">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Debug Info</p>
                            <p className="text-[10px] text-indigo-400 font-mono mt-1 break-all">
                                ShopID: {import.meta.env.VITE_USER_ID || 'Auth UID'}
                            </p>
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-sm font-bold"
                    >
                        <LogOut className="w-5 h-5" />
                        End Session
                    </button>
                </div>
            </aside>
        </>
    );
};

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '../lib/auth';
import { toast } from "sonner";
import { X, Zap } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Payments', href: '/payments' },
    { name: 'Settlements', href: '/settlements' },
    { name: 'Reconciliation', href: '/reconciliation' },
];

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout(); // clear token
        toast.success("Logged out successfully");
        router.push('/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar Content */}
            <div className="relative flex h-full w-72 flex-col bg-gray-900 px-4 py-8 text-white shadow-xl animate-in slide-in-from-left duration-300">
                <div className="mb-8 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">PayFlowX</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-800 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 pointer-events-auto cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

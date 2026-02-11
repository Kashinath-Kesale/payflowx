'use client';

import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { logout } from "../lib/auth";
import { toast } from "sonner";

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const getTitle = () => {
        if (pathname === '/') return 'Dashboard';

        const path = pathname.split('/')[1];
        if (!path) return 'Dashboard';

        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push('/');
    };

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-full"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

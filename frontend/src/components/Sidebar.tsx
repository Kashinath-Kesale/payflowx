'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '../lib/auth';
import { toast } from "sonner";

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Payments', href: '/payments' },
    { name: 'Settlements', href: '/settlements' },
    { name: 'Reconciliation', href: '/reconciliation' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout(); // clear token
        toast.success("Logged out successfully");
        router.push('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 px-4 py-8 text-white">
            <div className="mb-8 px-2">
                <h1 className="text-2xl font-bold">PayFlowX</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
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
    );
}

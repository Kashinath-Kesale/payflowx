'use client';

import { usePathname } from "next/navigation";

export default function Topbar() {
    const pathname = usePathname();

    // Map pathnames to titles
    const getTitle = () => {
        if (pathname === '/') return 'Dashboard';

        // Remove leading slash and capitalize first letter
        const path = pathname.split('/')[1];
        if (!path) return 'Dashboard';

        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-8">
            <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
            <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                {/* Add user profile / dropdown later */}
            </div>
        </header>
    );
}

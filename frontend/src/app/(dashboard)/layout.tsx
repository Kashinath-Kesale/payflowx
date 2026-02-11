'use client';

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";
import Topbar from "../../components/Topbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-gray-100">
                <Sidebar />
                <MobileSidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                <div className="flex flex-1 flex-col overflow-hidden">
                    <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

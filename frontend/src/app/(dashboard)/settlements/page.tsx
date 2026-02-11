'use client';

import { useEffect, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { api } from '@/src/lib/api';
import { toast } from "sonner";

type Settlement = {
    id: string;
    paymentId: string;
    status: string;
    attemptedAt: string;
    amount: string;
    currency: string;
    createdAt: string;
    payment?: {
        merchant?: { name: string };
        user?: { email: string };
    }
}


export default function SettlementsPage() {
    const [rows, setRows] = useState<Settlement[]>([]);

    useEffect(() => {
        api<Settlement[]>('/settlements').then(setRows);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const processSettlements = async () => {
        try {
            await api('/internal/settlements/process', { method: 'POST' });
            toast.success("Settlements processed successfully");
            // Refresh list
            const data = await api<Settlement[]>('/settlements');
            setRows(data);
        } catch (e) {
            toast.error("Failed to process settlements");
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settlement Batches</h1>
                        <p className="text-gray-500 mt-1">Track payouts and bank transfer statuses.</p>
                    </div>
                    <div className="relative group">
                        <button
                            onClick={processSettlements}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span>Process Settlements</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Normally this runs as a cron job at midnight, but for this demo/ops view, I added a manual trigger.
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Processed At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{s.paymentId.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{s.payment?.merchant?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.payment?.user?.email || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{parseFloat(s.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {s.attemptedAt ? new Date(s.attemptedAt).toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No settlements found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    )
}
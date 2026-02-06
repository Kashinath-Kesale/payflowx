'use client';

import { useEffect, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {api} from '@/src/lib/api';

type Settlement = {
    id: string;
    paymentId: string;
    status: string;
    attemptedAt: string;
    amount: string;
    currency: string;
};


export default function SettlementsPage() {
    const [rows, setRows] = useState<Settlement[]>([]);

    useEffect(() => {
        api<Settlement[]>('/settlements').then(setRows);
    }, []);


    return (
        <ProtectedRoute>
            <main className="w-full border border-gray-200">
                <h1 className="text-xl font-semibold mb-4">Settlements</h1>

                <table className="w-full border border-gray-200">
                    <thead className="p-2 border">
                        <tr>
                            <th className="p-2 border">Payment</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Attempted</th>
                        </tr>
                    </thead>


                    <tbody>
                        {rows.map((s) => (
                            
                            <tr key={s.id} className="text-sm">
                                <td className="p-2 border">{s.paymentId.slice(0, 8)}...</td>
                                <td className="p-2 border">₹{s.amount} {s.currency}</td>
                                <td className="p-2 border">{s.status}</td>
                                <td className="p-2 border">{s.attemptedAt ? new Date(s.attemptedAt).toLocaleString() : '-'}</td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </main>
        </ProtectedRoute>
    )
}
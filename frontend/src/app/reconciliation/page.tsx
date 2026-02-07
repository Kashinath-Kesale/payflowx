'use client';

import { useEffect, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {api} from "@/src/lib/api";


type Row = {
    paymentId: string;
    status: 'MATCHED' | 'MISMATCHED';
    reason?: string;
}


export default function ReconciliationPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);


    const fetchData = async () => {
        setLoading(true);
        const data = await api<Row[]>('/reconciliation');
        setRows(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
    <ProtectedRoute>
      <main className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Reconciliation</h1>
          <button
            onClick={fetchData}
            className="border px-3 py-1 text-sm"
            disabled={loading}
          >
            {loading ? 'Running…' : 'Re-run'}
          </button>
        </div>

        <table className="w-full border border-gray-200">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.paymentId} className="text-sm">
                <td className="p-2 border">{r.paymentId.slice(0, 8)}…</td>
                <td className="p-2 border">
                  {r.status === 'MATCHED' ? 'MATCHED' : 'MISMATCHED'}
                </td>
                <td className="p-2 border">{r.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </ProtectedRoute>
  );
}



'use client';


import { useEffect, useState } from "react";
import ProtectedRoute from '../../components/ProtectedRoute';

import {api} from '../../lib/api';

type Payment = {
    id: string;
    amount: string;
    currency: string;
    status: string;
    idempotencyKey: string;
    createdAt: string;
};



export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [amount, setAmount] = useState('');
    const [merchantId, setMerchantId] = useState('');
    const [loading, setLoading] = useState(false);


    const fetchPayments = async() =>{
        const data = await api<Payment[]>('/payments');
        setPayments(data);
    };

    useEffect(() => {
        fetchPayments();
    }, []);


    const createPayment = async() => {
        if(!amount || !merchantId) return;

        setLoading(true);

        await api('/payments', {
            method: 'POST',
            body: JSON.stringify({
                merchantId,
                amount: Number(amount),
                currency: 'INR',
                idempotencyKey: `ui-${Date.now()}`
            }),
        });

        setAmount('');
        setMerchantId('');
        setLoading(false);
        fetchPayments();
    };


    return (
        <ProtectedRoute>
            <main className="p-8 max-w-4xl">
                <h1 className="text-xl font-semibold mb-4">Payments</h1>

                {/* Creating payment */}

                <div className="border border-gray-200 p-4 mb-6">
                    <h2 className="text-sm font-medium mb-2">Create payment</h2>

                    <input placeholder="Merchant ID" className="border p-2 mr-2 w-64" value={merchantId}
                        onChange={(e) => setMerchantId(e.target.value)}
                    />

                    <input placeholder="Amount" type="number" className="text-sm font-medium mb-2" value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <button onClick={createPayment} disabled={loading} className="bg-black text-white px-4 py-2 text-sm">
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>


                {/* Payments List */}


                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="text-left text-sm bg-gray-50">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Idempotency</th>
                        </tr>
                    </thead>

                    <tbody>
                        {payments.map((p) => (
                            <tr key={p.id} className="text-sm">
                                <td className="p-2 border">{p.id.slice(0,8)}...</td>
                                <td className="p-2 border">₹{p.amount} {p.currency}</td>
                                <td className="p-2 border">{p.status}</td>
                                <td className="p-2 border">{p.idempotencyKey}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </ProtectedRoute>
    )
}

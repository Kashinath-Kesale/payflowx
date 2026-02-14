'use client';

import { useEffect, useState } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { toast } from "sonner";

import { api } from "@/src/lib/api";

type Payment = {
    id: string;
    amount: string;
    currency: string;
    status: string;
    idempotencyKey: string;
    createdAt: string;
    merchant: { name: string };
    user: { email: string };
};

type Merchant = {
    id: string;
    name: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [merchants, setMerchants] = useState<Merchant[]>([]);

    const [amount, setAmount] = useState('');
    const [merchantId, setMerchantId] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch merchants first as it's critical for creating payments
            try {
                const merchantsData = await api<Merchant[]>('/merchants');
                setMerchants(merchantsData);
            } catch (e) {
                console.error("Failed to fetch merchants", e);
                toast.error("Failed to load merchants");
            }

            // Fetch payments independently
            try {
                const paymentsData = await api<Payment[]>('/payments');
                setPayments(paymentsData);
            } catch (e) {
                console.error("Failed to fetch payments", e);
                toast.error("Failed to load payments");
            }
        } catch (e) {
            console.error("Unexpected error in fetchData", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createPayment = async () => {
        if (!merchantId) {
            toast.error("Please select a merchant");
            return;
        }

        const numericAmount = Number(amount);
        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }

        setLoading(true);
        try {
            await api('/payments', {
                method: 'POST',
                body: JSON.stringify({
                    merchantId,
                    amount: numericAmount,
                    currency: 'INR',
                    idempotencyKey: `ui-${Date.now()}`
                }),
            });
            setAmount('');
            setMerchantId('');
            toast.success("Payment created successfully");
            // Refresh payments only
            const refreshedPayments = await api<Payment[]>('/payments');
            setPayments(refreshedPayments);
        } catch (error: any) {
            toast.error(error.message || "Failed to create payment");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
                    <p className="text-gray-500 mt-1">Create new payments and view transaction history.</p>
                </div>

                {/* Create Payment Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Create New Payment</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            className="w-full sm:flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                        >
                            <option value="">Select Merchant</option>
                            {merchants.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>

                        <input
                            placeholder="Amount (₹)"
                            type="number"
                            min="1"
                            className="w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button
                            onClick={createPayment}
                            disabled={loading}
                            className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Create Payment'}
                        </button>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Idempotency Key</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{p.merchant?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{p.user?.email || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{parseFloat(p.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{p.idempotencyKey}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    )
}

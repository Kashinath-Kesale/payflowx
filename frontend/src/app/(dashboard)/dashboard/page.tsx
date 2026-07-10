'use client';

import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";

type Payment = {
  id: string;
  amount: string;
  status: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    successRate: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const statsData = await api<{
          totalRevenue: number;
          transactionCount: number;
          successRate: number;
          pending: number;
        }>('/payments/stats');

        setStats(statsData);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading stats...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
      <p className="text-gray-500 mt-1 mb-6">Real-time insights into your payment flows.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>

        {/* Transactions Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Transactions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.transactionCount}
          </p>
        </div>

        {/* Success Rate Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Success Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.successRate}%
          </p>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats.pending}
          </p>
        </div>
      </div>
    </div>
  );
}

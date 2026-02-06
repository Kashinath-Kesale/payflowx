'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email) return;

        setLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();
        localStorage.setItem('token', data.accessToken);

        setLoading(false);
        router.push('/payments');
    };


    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white p-6 border border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                    Sign in
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Access PayFlowX dashboard
                </p>

                {/* email input */}
                <input type="email" placeholder="you@example.com"
                    className="w-full mt-4 p-2 border border-gray-300 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button onClick={handleLogin} disabled={loading} className="w-full mt-4 bg-black text-white py-2 text-sm hover:bg-gray-800">
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>
        </main>
    )
}
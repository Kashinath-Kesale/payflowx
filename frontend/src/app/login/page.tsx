'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message || 'Login failed');
                setLoading(false);
                return;
            }

            const data = await res.json();
            localStorage.setItem('token', data.accessToken);
            toast.success("Login successful");
            router.push('/payments');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Something went wrong. Check console.');
        } finally {
            setLoading(false);
        }
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

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Test user: user1@payflowx.com
                </p>
            </div>
        </main>
    )
}
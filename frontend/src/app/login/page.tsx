'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen flex items-center justify-center bg-black selection:bg-blue-500 selection:text-white px-4">
            {/* Background Effects */}
            <div className="absolute top-0 center w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">PayFlowX</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-gray-400">Enter your email to access the dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Protected by enterprise-grade security.
                </p>
            </div>
        </main>
    )
}
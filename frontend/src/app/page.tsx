'use client';

import Link from "next/link";
import { ArrowRight, CheckCircle, Database, Lock, Server, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function LandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">PayFlowX</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/login"
                            className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            Sign In <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 center w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-green-400 mb-8 animate-fade-in-up" title="Real-time system status indicator">
                        <span className="flex w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        System Operational • Demo Environment
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        Financial Infrastructure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            Built for Scale
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Enterprise-grade payment orchestration with idempotent processing, asynchronous settlement handling, and auditable reconciliation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="h-12 px-8 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Architecture / Features Grid */}
            <section className="py-24 relative bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Engineered for Reliability</h2>
                        <p className="text-gray-400">Core architectural components that power the platform.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1: Idempotency */}
                        <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:bg-white/[0.07]">
                            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Lock className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Idempotency Engine</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Prevents double-spending using unique keys. Validates every request against existing records to ensure exactly-once processing.
                            </p>
                        </div>

                        {/* Feature 2: Reconciliation & Settlements */}
                        <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:bg-white/[0.07]">
                            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Reconciliation & Settlements</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Unified ledger tracking payments from initiation to final settlement. Automatically attempts settlement for successful payments and audits the lifecyle.
                            </p>
                        </div>

                        {/* Feature 3: Structured Logging */}
                        <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:bg-white/[0.07]">
                            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Server className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Structured Logging</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Production-ready JSON logging with context propagation. Captures correlation IDs, service labels, and error stacks for full observability.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Ticker */}
            <section className="py-20 border-t border-white/10 bg-black/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">Powered By Modern Stack</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <TechBadge name="Next.js 14" color="text-white" />
                        <TechBadge name="NestJS" color="text-red-600" />
                        <TechBadge name="PostgreSQL" color="text-blue-400" />
                        <TechBadge name="Prisma" color="text-cyan-400" />
                        <TechBadge name="TypeScript" color="text-blue-500" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex justify-center text-gray-500 text-sm">
                    <p>&copy; 2026 PayFlowX. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function TechBadge({ name, color }: { name: string; color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-current ${color}`}></div>
            <span className={`text-lg font-semibold ${color}`}>{name}</span>
        </div>
    )
}

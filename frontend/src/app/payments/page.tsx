import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function PaymentPage() {
    return (
        <ProtectedRoute>
            <main className="p-8">
                <h1 className="text-xl font-semibold">
                    Payments
                </h1>
            </main>
        </ProtectedRoute>
    )
}
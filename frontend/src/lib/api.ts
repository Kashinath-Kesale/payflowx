import { getToken } from './auth';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function api<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        }
    });


    if (!res.ok) {
        if (res.status === 429) {
            if (typeof window !== 'undefined') {
                toast.error('You are doing that too fast. Please wait a minute.');
            }
            throw new Error('Rate limit exceeded');
        }

        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Request failed');
    }

    return res.json();
}
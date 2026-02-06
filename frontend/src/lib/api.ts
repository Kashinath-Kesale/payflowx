import { getToken } from './auth';

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
        const err = await res.json();
        throw new Error(err.message || 'Request failed');
    }

    return res.json();
}
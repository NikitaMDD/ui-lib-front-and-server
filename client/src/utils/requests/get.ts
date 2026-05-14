import { apiUrl } from "./apiUrl";

export async function get<T>(endpoint: string): Promise<T | null> {
    try {
        const response = await fetch(apiUrl(endpoint));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as T;
    } catch (e) {
        console.error(`Request to ${endpoint} failed:`, e);
        return null;
    }
}
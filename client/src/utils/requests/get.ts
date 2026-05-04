export async function get<T>(endpoint: string): Promise<T | null> {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as T;
    } catch (e) {
        console.error(`Request to ${endpoint} failed:`, e);
        return null;
    }
}
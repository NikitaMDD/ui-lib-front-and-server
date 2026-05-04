export async function deleteRequest<T>(endpoint: string): Promise<T | null> {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as T;
    } catch (e) {
        console.error(`DELETE ${endpoint} failed:`, e);
        return null;
    }
}
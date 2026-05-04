export async function put<T>(endpoint: string, body: unknown): Promise<T | null> {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return await response.json() as T;
    } catch (e) {
        console.error(`PUT ${endpoint} failed:`, e);
        return null;
    }
}
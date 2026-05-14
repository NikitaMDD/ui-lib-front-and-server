export function apiUrl(path: string): string {
    const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const base = raw?.trim().replace(/\/$/, "") ?? "";
    let segment = path.replace(/^\//, "");
    if (!segment.startsWith("api/")) {
        segment = `api/${segment}`;
    }
    return base ? `${base}/${segment}` : `/${segment}`;
}

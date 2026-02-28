let cachedApiUrl = null;

async function fetchRuntimeConfig() {
  // Endpoint servido pelo próprio Next (mesmo domínio do frontend)
  const res = await fetch('/api/config', { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.apiUrl || null;
}

export async function resolveApiBaseUrl() {
  // Preferência:
  // 1) cache em memória
  // 2) runtime config via /api/config (bom pra CapRover/prod e também override de env bakeado)
  // 3) env (bom pra dev/local e também SSR)
  if (cachedApiUrl) return cachedApiUrl;

  if (typeof window !== 'undefined') {
    try {
      const runtimeUrl = await fetchRuntimeConfig();
      if (runtimeUrl) {
        cachedApiUrl = runtimeUrl;
        return cachedApiUrl;
      }
    } catch {
      // ignore
    }
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    cachedApiUrl = process.env.NEXT_PUBLIC_API_URL;
    return cachedApiUrl;
  }

  // Fallback (dev) - GovernAI API
  cachedApiUrl = 'http://localhost:3001';
  return cachedApiUrl;
}

// Compat: se algum lugar ainda chamar a função antiga
export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || cachedApiUrl || 'http://localhost:3001';
}



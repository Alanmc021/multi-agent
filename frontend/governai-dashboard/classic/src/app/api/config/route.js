import { NextResponse } from 'next/server';

/**
 * Retorna a URL da API para o frontend.
 * Usado pelo resolveApiBaseUrl() em lib/api/config.js
 */
export async function GET() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001';
  return NextResponse.json({ apiUrl });
}

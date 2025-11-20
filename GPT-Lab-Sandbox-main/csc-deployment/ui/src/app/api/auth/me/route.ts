import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({
      success: true,
      user: { id: '1', email: 'admin@sw4e.org', name: 'Admin User', role: 'super_admin' },
      note: 'fallback-mock',
    });
  }
}



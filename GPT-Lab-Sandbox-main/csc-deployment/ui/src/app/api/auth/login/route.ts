import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    // Fallback mock for local prototype
    return NextResponse.json({
      success: true,
      token: 'mock-token',
      user: { id: '1', email: 'admin@sw4e.org', name: 'Admin User', role: 'super_admin' },
      note: 'fallback-mock',
    });
  }
}



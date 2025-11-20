import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    const body = await request.json().catch(() => ({} as any));
    return NextResponse.json({
      success: true,
      user: {
        id: '2',
        email: body?.email || 'user@example.org',
        name: `${body?.first_name || 'New'} ${body?.last_name || 'User'}`.trim(),
        role: body?.role || 'researcher',
      },
      note: 'fallback-mock',
    });
  }
}



import { NextRequest, NextResponse } from 'next/server';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${CONTROL_PLANE_URL}/api/templates/launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'demo-user',
        'x-groups': 'admin,contributor',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error launching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to launch template' },
      { status: 500 }
    );
  }
}



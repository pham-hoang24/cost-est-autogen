import { NextRequest, NextResponse } from 'next/server';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');
    
    if (!namespace) {
      return NextResponse.json(
        { success: false, error: 'namespace query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${CONTROL_PLANE_URL}/api/templates/${params.deploymentId}/status?namespace=${namespace}`);
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error getting deployment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get deployment status' },
      { status: 500 }
    );
  }
}

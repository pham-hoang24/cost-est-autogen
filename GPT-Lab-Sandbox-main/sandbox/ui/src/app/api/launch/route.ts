import { NextRequest, NextResponse } from 'next/server';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://control-plane.control-plane.svc.cluster.local';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const templateId = String(form.get('templateId') || '');
  const namespace = String(form.get('namespace') || 'teaching');
  if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });

  const res = await fetch(`${CONTROL_PLANE_URL}/api/templates/launch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ templateId, namespace }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}




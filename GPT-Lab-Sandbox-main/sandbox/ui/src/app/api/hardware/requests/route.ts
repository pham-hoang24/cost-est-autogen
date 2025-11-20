export async function GET() {
  const payload = {
    requests: [
      { id: 'h1', type: 'GPU', status: 'pending', details: '2x A100 for 24h' },
      { id: 'h2', type: 'CPU', status: 'approved', details: '32 vCPU for 7d' }
    ]
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



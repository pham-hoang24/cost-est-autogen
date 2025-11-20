export async function GET() {
  const payload = {
    services: [
      { id: 'svc-1', name: 'Model Benchmarking', category: 'analytics' },
      { id: 'svc-2', name: 'Data Preprocessing Pipeline', category: 'pipeline' }
    ]
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



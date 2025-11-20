export async function POST(_request: Request) {
  // Local dev stub: always return a valid admin user
  const payload = {
    success: true,
    token: 'demo-token',
    user: { id: '1', email: 'admin@sw4e.org', role: 'super_admin' }
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



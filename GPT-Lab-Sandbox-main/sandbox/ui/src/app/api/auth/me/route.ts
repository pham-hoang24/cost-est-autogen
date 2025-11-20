export async function GET() {
  // Local dev stub: return a valid admin user when token present
  const payload = {
    success: true,
    user: { id: '1', email: 'admin@sw4e.org', role: 'super_admin' }
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



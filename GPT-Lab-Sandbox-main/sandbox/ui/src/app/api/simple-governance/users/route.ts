export async function GET() {
  // Local dev stub data for admin dashboard
  const payload = {
    users: [
      { id: 'u1', email: 'admin@sw4e.org', role: 'super_admin', status: 'active' },
      { id: 'u2', email: 'researcher@university.edu', role: 'researcher', status: 'pending' }
    ],
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



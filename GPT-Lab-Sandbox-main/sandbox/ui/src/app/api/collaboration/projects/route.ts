export async function GET() {
  const payload = {
    projects: [
      { id: 'p1', name: 'AI Healthcare Diagnostics', status: 'active' },
      { id: 'p2', name: 'NLP Sentiment Analysis', status: 'completed' }
    ]
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



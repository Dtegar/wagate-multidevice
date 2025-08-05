const { whatsappService } = require('@/lib/whatsapp');

export async function GET() {
  return Response.json({
    status: whatsappService.status,
    qr: whatsappService.qr
  });
}

export async function POST(request) {
  const { action } = await request.json();

  if (action === 'initialize') {
    whatsappService.initialize();
    return Response.json({ status: 'initializing' });
  }

  if (action === 'delete-session') {
    await whatsappService.deleteSession();
    return Response.json({ status: 'session-deleted' });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
const { whatsappService } = require('@/lib/whatsapp');

export async function GET() {
  try {
    const sessions = await whatsappService.getAllSessions();
    return Response.json({ sessions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { action, sessionId, sessionName, phoneNumber } = await request.json();

  try {
    switch (action) {
      case 'create-session':
        const newSessionId = await whatsappService.createSession(sessionName, phoneNumber);
        await whatsappService.initialize(newSessionId);
        return Response.json({ sessionId: newSessionId });

      case 'initialize':
        await whatsappService.initialize(sessionId);
        return Response.json({ status: 'initializing' });

      case 'delete-session':
        await whatsappService.deleteSession(sessionId);
        return Response.json({ status: 'session-deleted' });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
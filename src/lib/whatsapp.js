const { Client } = require('whatsapp-web.js');
const db = require('./db');

class WhatsAppService {
  constructor() {
    this.sessions = new Map();
  }

  async createSession(sessionName, phoneNumber) {
    try {
      const [result] = await db.execute(
        'INSERT INTO whatsapp_sessions (session_name, phone_number) VALUES (?, ?)',
        [sessionName, phoneNumber]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async initialize(sessionId) {
    if (this.sessions.has(sessionId)) {
      console.log(`Session ${sessionId} already initialized`);
      return;
    }

    const client = new Client({
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', async (qr) => {
      console.log(`QR Code received for session ${sessionId}`);
      await db.execute(
        'UPDATE whatsapp_sessions SET status = ?, qr_code = ? WHERE id = ?',
        ['qr', qr, sessionId]
      );
    });

    client.on('ready', async () => {
      await db.execute(
        'UPDATE whatsapp_sessions SET status = ?, qr_code = NULL WHERE id = ?',
        ['connected', sessionId]
      );
      console.log(`Client ${sessionId} is ready!`);
    });

    client.on('message', async msg => {
      try {
        // Log pesan masuk
        await db.execute(
          'INSERT INTO whatsapp_messages (session_id, message_type, from_number, to_number, message_content) VALUES (?, ?, ?, ?, ?)',
          [sessionId, 'incoming', msg.from, msg.to, msg.body]
        );

        if (msg.body === 'ping') {
          await msg.reply('pong');
          // Log pesan keluar
          await db.execute(
            'INSERT INTO whatsapp_messages (session_id, message_type, from_number, to_number, message_content) VALUES (?, ?, ?, ?, ?)',
            [sessionId, 'outgoing', msg.to, msg.from, 'pong']
          );
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    this.sessions.set(sessionId, client);
    try {
      await client.initialize();
    } catch (error) {
      console.error(`Failed to initialize client ${sessionId}:`, error);
      await db.execute(
        'UPDATE whatsapp_sessions SET status = ? WHERE id = ?',
        ['error', sessionId]
      );
    }
  }

  async deleteSession(sessionId) {
    try {
      const client = this.sessions.get(sessionId);
      if (client) {
        await client.destroy();
        this.sessions.delete(sessionId);
      }
      await db.execute('DELETE FROM whatsapp_sessions WHERE id = ?', [sessionId]);
      console.log(`Session ${sessionId} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  }

  async getAllSessions() {
    try {
      const [rows] = await db.execute('SELECT * FROM whatsapp_sessions');
      return rows;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }
}

const whatsappService = new WhatsAppService();
module.exports = { whatsappService };
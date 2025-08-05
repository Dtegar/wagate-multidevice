const { Client, LocalAuth } = require('whatsapp-web.js');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.qr = null;
    this.status = 'disconnected';
  }

  initialize() {
    if (this.client) {
      console.log('Client already initialized');
      return;
    }

    console.log('Initializing WhatsApp client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      console.log('QR Code received');
      this.qr = qr;
      this.status = 'qr';
    });

    this.client.on('ready', () => {
      this.status = 'connected';
      this.qr = null;
      console.log('Client is ready!');
    });

    this.client.on('disconnected', () => {
      this.status = 'disconnected';
      this.qr = null;
      console.log('Client disconnected');
    });

    this.client.on('message', async msg => {
      try {
        if (msg.body === 'ping') {
          await msg.reply('pong');
        } else if (msg.body === 'hallo') {
          await msg.reply('hallo juga');
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    this.client.on('auth_failure', () => {
      this.status = 'disconnected';
      this.qr = null;
      console.log('Auth failure, restarting...');
    });

    try {
      this.client.initialize();
    } catch (error) {
      console.error('Failed to initialize client:', error);
      this.status = 'error';
    }
  }

  async deleteSession() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
        this.qr = null;
        this.status = 'disconnected';
        console.log('Session deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      this.status = 'error';
    }
  }
}

const whatsappService = new WhatsAppService();
module.exports = { whatsappService };
'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/whatsapp');
        const data = await res.json();
        setSessions(data.sessions);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };

    const interval = setInterval(fetchSessions, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionName || !newPhoneNumber) {
      alert('Mohon isi nama session dan nomor telepon');
      return;
    }

    setIsLoading(true);
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-session',
          sessionName: newSessionName,
          phoneNumber: newPhoneNumber
        })
      });
      setNewSessionName('');
      setNewPhoneNumber('');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Gagal membuat session baru');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus session ini?')) {
      return;
    }

    setIsLoading(true);
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-session',
          sessionId
        })
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Gagal menghapus session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-8">
      {/* Form untuk menambah session baru */}
      <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-white">Tambah Session WhatsApp Baru</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Nama Session"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white placeholder-white/50 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Nomor Telepon (contoh: 628123456789)"
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white placeholder-white/50 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleCreateSession}
            disabled={isLoading}
            className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25'}`}
          >
            {isLoading ? 'Memproses...' : 'Tambah Session'}
          </button>
        </div>
      </div>

      {/* Grid untuk menampilkan sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white">{session.session_name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-white/80">
                <span className="font-semibold">Nomor:</span> {session.phone_number}
              </p>
              <p className="text-white/80">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`
                  ${session.status === 'connected' ? 'text-green-400' : ''}
                  ${session.status === 'disconnected' ? 'text-red-400' : ''}
                  ${session.status === 'qr' ? 'text-yellow-400' : ''}
                  ${session.status === 'error' ? 'text-red-600' : ''}
                `}>
                  {session.status}
                </span>
              </p>
            </div>
            
            {session.qr_code && session.status === 'qr' && (
              <div className="mb-4 bg-white p-4 rounded-xl shadow-inner">
                <QRCodeSVG
                  value={session.qr_code}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={() => handleDeleteSession(session.id)}
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-red-500/25'}`}
            >
              {isLoading ? 'Memproses...' : 'Hapus Session'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
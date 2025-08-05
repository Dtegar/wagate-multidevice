'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [status, setStatus] = useState('disconnected');
  const [qr, setQr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp');
        const data = await res.json();
        setStatus(data.status);
        setQr(data.qr);
      } catch (error) {
        console.error('Failed to check status:', error);
        setStatus('error');
      }
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-session' })
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-8 flex items-center justify-center">
      {/* Animated background blobs */}
      <div className="blob"></div>
      <div className="blob"></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
            WhatsApp Gateway
          </h1>
          
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <span>Connect WhatsApp</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={isLoading}
                className={`px-8 py-4 bg-gradient-to-r from-red-500 to-red-700 rounded-xl hover:from-red-600 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Session</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="text-xl font-semibold bg-white/5 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors duration-300">
                Status: 
                <span className={`
                  ${status === 'connected' ? 'text-green-400' : ''}
                  ${status === 'disconnected' ? 'text-red-400' : ''}
                  ${status === 'qr' ? 'text-yellow-400' : ''}
                  ${status === 'error' ? 'text-red-600' : ''}
                  flex items-center gap-2
                `}>
                  <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-400' : ''} ${status === 'disconnected' ? 'bg-red-400' : ''} ${status === 'qr' ? 'bg-yellow-400' : ''} ${status === 'error' ? 'bg-red-600' : ''} animate-pulse shadow-lg`}></div>
                  {status}
                </span>
              </div>
              
              {qr && status === 'qr' && (
                <div className="gradient-border animate-fade-in-up">
                  <div className="bg-white rounded-xl p-8 backdrop-blur-xl">
                    <QRCodeSVG
                      value={qr}
                      size={256}
                      level="H"
                      includeMargin={true}
                      className="transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Copy, Check, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';

export function ShareLink({ peerId, hasFiles }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { isDark } = useTheme();

  const shareUrl = useMemo(() => {
    if (!peerId) return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?peer=${peerId}`;
  }, [peerId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!hasFiles) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}
      >
        <div className={`flex items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Link className="w-5 h-5" />
          <p>Add files to generate a share link</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${isDark ? 'glass-dark' : 'glass-light'}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-500/30' : 'bg-green-100'}`}
          >
            <Link className={`w-5 h-5 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
          </motion.div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Share Link Ready</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Anyone with this link can download your files</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className={`flex-1 rounded-xl px-4 py-3 text-sm truncate focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark 
                ? 'bg-black/30 border border-white/20 text-white' 
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyToClipboard}
            className={`
              px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2
              ${copied 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Copied
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQR(true)}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
            isDark 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          <QrCode className="w-5 h-5" />
          Show QR Code
        </motion.button>
        
        <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
            ⚠️ Keep this tab open while others download
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-3xl p-8 max-w-sm w-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Scan to Download</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowQR(false)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </motion.button>
              </div>
              <div className="bg-white p-4 rounded-2xl">
                <QRCodeSVG 
                  value={shareUrl} 
                  size={256} 
                  className="w-full h-auto"
                  level="M"
                />
              </div>
              <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Point your phone camera at this code
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

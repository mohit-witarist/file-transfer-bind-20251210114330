import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Share2, Shield, Zap, Globe } from 'lucide-react';
import { usePeer } from './hooks/usePeer';
import { useTheme } from './context/ThemeContext';
import { FileUploader } from './components/FileUploader';
import { ShareLink } from './components/ShareLink';
import { FileReceiver } from './components/FileReceiver';
import { ThemeToggle } from './components/ThemeToggle';
import { ConnectionStatus } from './components/ConnectionStatus';

function App() {
  const { peerId, isConnected, activeConnections, setFilesToShare, connectToPeer } = usePeer();
  const [files, setFiles] = useState([]);
  const { isDark } = useTheme();

  const remotePeerId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('peer');
  }, []);

  const isReceiveMode = !!remotePeerId;

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
    setFilesToShare(newFiles);
  };

  const features = [
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Direct browser-to-browser transfer. Files never touch any server.',
      color: 'blue'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'No upload wait. Start sharing instantly with peer-to-peer speed.',
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Works Everywhere',
      description: 'Share across devices, tabs, or with anyone around the world.',
      color: 'purple'
    }
  ];

  if (isReceiveMode) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100'
      }`}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Share2 className="w-6 h-6 text-white" />
            </motion.div>
            <ThemeToggle />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>P2P File Share</h1>
        </motion.div>
        <FileReceiver 
          remotePeerId={remotePeerId} 
          connectToPeer={connectToPeer}
          isReady={isConnected}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              <Share2 className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>P2P File Share</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Share files directly, no servers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus isConnected={isConnected} activeConnections={activeConnections} />
            <ThemeToggle />
          </div>
        </motion.header>

        <div className="grid gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FileUploader files={files} onFilesChange={handleFilesChange} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ShareLink peerId={peerId} hasFiles={files.length > 0} />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-gray-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                feature.color === 'blue' 
                  ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  : feature.color === 'green'
                  ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                  : isDark ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <feature.icon className={`w-5 h-5 ${
                  feature.color === 'blue' 
                    ? isDark ? 'text-blue-400' : 'text-blue-600'
                    : feature.color === 'green'
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Made with ❤️ using WebRTC • No data stored on servers
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;

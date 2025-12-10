import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, CheckCircle, AlertCircle, File, RefreshCw, FileText, Image, Film, Music, Archive, DownloadCloud } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const fileIcons = {
  image: Image,
  video: Film,
  audio: Music,
  application: Archive,
  text: FileText,
  default: File
};

const getFileIcon = (mimeType) => {
  const type = mimeType?.split('/')[0];
  return fileIcons[type] || fileIcons.default;
};

export function FileReceiver({ remotePeerId, connectToPeer, isReady }) {
  const [status, setStatus] = useState('waiting');
  const [filesInfo, setFilesInfo] = useState([]);
  const [fileProgress, setFileProgress] = useState({});
  const [downloadUrls, setDownloadUrls] = useState({});
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);
  const { isDark } = useTheme();

  const startConnection = () => {
    if (!remotePeerId || !connectToPeer || !isReady) return;

    setStatus('connecting');
    setError(null);

    const { conn, requestFile } = connectToPeer(remotePeerId, {
      onConnected: () => {
        setStatus('waiting-files');
      },
      onFilesInfo: (files) => {
        setFilesInfo(files);
        setStatus('ready');
      },
      onProgress: (fileId, progress) => {
        setFileProgress(prev => ({ ...prev, [fileId]: progress }));
      },
      onFileComplete: (fileId, blob, info) => {
        const url = URL.createObjectURL(blob);
        setDownloadUrls(prev => ({ ...prev, [fileId]: { url, info } }));
        setFileProgress(prev => ({ ...prev, [fileId]: 100 }));
      },
      onError: (err) => {
        setError(err);
        setStatus('error');
      }
    });

    connectionRef.current = { conn, requestFile };
  };

  useEffect(() => {
    if (isReady && status === 'waiting') {
      startConnection();
    }
  }, [isReady]);

  useEffect(() => {
    return () => {
      Object.values(downloadUrls).forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDownloadFile = (fileId) => {
    if (downloadUrls[fileId]) {
      const { url, info } = downloadUrls[fileId];
      const a = document.createElement('a');
      a.href = url;
      a.download = info.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (connectionRef.current) {
      setFileProgress(prev => ({ ...prev, [fileId]: 0 }));
      connectionRef.current.requestFile(fileId);
    }
  };

  const handleDownloadAll = () => {
    filesInfo.forEach(file => {
      if (!downloadUrls[file.id] && !fileProgress[file.id]) {
        handleDownloadFile(file.id);
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleRetry = () => {
    setStatus('waiting');
    setError(null);
    setFileProgress({});
    setTimeout(startConnection, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl p-8 max-w-lg w-full ${isDark ? 'glass-dark' : 'glass-light'}`}
    >
      <AnimatePresence mode="wait">
        {(status === 'waiting' || status === 'connecting' || status === 'waiting-files') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Loader2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </motion.div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {status === 'waiting' ? 'Initializing...' : 
               status === 'connecting' ? 'Connecting to sender...' : 
               'Getting file info...'}
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we establish a secure connection
            </p>
          </motion.div>
        )}

        {status === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {filesInfo.length} File{filesInfo.length > 1 ? 's' : ''} Available
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click to download each file
                </p>
              </div>
              {filesInfo.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadAll}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  All
                </motion.button>
              )}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filesInfo.map((file, index) => {
                const IconComponent = getFileIcon(file.mimeType);
                const progress = fileProgress[file.id];
                const isComplete = downloadUrls[file.id];
                const isDownloading = progress !== undefined && !isComplete;

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-xl p-4 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isComplete 
                          ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                          : isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}>
                        {isComplete ? (
                          <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        ) : (
                          <IconComponent className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadFile(file.id)}
                        disabled={isDownloading}
                        className={`p-2 rounded-xl transition-colors ${
                          isComplete
                            ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                            : isDark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                        } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                    
                    {isDownloading && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Downloading...</span>
                          <span className={isDark ? 'text-white' : 'text-gray-800'}>{Math.round(progress)}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-black/30' : 'bg-gray-200'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <AlertCircle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Connection Failed</p>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

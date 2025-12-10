import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

export function usePeer() {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [activeConnections, setActiveConnections] = useState(0);
  const [transferStatus, setTransferStatus] = useState({});
  const filesRef = useRef([]);

  useEffect(() => {
    const newPeer = new Peer({
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ]
      }
    });

    newPeer.on('open', (id) => {
      setPeerId(id);
      setIsConnected(true);
      setError(null);
    });

    newPeer.on('error', (err) => {
      setError(err.message);
      if (err.type === 'unavailable-id' || err.type === 'network') {
        setIsConnected(false);
      }
    });

    newPeer.on('disconnected', () => {
      setIsConnected(false);
      newPeer.reconnect();
    });

    newPeer.on('connection', (conn) => {
      setActiveConnections(prev => prev + 1);
      
      conn.on('open', () => {
        if (filesRef.current.length > 0) {
          const filesInfo = filesRef.current.map((f, idx) => ({
            id: idx,
            name: f.name,
            size: f.size,
            mimeType: f.type
          }));
          conn.send({ type: 'files-info', files: filesInfo });
        } else {
          conn.send({ type: 'no-files' });
        }
      });

      conn.on('data', async (data) => {
        if (data.type === 'request-file') {
          const file = filesRef.current[data.fileId];
          if (file) {
            await sendFileInChunks(conn, file, data.fileId);
          }
        }
      });

      conn.on('close', () => {
        setActiveConnections(prev => Math.max(0, prev - 1));
      });

      conn.on('error', () => {
        setActiveConnections(prev => Math.max(0, prev - 1));
      });
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const sendFileInChunks = async (conn, file, fileId) => {
    const chunkSize = 16 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    setTransferStatus(prev => ({
      ...prev,
      [fileId]: { status: 'sending', progress: 0 }
    }));

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const arrayBuffer = await chunk.arrayBuffer();

      try {
        conn.send({
          type: 'file-chunk',
          fileId,
          chunk: arrayBuffer,
          index: i,
          total: totalChunks
        });
        
        const progress = ((i + 1) / totalChunks) * 100;
        setTransferStatus(prev => ({
          ...prev,
          [fileId]: { status: 'sending', progress }
        }));
      } catch (err) {
        setTransferStatus(prev => ({
          ...prev,
          [fileId]: { status: 'error', progress: 0 }
        }));
        return;
      }

      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    conn.send({ type: 'file-complete', fileId });
    setTransferStatus(prev => ({
      ...prev,
      [fileId]: { status: 'complete', progress: 100 }
    }));
  };

  const setFilesToShare = useCallback((files) => {
    filesRef.current = files;
  }, []);

  const connectToPeer = useCallback((remotePeerId, callbacks = {}) => {
    if (!peer) {
      callbacks.onError?.('Peer not initialized');
      return null;
    }
    
    const conn = peer.connect(remotePeerId, { 
      reliable: true,
      serialization: 'binary'
    });
    
    const fileChunks = {};
    let filesInfo = [];
    let connectionTimeout;

    connectionTimeout = setTimeout(() => {
      if (conn.open === false) {
        callbacks.onError?.('Connection timeout. The sender may be offline.');
        conn.close();
      }
    }, 15000);

    conn.on('open', () => {
      clearTimeout(connectionTimeout);
      callbacks.onConnected?.();
    });

    conn.on('data', (data) => {
      if (data.type === 'no-files') {
        callbacks.onError?.('No files available.');
      } else if (data.type === 'files-info') {
        filesInfo = data.files;
        callbacks.onFilesInfo?.(data.files);
      } else if (data.type === 'file-chunk') {
        if (!fileChunks[data.fileId]) {
          fileChunks[data.fileId] = [];
        }
        fileChunks[data.fileId][data.index] = data.chunk;
        const progress = ((data.index + 1) / data.total) * 100;
        callbacks.onProgress?.(data.fileId, progress);
      } else if (data.type === 'file-complete') {
        const info = filesInfo.find(f => f.id === data.fileId);
        const chunks = fileChunks[data.fileId];
        const blob = new Blob(chunks, { type: info?.mimeType || 'application/octet-stream' });
        callbacks.onFileComplete?.(data.fileId, blob, info);
      }
    });

    conn.on('close', () => {
      clearTimeout(connectionTimeout);
    });

    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      callbacks.onError?.(err.message || 'Connection failed');
    });

    const requestFile = (fileId) => {
      conn.send({ type: 'request-file', fileId });
    };

    return { conn, requestFile };
  }, [peer]);

  return {
    peer,
    peerId,
    isConnected,
    error,
    activeConnections,
    transferStatus,
    setFilesToShare,
    connectToPeer
  };
}

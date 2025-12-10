import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ConnectionStatus({ isConnected, activeConnections }) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          isConnected
            ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
            : isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
        />
        {isConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            Connecting...
          </>
        )}
      </motion.div>

      {activeConnections > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {activeConnections} active
        </motion.div>
      )}
    </div>
  );
}

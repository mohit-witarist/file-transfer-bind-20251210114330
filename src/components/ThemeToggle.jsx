import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300
        ${isDark ? 'bg-purple-600' : 'bg-yellow-400'}
      `}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          w-5 h-5 rounded-full flex items-center justify-center
          ${isDark ? 'bg-slate-900 ml-auto' : 'bg-white ml-0'}
        `}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-purple-300" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
}

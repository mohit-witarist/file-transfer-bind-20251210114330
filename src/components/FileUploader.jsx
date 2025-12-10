import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, FileText, Image, Film, Music, Archive } from 'lucide-react';
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

export function FileUploader({ files, onFilesChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        onFilesChange([...files, ...pastedFiles]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [files, onFilesChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesChange([...files, ...droppedFiles]);
    }
  }, [files, onFilesChange]);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      onFilesChange([...files, ...selectedFiles]);
    }
    e.target.value = '';
  }, [files, onFilesChange]);

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
          ${isDragging 
            ? isDark ? 'border-purple-400 bg-purple-500/20' : 'border-purple-500 bg-purple-50'
            : isDark ? 'border-white/30' : 'border-gray-300'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <motion.div 
          className="flex flex-col items-center gap-3"
          animate={{ y: isDragging ? -5 : 0 }}
        >
          <motion.div
            animate={{ 
              scale: isDragging ? 1.2 : 1,
              rotate: isDragging ? 10 : 0
            }}
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              ${isDark ? 'bg-purple-500/30' : 'bg-purple-100'}
            `}
          >
            <Upload className={`w-7 h-7 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
          </motion.div>
          <div>
            <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {isDragging ? 'Drop files here' : 'Drop files or click to browse'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Or press Ctrl+V to paste from clipboard
            </p>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl overflow-hidden ${isDark ? 'glass-dark' : 'glass-light'}`}
          >
            <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(totalSize)} total
                </span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {files.map((file, index) => {
                const IconComponent = getFileIcon(file.type);
                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <IconComponent className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(index)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                    >
                      <X className={`w-4 h-4 ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

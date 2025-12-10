import React from 'react';

export function TransferProgress({ progress }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Downloading...</span>
        <span className="text-white font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 bg-black/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

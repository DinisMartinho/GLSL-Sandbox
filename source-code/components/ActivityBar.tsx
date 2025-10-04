import React from 'react';
import { FolderIcon } from './icons';

interface ActivityBarProps {
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ isExplorerOpen, onToggleExplorer }) => {
  return (
    <div className="h-full w-12 bg-zinc-900/60 flex flex-col items-center py-2 border-r border-zinc-800 shadow-lg flex-shrink-0 rounded-lg gap-2">
      <button
        onClick={onToggleExplorer}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
          isExplorerOpen
            ? 'bg-zinc-700/50 text-white'
            : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
        }`}
        title="Toggle Asset Explorer"
        aria-label="Toggle Asset Explorer"
        aria-pressed={isExplorerOpen}
      >
        {isExplorerOpen && <div className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-white rounded-r-full"></div>}
        <FolderIcon />
      </button>
    </div>
  );
};

export default ActivityBar;

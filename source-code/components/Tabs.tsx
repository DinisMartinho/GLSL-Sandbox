import React, { useState } from 'react';
import { SHADER_COLORS } from '../constants';
import { WordWrapIcon, TrashIcon } from './icons';
import ContextMenu, { ContextMenuOption } from './ContextMenu';

interface TabsProps {
  tabs: string[];
  buffers: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddBuffer: () => void;
  onDeleteLastBuffer: () => void;
  canAddBuffer: boolean;
  isWordWrapOn: boolean;
  onToggleWordWrap: () => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, buffers, activeTab, onTabChange, onAddBuffer, onDeleteLastBuffer, canAddBuffer, isWordWrapOn, onToggleWordWrap }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, options: ContextMenuOption[] } | null>(null);
  
  const getTabName = (tab: string) => {
    if (tab === 'help') return 'README';
    if (tab === 'finalPass') return 'Final Pass';
    return `Buffer ${tab.slice(-1).toUpperCase()}`;
  }

  const handleContextMenu = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();

    let menuOptions: ContextMenuOption[] | null = null;

    if (tab === 'finalPass') {
      menuOptions = [
        {
          label: 'The Final Pass cannot be deleted.',
          onClick: () => {},
          disabled: true,
        },
      ];
    } else if (tab.startsWith('buffer')) {
      const lastBuffer = buffers[buffers.length - 1];
      const isLastBuffer = tab === lastBuffer;
      const canDelete = buffers.length > 1;

      if (isLastBuffer && canDelete) {
        menuOptions = [
          {
            label: 'Delete Buffer',
            onClick: onDeleteLastBuffer,
            isDestructive: true,
            icon: <TrashIcon />,
          },
        ];
      } else if (canDelete) {
        menuOptions = [
          {
            label: 'Only the last buffer can be deleted.',
            onClick: () => {},
            disabled: true,
          },
        ];
      } else {
          menuOptions = [
          {
            label: 'Cannot delete the only buffer.',
            onClick: () => {},
            disabled: true,
          },
        ];
      }
    }
    
    if (menuOptions) {
      setContextMenu({ x: e.clientX, y: e.clientY, options: menuOptions });
    }
  };
  
  return (
    <div className="flex justify-between items-start bg-zinc-900/80 border-b border-zinc-800">
      <div className="flex flex-wrap">
        {tabs.map((tab) => {
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200 relative flex items-center gap-2 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
              }`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              <div className={`w-2 h-2 rounded-full ${SHADER_COLORS[tab]?.replace('text-', 'bg-') || 'bg-zinc-500'}`}></div>
              {getTabName(tab)}
              {activeTab === tab && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${SHADER_COLORS[tab]?.replace('text-', 'bg-') || 'bg-cyan-500'} shadow-[0_0_8px] ${SHADER_COLORS[tab]?.replace('text-','shadow-')}/50`}></div>
              )}
            </button>
          )
        })}
      </div>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          options={contextMenu.options}
        />
      )}

      <div className="flex-shrink-0 flex items-center gap-1 p-1.5">
        {activeTab !== 'help' && (
          <button
            onClick={onToggleWordWrap}
            className={`p-1.5 rounded-md focus:outline-none transition-colors duration-200 ${
              isWordWrapOn 
                ? 'bg-zinc-700 text-white' 
                : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
            }`}
            aria-label="Toggle word wrap"
            title="Toggle word wrap"
          >
            <WordWrapIcon />
          </button>
        )}
        
        {canAddBuffer && (
          <button 
            onClick={onAddBuffer}
            className="px-3 py-1 text-lg font-bold text-zinc-400 hover:bg-zinc-700/50 hover:text-white focus:outline-none rounded-sm"
            aria-label="Add new buffer"
            title="Add new buffer"
          >
            +
          </button>
        )}
      </div>

    </div>
  );
};

export default Tabs;
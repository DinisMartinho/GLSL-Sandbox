import React, { useEffect, useRef } from 'react';

export interface ContextMenuOption {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid the menu closing on the same click that opened it
    const timerId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[10rem] max-w-xs bg-zinc-800 border border-zinc-700 rounded-md shadow-lg text-white py-1 text-sm font-mono animate-fade-in-fast"
      style={{ top: y, left: x }}
    >
      {options.map((option, index) => (
        option.disabled ? (
            <div
                key={index}
                className="px-3 py-1.5 text-zinc-500 italic text-xs cursor-default select-none"
            >
                {option.label}
            </div>
        ) : (
            <button
            key={index}
            onClick={() => {
                option.onClick();
                onClose();
            }}
            className={`block w-full text-left px-3 py-1.5 transition-colors duration-150 flex items-center gap-2 ${
                option.isDestructive
                ? 'text-rose-400 hover:bg-rose-500/20'
                : 'hover:bg-zinc-700'
            }`}
            >
            {option.icon}
            {option.label}
            </button>
        )
      ))}
    </div>
  );
};

export default ContextMenu;

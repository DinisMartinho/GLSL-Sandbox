import React, { useRef, useState, useEffect } from 'react';
import { ChevronDownIcon, UploadIcon, ImportIcon, ExportIcon, TextureIcon, TrashIcon, LinkIcon } from './icons';
import type { TextureAsset } from '../App';
import { MAX_TEXTURES } from '../constants';
import ContextMenu from './ContextMenu';

interface AssetExplorerProps {
  textures: TextureAsset[];
  onTextureUpload: (files: FileList | null) => void;
  onDeleteTexture: (textureId: string) => void;
  onTextureFromUrl: (url: string) => Promise<void>;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
}

const UrlModal: React.FC<{ onClose: () => void; onSubmit: (url: string) => Promise<void> }> = ({ onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(url);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-fast" onMouseDown={onClose}>
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">Add Texture from URL</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            disabled={isLoading}
          />
          {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-300 bg-zinc-700/60 hover:bg-zinc-700 rounded-md transition" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition flex items-center gap-2 disabled:bg-cyan-800 disabled:cursor-not-allowed" disabled={isLoading || !url.trim()}>
              {isLoading && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
              {isLoading ? 'Adding...' : 'Add Texture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AssetExplorer: React.FC<AssetExplorerProps> = ({ textures, onTextureUpload, onDeleteTexture, onTextureFromUrl, onExportProject, onImportProject }) => {
  const textureInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, textureId: string } | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  const handleUploadClick = () => {
    textureInputRef.current?.click();
  };

  const handleTextureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTextureUpload(event.target.files);
    event.target.value = '';
  };
  
  const handleImportClick = () => {
    projectInputRef.current?.click();
  };
  
  const handleProjectFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportProject(file);
    }
    event.target.value = '';
  };

  const handleContextMenu = (e: React.MouseEvent, textureId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, textureId });
  };

  return (
    <aside className="w-60 h-full bg-zinc-900/50 flex flex-col flex-shrink-0 border border-zinc-800 rounded-lg shadow-2xl shadow-black/30">
      <input
        type="file"
        ref={textureInputRef}
        onChange={handleTextureFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        multiple
      />
      <input
        type="file"
        ref={projectInputRef}
        onChange={handleProjectFileChange}
        className="hidden"
        accept="application/json"
      />
      <header className="flex items-center justify-between p-2.5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Scene Assets</h1>
        <div className="flex items-center gap-1">
            <button onClick={handleImportClick} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-700/50" title="Import Project" aria-label="Import Project">
                <ImportIcon />
            </button>
            <button onClick={onExportProject} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-700/50" title="Export Project" aria-label="Export Project">
                <ExportIcon />
            </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
        <details open className="group mt-2">
          <summary className="flex items-center gap-1.5 p-1 rounded-md text-sm font-semibold text-zinc-300 cursor-pointer list-none hover:bg-zinc-700/40 select-none">
            <ChevronDownIcon className="group-open:rotate-0 -rotate-90 transition-transform duration-200" />
            Textures (iTexChannels)
          </summary>
          <div className="mt-2 space-y-1.5 px-1">
            {textures.map((texture, index) => (
              <div 
                key={texture.id}
                onContextMenu={(e) => handleContextMenu(e, texture.id)}
                className="flex items-center gap-2 p-1.5 text-sm rounded-md bg-zinc-800/50 hover:bg-zinc-700/80 cursor-pointer transition-colors"
              >
                <TextureIcon />
                <span className="flex-1 truncate text-zinc-300" title={texture.name}>{texture.name}</span>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-900/50 px-1.5 py-0.5 rounded">iTexChannel{index}</span>
              </div>
            ))}
            
            {textures.length < MAX_TEXTURES && (
               <div className="flex gap-1.5">
                <button 
                  onClick={handleUploadClick}
                  className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors font-medium text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 hover:text-white" title="Upload new texture from device">
                    <UploadIcon />
                    <span>Upload</span>
                </button>
                <button
                  onClick={() => setIsUrlModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors font-medium text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 hover:text-white" title="Add texture from URL">
                    <LinkIcon />
                    <span>From URL</span>
                </button>
              </div>
            )}

            {textures.length === 0 && (
               <div className="px-2 py-4 text-center text-xs text-zinc-500">
                  No textures uploaded.
               </div>
            )}
          </div>
        </details>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          options={[
            {
              label: 'Delete Texture',
              onClick: () => onDeleteTexture(contextMenu.textureId),
              isDestructive: true,
              icon: <TrashIcon />,
            },
          ]}
        />
      )}

      {isUrlModalOpen && (
        <UrlModal onClose={() => setIsUrlModalOpen(false)} onSubmit={onTextureFromUrl} />
      )}
    </aside>
  );
};

export default AssetExplorer;
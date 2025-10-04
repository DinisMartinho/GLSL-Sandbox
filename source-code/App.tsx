import React, { useState, useCallback, useRef, useEffect } from 'react';
import Editor from './components/Editor';
import ShaderCanvas from './components/ShaderCanvas';
import Tabs from './components/Tabs';
import Controls from './components/Controls';
import StatsDisplay from './components/StatsDisplay';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_BUFFER_A_SHADER, DEFAULT_BUFFER_B_SHADER, DEFAULT_NEW_BUFFER_SHADER, DEFAULT_README_CONTENT, MAX_TEXTURES } from './constants';
import ActivityBar from './components/ActivityBar';
import AssetExplorer from './components/AssetExplorer';

export type ShaderName = string;
export type ShaderCodes = Partial<Record<ShaderName, string>>;
export type CompileTimes = Partial<Record<ShaderName, number | null>>;

export interface TextureAsset {
  id: string;
  name: string;
  dataUrl: string;
}

const MAX_BUFFERS = 26; // A-Z

function App() {
  const [buffers, setBuffers] = useState<string[]>(['bufferA', 'bufferB']);
  const [shaderCodes, setShaderCodes] = useState<ShaderCodes>({
    help: DEFAULT_README_CONTENT,
    finalPass: DEFAULT_FRAGMENT_SHADER,
    bufferA: DEFAULT_BUFFER_A_SHADER,
    bufferB: DEFAULT_BUFFER_B_SHADER,
  });
  const [activeShader, setActiveShader] = useState<ShaderName>('finalPass');
  const [compileTimes, setCompileTimes] = useState<CompileTimes>({});
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const [targetFps, setTargetFps] = useState<number>(60);
  const [timeScale, setTimeScale] = useState(1.0);
  const [isWordWrapOn, setIsWordWrapOn] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [editorWidth, setEditorWidth] = useState(65); // percentage
  
  const [textures, setTextures] = useState<TextureAsset[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const handleCodeChange = (code: string | undefined) => {
    if (code !== undefined) {
      setShaderCodes(prev => ({ ...prev, [activeShader]: code }));
    }
  };

  const handleTextureUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const availableSlots = MAX_TEXTURES - textures.length;
    if (availableSlots <= 0) {
      alert(`Maximum of ${MAX_TEXTURES} textures reached.`);
      return;
    }

    const filesToProcess = Array.from(files);

    if (filesToProcess.length > availableSlots) {
      alert(`You can only upload ${availableSlots} more texture(s). The first ${availableSlots} files will be added.`);
    }
    
    const filesToAdd = filesToProcess.slice(0, availableSlots);
    if (filesToAdd.length === 0) return;

    const newTextures: TextureAsset[] = [];

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          newTextures.push({
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            dataUrl,
          });
          
          if (newTextures.length === filesToAdd.length) {
            setTextures(prev => [...prev, ...newTextures]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, [textures]);

  const handleTextureFromUrl = useCallback(async (url: string): Promise<void> => {
    if (textures.length >= MAX_TEXTURES) {
      const message = `Maximum of ${MAX_TEXTURES} textures reached.`;
      alert(message);
      return Promise.reject(new Error(message));
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('The provided URL does not point to a valid image.');
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const fileName = new URL(url).pathname.split('/').pop() || 'texture-from-url';

      const newTexture: TextureAsset = {
        id: `${fileName}-${Date.now()}`,
        name: fileName,
        dataUrl,
      };

      setTextures(prev => [...prev, newTexture]);

    } catch (error) {
      console.error("Error loading texture from URL:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred while fetching the texture.');
    }
  }, [textures]);

  const handleDeleteTexture = useCallback((textureId: string) => {
    setTextures(prevTextures => prevTextures.filter(texture => texture.id !== textureId));
  }, []);

  const handleExportProject = useCallback(() => {
    const projectData = {
      shaderCodes,
      buffers,
      textures,
    };

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'shader-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [shaderCodes, buffers, textures]);

  const handleImportProject = useCallback((file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file.');
        }
        const data = JSON.parse(result);

        if (!data.shaderCodes || !data.buffers || !data.textures) {
          throw new Error('Invalid project file format.');
        }

        setShaderCodes(data.shaderCodes);
        setBuffers(data.buffers);
        setTextures(data.textures);
        setActiveShader('finalPass');
        setRestartKey(k => k + 1);
      } catch (error) {
        console.error("Failed to import project:", error);
        alert(`Import failed: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
      }
    };
    reader.onerror = () => {
        alert('Error reading the project file.');
    };
    reader.readAsText(file);
  }, []);

  const addBuffer = useCallback(() => {
    setBuffers(prevBuffers => {
      if (prevBuffers.length >= MAX_BUFFERS) {
        alert(`Maximum of ${MAX_BUFFERS} buffers reached.`);
        return prevBuffers;
      }
      const nextBufferChar = String.fromCharCode('A'.charCodeAt(0) + prevBuffers.length);
      const newBufferName: string = `buffer${nextBufferChar}`;
      
      setShaderCodes(prevCodes => ({
        ...prevCodes,
        [newBufferName]: DEFAULT_NEW_BUFFER_SHADER.replace(/Buffer X/g, `Buffer ${nextBufferChar}`)
      }));
      
      setActiveShader(newBufferName);
      return [...prevBuffers, newBufferName];
    });
  }, []);

  const handleDeleteLastBuffer = useCallback(() => {
    if (buffers.length <= 1) {
      console.warn("Cannot delete the base buffer.");
      return;
    }

    const lastBuffer = buffers[buffers.length - 1];

    if (activeShader === lastBuffer) {
      setActiveShader('finalPass');
    }

    setBuffers(prev => prev.slice(0, -1));
    
    setShaderCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[lastBuffer];
      return newCodes;
    });
  }, [buffers, activeShader]);

  const handleCompileSuccess = useCallback((source: ShaderName, time: number) => {
    setCompileTimes(prev => ({ ...prev, [source]: time }));
    // When a shader compiles, clear its previous time after a short delay
    setTimeout(() => {
        setCompileTimes(prev => ({ ...prev, [source]: null }));
    }, 2000);
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);
  
  const handlePlayPause = () => setIsPlaying(p => !p);
  const handleRestart = () => {
    setRestartKey(k => k + 1);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleTargetFpsChange = (fps: number) => {
    setTargetFps(fps);
    setRestartKey(k => k + 1);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    canvasContainerRef.current?.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  };

  const handleToggleWordWrap = () => {
    setIsWordWrapOn(prev => !prev);
  };

  const handleMouseDownOnResizer = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!editorPanelRef.current || !mainContentRef.current) return;

    const startX = e.clientX;
    const startWidth = editorPanelRef.current.getBoundingClientRect().width;
    const containerWidth = mainContentRef.current.getBoundingClientRect().width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const newPixelWidth = startWidth + dx;
        
        const newPercentageWidth = (newPixelWidth / containerWidth) * 100;
        
        const clampedWidth = Math.max(25, Math.min(75, newPercentageWidth));
        setEditorWidth(clampedWidth);
    };

    const handleMouseUp = () => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };


  const shaderTabs: ShaderName[] = ['help', 'finalPass', ...buffers];
  const toggleExplorer = () => setIsExplorerOpen(prev => !prev);


  return (
    <div className="flex h-screen w-screen bg-transparent text-white font-mono p-2 gap-2">
      <ActivityBar isExplorerOpen={isExplorerOpen} onToggleExplorer={toggleExplorer} />
      {isExplorerOpen && (
        <AssetExplorer 
          textures={textures}
          onTextureUpload={handleTextureUpload}
          onDeleteTexture={handleDeleteTexture}
          onTextureFromUrl={handleTextureFromUrl}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
        />
      )}
      <div className="flex flex-1 min-w-0 flex-col md:flex-row gap-2 md:gap-0" ref={mainContentRef}>
        <div 
          ref={editorPanelRef}
          className="h-1/2 md:h-full flex flex-col bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50"
          style={!isMobile ? { width: `${editorWidth}%` } : {}}
        >
          <Tabs
            tabs={shaderTabs}
            activeTab={activeShader}
            onTabChange={(tab) => setActiveShader(tab as ShaderName)}
            onAddBuffer={addBuffer}
            buffers={buffers}
            onDeleteLastBuffer={handleDeleteLastBuffer}
            canAddBuffer={buffers.length < MAX_BUFFERS}
            isWordWrapOn={isWordWrapOn}
            onToggleWordWrap={handleToggleWordWrap}
          />
          <div className="flex-1 relative min-h-0">
            <Editor
              value={shaderCodes[activeShader] || ''}
              onChange={handleCodeChange}
              isWordWrapOn={isWordWrapOn}
            />
          </div>
        </div>

        <div
          onMouseDown={handleMouseDownOnResizer}
          className="w-2 h-full cursor-col-resize hidden md:flex items-center justify-center group flex-shrink-0"
          title="Resize editor"
        >
          <div className="w-0.5 h-10 bg-zinc-700 group-hover:bg-cyan-400 transition-colors duration-200 rounded-full"></div>
        </div>

        <div 
          className="h-1/2 md:h-full relative bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50 @container" 
          style={!isMobile ? { width: `calc(100% - ${editorWidth}% - 0.5rem)`} : {}}
          ref={canvasContainerRef}>
          <ShaderCanvas
            key={restartKey}
            shaderCodes={shaderCodes}
            buffers={buffers}
            textures={textures}
            onCompileSuccess={handleCompileSuccess}
            onFpsUpdate={handleFpsUpdate}
            onTimeUpdate={handleTimeUpdate}
            isPlaying={isPlaying}
            targetFps={targetFps}
            timeScale={timeScale}
          />
          <StatsDisplay fps={fps} compileTime={compileTimes[activeShader] || null} />
          <Controls 
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
            onFullscreen={handleFullscreen}
            targetFps={targetFps}
            onTargetFpsChange={handleTargetFpsChange}
            timeScale={timeScale}
            onTimeScaleChange={setTimeScale}
            currentTime={currentTime}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
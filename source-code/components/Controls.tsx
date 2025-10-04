import React from 'react';
import { PlayIcon, PauseIcon, RestartIcon, FullscreenIcon, ClockIcon, SpeedIcon } from './icons';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onFullscreen: () => void;
  targetFps: number;
  onTargetFpsChange: (fps: number) => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  currentTime: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  onPlayPause, 
  onRestart, 
  onFullscreen,
  targetFps,
  onTargetFpsChange,
  timeScale,
  onTimeScaleChange,
  currentTime,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 flex items-center justify-between gap-x-2 p-1 sm:p-2">
      {/* Left Group: Playback Controls & Time */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onPlayPause} className="text-white hover:bg-white/10 rounded-md p-1 sm:p-1.5 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={onRestart} className="text-white hover:bg-white/10 rounded-md p-1 sm:p-1.5 transition-colors" aria-label="Restart">
          <RestartIcon />
        </button>
        <div className="w-px h-6 bg-white/20 ml-1 hidden sm:block"></div>
        <div className="flex items-center gap-1 text-white/80 pl-1" title="Current shader time (iTime)">
            <ClockIcon />
            <span className="text-xs sm:text-sm font-bold w-14 text-left tabular-nums text-white">
                {currentTime.toFixed(2)}s
            </span>
        </div>
      </div>

      {/* Right Group: Performance & View Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
         <div className="hidden @[22rem]:flex items-center gap-1 sm:gap-2">
            <label htmlFor="timescale-slider" className="text-xs text-white/70 hidden sm:inline" title="Time Scale">
              <SpeedIcon />
            </label>
            <input
              id="timescale-slider"
              type="range"
              min="0"
              max="4"
              step="0.01"
              value={timeScale}
              onChange={(e) => onTimeScaleChange(parseFloat(e.target.value))}
              className="w-12 sm:w-16 md:w-20 accent-sky-500 min-w-0"
              title={`Time Scale: ${timeScale.toFixed(2)}x`}
            />
            <span className="text-xs sm:text-sm font-bold w-10 text-right tabular-nums text-white">{timeScale.toFixed(2)}x</span>
        </div>
         <div className="hidden @[22rem]:flex items-center gap-1 sm:gap-2">
            <label htmlFor="fps-slider" className="text-xs text-white/70 hidden sm:inline">FPS</label>
            <input
              id="fps-slider"
              type="range"
              min="1"
              max="60"
              value={targetFps}
              onChange={(e) => onTargetFpsChange(parseInt(e.target.value, 10))}
              className="w-12 sm:w-16 md:w-20 accent-sky-500 min-w-0"
              title={`Target Framerate: ${targetFps} FPS`}
            />
            <span className="text-xs sm:text-sm font-bold w-8 text-right tabular-nums text-white">{targetFps}</span>
        </div>
        <button onClick={onFullscreen} className="text-white hover:bg-white/10 rounded-md p-1 sm:p-1.5 transition-colors" aria-label="Toggle Fullscreen">
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
};

export default Controls;
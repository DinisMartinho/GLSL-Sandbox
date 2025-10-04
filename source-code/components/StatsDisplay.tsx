import React from 'react';

interface StatsDisplayProps {
  fps: number;
  compileTime: number | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ fps, compileTime }) => {
  return (
    <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-md p-2 text-xs font-mono text-white/80 select-none pointer-events-none">
      <div className="flex items-center justify-between gap-4">
        <span>FPS</span>
        <span className="font-bold text-white">{fps}</span>
      </div>
      {compileTime !== null && (
         <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-white/10">
            <span>Compile</span>
            <span className="font-bold text-cyan-400">{compileTime.toFixed(2)} ms</span>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
import React from 'react';

const InfoPanel = () => {
  return (
    <div className="info-panel h-full w-full bg-transparent text-white p-6 overflow-y-auto font-mono text-sm leading-relaxed">
      <pre className="whitespace-pre-wrap">
        <span className="comment">/**
         * Welcome to the Shader Sandbox!
         * 
         * This is a real-time GLSL editor. Write fragment shaders on the left,
         * see your creations render on the right.
         *
         * This document is your guide to the built-in features and uniforms.
         */</span>
        
        {'\n\n'}

        <span className="comment">{'//'} ==================================================================</span>
        {'\n'}
        <span className="comment">{'//'}  Global Uniforms - Your toolbox for every shader</span>
        {'\n'}
        <span className="comment">{'//'} ==================================================================</span>
        
        {'\n\n'}
        <span className="type">vec3</span>  <span className="uniform">iResolution</span>; <span className="comment">{'//'} Viewport resolution in pixels (width, height, aspect ratio)</span>
        {'\n'}
        <span className="type">float</span> <span className="uniform">iTime</span>;       <span className="comment">{'//'} Shader playback time in seconds</span>
        {'\n'}
        <span className="type">vec4</span>  <span className="uniform">iMouse</span>;      <span className="comment">{'//'} Mouse coordinates in pixels.</span>
        {'\n'}
        <span className="comment">{'//'}               .xy = current position (while dragging)</span>
        {'\n'}
        <span className="comment">{'//'}               .zw = position on click (negative when button is up)</span>
        
        {'\n\n'}

        <span className="comment">{'//'} ==================================================================</span>
        {'\n'}
        <span className="comment">{'//'}  The Buffer System & iChannels - Multi-pass rendering</span>
        {'\n'}
        <span className="comment">{'//'} ==================================================================</span>
        {'\n\n'}
        <span className="comment">/**
         * Shaders can be chained together. Each 'Buffer' renders to a texture
         * that can be used as an input to other shaders via `iChannel` uniforms.
         *
         * The `Final Pass` shader is what you see on screen. It reads from the
         * buffers.
         *
         * IMPORTANT: For any given buffer, `iChannel0` is special. It contains
         * that buffer's *own output from the previous frame*. This is the key
         * to creating feedback effects, simulations, and fractals.
         */</span>
        
        {'\n\n\n'}
        <span className="comment">{'//'} --- Input Mapping Rules ---</span>
        {'\n\n'}
        <span className="text">In </span><span className="keyword">'Final Pass'</span><span className="text">:</span>
        {'\n'}
        <span className="keyword">uniform sampler2D</span> <span className="uniform">iChannel0</span>; <span className="comment">{'//'} Output of Buffer A</span>
        {'\n'}
        <span className="keyword">uniform sampler2D</span> <span className="uniform">iChannel1</span>; <span className="comment">{'//'} Output of Buffer B</span>
        {'\n'}
        <span className="comment">{'//'} ...and so on.</span>
        
        {'\n\n'}
        <span className="text">In </span><span className="keyword">'Buffer A'</span><span className="text">:</span>
        {'\n'}
        <span className="keyword">uniform sampler2D</span> <span className="uniform">iChannel0</span>; <span className="comment">{'//'} Buffer A's own previous frame (feedback)</span>
        
        {'\n\n'}
        <span className="text">In </span><span className="keyword">'Buffer B'</span><span className="text">:</span>
        {'\n'}
        <span className="keyword">uniform sampler2D</span> <span className="uniform">iChannel0</span>; <span className="comment">{'//'} Buffer B's own previous frame (feedback)</span>
        {'\n'}
        <span className="keyword">uniform sampler2D</span> <span className="uniform">iChannel1</span>; <span className="comment">{'//'} Output of Buffer A</span>
        
        {'\n\n\n'}
        <span className="comment">{'//'} ==================================================================</span>
        {'\n'}
        <span className="comment">{'//'}  Quick Start - Your first shader</span>
        {'\n'}
        <span className="comment">{'//'} ==================================================================</span>
        {'\n\n'}
        <span className="keyword">void</span> <span className="function">mainImage</span>(<span className="keyword">out</span> <span className="type">vec4</span> fragColor, <span className="keyword">in</span> <span className="type">vec2</span> fragCoord)
        {'\n'}
        {'{'}
        {'\n'}
        <span className="comment">    // Normalize coordinates to go from 0.0 to 1.0</span>
        {'\n'}
        {'    '}<span className="type">vec2</span> uv = fragCoord/<span className="uniform">iResolution</span>.xy;
        {'\n\n'}
        <span className="comment">    // Sample the texture from Buffer A (available on iChannel0)</span>
        {'\n'}
        {'    '}<span className="type">vec3</span> color = <span className="function">texture</span>(<span className="uniform">iChannel0</span>, uv).rgb;
        {'\n\n'}
        <span className="comment">    // Output the final color</span>
        {'\n'}
        {'    '}fragColor = <span className="type">vec4</span>(color, 1.0);
        {'\n'}
        {'}'}
      </pre>
    </div>
  );
};

export default InfoPanel;

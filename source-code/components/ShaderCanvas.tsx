

import React, { useRef, useEffect, useState } from 'react';
import { DEFAULT_VERTEX_SHADER, MAX_TEXTURES } from '../constants';
import type { ShaderName, TextureAsset } from '../App';

declare const THREE: any;

interface BufferResource {
  material: any;
  rt1: any;
  rt2: any;
}

interface ShaderCanvasProps {
  shaderCodes: Partial<Record<ShaderName, string>>;
  buffers: string[];
  textures: TextureAsset[];
  isPlaying: boolean;
  targetFps: number;
  timeScale: number;
  onCompileSuccess: (source: ShaderName, time: number) => void;
  onFpsUpdate: (fps: number) => void;
  onTimeUpdate: (time: number) => void;
}

const createTexChannelUniforms = () => {
  let uniforms = '';
  for (let i = 0; i < MAX_TEXTURES; i++) {
    uniforms += `  uniform sampler2D iTexChannel${i};\n`;
  }
  return uniforms;
};

const createShaderString = (shaderCode: string) => `
  varying vec2 vUv;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform float iTimeDelta;
  uniform int iFrame;
  uniform vec4 iDate;
  uniform vec4 iMouse;
  
  // Buffer inputs
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform sampler2D iChannel2;
  uniform sampler2D iChannel3;
  
  // Global texture inputs
${createTexChannelUniforms()}

  ${shaderCode}

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
`;

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  shaderCodes,
  buffers,
  textures,
  isPlaying,
  targetFps,
  timeScale,
  onCompileSuccess,
  onFpsUpdate,
  onTimeUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0, z: 0, w: 0 });
  const timeRef = useRef(0);
  const frameRef = useRef(0);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  
  const [loadedThreeTextures, setLoadedThreeTextures] = useState<any[]>([]);
  const loadedThreeTexturesRef = useRef<any[]>([]);

  useEffect(() => {
    loadedThreeTexturesRef.current = loadedThreeTextures;
  }, [loadedThreeTextures]);
  
  const stateRef = useRef<{
    scene: any;
    camera: any;
    clock: any;
    plane: any;
    imageMaterial: any;
    bufferResources: Record<string, BufferResource>;
    dummyTexture: any;
  } | null>(null);

  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const lastAnimateTimeRef = useRef(performance.now());

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  const timeScaleRef = useRef(timeScale);
  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  // Effect for loading and managing textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const newThreeTextures = textures.map(texAsset => {
      const texture = textureLoader.load(texAsset.dataUrl);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    });

    // Clean up old textures that are no longer in use
    const oldTextures = loadedThreeTextures.filter(
      (t) => !newThreeTextures.some((nt) => nt.uuid === t.uuid)
    );
    oldTextures.forEach(t => t.dispose());

    setLoadedThreeTextures(newThreeTextures);

    return () => {
      // Cleanup all textures on component unmount
      newThreeTextures.forEach(t => t.dispose());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);


  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    mountNode.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const dummyTexture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
    dummyTexture.needsUpdate = true;

    const texUniforms: Record<string, { value: any }> = {};
    for (let i = 0; i < MAX_TEXTURES; i++) {
      texUniforms[`iTexChannel${i}`] = { value: dummyTexture };
    }

    const baseUniforms = () => ({
      iTime: { value: 0 },
      iTimeDelta: { value: 0 },
      iFrame: { value: 0 },
      iDate: { value: new THREE.Vector4() },
      iResolution: { value: new THREE.Vector3(mountNode.clientWidth, mountNode.clientHeight, 1) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      iChannel0: { value: dummyTexture },
      iChannel1: { value: dummyTexture },
      iChannel2: { value: dummyTexture },
      iChannel3: { value: dummyTexture },
      ...texUniforms,
    });

    const renderTargetOptions = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    };
    
    const bufferResources: Record<string, BufferResource> = {};
    buffers.forEach(bufferName => {
        const rt1 = new THREE.WebGLRenderTarget(mountNode.clientWidth, mountNode.clientHeight, renderTargetOptions);
        const rt2 = new THREE.WebGLRenderTarget(mountNode.clientWidth, mountNode.clientHeight, renderTargetOptions);
        const material = new THREE.ShaderMaterial({
            uniforms: baseUniforms(),
            vertexShader: DEFAULT_VERTEX_SHADER,
            fragmentShader: createShaderString(shaderCodes[bufferName] || ''),
        });
        bufferResources[bufferName] = { material, rt1, rt2 };
    });

    const imageMaterial = new THREE.ShaderMaterial({
      uniforms: baseUniforms(),
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: createShaderString(shaderCodes.finalPass || '')
    });

    const plane = new THREE.Mesh(geometry, imageMaterial);
    scene.add(plane);
    
    stateRef.current = {
      scene, camera, clock, plane, imageMaterial, bufferResources, dummyTexture
    };
    timeRef.current = 0;
    frameRef.current = 0;

    const handleMouseMove = (event: MouseEvent) => {
        const bounds = mountNode.getBoundingClientRect();
        mouseRef.current.x = event.clientX - bounds.left;
        mouseRef.current.y = bounds.height - (event.clientY - bounds.top);
    };
    const handleMouseUp = () => {
        mouseRef.current.z = -Math.abs(mouseRef.current.z);
        mouseRef.current.w = -Math.abs(mouseRef.current.w);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleMouseDown = (event: MouseEvent) => {
        handleMouseMove(event); 
        mouseRef.current.z = mouseRef.current.x;
        mouseRef.current.w = mouseRef.current.y;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    mountNode.addEventListener('mousemove', handleMouseMove);
    mountNode.addEventListener('mousedown', handleMouseDown);
    
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const state = stateRef.current;
      if (!state) return;
      
      // Fix: Destructure properties from stateRef.current. This allows TypeScript's
      // control flow analysis to correctly infer types within loops and callbacks.
      const { scene, camera, clock, plane, imageMaterial, bufferResources, dummyTexture } = state;

      const delta = clock.getDelta();
      if (isPlayingRef.current) {
        timeRef.current += delta * timeScaleRef.current;
        frameRef.current++;
      }
      onTimeUpdate(timeRef.current);

      // --- Throttling logic ---
      const now = performance.now();
      const elapsed = now - lastAnimateTimeRef.current;
      const frameInterval = 1000 / targetFps;

      if (elapsed < frameInterval) {
        return; // Skip rendering this frame
      }
      lastAnimateTimeRef.current = now - (elapsed % frameInterval); // Correct for drift
      
      // --- FPS Counter ---
      frameCountRef.current++;
      if (now - lastFrameTimeRef.current >= 1000) {
        onFpsUpdate(frameCountRef.current);
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      
      const currentTime = timeRef.current;
      const currentMouse = new THREE.Vector4(mouseRef.current.x, mouseRef.current.y, mouseRef.current.z, mouseRef.current.w);
      const d = new Date();
      const currentDate = new THREE.Vector4(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000
      );

      // FIX: Explicitly type `r` as BufferResource to fix type inference issue with Object.values.
      const allMaterials = [imageMaterial, ...Object.values(bufferResources).map((r: BufferResource) => r.material)];
      allMaterials.forEach(mat => {
        for (let i = 0; i < MAX_TEXTURES; i++) {
            mat.uniforms[`iTexChannel${i}`].value = loadedThreeTexturesRef.current[i] || dummyTexture;
        }
      });


      const currentFrameOutputs: Record<string, any> = {};

      buffers.forEach((bufferName, bufferIndex) => {
        const resources = bufferResources[bufferName];
        if (!resources) return;

        resources.material.uniforms.iTime.value = currentTime;
        resources.material.uniforms.iTimeDelta.value = delta;
        resources.material.uniforms.iFrame.value = frameRef.current;
        resources.material.uniforms.iDate.value = currentDate;
        resources.material.uniforms.iMouse.value = currentMouse;
        resources.material.uniforms.iChannel0.value = resources.rt2.texture;
        
        for(let i=0; i < bufferIndex; i++) {
            const prevBufferName = buffers[i];
            const channelIndex = i + 1;
            if (resources.material.uniforms[`iChannel${channelIndex}`]) {
              resources.material.uniforms[`iChannel${channelIndex}`].value = currentFrameOutputs[prevBufferName];
            }
        }
        
        const needsCompile = resources.material.needsUpdate;
        let compileTime: number | null = null;
        
        const start = performance.now();
        plane.material = resources.material;
        renderer.setRenderTarget(resources.rt1);
        renderer.render(scene, camera);
        if(needsCompile) {
          compileTime = performance.now() - start;
          onCompileSuccess(bufferName, compileTime);
        }
        
        currentFrameOutputs[bufferName] = resources.rt1.texture;
        
        const temp = resources.rt1;
        resources.rt1 = resources.rt2;
        resources.rt2 = temp;
      });

      imageMaterial.uniforms.iTime.value = currentTime;
      imageMaterial.uniforms.iTimeDelta.value = delta;
      imageMaterial.uniforms.iFrame.value = frameRef.current;
      imageMaterial.uniforms.iDate.value = currentDate;
      imageMaterial.uniforms.iMouse.value = currentMouse;
      buffers.forEach((bufferName, index) => {
        if(imageMaterial.uniforms[`iChannel${index}`]) {
          imageMaterial.uniforms[`iChannel${index}`].value = currentFrameOutputs[bufferName];
        }
      });

      const needsCompile = imageMaterial.needsUpdate;
      let compileTime: number | null = null;

      const start = performance.now();
      plane.material = imageMaterial;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      if(needsCompile) {
        compileTime = performance.now() - start;
        onCompileSuccess('finalPass', compileTime);
      }
    };
    animate();
    
    const handleResize = () => {
      const { clientWidth, clientHeight } = mountNode;
      renderer.setSize(clientWidth, clientHeight);
      const newResolution = new THREE.Vector3(clientWidth, clientHeight, 1);
      
      if (stateRef.current) {
        stateRef.current.imageMaterial.uniforms.iResolution.value = newResolution;
        Object.values(stateRef.current.bufferResources).forEach((res: BufferResource) => {
          res.material.uniforms.iResolution.value = newResolution;
          res.rt1.setSize(clientWidth, clientHeight);
          res.rt2.setSize(clientWidth, clientHeight);
        });
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountNode);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      resizeObserver.disconnect();
      mountNode.removeEventListener('mousemove', handleMouseMove);
      mountNode.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (renderer.domElement && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
      
      stateRef.current?.dummyTexture.dispose();
      Object.values(stateRef.current?.bufferResources || {}).forEach((res: BufferResource) => {
        res.rt1.dispose();
        res.rt2.dispose();
      });

      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffers]);

  useEffect(() => {
    if (!stateRef.current) return;
    
    // FIX: Destructure properties from the mutable `stateRef.current` into local
    // constants. This allows TypeScript's control flow analysis to correctly
    // infer types within the loop, resolving an error where an indexed property
    // was being inferred as 'unknown'.
    const { bufferResources, imageMaterial } = stateRef.current;

    Object.entries(shaderCodes).forEach(([name, code]: [string, string | undefined]) => {
      if (!code) return;
      
      let material: any;
      if (name === 'finalPass') {
        material = imageMaterial;
      } else {
        const resource = bufferResources[name];
        if (resource) {
            material = resource.material;
        }
      }

      if (material && material.fragmentShader !== createShaderString(code)) {
        material.fragmentShader = createShaderString(code);
        material.needsUpdate = true;
      }
    });
  }, [shaderCodes]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default ShaderCanvas;
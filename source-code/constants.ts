export const MAX_TEXTURES = 8;

export const DEFAULT_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const DEFAULT_README_CONTENT = `/**
 * Welcome to the GLSL Shader Sandbox!
 * 
 * This editor uses Three.js to compile and run your GLSL shaders in real-time.
 * It's designed for creating multi-pass rendering effects.
 *
 * The default project demonstrates a common workflow:
 *   - Buffer A: Renders a primary 3D scene.
 *   - Buffer B: Applies a post-processing effect (edge detection).
 *   - Final Pass: Combines the previous passes into the final image.
 */

// ==================================================================
//  Available Uniforms (in all shaders)
// ==================================================================

vec3  iResolution; // Viewport resolution (width, height, aspect ratio)
float iTime;       // Playback time in seconds
float iTimeDelta;  // Time since last frame
int   iFrame;      // Current frame number
vec4  iMouse;      // Mouse coords: .xy = current, .zw = on click
vec4  iDate;       // (year, month, day, time in seconds)


// ==================================================================
//  Multi-Pass Rendering (iChannels)
// ==================================================================

/**
 * Chain shaders together by creating multiple Buffers. Each buffer renders
 * to a texture, which can be used as an input in subsequent shaders.
 * These textures are accessed via \`iChannel\` uniforms.
 *
 * --- iChannel Input Rules ---
 *
 * >> In 'Final Pass':
 *    uniform sampler2D iChannel0; // Output of Buffer A
 *    uniform sampler2D iChannel1; // Output of Buffer B
 *    ... etc.
 *
 * >> In any Buffer (e.g. Buffer B):
 *    iChannel0 is a special feedback channel.
 *    uniform sampler2D iChannel0; // This buffer's *own* output from the last frame.
 *
 *    Other channels read from previous buffers in order.
 *    uniform sampler2D iChannel1; // Output of Buffer A
 *
 * This feedback mechanism on iChannel0 is key for effects that evolve
 * over time, like simulations or fractals.
 */


// ==================================================================
//  Custom Textures (iTexChannel)
// ==================================================================
/**
 * Upload your own images in the Asset Explorer (folder icon on the left).
 * They become globally available to all shaders.
 */

uniform sampler2D iTexChannel0; // Your first uploaded texture
uniform sampler2D iTexChannel1; // Your second...
// ...up to iTexChannel7.
`;


export const DEFAULT_FRAGMENT_SHADER = `
/**
 * Final Pass: Compositing
 *
 * This is the final stage. It combines the textures from the preceding
 * buffers to produce the image you see on screen.
 *
 * Inputs:
 *   iChannel0: The 3D scene from Buffer A.
 *   iChannel1: The edge-detection outline from Buffer B.
 */

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;

    // Sample the 3D scene from Buffer A.
    vec3 sceneColor = texture(iChannel0, uv).rgb;

    // Sample the outline from Buffer B.
    float outline = texture(iChannel1, uv).r;

    // Blend the scene and the outline.
    vec3 finalColor = mix(sceneColor, vec3(0.1, 0.1, 0.2), outline * 0.8);

    // Final output.
    fragColor = vec4(finalColor, 1.0);
}
`;

export const DEFAULT_BUFFER_A_SHADER = `
/**
 * Buffer A: 3D Raymarched Scene
 *
 * This shader generates a 3D scene by raymarching a sphere
 * distorted with 3D noise. It uses a simple toon shader for lighting.
 */

// 2D rotation matrix
mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// 3D Simplex noise by Stefan Gustavson
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Signed Distance Function (SDF) for our scene.
float map(vec3 p) {
    float baseSphere = length(p) - 0.5;
    float displacement = snoise(p * 2.0 + vec3(0.0, 0.0, iTime * 0.5)) * 0.1;
    return baseSphere + displacement;
}

// Calculate the surface normal using the SDF.
vec3 getNormal(vec3 p) {
    const float eps = 0.001;
    vec2 h = vec2(eps, 0);
    return normalize(vec3(
        map(p + h.xyy) - map(p - h.xyy),
        map(p + h.yxy) - map(p - h.yxy),
        map(p + h.yyx) - map(p - h.yyx)
    ));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Setup camera and normalized coordinates.
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0, 0.0, 2.0); // Ray Origin
    vec3 rd = normalize(vec3(uv, -1.0)); // Ray Direction

    // Animate camera rotation.
    ro.xz *= rotate(iTime * 0.6);
    rd.xz *= rotate(iTime * 0.6);

    // Simple sky gradient background.
    vec2 p_bg = fragCoord.xy / iResolution.xy;
    vec3 skyColor = mix(vec3(0.7, 0.85, 1.0), vec3(0.95, 0.95, 1.0), p_bg.y);

    float t = 0.0;
    vec3 col = skyColor;

    // Raymarching loop.
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);

        // Hit condition.
        if (d < 0.001) {
            vec3 n = getNormal(p);
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float intensity = max(dot(n, lightDir), 0.0);
            
            vec3 baseColor = vec3(0.6, 0.8, 1.0);
            vec3 ambientColor = vec3(0.4, 0.5, 0.9);

            // Simple toon shading.
            if (intensity > 0.8) {
                col = baseColor * 1.0;
            } else if (intensity > 0.45) {
                col = baseColor * 0.7;
            } else if (intensity > 0.25) {
                col = baseColor * 0.5;
            } else {
                // Add ambient light to shadows.
                col = baseColor * 0.4 + ambientColor * 0.3;
            }
            
            // Hit found, exit loop.
            break;
        }
        
        // Bail out if ray goes too far.
        if (t > 100.0) { break; }

        // March the ray forward.
        t += d;
    }

    fragColor = vec4(col, 1.0);
}
`;

export const DEFAULT_BUFFER_B_SHADER = `
/**
 * Buffer B: Edge Detection Post-Process
 *
 * This shader applies a Sobel filter to the output of Buffer A
 * to detect edges, creating an outline effect.
 */
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 texel = 1.0 / iResolution.xy; // The size of one pixel

    // Sample neighboring pixels from Buffer A's output (iChannel1)
    float tl = texture(iChannel1, uv + vec2(-texel.x, texel.y)).r;
    float t  = texture(iChannel1, uv + vec2(0.0, texel.y)).r;
    float tr = texture(iChannel1, uv + vec2(texel.x, texel.y)).r;
    float l  = texture(iChannel1, uv + vec2(-texel.x, 0.0)).r;
    float r  = texture(iChannel1, uv + vec2(texel.x, 0.0)).r;
    float bl = texture(iChannel1, uv + vec2(-texel.x, -texel.y)).r;
    float b  = texture(iChannel1, uv + vec2(0.0, -texel.y)).r;
    float br = texture(iChannel1, uv + vec2(texel.x, -texel.y)).r;

    // Apply Sobel operator.
    float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
    float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;

    // Calculate edge strength.
    float g = sqrt(gx*gx + gy*gy);
    
    // Sharpen the edge.
    float edge = smoothstep(0.2, 0.21, g);

    fragColor = vec4(vec3(edge), 1.0);
}
`;


export const DEFAULT_NEW_BUFFER_SHADER = `
/**
 * Buffer X: Example Effect
 *
 * This buffer demonstrates a simple post-processing effect.
 * iChannel inputs depend on buffer order. If this were Buffer C,
 * iChannel1 would be Buffer A's output, and iChannel2 would be Buffer B's.
 *
 * This example applies a twirl effect to Buffer A.
 */

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;

    // Create a twirl distortion based on distance from center.
    vec2 center = vec2(0.5, 0.5);
    vec2 tc = uv - center;
    float dist = length(tc);
    float angle = atan(tc.y, tc.x);
    
    angle += dist * 10.0 * sin(iTime * 0.5);
    
    tc.x = cos(angle) * dist;
    tc.y = sin(angle) * dist;
    
    vec2 twistedUv = tc + center;

    // Sample Buffer A with distorted UVs.
    vec3 col = texture(iChannel1, twistedUv).rgb;

    fragColor = vec4(col, 1.0);
}
`;

export const SHADER_COLORS: Record<string, string> = {
  help: 'text-gray-400',
  finalPass: 'text-rose-400',
  bufferA: 'text-cyan-400',
  bufferB: 'text-fuchsia-400',
  bufferC: 'text-amber-400',
  bufferD: 'text-lime-400',
  bufferE: 'text-rose-400',
  bufferF: 'text-indigo-400',
  bufferG: 'text-teal-400',
  bufferH: 'text-yellow-400',
  bufferI: 'text-sky-400',
  bufferJ: 'text-pink-400',
  bufferK: 'text-orange-400',
  bufferL: 'text-green-400',
  bufferM: 'text-violet-400',
  bufferN: 'text-red-500',
  bufferO: 'text-blue-400',
  bufferP: 'text-emerald-400',
  bufferQ: 'text-cyan-500',
  bufferR: 'text-fuchsia-500',
  bufferS: 'text-amber-500',
  bufferT: 'text-lime-500',
  bufferU: 'text-rose-500',
  bufferV: 'text-indigo-500',
  bufferW: 'text-teal-500',
  bufferX: 'text-yellow-500',
  bufferY: 'text-sky-500',
  bufferZ: 'text-pink-500',
};
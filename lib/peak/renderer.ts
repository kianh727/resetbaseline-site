/*
 * The Peak's renderer — hand-rolled WebGL2, no library.
 *
 * **§11.2 gives the scene 140 KB gzip, lazy and excluded from the core.** Three
 * .js tree-shaken to a mesh, a camera and a custom shader is around 120 KB
 * before any of this site's own code, which would spend the entire budget on
 * a framework for 364 triangles and one draw call. So the renderer is written
 * out: it is one buffer, one program, one draw, and the shader is where all the
 * interesting parts of §7.2 and §7.3 live anyway.
 *
 * ---
 *
 * **§7.3, and each clause is a line in the fragment shader:**
 *
 * > Albedo `#0E0C18`. **Lavender is *light*, never paint.** · **Posterized
 * > Lambert, 3 bands**, 0.04 transition. *The primary anti-cliché lever —
 * > smooth photoreal gradient makes it a mountain photo; banding makes it
 * > machined.* · Vertex AO baked at build. · **No shadow maps.**
 *
 * The posterisation is the load-bearing one. §19 bans *smooth photoreal diffuse
 * gradients* by name, and a Lambert term written the obvious way is exactly
 * that — the banding is not a style applied afterwards, it is the difference
 * between this and the thing the ban describes.
 *
 * **§7.1: it never rotates, drifts, or pulses.** The model matrix is identity
 * and there is no time input to the vertex stage. What moves is the light, and
 * only the light. A rotation here would satisfy every other constraint in this
 * file and break the one §7.1 states twice.
 */

import { buildPeak, type Mesh } from './geometry.ts'
import { lightDirection, type LightAngles } from './light.ts'

/** §7.1. Telephoto compression reads photographic. */
export const FOV_DEGREES = 28

const VERTEX_SHADER = `#version 300 es
in vec3 a_position;
in vec3 a_normal;
in float a_occlusion;

uniform mat4 u_projection;
uniform mat4 u_view;

out vec3 v_normal;
out float v_occlusion;
out vec3 v_viewDir;

void main() {
  // No model matrix and no time: §7.1's "never rotates, drifts, or pulses"
  // is the absence of a term here rather than a value chosen for one.
  vec4 viewPos = u_view * vec4(a_position, 1.0);

  // **The normal goes to view space, and the first version did not.** It was
  // interpolated in object space while v_viewDir was in view space, so the
  // fresnel dotted two vectors from different frames and returned a value with
  // no geometric meaning -- high nearly everywhere. The rim term then washed
  // the whole ridge in lavender, which is the one thing §7.3 forbids by name:
  // lavender is light, never paint. There is no non-uniform scale in u_view,
  // so its upper 3x3 is its own inverse transpose and this is correct.
  v_normal = mat3(u_view) * a_normal;
  v_occlusion = a_occlusion;
  v_viewDir = normalize(-viewPos.xyz);
  gl_Position = u_projection * viewPos;
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec3 v_normal;
in float v_occlusion;
in vec3 v_viewDir;

uniform vec3 u_lightDir;

out vec4 outColor;

// §7.3's palette. Lavender appears only as light, never as albedo.
const vec3 ALBEDO   = vec3(0.055, 0.047, 0.094);  // #0E0C18
const vec3 KEY      = vec3(0.788, 0.753, 1.000);  // #C9C0FF
const vec3 FILL     = vec3(0.102, 0.082, 0.188);  // #1A1530
const vec3 RIM      = vec3(0.545, 0.490, 1.000);  // #8B7DFF

const float KEY_STRENGTH  = 1.00;
const float FILL_STRENGTH = 0.12;
const float RIM_STRENGTH   = 0.85;
const float RIM_POWER      = 4.5;

// §7.3: three bands, 0.04 transition.
const float BANDS = 3.0;
const float TRANSITION = 0.04;

float posterize(float x) {
  float scaled = x * BANDS;
  float band = floor(scaled);
  float frac = scaled - band;
  // A soft edge of exactly TRANSITION, so the bands read as machined rather
  // than as aliasing. Any wider and it is the smooth gradient §19 bans.
  return (band + smoothstep(0.0, TRANSITION * BANDS, frac)) / BANDS;
}

void main() {
  vec3 n = normalize(v_normal);

  /*
   * **Face the normal toward the viewer on back-facing triangles.**
   *
   * The ridge is an open heightfield rather than a closed solid, so roughly
   * half its triangles wind away from the camera. Their normals then point
   * backwards, dot(n, viewDir) goes negative, the clamp takes it to 0, and the
   * fresnel term evaluates to 1 -- full rim -- across the whole surface. That
   * is what turned the peak into a flat lavender mass: not a rim that was too
   * strong, but a rim applied to every fragment. §7.3 is explicit that lavender
   * is light and never paint, and a rim everywhere is paint.
   */
  if (!gl_FrontFacing) n = -n;

  // The light direction is given in world space and the normal is now in view
  // space; both are rotations of the same frame here because the camera does
  // not roll, so the dot is taken after putting the light through the same
  // rotation the normal went through. Passed in already-transformed to keep
  // the fragment stage free of matrix work.
  float lambert = max(dot(n, normalize(u_lightDir)), 0.0);
  vec3 key = KEY * KEY_STRENGTH * posterize(lambert);

  // Hemisphere from below: prevents pure black without modelling form.
  float below = clamp(-n.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 fill = FILL * FILL_STRENGTH * below;

  // §7.2: "where the visible color lives".
  float fresnel = pow(1.0 - clamp(dot(n, normalize(v_viewDir)), 0.0, 1.0), RIM_POWER);
  vec3 rim = RIM * RIM_STRENGTH * fresnel;

  vec3 lit = ALBEDO * (key + fill) + rim;
  outColor = vec4(lit * v_occlusion, 1.0);
}`

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('could not create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`shader failed to compile: ${log}`)
  }
  return shader
}

function perspective(fovDegrees: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan((fovDegrees * Math.PI) / 360)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ])
}

/** A look-at from `eye` toward the origin, with +Y up. */
function view(eye: [number, number, number]): Float32Array {
  const [ex, ey, ez] = eye
  const len = Math.hypot(ex, ey, ez) || 1
  const [zx, zy, zz] = [ex / len, ey / len, ez / len]
  let [xx, xy, xz] = [zz, 0, -zx]
  const xl = Math.hypot(xx, xy, xz) || 1
  ;[xx, xy, xz] = [xx / xl, xy / xl, xz / xl]
  const [yx, yy, yz] = [zy * xz - zz * xy, zz * xx - zx * xz, zx * xy - zy * xx]

  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * ex + xy * ey + xz * ez),
    -(yx * ex + yy * ey + yz * ez),
    -(zx * ex + zy * ey + zz * ez),
    1,
  ])
}

export interface PeakRenderer {
  /** Draw one frame at the given light angles. */
  draw(angles: LightAngles): void
  resize(width: number, height: number): void
  dispose(): void
  readonly triangleCount: number
}

/**
 * @param eye the camera station. §7.5 gives three for P1 — base, mid, wide —
 * and this takes one so the station is the caller's rather than a mode here.
 */
export function createRenderer(
  canvas: HTMLCanvasElement,
  mesh: Mesh = buildPeak(),
  eye: [number, number, number] = [0, 0.75, 4.2],
): PeakRenderer | null {
  const gl = canvas.getContext('webgl2', {
    antialias: true,
    alpha: true,
    // The scene is atmosphere; a failed context must cost nothing (DS-6).
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const program = gl.createProgram()
  if (!program) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const buffers: WebGLBuffer[] = []
  const attribute = (name: string, data: Float32Array, size: number) => {
    const buffer = gl.createBuffer()
    if (!buffer) return
    buffers.push(buffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const location = gl.getAttribLocation(program, name)
    if (location < 0) return
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
  }

  attribute('a_position', mesh.positions, 3)
  attribute('a_normal', mesh.normals, 3)
  attribute('a_occlusion', mesh.occlusion, 1)

  const uProjection = gl.getUniformLocation(program, 'u_projection')
  const uView = gl.getUniformLocation(program, 'u_view')
  const uLightDir = gl.getUniformLocation(program, 'u_lightDir')

  const viewMatrix = view(eye)
  gl.useProgram(program)
  gl.uniformMatrix4fv(uView, false, viewMatrix)
  gl.enable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0)

  let projection = perspective(FOV_DEGREES, 1, 0.1, 100)

  return {
    triangleCount: mesh.triangleCount,

    resize(width, height) {
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      projection = perspective(FOV_DEGREES, width / Math.max(1, height), 0.1, 100)
    },

    draw(angles) {
      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.uniformMatrix4fv(uProjection, false, projection)
      const [lx, ly, lz] = lightDirection(angles)
      /*
       * Rotated into view space with the same upper 3x3 the vertex shader uses
       * on the normal. Done once per frame on the CPU rather than per fragment.
       */
      const m = viewMatrix
      gl.uniform3fv(uLightDir, [
        m[0]! * lx + m[4]! * ly + m[8]! * lz,
        m[1]! * lx + m[5]! * ly + m[9]! * lz,
        m[2]! * lx + m[6]! * ly + m[10]! * lz,
      ])
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, mesh.triangleCount * 3)
    },

    dispose() {
      /*
       * **The context is released, not just dropped.** A discarded WebGL
       * context costs a GPU allocation for the rest of the session on exactly
       * the low-end devices the tier ladder exists to protect — the same
       * reasoning `readCapabilities()` uses for its probe.
       */
      for (const buffer of buffers) gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

// The caught sequence's light from outside, carried past the window: a searchlight's or a torch's
// beam sweeping across the room, or, for a mashaal or an oil lantern (no beam before electric
// light), a soft flickering glow spilling in from where the flame is. One additive quad held in front of the camera,
// like the verdict flash: no light is added to the scene, so no shader recompiles, no shadow pass,
// and the low tier pays one cheap full-screen draw while it shows. Its source is a real place in the
// room (the window), projected every frame, so the beam comes from where the window is in the shot:
// out of it when the camera looks up, from above the frame when it looks down at the paper.
import * as THREE from 'three'
import { disposeTree } from './props'
import type { QualityTier } from './types'

const BEAM_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const BEAM_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAmount;
uniform float uAspect;
uniform vec2 uOrigin;
uniform float uAngle;
uniform float uWidth;
uniform float uReach;
uniform float uTime;
uniform float uCone;
varying vec2 vUv;
#if HAZE
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
#endif
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 d = p - uOrigin;
  float r = max(length(d), 1e-4);
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  float along = dot(d, dir);
  // how far off the beam's axis, as an angle: a soft cone with a brighter core
  float off = acos(clamp(along / r, -1.0, 1.0));
  float cone = 1.0 - smoothstep(uWidth * 0.3, uWidth, off);
  float core = 1.0 - smoothstep(0.0, uWidth * 0.45, off);
  // brightest near its source, fading across the room
  float fall = clamp(1.3 - 0.6 * r / uReach, 0.15, 1.0);
#if HAZE
  // smoke and dust drifting through it
  float haze = 0.68 + 0.32 * noise(p * 5.0 + vec2(uTime * 0.21, uTime * 0.08));
#else
  float haze = 1.0;
#endif
  // the source itself glows when it is in the shot
  float glow = exp(-r * r * 55.0) * 0.7;
  float beam = (cone * 0.55 + core * 0.45) * fall * haze * step(0.0, along);
  // a flame's light: no beam, a broad soft spill around the window that falls off across the room
  float spill = (exp(-r * r * 1.6) * 0.75 + 0.12 * (1.0 - smoothstep(0.2, 2.2, r))) * haze;
  float a = (mix(spill, beam, uCone) + glow) * uAmount;
  gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
}`

export interface Beam {
  mesh: THREE.Mesh
  /**
   * Where the light comes from in the room, how far it is carried along the window as it sweeps
   * (half the travel, a world vector), its colour (display, 0..1) and the cone's half-angle.
   */
  setup(o: { origin: THREE.Vector3; travel: THREE.Vector3; color: [number, number, number]; width: number; cone: boolean }): void
  /** How bright (0 hides it), and how far it has been carried across (-1..1). */
  set(amount: number, sweep: number): void
  /** Each frame while it shows: fill the view and re-aim from the source as the camera moves. */
  fit(camera: THREE.PerspectiveCamera, tMs: number): void
  dispose(): void
}

/** How far the beam turns against its carrier's travel: the patch of light crosses the room the other way. */
const SWING = 0.34

export function createBeam(tier: QualityTier): Beam {
  const mat = new THREE.ShaderMaterial({
    vertexShader: BEAM_VS,
    fragmentShader: BEAM_FS,
    defines: { HAZE: tier === 'low' ? 0 : 1 },
    uniforms: {
      uColor: { value: new THREE.Color(1, 0.9, 0.7) },
      uAmount: { value: 0 },
      uAspect: { value: 1 },
      uOrigin: { value: new THREE.Vector2(0, 1) },
      uAngle: { value: -Math.PI / 2 },
      uWidth: { value: 0.2 },
      uReach: { value: 1 },
      uTime: { value: 0 },
      uCone: { value: 1 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
  mesh.name = 'caught-beam'
  mesh.renderOrder = 999 // under the verdict flash, so the red still covers it
  mesh.frustumCulled = false
  mesh.visible = false
  mesh.position.z = -0.1
  const origin = new THREE.Vector3(0, 0.5, -0.5)
  const travel = new THREE.Vector3()
  const v = new THREE.Vector3()
  let sweep = 0
  const u = mat.uniforms
  return {
    mesh,
    setup(o) {
      origin.copy(o.origin)
      travel.copy(o.travel)
      ;(u.uColor?.value as THREE.Color).setRGB(o.color[0], o.color[1], o.color[2])
      if (u.uWidth) u.uWidth.value = o.width
      if (u.uCone) u.uCone.value = o.cone ? 1 : 0
    },
    set(amount, s) {
      if (u.uAmount) u.uAmount.value = amount
      sweep = s
      mesh.visible = amount > 0.002
    },
    fit(camera, tMs) {
      const h = 2 * 0.1 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      mesh.scale.set(h * camera.aspect * 1.02, h * 1.02, 1)
      const aspect = camera.aspect
      camera.updateMatrixWorld()
      // the source in the quad's frame (x across ±aspect/2, y ±0.5); behind the camera it sits above
      const src = origin.clone().addScaledVector(travel, sweep)
      v.copy(src).applyMatrix4(camera.matrixWorldInverse)
      let ox = 0
      let oy = 1.4
      if (v.z < -0.02) {
        v.copy(src).project(camera)
        ox = (v.x * aspect) / 2
        oy = v.y / 2
      }
      const len = Math.hypot(ox, oy)
      if (len > 2.4) {
        ox *= 2.4 / len
        oy *= 2.4 / len
      }
      if (u.uOrigin) (u.uOrigin.value as THREE.Vector2).set(ox, oy)
      if (u.uAspect) u.uAspect.value = aspect
      // aimed into the middle of the frame, turned against the carrier's travel
      const toCentre = Math.atan2(-oy, -ox)
      if (u.uAngle) u.uAngle.value = toCentre - sweep * SWING
      if (u.uReach) u.uReach.value = Math.max(0.5, Math.hypot(ox, oy) + 0.5)
      if (u.uTime) u.uTime.value = tMs / 1000
    },
    dispose: () => disposeTree(mesh),
  }
}

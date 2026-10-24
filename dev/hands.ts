// Dev-only: the hands in six poses, to judge their shape: `npx vite`, then /dev/hands.html.
//   ?tier=low|mid|high  ?era=<id>  ?zoom=1.6 (closer)
// Sets window.__devReady once drawn, for a screenshot.
import * as THREE from 'three'
import type { EraId } from '../src/content/types'
import { basisQuat, createHands, type HandPose } from '../src/scene/hands'
import type { QualityTier } from '../src/scene/types'

const q = new URLSearchParams(location.search)
const tier = (q.get('tier') ?? 'high') as QualityTier
const era = (q.get('era') ?? 'delhi-1857') as EraId
const zoom = Number(q.get('zoom') ?? 1)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(2, devicePixelRatio))
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x3a1410)
const camera = new THREE.PerspectiveCamera(30 / zoom, innerWidth / innerHeight, 0.01, 10)
const look = (q.get('look') ?? '0,-0.02').split(',').map(Number)
camera.position.set(look[0] ?? 0, (look[1] ?? 0) + 0.27, 1.45)
camera.lookAt(look[0] ?? 0, look[1] ?? 0, 0)
scene.add(new THREE.HemisphereLight(0xffe6c0, 0x3a2010, 0.9))
const key = new THREE.DirectionalLight(0xffd8a0, 2.2)
key.position.set(-0.6, 1, 0.8)
scene.add(key)
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const pose = (pos: THREE.Vector3, fingers: THREE.Vector3, back: THREE.Vector3, curl: number, thumb: number, spread?: number): HandPose => ({
  pos,
  quat: basisQuat(fingers, back),
  curl,
  thumb,
  ...(spread !== undefined ? { spread } : {}),
})
// the right hand in six poses, left to right, top then bottom
const poses: HandPose[] = [
  pose(v(-0.36, 0.06, 0), v(0, 1, 0), v(0, 0, 1), 0.12, 0.15), // the back, at rest
  pose(v(-0.12, 0.06, 0), v(0, 1, 0), v(0, 0, -1), 0.05, 0.05, 1.4), // the palm, open
  pose(v(0.12, 0.06, 0), v(0, 1, 0), v(1, 0, 0), 0.2, 0.3), // from the thumb side, relaxed
  pose(v(0.36, 0.08, 0), v(0, 1, 0), v(0.3, 0, 1), 1, 1), // a fist
  pose(v(-0.2, -0.13, 0.12), v(-0.2, -0.3, -1), v(1, 0.45, 0), 0.5, 0.5), // the crumple grip, seen from the front
  pose(v(0.2, -0.1, 0.12), v(0, -0.45, -1), v(0, 1, -0.3), 0.55, 0.55), // over a ball, back up
]
const sets = Array.from({ length: 3 }, () => createHands({ tier, era }))
const hands = sets.flatMap((s) => [s.right, s.left])
sets.forEach((s) => {
  s.group.visible = true
  scene.add(s.group)
})
hands.forEach((h, i) => {
  const p = poses[i]
  if (!p) return
  h.set(i % 2 === 1 ? { ...p, pos: p.pos.clone() } : p)
})
// the left hands in the sets are posed the same, then mirrored: show them as the right ones
sets.forEach((s, si) => {
  const a = poses[si * 2]
  const b = poses[si * 2 + 1]
  if (a) s.right.set(a)
  if (b) {
    // the second of each pair is drawn with the same right hand shape, mirrored back
    s.left.root.scale.set(-1, 1, 1)
    s.left.set({ ...b, quat: b.quat.clone() })
  }
})
scene.updateMatrixWorld(true)
for (const h of hands) h.aim(h.root.position.clone().add(new THREE.Vector3(0, -0.4, 0.1).applyQuaternion(h.root.quaternion)))
// a ball for the last pose
const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 2), new THREE.MeshLambertMaterial({ color: 0xe8dcc0, flatShading: true }))
ball.position.set(0.2, -0.16, 0.06)
scene.add(ball)
renderer.render(scene, camera)
;(window as unknown as { __devReady: boolean }).__devReady = true

// Camera shots that frame things instead of using fixed positions: fit a set of world points into
// a box on screen (the screen minus the HUD), looking along a chosen direction.
import * as THREE from 'three'
import { fovFor, type Pose } from './props'

/** The HUD's footprint in CSS px: what the shots keep clear. */
export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

/** A box in normalised device coordinates (-1..1, y up). */
export interface NdcBox {
  x0: number
  x1: number
  y0: number
  y1: number
}

const cam = new THREE.PerspectiveCamera(50, 1, 0.01, 50)
const v = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()

/**
 * Finds the camera distance and look point (along `dir`, from the target toward the camera) that
 * fill `box` with `points` as fully as fits, centred in the box. Converges in a few steps.
 */
export function fitPose(o: { points: THREE.Vector3[]; dir: THREE.Vector3; aspect: number; box: NdcBox; fov?: number; look?: THREE.Vector3; minDist?: number }): Pose {
  const fov = o.fov ?? fovFor(o.aspect)
  const dir = o.dir.clone().normalize()
  const look = o.look?.clone() ?? centroid(o.points)
  const tanV = Math.tan(THREE.MathUtils.degToRad(fov) / 2)
  const tanH = tanV * o.aspect
  let d = 1
  cam.fov = fov
  cam.aspect = o.aspect
  cam.updateProjectionMatrix()
  const bw = o.box.x1 - o.box.x0
  const bh = o.box.y1 - o.box.y0
  for (let i = 0; i < 14; i++) {
    cam.position.copy(look).addScaledVector(dir, d)
    cam.lookAt(look)
    cam.updateMatrixWorld()
    let x0 = Infinity
    let x1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    for (const p of o.points) {
      v.copy(p).project(cam)
      if (v.z > 1 || v.z < -1) {
        // behind or too close: back off and try again
        x0 = -10
        x1 = 10
        y0 = -10
        y1 = 10
        break
      }
      x0 = Math.min(x0, v.x)
      x1 = Math.max(x1, v.x)
      y0 = Math.min(y0, v.y)
      y1 = Math.max(y1, v.y)
    }
    const s = Math.min(bw / Math.max(1e-4, x1 - x0), bh / Math.max(1e-4, y1 - y0))
    // shift the look point so the points' box centre lands on the target box centre
    const dx = (o.box.x0 + o.box.x1) / 2 - (x0 + x1) / 2
    const dy = (o.box.y0 + o.box.y1) / 2 - (y0 + y1) / 2
    right.setFromMatrixColumn(cam.matrixWorld, 0)
    up.setFromMatrixColumn(cam.matrixWorld, 1)
    look.addScaledVector(right, -dx * d * tanH).addScaledVector(up, -dy * d * tanV)
    d = Math.max(o.minDist ?? 0.08, d / s)
    if (Math.abs(1 - s) < 0.002 && Math.abs(dx) < 0.002 && Math.abs(dy) < 0.002) break
  }
  return { pos: look.clone().addScaledVector(dir, d), look, fov }
}

export function centroid(points: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3()
  for (const p of points) c.add(p)
  return points.length ? c.divideScalar(points.length) : c
}

/** The four corners of a w × h rectangle lying on the desk (y up), centred at `c`, turned by yaw. */
export function rectOnDesk(c: THREE.Vector3, w: number, h: number, yaw: number, lift = 0): THREE.Vector3[] {
  const cs = Math.cos(yaw)
  const sn = Math.sin(yaw)
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx = 0, sz = 0]) => {
    const x = (sx * w) / 2
    const z = (sz * h) / 2
    return new THREE.Vector3(c.x + x * cs + z * sn, c.y + lift, c.z - x * sn + z * cs)
  })
}

/** The four corners of an upright w × h rectangle facing +z (turned by yaw), centred at `c`. */
export function rectOnWall(c: THREE.Vector3, w: number, h: number, yaw = 0): THREE.Vector3[] {
  const cs = Math.cos(yaw)
  const sn = Math.sin(yaw)
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx = 0, sy = 0]) => {
    const x = (sx * w) / 2
    return new THREE.Vector3(c.x + x * cs, c.y + (sy * h) / 2, c.z - x * sn)
  })
}

const px = (el: Element, name: string): number | null => {
  try {
    const raw = getComputedStyle(el).getPropertyValue(name).trim()
    if (!raw) return null
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

/**
 * The HUD insets from `--ft-hud-top/right/bottom/left` on the mount, else defaults: a top bar,
 * and the stamp buttons along the bottom (taller in portrait, where they span the width).
 */
export function readInsets(el: Element, w: number, h: number): Insets {
  const portrait = w / h < 0.8
  return {
    top: px(el, '--ft-hud-top') ?? (portrait ? 70 : 62),
    right: px(el, '--ft-hud-right') ?? 0,
    bottom: px(el, '--ft-hud-bottom') ?? (portrait ? 140 : 120),
    left: px(el, '--ft-hud-left') ?? 0,
  }
}

/** The screen minus the insets, shrunk by a margin (a share of the free width), in NDC. */
export function safeBox(w: number, h: number, ins: Insets, margin = 0.04): NdcBox {
  const x0 = -1 + (2 * ins.left) / w
  const x1 = 1 - (2 * ins.right) / w
  const y0 = -1 + (2 * ins.bottom) / h
  const y1 = 1 - (2 * ins.top) / h
  const mx = (x1 - x0) * margin
  const my = ((x1 - x0) * margin * w) / h
  return { x0: x0 + mx, x1: x1 - mx, y0: y0 + my, y1: y1 - my }
}

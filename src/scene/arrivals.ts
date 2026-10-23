// How each era's message reaches the desk, about 1.5–2.5 s each, then the lean-in:
//   1857 petition: a folded, sealed arzi is tossed across the durrie onto the desk; the seal
//                  cracks and the letter opens, top flap then bottom.
//   1929 note:     a folded note slides in from the edge as if pushed under the door, and opens
//                  with a flick.
//   1942 radio:    a courier's envelope slides in, its flap lifts, the script slip comes out and
//                  the envelope is pulled away from under it.
//   1947 telegram: the telegram is typed on the typewriter, line by line, the carriage moving and
//                  returning with a ding, then pulled out and laid on the baize.
// Every step runs on the stage's tweens, so skip() finishes the lot at once.
import * as THREE from 'three'
import type { Channel, Lang } from '../content/types'
import type { Envelope, MessageSheet } from './message'
import type { CameraRig, PoseFn } from './props'
import type { SheetMetrics } from './sheet'
import { clamp01, ease, lerp, type Tweens } from './tween'
import type { DressingHooks, StageCueName } from './types'

export type StageCue = StageCueName

export interface ArrivalCtx {
  tw: Tweens
  rig: CameraRig
  sheet: MessageSheet
  envelope: Envelope
  hooks: DressingHooks
  rest: { pos: THREE.Vector3; yaw: number }
  metrics: SheetMetrics
  lang: Lang
  reduced: boolean
  cue(name: StageCue): void
  shake(amount: number, down?: number): void
  /** Starts the camera's lean-in over the resting sheet. */
  leanIn(ms: number): Promise<void>
  arrivePose: PoseFn
  typewriterPose: PoseFn | null
  /** False once the world was rebuilt or the stage stopped: an arrival then stops quietly. */
  alive(): boolean
}

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()

/** Puts the sheet flat at (pos, yaw). */
function lay(sheet: MessageSheet, pos: THREE.Vector3, yaw: number, tilt = 0): void {
  sheet.group.position.copy(pos)
  q1.setFromAxisAngle(Y_AXIS, yaw)
  q2.setFromAxisAngle(X_AXIS, tilt)
  sheet.group.quaternion.copy(q1).multiply(q2)
}

const bez = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, k: number, out: THREE.Vector3) => {
  const u = 1 - k
  return out.set(u * u * a.x + 2 * u * k * c.x + k * k * b.x, u * u * a.y + 2 * u * k * c.y + k * k * b.y, u * u * a.z + 2 * u * k * c.z + k * k * b.z)
}

/** Places the sheet flat at rest, unfolded, with no animation (reduced motion, rebuilds). */
export function placeAtRest(ctx: Pick<ArrivalCtx, 'sheet' | 'rest'>): void {
  ctx.sheet.setFold('flat')
  ctx.sheet.setFeed(1)
  ctx.sheet.setReveal(null)
  ctx.sheet.setSeal(false)
  lay(ctx.sheet, ctx.rest.pos, ctx.rest.yaw)
  ctx.sheet.group.visible = true
}

export async function arrive(channel: Channel, ctx: ArrivalCtx): Promise<void> {
  ctx.envelope.group.visible = false
  if (ctx.reduced) {
    placeAtRest(ctx)
    return
  }
  if (channel === 'telegram' && ctx.hooks.typewriter && ctx.typewriterPose) return typewriter(ctx)
  if (channel === 'petition') return petition(ctx)
  if (channel === 'radio') return envelope(ctx)
  return note(ctx)
}

// ---------------------------------------------------------------- 1857: the sealed arzi

async function petition(ctx: ArrivalCtx): Promise<void> {
  const { tw, sheet, rest } = ctx
  sheet.setFold('letter')
  sheet.setOpen(0, 0)
  sheet.setOpen(1, 0)
  sheet.setSeal(true, 0)
  const from = new THREE.Vector3(...(ctx.hooks.entry ?? [0.72, 0.004, 0.5]))
  // a letter folded in three lies with its middle panel at the sheet's centre
  const end = rest.pos.clone()
  const ctrl = new THREE.Vector3((from.x + end.x) / 2, Math.max(from.y, end.y) + 0.14, (from.z + end.z) / 2)
  const p = new THREE.Vector3()
  lay(sheet, from, rest.yaw + 1.3)
  sheet.group.visible = true
  void ctx.rig.goTo(ctx.arrivePose, 650, ease.inOut)
  await tw.wait(160)
  ctx.cue('arrive')
  await tw.run(760, (k) => {
    bez(from, ctrl, end, k, p)
    lay(sheet, p, lerp(rest.yaw + 1.3, rest.yaw, k), Math.sin(k * Math.PI) * 0.22)
  }, ease.out)
  if (!ctx.alive()) return
  // it lands with a little slap and settles
  ctx.shake(0.003, 0.002)
  await tw.wait(140)
  ctx.cue('seal')
  await tw.run(170, (k) => sheet.setSeal(true, k), ease.out)
  ctx.shake(0.0025)
  await tw.wait(90)
  ctx.cue('unfold')
  await tw.run(380, (k) => sheet.setOpen(0, k), ease.inOut)
  sheet.setSeal(false)
  const lean = ctx.leanIn(1000)
  await tw.run(330, (k) => sheet.setOpen(1, k), ease.out)
  sheet.setFold('flat')
  await lean
}

// ---------------------------------------------------------------- 1929: the note under the door

async function note(ctx: ArrivalCtx): Promise<void> {
  const { tw, sheet, rest } = ctx
  sheet.setFold('half')
  sheet.setOpen(0, 0)
  sheet.setSeal(false)
  const from = new THREE.Vector3(...(ctx.hooks.entry ?? [-0.8, 0.002, 0.3]))
  const end = rest.pos.clone()
  const spin = 2.4
  const p = new THREE.Vector3()
  lay(sheet, from, rest.yaw + spin)
  sheet.group.visible = true
  void ctx.rig.goTo(ctx.arrivePose, 600, ease.inOut)
  await tw.wait(200)
  ctx.cue('arrive')
  // a hard push, then paper friction: fast at first, slowing to a stop
  await tw.run(700, (k) => {
    p.lerpVectors(from, end, k)
    p.y = lerp(from.y, end.y, k)
    lay(sheet, p, rest.yaw + spin * (1 - k))
  }, (k) => 1 - Math.pow(1 - k, 4))
  if (!ctx.alive()) return
  await tw.wait(110)
  ctx.cue('unfold')
  // the flick: the top half snaps open and the sheet hops a hair as it lands flat
  const lean = ctx.leanIn(1000)
  await tw.run(300, (k) => {
    sheet.setOpen(0, k)
    sheet.group.position.y = end.y + Math.sin(clamp01((k - 0.55) / 0.45) * Math.PI) * 0.004
  }, ease.out)
  sheet.setFold('flat')
  lay(sheet, end, rest.yaw)
  // a tiny settle wobble
  await tw.run(220, (k) => lay(sheet, end, rest.yaw + Math.sin(k * Math.PI * 2) * 0.012 * (1 - k)))
  await lean
}

// ---------------------------------------------------------------- 1942: the courier's envelope

async function envelope(ctx: ArrivalCtx): Promise<void> {
  const { tw, sheet, rest, envelope: env } = ctx
  const H = sheet.h()
  sheet.setFold('half')
  sheet.setOpen(0, 0)
  sheet.setSeal(false)
  env.setup(H / 2, ctx.lang)
  env.setFlap(0)
  // the folded slip lies on the sheet's lower half: inside the envelope, which sits over it
  const yawQ = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, rest.yaw)
  const local = (x: number, z: number) => new THREE.Vector3(x, 0, z).applyQuaternion(yawQ)
  const envAt = rest.pos.clone().add(local(0, H / 4 + 0.006))
  const entry = new THREE.Vector3(...(ctx.hooks.entry ?? [0.78, 0, 0.28]))
  const off = entry.clone().sub(envAt)
  off.y = 0
  const sheetAt = (k: number, out = 0) => rest.pos.clone().add(off.clone().multiplyScalar(1 - k)).add(local(0, -out))
  env.group.position.copy(envAt).add(off)
  env.group.quaternion.copy(yawQ)
  env.group.visible = true
  lay(sheet, sheetAt(0), rest.yaw)
  sheet.group.visible = true
  void ctx.rig.goTo(ctx.arrivePose, 600, ease.inOut)
  await tw.wait(160)
  ctx.cue('arrive')
  await tw.run(560, (k) => {
    env.group.position.copy(envAt).addScaledVector(off, 1 - k)
    lay(sheet, sheetAt(k), rest.yaw)
  }, ease.out)
  if (!ctx.alive()) return
  await tw.wait(100)
  ctx.cue('flap')
  // the flap lifts, hangs a moment past upright, and falls open
  await tw.run(340, (k) => env.setFlap(k), ease.inOut)
  // the slip is drawn out through the mouth
  const out = 0.075
  await tw.run(330, (k) => lay(sheet, sheetAt(1, out * k), rest.yaw), ease.out)
  // and the envelope is pulled away from under it, toward the player
  const away = local(0.06, 0.5)
  await tw.run(440, (k) => {
    env.group.position.copy(envAt).addScaledVector(away, k)
    lay(sheet, sheetAt(1, out * (1 - k)), rest.yaw)
  }, ease.inOut)
  env.group.visible = false
  ctx.cue('unfold')
  const lean = ctx.leanIn(1000)
  await tw.run(360, (k) => sheet.setOpen(0, k), ease.out)
  sheet.setFold('flat')
  await lean
}

// ---------------------------------------------------------------- 1947: the typewriter

async function typewriter(ctx: ArrivalCtx): Promise<void> {
  const { tw, sheet, rest, metrics } = ctx
  const t = ctx.hooks.typewriter
  if (!t || !ctx.typewriterPose) return
  const H = sheet.h()
  const yawQ = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, t.yaw)
  const machineX = new THREE.Vector3(1, 0, 0).applyQuaternion(yawQ)
  const qStand = yawQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, Math.PI / 2 - t.lean))
  const platen = new THREE.Vector3(...t.platen).applyQuaternion(yawQ).add(new THREE.Vector3(...t.origin))
  const carriageHome = t.carriage?.position.clone() ?? new THREE.Vector3()
  let feed = 0
  let shift = 0
  const pose = () => {
    // the crop's lower edge sits at the platen; the carriage carries the paper sideways
    const local = new THREE.Vector3(0, 0, -H / 2 + feed * H).applyQuaternion(qStand)
    sheet.group.position.copy(platen).sub(local).addScaledVector(machineX, shift)
    sheet.group.quaternion.copy(qStand)
    if (t.carriage) t.carriage.position.copy(carriageHome).addScaledVector(machineX, shift)
  }
  const setFeed = (f: number) => {
    feed = clamp01(f)
    sheet.setFeed(feed)
    pose()
  }
  sheet.setFold('flat')
  sheet.setSeal(false)
  if (t.idleSheet) t.idleSheet.visible = false
  const lines = metrics.typed.length ? metrics.typed : [{ top: 0.3, bottom: 0.34, x0: 0.08, x1: 0.92, chars: 30 }]
  const first = lines[0]
  if (!first) return
  sheet.setReveal({ top: first.top, bottom: first.bottom, x0: first.x0, x1: first.x1, u: first.x0 }, metrics.tint)
  setFeed(0)
  sheet.group.visible = true
  const restore = () => {
    if (t.carriage) t.carriage.position.copy(carriageHome)
    if (t.idleSheet) t.idleSheet.visible = true
  }
  try {
    void ctx.rig.goTo(ctx.typewriterPose, 600, ease.inOut)
    await tw.wait(200)
    ctx.cue('arrive')
    // the form is rolled in to its first line, the carriage pushed over to the margin
    const shift0 = (0.5 - first.x0) * 0.21
    await tw.run(300, (k) => {
      shift = shift0 * k
      setFeed((first.bottom + 0.012) * k)
    }, ease.inOut)
    // one budget for the whole message: the carriage returns, then the letters share the rest
    const chars = lines.reduce((n, l) => n + l.chars, 0)
    const returnMs = 55
    const typeMs = Math.max(450, 1050 - returnMs * lines.length)
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i]
      if (!L || !ctx.alive()) return
      const f = Math.max(feed, L.bottom + 0.012)
      if (f > feed + 0.001) {
        const f0 = feed
        await tw.run(60, (k) => setFeed(lerp(f0, f, k)), ease.out)
      }
      const ms = Math.max(60, (typeMs * L.chars) / Math.max(1, chars))
      ctx.cue('type')
      await tw.run(ms, (k) => {
        const u = lerp(L.x0, L.x1, k)
        sheet.setReveal({ top: L.top, bottom: L.bottom, x0: L.x0, x1: L.x1, u }, metrics.tint)
        shift = (0.5 - u) * 0.21
        pose()
      })
      const next = lines[i + 1]
      const to = next ? (0.5 - next.x0) * 0.21 : 0
      if (L.x1 - L.x0 > 0.35) ctx.cue('ding')
      const s0 = shift
      await tw.run(returnMs, (k) => {
        shift = lerp(s0, to, k)
        pose()
      }, ease.out)
      if (L.x1 - L.x0 > 0.35) ctx.shake(0.0015)
    }
    sheet.setReveal(null)
    // pulled out of the machine, then laid on the baize
    const f0 = feed
    const sh0 = shift
    await tw.run(240, (k) => {
      shift = sh0 * (1 - k)
      setFeed(lerp(f0, 1, k))
    }, ease.in)
    if (!ctx.alive()) return
    const a = sheet.group.position.clone()
    const qa = sheet.group.quaternion.clone()
    const up = new THREE.Vector3(0, 0, -1).applyQuaternion(qa).multiplyScalar(0.06)
    const ctrl = a.clone().add(up).add(new THREE.Vector3(0, 0.08, 0))
    const qb = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, rest.yaw)
    restore()
    const p = new THREE.Vector3()
    let lean: Promise<void> | null = null
    await tw.run(600, (k) => {
      bez(a, ctrl, rest.pos, k, p)
      sheet.group.position.copy(p)
      sheet.group.quaternion.slerpQuaternions(qa, qb, ease.inOut(k))
      if (!lean && k > 0.3) lean = ctx.leanIn(900)
    }, ease.inOut)
    lay(sheet, rest.pos, rest.yaw)
    ctx.shake(0.002)
    if (lean) await lean
    else await ctx.leanIn(800)
  } finally {
    restore()
    sheet.setReveal(null)
  }
}

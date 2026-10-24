// After a right stamp: two hands come in, screw the read paper up into a ball in two or three
// squeezes, and one hand flicks it into the basket while the other withdraws. The stage hands in
// its tweens, the camera moves and the props; this file is only the choreography, in the frame of
// the paper as it lay on the desk (+x to the right, +y up, +z toward the player).
import * as THREE from 'three'
import { BALL_R, type BinBall, type PaperBall } from './crumple'
import { basisQuat, mirrorPose, type HandPose, type Hands } from './hands'
import { ease, type Tweens } from './tween'
import type { StageCueName } from './types'

/**
 * The beats, in ms. The camera starts to draw back (`lead`), the hands come in (`reach`), three squeezes screw the paper up, the right hand
 * rolls the ball onto its palm while the left withdraws (`roll`), cocks it (`windup`) and flicks it
 * (`flick`) as the camera draws back to the basket (`camOut`); the ball flies (`fly`), drops in and
 * bounces (`settle`), and the shot holds a breath (`hold`). From the start to the landing is about
 * 2.4 s. Under reduced motion it only fades (`fade`).
 */
export const TOSS = { lead: 80, reach: 250, squeezes: [300, 320, 380] as const, roll: 220, windup: 130, flick: 110, fly: 600, settle: 170, hold: 320, fade: 320, camIn: 650, camPush: 760, camOut: 850 } as const

/** How far each squeeze has screwed the paper up (0 flat … 1 a ball), and the wring after it. */
const SQUEEZE_K = [0.42, 0.76, 1] as const
const SQUEEZE_TWIST = [0.3, -0.26, 0.12] as const
/** How high the hands lift the paper off the desk while they crush it (m). */
export const CRUMPLE_LIFT = 0.072

/** From the start of the toss to the ball landing (ms). */
export const TOSS_LANDS_MS = TOSS.lead + TOSS.reach + TOSS.squeezes.reduce((a, b) => a + b, 0) + TOSS.roll + TOSS.windup + TOSS.flick + TOSS.fly

export interface TossPlay {
  tw: Tweens
  /** The paper's frame on the desk; the ball and the hands are its children. */
  rig: THREE.Group
  ball: PaperBall
  hands: Hands
  camera: THREE.Camera
  /** The flat sheet's height in the rig, where the ball starts. */
  flatY: number
  /** Where the ball comes to rest in the basket (world), filled in with how it lands. */
  rest: BinBall
  /** The basket's mouth (world). */
  mouth: THREE.Vector3
  cue(name: StageCueName): void
  /** False once the world was rebuilt or the stage stopped. */
  alive(): boolean
  /** True while skip() is landing it at once: then no crinkles or flick are heard. */
  skipping(): boolean
  /**
   * The camera's moves: back over the paper and the hands as they come in, in closer on the ball
   * as it is screwed up, then back to the basket for the throw.
   */
  camTo(shot: 'hands' | 'ball' | 'basket', ms: number): Promise<void>
  /** The basket rocks on its foot; `along` is the way the ball was going (world). */
  rockBasket(along: THREE.Vector3): void
  /** The ball has landed (it is in the basket from now on, whatever happens next). */
  landed(): void
}

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const q1 = new THREE.Quaternion()
const elbowTmp = new THREE.Vector3()
const PICK_BACK = new THREE.Vector3(0.78, 0.62, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)
const v1Pose: HandPose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0, thumb: 0 }
const PALM_C = new THREE.Vector3(0, 0.048, -0.0158) // the middle of the palm's skin, in the hand's frame
const smooth01 = (k: number) => {
  const t = Math.min(1, Math.max(0, k))
  return t * t * (3 - 2 * t)
}

/**
 * The right hand holding the paper at crumple k: its palm pressed to the paper's side at `hw`, at
 * the height and depth of `c`, turned by `twist` about the line between the hands. Picking up, the
 * palm faces down and in; it turns to face the other hand as the squeezing starts, and the fingers
 * close round the ball toward the end.
 */
export function holdPose(hw: number, c: THREE.Vector3, k: number, twist: number, press: number, out: HandPose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0, thumb: 0 }): HandPose {
  const pick = 1 - smooth01(k / 0.3)
  const pitch = 0.34 + 0.4 * k
  const fingers = v1.set(-0.12 - 0.22 * k, -Math.sin(pitch), -Math.cos(pitch))
  const back = v2.set(1, 0.2 * k, 0).lerp(PICK_BACK, pick)
  basisQuat(fingers, back, out.quat)
  if (twist) out.quat.premultiply(q1.setFromAxisAngle(X_AXIS, twist))
  // the palm's middle on the paper's edge (on the desk, it stays clear of the wood)
  const target = new THREE.Vector3(hw + 0.001, Math.max(c.y, 0.026 + 0.016 * pick), c.z + 0.004)
  out.pos.copy(target).sub(PALM_C.clone().applyQuaternion(out.quat))
  out.curl = 0.2 + 0.4 * k + 0.12 * press
  out.thumb = 0.25 + 0.45 * k + 0.1 * press
  return out
}

/** The right hand palm up with the ball in it, ready to toss (the ball's centre is `b`). */
export function palmUpPose(b: THREE.Vector3, out: HandPose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0, thumb: 0 }, curl = 0.42): HandPose {
  basisQuat(v1.set(-0.38, 0.18, -0.9), v2.set(0.15, -1, 0.05), out.quat)
  out.pos.copy(b).sub(new THREE.Vector3(0, 0.05, -0.0158 - BALL_R * 0.92).applyQuaternion(out.quat))
  out.curl = curl
  out.thumb = 0.32
  return out
}

/**
 * The player's elbows, in the paper's frame: just off the near edge of the desk, a hand's width
 * above it. The forearms lie back toward them, so they leave the frame at its bottom edge, and a
 * hand comes in from there and goes back there.
 */
export const ELBOW = { x: 0.2, y: 0.1, z: 0.46 } as const
const elbowLocal = (side: 1 | -1, out: THREE.Vector3) => out.set(ELBOW.x * side, ELBOW.y, ELBOW.z)

/** The elbow in the world, for a sleeve to aim at. */
function elbowAt(play: TossPlay, side: 1 | -1, out: THREE.Vector3): THREE.Vector3 {
  return play.rig.localToWorld(elbowLocal(side, out))
}

/** Both hands posed, and each sleeve turned back along its forearm toward the body. */
function place(play: TossPlay, right: HandPose, left: HandPose): void {
  play.hands.right.set(right)
  play.hands.left.set(left)
  play.rig.updateWorldMatrix(true, false)
  play.hands.right.aim(elbowAt(play, 1, elbowTmp))
  play.hands.left.aim(elbowAt(play, -1, elbowTmp))
}

const lerpPose = (a: HandPose, b: HandPose, k: number, out: HandPose): HandPose => {
  out.pos.lerpVectors(a.pos, b.pos, k)
  out.quat.slerpQuaternions(a.quat, b.quat, k)
  out.curl = a.curl + (b.curl - a.curl) * k
  out.thumb = a.thumb + (b.thumb - a.thumb) * k
  return out
}
const copyPose = (p: HandPose): HandPose => ({ pos: p.pos.clone(), quat: p.quat.clone(), curl: p.curl, thumb: p.thumb })
/** A hand drawn back toward `to` (rig frame), opening as it goes. */
const withdrawn = (from: HandPose, to: THREE.Vector3): HandPose => ({ pos: from.pos.clone().lerp(to, 0.8), quat: from.quat.clone(), curl: 0.18, thumb: 0.2 })

/** A point on the cubic Bézier a → c1 → c2 → b at t. */
function cubic(a: THREE.Vector3, c1: THREE.Vector3, c2: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3): THREE.Vector3 {
  const u = 1 - t
  return out
    .copy(a).multiplyScalar(u * u * u)
    .addScaledVector(c1, 3 * u * u * t)
    .addScaledVector(c2, 3 * u * t * t)
    .addScaledVector(b, t * t * t)
}

/**
 * The whole toss: the hands in, the crumple, the flick, the flight and the landing. Every beat is a
 * tween, so skip() (instant tweens) lands it at once; it checks alive() after each, so a rebuilt or
 * stopped stage is left alone. The hands are hidden again when it ends, however it ends.
 */
export async function crumpleAndToss(play: TossPlay): Promise<void> {
  const { tw, rig, ball, hands } = play
  const inv = new THREE.Matrix4()
  const toRig = (p: THREE.Vector3) => p.applyMatrix4(inv.copy(rig.matrixWorld).invert())
  const elbow = (side: 1 | -1) => elbowLocal(side, new THREE.Vector3())
  const sound = (name: StageCueName) => {
    if (!play.skipping()) play.cue(name)
  }
  const c = new THREE.Vector3(0, play.flatY, 0)
  ball.group.position.copy(c)
  ball.group.quaternion.identity()
  ball.setCrumple(0)
  ball.group.visible = true
  hands.group.visible = true
  const R = holdPose(ball.halfWidth(), c, 0, 0, 0)
  const L = mirrorPose(holdPose(ball.halfWidth(), c, 0, 0, 0))
  const right = copyPose(R)
  const left = copyPose(L)
  try {
    // 1. the hands come in from the bottom of the frame and take the paper by its sides
    void play.camTo('hands', TOSS.camIn)
    await tw.wait(TOSS.lead)
    if (!play.alive()) return
    const startR = copyPose(R)
    startR.pos.lerp(elbow(1), 0.6)
    startR.curl = 0.1
    const startL = copyPose(L)
    startL.pos.lerp(elbow(-1), 0.6)
    startL.curl = 0.1
    place(play, startR, startL)
    await tw.run(TOSS.reach, (k) => place(play, lerpPose(startR, R, k, right), lerpPose(startL, L, k, left)), ease.inOutSine)
    if (!play.alive()) return
    // 2. two squeezes and a last one: the paper lifts, crushes in from the sides and is wrung
    let k0 = 0
    let tw0 = 0
    for (let s = 0; s < SQUEEZE_K.length; s++) {
      const k1 = SQUEEZE_K[s] ?? 1
      const tw1 = SQUEEZE_TWIST[s] ?? 0
      const ms = TOSS.squeezes[s] ?? 320
      const y0 = c.y
      const y1 = play.flatY + CRUMPLE_LIFT * Math.min(1, (s + 1) / 2)
      // with the second squeeze the camera leans in on the paper as it balls up
      if (s === 1) void play.camTo('ball', TOSS.camPush)
      sound('crumple')
      await tw.run(ms, (t) => {
        // press in fast (the first six tenths), then wring as the grip eases
        const p = Math.min(1, t / 0.6)
        const pe = 1 - Math.pow(1 - p, 3)
        const w = smooth01((t - 0.35) / 0.65)
        const k = k0 + (k1 - k0) * pe
        const twist = tw0 + (tw1 - tw0) * w
        c.y = y0 + (y1 - y0) * pe
        ball.group.position.copy(c)
        ball.setCrumple(k, twist * 0.8)
        const press = t < 0.6 ? Math.sin(p * Math.PI * 0.5) : 1 - (t - 0.6) / 0.4 * 0.7
        holdPose(ball.halfWidth(), c, k, -twist, press, right)
        mirrorPose(holdPose(ball.halfWidth(), c, k, twist, press, v1Pose), left)
        place(play, right, left)
      }, ease.linear)
      if (!play.alive()) return
      k0 = k1
      tw0 = tw1
    }
    // 3. the toss: the left hand lets go and withdraws; the right rolls the ball onto its palm,
    //    cocks it and flicks it at the basket, and the camera draws back to watch it land
    const heldR = copyPose(right)
    const heldL = copyPose(left)
    const outL = withdrawn(heldL, elbow(-1))
    outL.pos.x -= 0.04
    const b0 = c.clone()
    const b1 = c.clone().add(new THREE.Vector3(0.018, -0.01, 0.012))
    const up = palmUpPose(b1)
    const twist0 = tw0
    await tw.run(TOSS.roll, (t) => {
      const e = ease.inOut(t)
      ball.group.position.lerpVectors(b0, b1, e)
      ball.setCrumple(1, twist0 * 0.8 * (1 - e))
      lerpPose(heldR, up, e, right)
      lerpPose(heldL, outL, ease.in(t), left)
      place(play, right, left)
    }, ease.linear)
    if (!play.alive()) return
    hands.left.root.visible = false
    const b2 = b1.clone().add(new THREE.Vector3(-0.026, -0.022, 0.03))
    await tw.run(TOSS.windup, (t) => {
      ball.group.position.lerpVectors(b1, b2, t)
      palmUpPose(ball.group.position, right)
      place(play, right, left)
    }, ease.inOut)
    if (!play.alive()) return
    const b3 = b1.clone().add(new THREE.Vector3(0.07, 0.055, 0.02))
    const cam = play.camTo('basket', TOSS.camOut)
    await tw.run(TOSS.flick, (t) => {
      ball.group.position.lerpVectors(b2, b3, t)
      palmUpPose(ball.group.position, right, 0.42 - 0.3 * t)
      right.quat.multiply(q1.setFromAxisAngle(X_AXIS, -0.5 * t))
      place(play, right, left)
    }, ease.in)
    if (!play.alive()) return
    // 4. it leaves the hand: up over the desk's edge and down into the basket, tumbling
    sound('toss')
    rig.updateWorldMatrix(true, false)
    const p0 = b3.clone()
    const mouth = toRig(play.mouth.clone())
    const end = toRig(play.rest.pos.clone())
    const toward = mouth.clone().sub(p0).setY(0).normalize()
    const c1 = p0.clone().addScaledVector(toward, 0.12).add(new THREE.Vector3(0, 0.1, 0))
    const c2 = mouth.clone().add(new THREE.Vector3(0, 0.24, 0))
    const spinAxis = new THREE.Vector3(0, 1, 0).cross(toward).normalize()
    const qa = ball.group.quaternion.clone()
    const spin = new THREE.Quaternion()
    const flung = copyPose(right)
    const away = withdrawn(flung, elbow(1))
    away.pos.lerp(elbow(1), 1).y -= 0.04
    const flight = tw.run(TOSS.fly, (t) => {
      cubic(p0, c1, c2, end, t, ball.group.position)
      ball.group.quaternion.copy(qa).premultiply(spin.setFromAxisAngle(spinAxis, Math.PI * 2.4 * t))
    }, ease.linear)
    // the throwing hand follows through, then goes back out of the frame
    void tw.run(TOSS.fly * 0.3, (t) => {
      if (!play.alive()) return
      lerpPose(flung, away, ease.in(t), right)
      place(play, right, left)
    }, ease.linear).then(() => {
      hands.right.root.visible = false
    })
    await flight
    if (!play.alive()) return
    // 5. it drops in: a soft thud in the basket, which rocks a little; the ball bounces and lies still
    ball.group.position.copy(end)
    rig.updateWorldMatrix(true, false)
    ball.group.getWorldQuaternion(play.rest.quat)
    play.landed()
    play.cue('tossLand')
    play.rockBasket(toward.clone().transformDirection(rig.matrixWorld))
    await tw.run(TOSS.settle, (t) => ball.group.position.copy(end).add(v2.set(0, 0.012 * Math.sin(t * Math.PI) * (1 - t), 0)), ease.out)
    ball.group.position.copy(end)
    await Promise.all([cam, tw.wait(TOSS.hold)])
  } finally {
    hands.group.visible = false
    hands.left.root.visible = true
    hands.right.root.visible = true
  }
}

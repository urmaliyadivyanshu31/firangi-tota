// After a right stamp: two hands come down over the read paper, palms facing, thumbs on top and
// fingers curled under its sides, and screw it up between the palms in three squeezes, wringing
// it. The left hand lets go; the right, its back up and its fingers round the ball, carries it
// out over the front of the desk and lets it drop into the basket. The stage hands in its tweens,
// the camera moves and the props; this file is only the choreography, in the frame of the paper
// as it lay on the desk (+x to the right, +y up, +z toward the player).
import * as THREE from 'three'
import { BALL_R, type BinBall, type PaperBall } from './crumple'
import { HAND_SCALE, basisQuat, mirrorPose, type HandPose, type Hands } from './hands'
import { SQUEEZE_K, SQUEEZE_TWIST, TOSS, squeezeAt } from './toss-beats'
import { ease, type Tweens } from './tween'
import type { StageCueName } from './types'

export { TOSS, TOSS_LANDS_MS } from './toss-beats'

/** How high the hands lift the paper off the desk while they crush it (m). */
export const CRUMPLE_LIFT = 0.072
/** Gravity (m/s²): the world is in metres, so the drop takes as long as a real one. */
const GRAVITY = 9.8

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
  /** The desk's front edge, as z in the paper's frame: the ball is let go clear of it. */
  deskFront: number
  cue(name: StageCueName): void
  /** False once the world was rebuilt or the stage stopped. */
  alive(): boolean
  /** True while skip() is landing it at once: then no crinkles or drop are heard. */
  skipping(): boolean
  /**
   * The camera's moves: back over the paper and the hands as they come in, in closer on the ball
   * as it is screwed up, then round to take in the basket and, in `also` (world), where the hand
   * lets the ball go.
   */
  camTo(shot: 'hands' | 'ball' | 'basket', ms: number, also?: THREE.Vector3[]): Promise<void>
  /** The basket rocks on its foot; `along` is the way the ball was going (world). */
  rockBasket(along: THREE.Vector3): void
  /** The ball has landed (it is in the basket from now on, whatever happens next). */
  landed(): void
}

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const v4 = new THREE.Vector3()
const q1 = new THREE.Quaternion()
const elbowTmp = new THREE.Vector3()
const X_AXIS = new THREE.Vector3(1, 0, 0)
const newPose = (): HandPose => ({ pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0, thumb: 0 })
const v1Pose = newPose()
/** The middle of the palm's skin, in the hand's frame. */
export const PALM_C = new THREE.Vector3(0.002, 0.05, -0.0135).multiplyScalar(HAND_SCALE)
/** Where a ball held under the palm sits, in the hand's frame: under the palm's top, the fingers round it. */
export const BALL_IN_HAND = new THREE.Vector3(0.003, 0.066, -0.0135).multiplyScalar(HAND_SCALE).add(new THREE.Vector3(0, 0, -BALL_R * 0.92))
const smooth01 = (k: number) => {
  const t = Math.min(1, Math.max(0, k))
  return t * t * (3 - 2 * t)
}

/**
 * The right hand holding the paper at crumple k: its palm against the paper's side at `hw`, at the
 * height and depth of `c`, facing the other hand and a little down, the thumb on top and the
 * fingers curled under. Taking the flat sheet the palm is more over it; as the squeezing goes on
 * it turns to face the other hand and the fingers close round the ball. `twist` turns the wrist
 * about the line between the hands (the wring); `press` is how hard it squeezes.
 */
export function gripPose(hw: number, c: THREE.Vector3, k: number, twist: number, press: number, out: HandPose = newPose()): HandPose {
  const pick = 1 - smooth01(k / 0.35)
  const facing = v1.set(-1, -0.34 + 0.16 * k, 0.04).lerp(v3.set(-0.86, -0.52, 0.04), pick).normalize()
  const fingers = v2.set(-0.24 + 0.1 * k, -0.42 - 0.16 * k, -1).lerp(v4.set(-0.28, -0.3, -1), pick)
  basisQuat(fingers, facing.negate(), out.quat)
  if (twist) out.quat.premultiply(q1.setFromAxisAngle(X_AXIS, twist))
  // the palm's middle on the paper's edge (on the desk, it stays clear of the wood)
  const target = v1.set(hw + 0.003 - 0.004 * press, Math.max(c.y + 0.004 + 0.012 * (1 - k), 0.03 + 0.012 * pick), c.z + 0.008)
  out.pos.copy(target).sub(v2.copy(PALM_C).applyQuaternion(out.quat))
  // the fingers spread over the paper's sides, closing round it only as it becomes a ball
  out.curl = 0.16 + 0.04 * pick + 0.26 * k * k + 0.12 * press
  // the thumbs lie along the top on their own side, never across into the other hand
  out.thumb = 0.3 + 0.12 * k + 0.06 * press
  out.spread = 1.25 - 0.45 * k
  return out
}

/**
 * The right hand carrying the ball (its centre at `b`), the back of the hand up and the fingers
 * round it, pointing along `ahead` and a little down. `open` (0..1) lets go: the fingers open out.
 */
export function carryPose(b: THREE.Vector3, ahead: THREE.Vector3, open = 0, out: HandPose = newPose()): HandPose {
  const fingers = v1.copy(ahead).setY(0).normalize()
  fingers.y = -0.4 - 0.25 * open
  basisQuat(fingers, v2.set(-0.15, 1, 0.08), out.quat)
  out.pos.copy(b).sub(v3.copy(BALL_IN_HAND).applyQuaternion(out.quat))
  out.curl = 0.6 - 0.46 * open
  out.thumb = 0.55 - 0.38 * open
  out.spread = 0.85 + 0.45 * open
  return out
}

/**
 * The player's elbows, in the paper's frame: out to the sides, level with the desk and toward the
 * player, as when both hands squeeze something hard. The forearms run out to the sides of the shot
 * rather than down to its corners, and the sleeves leave it soon.
 */
export const ELBOW = { x: 0.34, y: -0.05, z: 0.22 } as const
const elbowLocal = (side: 1 | -1, out: THREE.Vector3) => out.set(ELBOW.x * side, ELBOW.y, ELBOW.z)

/** Both hands posed, and each forearm turned back toward its elbow (rig frame). */
function place(play: TossPlay, right: HandPose, left: HandPose, elbowR?: THREE.Vector3): void {
  play.hands.right.set(right)
  play.hands.left.set(left)
  play.rig.updateWorldMatrix(true, false)
  play.hands.right.aim(play.rig.localToWorld(elbowTmp.copy(elbowR ?? elbowLocal(1, elbowTmp))))
  play.hands.left.aim(play.rig.localToWorld(elbowLocal(-1, elbowTmp)))
}

const lerpPose = (a: HandPose, b: HandPose, k: number, out: HandPose): HandPose => {
  out.pos.lerpVectors(a.pos, b.pos, k)
  out.quat.slerpQuaternions(a.quat, b.quat, k)
  out.curl = a.curl + (b.curl - a.curl) * k
  out.thumb = a.thumb + (b.thumb - a.thumb) * k
  out.spread = (a.spread ?? 1) + ((b.spread ?? 1) - (a.spread ?? 1)) * k
  return out
}
const copyPose = (p: HandPose): HandPose => ({ pos: p.pos.clone(), quat: p.quat.clone(), curl: p.curl, thumb: p.thumb, spread: p.spread ?? 1 })
/** A hand drawn back toward `to` (rig frame) and down, opening as it goes. */
const withdrawn = (from: HandPose, to: THREE.Vector3): HandPose => {
  const p = copyPose(from)
  p.pos.lerp(to, 0.85).y -= 0.05
  p.curl = 0.16
  p.thumb = 0.2
  p.spread = 1.1
  return p
}

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
 * The drop: where the hand lets the ball go (rig frame), with how fast and how long it then falls
 * to `end`. It is let go a hand's breadth short of the basket on the desk's side, in front of the
 * desk's edge and a little below its top, moving gently toward the basket.
 */
export function dropFrom(end: THREE.Vector3, from: THREE.Vector3, deskFront: number): { at: THREE.Vector3; v: THREE.Vector3; secs: number } {
  const at = new THREE.Vector3(end.x, -0.08, end.z)
  const toward = new THREE.Vector3(end.x - from.x, 0, end.z - from.z)
  if (toward.lengthSq() < 1e-6) toward.set(0, 0, 1)
  toward.normalize()
  // falling about 0.6 m it is in the air a third of a second: let go 0.28 m/s short of the basket
  const vy = -0.1
  const secs = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * Math.max(0.05, at.y - end.y))) / GRAVITY
  at.addScaledVector(toward, -0.28 * secs)
  at.z = Math.max(at.z, deskFront + BALL_R + 0.04)
  const v = new THREE.Vector3((end.x - at.x) / secs, vy, (end.z - at.z) / secs)
  return { at, v, secs }
}

/**
 * The whole toss: the hands in, the crumple, the carry, the drop and the landing. Every beat is a
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
  ball.group.quaternion.identity()
  if (play.skipping()) {
    // skipped before it began: the paper is a ball in the basket at once, the camera stays put,
    // and only the soft landing is heard
    rig.updateWorldMatrix(true, false)
    ball.setCrumple(1)
    ball.group.position.copy(toRig(play.rest.pos.clone()))
    ball.group.visible = true
    rig.updateWorldMatrix(true, true)
    ball.group.getWorldQuaternion(play.rest.quat)
    play.landed()
    play.cue('tossLand')
    return
  }
  ball.group.position.copy(c)
  ball.setCrumple(0)
  ball.group.visible = true
  hands.group.visible = true
  const R = gripPose(ball.halfWidth(), c, 0, 0, 0)
  const L = mirrorPose(gripPose(ball.halfWidth(), c, 0, 0, 0))
  const right = copyPose(R)
  const left = copyPose(L)
  try {
    // 1. the hands come down over the paper from the near edge of the desk and take it by its sides
    void play.camTo('hands', TOSS.camIn)
    await tw.wait(TOSS.lead)
    if (!play.alive()) return
    const startR = copyPose(R)
    startR.pos.lerp(elbow(1), 0.55).y += 0.05
    startR.curl = 0.12
    startR.spread = 1.2
    const startL = mirrorPose(startR)
    place(play, startR, startL)
    await tw.run(TOSS.reach, (k) => place(play, lerpPose(startR, R, k, right), lerpPose(startL, L, k, left)), ease.inOutSine)
    if (!play.alive()) return
    // 2. three squeezes: the paper lifts, crushes in between the palms as the fingers clench, and is wrung
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
        const sq = squeezeAt(t)
        const k = k0 + (k1 - k0) * sq.k
        const twist = tw0 + (tw1 - tw0) * sq.wring
        c.y = y0 + (y1 - y0) * sq.k
        ball.group.position.copy(c)
        ball.setCrumple(k, twist * 0.8)
        gripPose(ball.halfWidth(), c, k, -twist, sq.press, right)
        mirrorPose(gripPose(ball.halfWidth(), c, k, twist, sq.press, v1Pose), left)
        place(play, right, left)
      }, ease.linear)
      if (!play.alive()) return
      k0 = k1
      tw0 = tw1
    }
    // 3. the left hand lets go and draws back; the right turns over the ball, its back up, and lifts it
    rig.updateWorldMatrix(true, false)
    const end = toRig(play.rest.pos.clone())
    const drop = dropFrom(end, c, play.deskFront)
    const heldR = copyPose(right)
    const heldL = copyPose(left)
    const outL = withdrawn(heldL, elbow(-1))
    outL.pos.x -= 0.05
    const b0 = c.clone()
    const b1 = c.clone().add(new THREE.Vector3(0.012, 0.022, 0.008))
    // the fingers carry on the line of the forearm
    const ahead = b1.clone().sub(elbow(1)).setY(0).normalize()
    const over = carryPose(b1, ahead)
    const twist0 = tw0
    // the camera draws back and round to take in the basket and where the ball will be let go
    rig.updateWorldMatrix(true, false)
    const cam = play.camTo('basket', TOSS.take + TOSS.carry + TOSS.swing, [
      drop.at.clone(),
      drop.at.clone().add(new THREE.Vector3(0, 0.09, -0.03)),
      new THREE.Vector3(drop.at.x - 0.06, 0, play.deskFront - 0.03),
      new THREE.Vector3(drop.at.x + 0.08, 0, play.deskFront - 0.03),
    ].map((q) => rig.localToWorld(q)))
    await tw.run(TOSS.take, (t) => {
      const e = ease.inOut(t)
      ball.group.position.lerpVectors(b0, b1, e)
      ball.setCrumple(1, twist0 * 0.8 * (1 - e))
      lerpPose(heldR, over, e, right)
      lerpPose(heldL, outL, ease.in(t), left)
      place(play, right, left)
    }, ease.linear)
    if (!play.alive()) return
    hands.left.root.visible = false
    // 4. it carries the ball up over the front edge of the desk and down toward the basket, the
    //    elbow swinging out to the side
    const swingBy = drop.v.clone().multiplyScalar((TOSS.swing / 1000) * 0.5)
    const aim = drop.at.clone().sub(swingBy)
    const c1 = b1.clone().add(new THREE.Vector3(0.05, 0.05, 0.1))
    const c2 = aim.clone().add(new THREE.Vector3(-0.02, 0.18, -0.05))
    const elbowFrom = elbow(1)
    const elbowTo = drop.at.clone().add(new THREE.Vector3(0.24, -0.03, 0.14))
    const elbowR = new THREE.Vector3()
    const p = new THREE.Vector3()
    await tw.run(TOSS.carry, (t) => {
      cubic(b1, c1, c2, aim, t, p)
      ball.group.position.copy(p)
      elbowR.lerpVectors(elbowFrom, elbowTo, t)
      carryPose(p, ahead.copy(p).sub(elbowR).setY(0).normalize(), 0, right)
      place(play, right, left, elbowR)
    }, ease.inOut)
    if (!play.alive()) return
    // a small push toward the basket, and the fingers open: it drops
    await tw.run(TOSS.swing, (t) => {
      p.copy(aim).addScaledVector(swingBy, 2 * t * t)
      ball.group.position.copy(p)
      carryPose(p, ahead, smooth01((t - 0.35) / 0.65), right)
      // the fingers dip a little as it leaves them
      right.quat.multiply(q1.setFromAxisAngle(X_AXIS, -0.22 * t))
      place(play, right, left, elbowTo)
    }, ease.linear)
    if (!play.alive()) return
    // 5. it falls into the basket, turning a little, while the hand follows through and goes
    sound('toss')
    const at = ball.group.position.clone()
    const spinAxis = new THREE.Vector3(drop.v.z, 0, -drop.v.x).normalize()
    const qa = ball.group.quaternion.clone()
    const spin = new THREE.Quaternion()
    const let_ = copyPose(right)
    let_.curl = 0.12
    let_.thumb = 0.16
    const away = withdrawn(let_, elbowTo)
    away.pos.y -= 0.03
    const secs = drop.secs
    const flight = tw.run(secs * 1000, (t) => {
      const s = t * secs
      ball.group.position.set(at.x + drop.v.x * s, at.y + drop.v.y * s - 0.5 * GRAVITY * s * s, at.z + drop.v.z * s)
      ball.group.quaternion.copy(qa).premultiply(spin.setFromAxisAngle(spinAxis, 2.2 * t))
    }, ease.linear)
    void tw.run(TOSS.fly * 0.85, (t) => {
      if (!play.alive()) return
      lerpPose(let_, away, ease.inOut(t), right)
      place(play, right, left, elbowTo)
    }, ease.linear).then(() => {
      hands.right.root.visible = false
    })
    await flight
    if (!play.alive()) return
    // 6. it drops in: a soft thud in the basket, which rocks a little; the ball bounces and lies still
    ball.group.position.copy(end)
    rig.updateWorldMatrix(true, false)
    ball.group.getWorldQuaternion(play.rest.quat)
    play.landed()
    play.cue('tossLand')
    play.rockBasket(v1.set(drop.v.x, 0, drop.v.z).normalize().transformDirection(rig.matrixWorld))
    await tw.run(TOSS.settle, (t) => ball.group.position.copy(end).add(v2.set(0, 0.012 * Math.sin(t * Math.PI) * (1 - t), 0)), ease.out)
    ball.group.position.copy(end)
    await Promise.all([cam, tw.wait(TOSS.hold)])
  } finally {
    hands.group.visible = false
    hands.left.root.visible = true
    hands.right.root.visible = true
  }
}

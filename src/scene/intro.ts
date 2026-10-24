// After Begin, before day 1: two illustrated cards laid on the desk, YOU and THE TOTA, and the
// camera looking down on them. Each has its own small motion: the YOU card lands with its photo
// still loose, the photo slides home and the paper clip snaps shut on it; the Tota's police notice
// lands beside it, and a moment later the green parrot on its stamp winks. Everything runs on the
// stage's tweens, so skip() finishes it at once; under reduced motion the cards simply fade in.
import * as THREE from 'three'
import { BLOTTER_TOP, disposeTree, material, type Pose } from './props'
import { CARD_ASPECT, CLIP_EDGE, CLIP_SCALE, YOU_PHOTO, artFor, clipPath, drawPhotoPrint, drawTotaCard, drawYouCard } from './intro-card'
import { TIER_SETTINGS } from './quality'
import { fitPose, rectOnDesk, type NdcBox } from './shots'
import { toTexture } from './textures'
import { ease, lerp, type Tweens } from './tween'
import type { IntroSpec, QualityTier, StageCueName } from './types'

/** A card's size on the desk, in metres: about a large index card. */
export const CARD_W = 0.2
export const CARD_H = CARD_W * CARD_ASPECT
const Y_YOU = BLOTTER_TOP + 0.0016
const Y_TOTA = BLOTTER_TOP + 0.0024
const GLOW = 0.2 // a little light of their own, so the cards read in a dim room
const CARD_PX: Record<QualityTier, number> = { high: 1024, mid: 896, low: 640 }
const PHOTO_PX: Record<QualityTier, number> = { high: 448, mid: 384, low: 256 }

export interface CardPlace {
  x: number
  z: number
  yaw: number
}

/** Where the two cards rest: one above the other on a tall screen, side by side on a wide one. */
export function introLayout(aspect: number): { you: CardPlace; tota: CardPlace } {
  if (aspect < 0.9) return { you: { x: -0.01, z: -0.05, yaw: 0.03 }, tota: { x: 0.012, z: 0.108, yaw: -0.035 } }
  return { you: { x: -0.106, z: 0.025, yaw: 0.04 }, tota: { x: 0.106, z: 0.035, yaw: -0.03 } }
}

/** The camera over the two cards, filling `box` (the screen minus the HUD) with them. */
export function introPose(aspect: number, box: NdcBox): Pose {
  const L = introLayout(aspect)
  const pts = [L.you, L.tota].flatMap((p) => rectOnDesk(new THREE.Vector3(p.x, 0, p.z), CARD_W * 1.03, CARD_H * 1.05, p.yaw, 0.003))
  const dir = new THREE.Vector3(0, 1, aspect < 0.9 ? 0.3 : 0.52).normalize()
  return fitPose({ points: pts, dir, aspect, box })
}

export interface IntroPlay {
  tw: Tweens
  /** How long to hold before the first card moves (the camera is still on its way down). */
  delay?: number
  reduced: boolean
  aspect: number
  cue(name: StageCueName): void
  /** False once the world was rebuilt or the intro was cleared: the motion then stops quietly. */
  alive(): boolean
  /** True while skip() finishes the motion: then no sounds (they would all land at once). */
  skipping(): boolean
}

export interface IntroCards {
  group: THREE.Group
  /** Draws both cards (and the photo) for `s`; a portrait still loading leaves an empty mount. */
  draw(s: IntroSpec): void
  /** Lays both cards at rest for the screen's shape, visible, with no motion. */
  rest(aspect: number): void
  /** Slides both cards in; resolves when they have settled. */
  play(o: IntroPlay): Promise<void>
  /** The parrot on the Tota's stamp winks once. */
  wink(o: IntroPlay): Promise<void>
  /** Both cards leave the desk; resolves when they are gone. */
  leave(o: IntroPlay): Promise<void>
  shown(): boolean
  dispose(): void
}

/**
 * A card's soft contact shadow as an alpha map (grey on black: three reads the green channel).
 * The blur is a canvas shadow cast by a rectangle drawn off the canvas, which every browser does.
 */
function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 96
  const g = c.getContext('2d')
  if (g) {
    g.fillStyle = '#000'
    g.fillRect(0, 0, 128, 96)
    g.shadowColor = '#fff'
    g.shadowBlur = 9
    g.shadowOffsetX = 1000
    g.fillStyle = '#fff'
    g.fillRect(19 - 1000, 17, 90, 62)
  }
  return toTexture(c, { color: false })
}

export function createIntroCards(tier: QualityTier): IntroCards {
  const s = TIER_SETTINGS[tier]
  const group = new THREE.Group()
  group.name = 'intro-cards'
  group.visible = false
  const shadowTex = shadowTexture()

  const makeCard = (w: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = Math.round(w * CARD_ASPECT)
    const tex = toTexture(canvas, { anisotropy: s.anisotropy })
    const mat = material(tier, { map: tex, shininess: 4, specular: 0x0a0a0a })
    mat.emissiveMap = tex
    mat.emissive.setRGB(GLOW, GLOW, GLOW)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H).rotateX(-Math.PI / 2), mat)
    mesh.receiveShadow = s.shadows !== 'none'
    const holder = new THREE.Group()
    holder.add(mesh)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowTex, transparent: true, opacity: 0.42, depthWrite: false })
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W * 1.16, CARD_H * 1.24).rotateX(-Math.PI / 2), shadowMat)
    shadow.renderOrder = -1
    group.add(holder, shadow)
    return { canvas, tex, mat, holder, shadow, shadowMat }
  }
  const you = makeCard(CARD_PX[tier])
  const tota = makeCard(CARD_PX[tier])
  // the buff card lies nearer the lamp: a shade darker, so it keeps its colour in the light
  you.mat.color.setScalar(0.84)
  you.holder.position.y = Y_YOU
  tota.holder.position.y = Y_TOTA

  // the YOU photo: its own print, lying on the card
  const pw = CARD_W * YOU_PHOTO.w
  const ph = CARD_H * YOU_PHOTO.h
  const photoCanvas = document.createElement('canvas')
  photoCanvas.width = PHOTO_PX[tier]
  photoCanvas.height = Math.round(PHOTO_PX[tier] * (ph / pw))
  const photoTex = toTexture(photoCanvas, { anisotropy: s.anisotropy })
  const photoMat = material(tier, { map: photoTex, color: 0xd6d6d6, shininess: 6, specular: 0x101010 })
  photoMat.emissiveMap = photoTex
  photoMat.emissive.setRGB(GLOW, GLOW, GLOW)
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph).rotateX(-Math.PI / 2), photoMat)
  const photoRest = new THREE.Vector3((YOU_PHOTO.u0 + YOU_PHOTO.w / 2 - 0.5) * CARD_W, 0.0006, (YOU_PHOTO.v0 + YOU_PHOTO.h / 2 - 0.5) * CARD_H)
  const PHOTO_YAW = -0.03
  photo.position.copy(photoRest)
  photo.rotation.y = PHOTO_YAW
  you.holder.add(photo)

  // the paper clip: steel wire, hinged where it hooks over the photo's top edge
  const mm = 0.001 * CLIP_SCALE
  const wire = clipPath().map(([x, y]) => new THREE.Vector3((x - 4) * mm, 0, (CLIP_EDGE - y) * mm))
  const curve = new THREE.CatmullRomCurve3(wire, false, 'centripetal')
  const clipMat = material(tier, { color: 0xaeb3b7, metal: true, shininess: 90, specular: 0x8a8a8a, emissive: 0x1a1a1a })
  const clipMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, tier === 'low' ? 90 : 160, 0.00062, tier === 'low' ? 4 : 6, false), clipMat)
  clipMesh.castShadow = s.shadows !== 'none'
  // the hinge sits at the clip's top end, on the card above the photo
  const hinge = new THREE.Group()
  const topZ = (CLIP_EDGE - 31) * mm
  hinge.position.set(photoRest.x - pw / 2 + pw * 0.64, 0.0014, photoRest.z - ph / 2 + topZ)
  hinge.rotation.y = 0.03
  clipMesh.position.z = -topZ
  hinge.add(clipMesh)
  you.holder.add(hinge)

  let spec: IntroSpec | null = null
  let wink = false
  let isShown = false
  let place = introLayout(1)

  const drawTota = () => {
    if (!spec) return
    const g = tota.canvas.getContext('2d')
    if (g) {
      g.setTransform(1, 0, 0, 1, 0, 0)
      drawTotaCard(g, tota.canvas.width, tota.canvas.height, spec.tota, spec.lang, artFor(spec.tota.art), wink)
    }
    tota.tex.needsUpdate = true
  }

  /** Puts a card at (x, z, yaw) with its lift, and its shadow on the desk below, a little off toward the room. */
  const put = (c: typeof you, x: number, z: number, yaw: number, lift: number) => {
    c.holder.position.set(x, (c === you ? Y_YOU : Y_TOTA) + lift, z)
    c.holder.rotation.y = yaw
    const spread = 1 + lift * 12
    c.shadow.position.set(x + 0.004 + lift * 0.25, BLOTTER_TOP + 0.0003, z + 0.007 + lift * 0.3)
    c.shadow.rotation.y = yaw
    c.shadow.scale.set(spread, 1, spread)
    c.shadowMat.opacity = 0.42 / (spread * spread)
  }

  const setOpacity = (k: number) => {
    const fading = k < 1
    for (const m of [you.mat, tota.mat, photoMat, clipMat]) {
      m.transparent = fading
      m.opacity = k
    }
    you.shadowMat.opacity = tota.shadowMat.opacity = 0.42 * k
  }

  const atRest = (aspect: number) => {
    place = introLayout(aspect)
    put(you, place.you.x, place.you.z, place.you.yaw, 0)
    put(tota, place.tota.x, place.tota.z, place.tota.yaw, 0)
    photo.position.copy(photoRest)
    photo.rotation.y = PHOTO_YAW
    hinge.rotation.x = 0
    setOpacity(1)
    group.visible = true
    isShown = true
  }

  /** A card's slide from off the desk to its place, with a small lift in the middle. */
  const slide = (o: IntroPlay, c: typeof you, to: CardPlace, from: { dx: number; dz: number; dyaw: number }, ms: number) =>
    o.tw.run(ms, (k) => {
      if (!o.alive()) return
      put(c, to.x + from.dx * (1 - k), to.z + from.dz * (1 - k), to.yaw + from.dyaw * (1 - k), 0.028 * Math.sin(Math.PI * Math.min(1, k * 1.05)))
    }, ease.out)

  return {
    group,
    draw(s2) {
      spec = s2
      const gy = you.canvas.getContext('2d')
      if (gy) {
        gy.setTransform(1, 0, 0, 1, 0, 0)
        drawYouCard(gy, you.canvas.width, you.canvas.height, s2.you, s2.lang)
      }
      you.tex.needsUpdate = true
      const gp = photoCanvas.getContext('2d')
      if (gp) {
        gp.setTransform(1, 0, 0, 1, 0, 0)
        drawPhotoPrint(gp, photoCanvas.width, photoCanvas.height, artFor(s2.you.art))
      }
      photoTex.needsUpdate = true
      drawTota()
    },
    rest: atRest,
    async play(o) {
      place = introLayout(o.aspect)
      const say = (n: StageCueName) => {
        if (!o.skipping()) o.cue(n)
      }
      group.visible = true
      isShown = true
      if (o.reduced) {
        atRest(o.aspect)
        setOpacity(0)
        say('cardSlide')
        await o.tw.run(260, (k) => o.alive() && setOpacity(k), ease.out)
        if (o.alive()) setOpacity(1)
        return
      }
      setOpacity(1)
      const portrait = o.aspect < 0.9
      // both start off the desk, toward the player and out to the sides
      put(you, -9, 0, 0, 0)
      put(tota, 9, 0, 0, 0)
      if (o.delay) await o.tw.wait(o.delay)
      if (!o.alive()) return
      // the photo is still loose on the card, and the clip is open
      photo.position.set(photoRest.x + 0.006, photoRest.y + 0.0004, photoRest.z + 0.03)
      photo.rotation.y = PHOTO_YAW + 0.16
      hinge.rotation.x = -0.62
      say('cardSlide')
      const youIn = slide(o, you, place.you, { dx: portrait ? -0.36 : -0.5, dz: 0.3, dyaw: 0.55 }, 660).then(async () => {
        if (!o.alive()) return
        // the photo slides home under the clip, and the clip snaps shut on it
        const p0 = photo.position.clone()
        const r0 = photo.rotation.y
        await o.tw.run(190, (k) => {
          if (!o.alive()) return
          photo.position.lerpVectors(p0, photoRest, k)
          photo.rotation.y = lerp(r0, PHOTO_YAW, k)
        }, ease.inOut)
        await o.tw.run(95, (k) => o.alive() && (hinge.rotation.x = lerp(-0.62, 0, k)), ease.in)
        if (!o.alive()) return
        say('clipSnap')
        await o.tw.run(150, (k) => o.alive() && (hinge.rotation.x = -0.07 * Math.sin(Math.PI * k)), ease.out)
        hinge.rotation.x = 0
      })
      await o.tw.wait(270)
      if (!o.alive()) return
      say('cardSlide')
      const totaIn = slide(o, tota, place.tota, { dx: portrait ? 0.38 : 0.5, dz: 0.34, dyaw: -0.5 }, 660)
      await Promise.all([youIn, totaIn])
    },
    async wink(o) {
      if (o.reduced || !o.alive() || !isShown) return
      wink = true
      drawTota()
      await o.tw.wait(190)
      wink = false
      drawTota()
    },
    async leave(o) {
      if (!isShown) return
      if (o.reduced) {
        await o.tw.run(200, (k) => setOpacity(1 - k), ease.out)
      } else {
        if (!o.skipping()) o.cue('cardSlide')
        const y0 = { x: you.holder.position.x, z: you.holder.position.z, yaw: you.holder.rotation.y }
        const t0 = { x: tota.holder.position.x, z: tota.holder.position.z, yaw: tota.holder.rotation.y }
        await o.tw.run(380, (k) => {
          put(you, y0.x - 0.55 * k, y0.z + 0.14 * k, y0.yaw + 0.4 * k, 0.012 * Math.sin(Math.PI * k))
          put(tota, t0.x + 0.55 * k, t0.z + 0.16 * k, t0.yaw - 0.4 * k, 0.012 * Math.sin(Math.PI * k))
        }, ease.in)
      }
      group.visible = false
      isShown = false
    },
    shown: () => isShown,
    dispose() {
      group.removeFromParent()
      disposeTree(group)
      shadowTex.dispose()
    },
  }
}

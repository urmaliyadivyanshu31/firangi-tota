// The 3D props that carry the message: the sheet itself (which folds, feeds out of a typewriter and
// takes the stamp), the 1942 courier's envelope, the in-world day title, the 1947 calendar leaves,
// and the full-screen flash after a verdict. The text on the sheet comes from sheet.ts.
import * as THREE from 'three'
import { mix } from './palette'
import { BLOTTER_TOP, disposeTree, material, type PaperStamp } from './props'
import { TIER_SETTINGS } from './quality'
import { FACE, MAX_ASPECT, STAMP_SHARE, drawDayTitle, drawStampImprint, type TitleTone } from './sheet'
import { toTexture } from './textures'
import { clamp01 } from './tween'
import type { DayTitle, DressingHooks, QualityTier, StampKind } from './types'

/** The message sheet is as wide as the desk paper; its height follows the text. */
export const SHEET_W = 0.21
const SHEET_Y = BLOTTER_TOP + 0.0007

/** Canvas width for the sheet texture per tier (height is width × MAX_ASPECT; only the top is used). */
export const SHEET_PX: Record<QualityTier, number> = { high: 1024, mid: 896, low: 768 }

export type FoldMode = 'flat' | 'half' | 'letter'

export interface Reveal {
  /** Page v (0 top … 1 bottom) of the line being typed. */
  top: number
  bottom: number
  /** Page u where the line starts and ends, and how far it is typed. */
  x0: number
  x1: number
  u: number
}

export interface MessageSheet {
  group: THREE.Group
  texture: THREE.CanvasTexture
  canvas: HTMLCanvasElement
  h(): number
  setAspect(a: number): void
  setFold(mode: FoldMode): void
  fold(): FoldMode
  /** Opens a flap: 0 = the top flap, 1 = the bottom flap (letter fold). 0 = folded, 1 = flat. */
  setOpen(i: 0 | 1, k: number): void
  /** Only the top `f` of the page shows (the typewriter's feed). Flat mode only. */
  setFeed(f: number): void
  setReveal(r: Reveal | null, paperTint?: number): void
  setStamp(st: PaperStamp | null): void
  setInk(k: number): void
  /** Lifts the paper's brightness for reading (0..1). */
  setGlow(k: number): void
  /** The red wax seal on the folded petition; `crack` 0..1 splits it. */
  setSeal(visible: boolean, crack?: number): void
  /** The verdict's pencil layer over the front (its canvas is drawn by the stage). */
  overlay: THREE.CanvasTexture | null
  setOverlay(visible: boolean): void
  /** The paper's back (its canvas is drawn by the stage), and the turn over to it: 0 front … 1 back. */
  reverse: THREE.CanvasTexture | null
  setFlip(k: number): void
  flip(): number
  /** A body-local point on the back at page (u, v), for hit rectangles. */
  backPointAt(u: number, v: number): THREE.Vector3
  /** Writes the address on the outside of the folded paper (ink for a petition, else pencil). */
  setOutside(text: string, lang: 'en' | 'hi', ink: boolean): void
  /** World point on the (flat) sheet at (u, v). */
  pointAt(u: number, v: number): THREE.Vector3
  /** The decal textures are drawn with the sheet fonts; call again once they load. */
  drawDecals(): void
  dispose(): void
}

interface Panel {
  front: THREE.Mesh
  back: THREE.Mesh
  base: Float32Array // unit positions (x in metres, t 0..1 down the panel)
}

function makePanel(frontMat: THREE.Material, backMat: THREE.Material, segX: number, segZ: number): Panel {
  const geo = new THREE.PlaneGeometry(SHEET_W, 1, segX, segZ).rotateX(-Math.PI / 2)
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const base = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    base[i * 2] = pos.getX(i)
    base[i * 2 + 1] = pos.getZ(i) + 0.5
  }
  const backGeo = geo.clone()
  const idx = backGeo.getIndex()
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i + 1)
      idx.setX(i + 1, idx.getX(i + 2))
      idx.setX(i + 2, a)
    }
  }
  const n = backGeo.getAttribute('normal') as THREE.BufferAttribute
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, -1, 0)
  const front = new THREE.Mesh(geo, frontMat)
  const back = new THREE.Mesh(backGeo, backMat)
  front.receiveShadow = true
  back.receiveShadow = true
  return { front, back, base }
}

/** Fills a panel spanning local z0..z1 with page v0..v1, plus a gentle curl on a flat sheet. */
function fillPanel(p: Panel, z0: number, z1: number, v0: number, v1: number, curl: number, halfH: number): void {
  for (const mesh of [p.front, p.back]) {
    const geo = mesh.geometry
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const uv = geo.getAttribute('uv') as THREE.BufferAttribute
    const back = mesh === p.back
    for (let i = 0; i < pos.count; i++) {
      const x = p.base[i * 2] ?? 0
      const t = p.base[i * 2 + 1] ?? 0
      const z = z0 + (z1 - z0) * t
      const nx = x / (SHEET_W / 2)
      const nz = halfH > 0 ? z / halfH : 0
      const lift = curl * (0.0022 * Math.pow(Math.abs(nx), 4) + 0.0018 * Math.pow(Math.max(0, nz), 6))
      pos.setXYZ(i, x, lift - (back ? 0.00025 : 0), z)
      // the back shows the outside of the fold (the address): each panel maps the whole label,
      // with its top at the hinge, so it reads upright on the folded packet
      if (back) uv.setXY(i, x / SHEET_W + 0.5, t)
      else uv.setXY(i, x / SHEET_W + 0.5, 1 - (v0 + (v1 - v0) * t))
    }
    pos.needsUpdate = true
    uv.needsUpdate = true
    geo.computeBoundingSphere()
  }
}

/**
 * The message sheet. One canvas (reused for every message) holds the page; the page is drawn into
 * its top part and the texture's repeat shows only that part.
 */
export function createMessageSheet(o: { tier: QualityTier; canvas: HTMLCanvasElement; paper: number; overlayCanvas?: HTMLCanvasElement; backCanvas?: HTMLCanvasElement }): MessageSheet {
  const s = TIER_SETTINGS[o.tier]
  const texture = toTexture(o.canvas, { anisotropy: s.anisotropy })
  const frontMat = material(o.tier, { map: texture, shininess: 5, specular: 0x0b0b0b }) as THREE.MeshLambertMaterial
  frontMat.emissiveMap = texture
  frontMat.emissive.setRGB(0, 0, 0)
  const uniforms = {
    uRevealOn: { value: 0 },
    uLine: { value: new THREE.Vector4(0, 0, 0, 0) },
    uRevealU: { value: 0 },
    uPaper: { value: new THREE.Color(o.paper) },
  }
  // the typewriter reveal: on the line being typed, paper shows where no letter is struck yet
  frontMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPageUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n\tvPageUv = uv;')
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec2 vPageUv;\nuniform float uRevealOn;\nuniform vec4 uLine;\nuniform float uRevealU;\nuniform vec3 uPaper;\n' +
          'float ftHidden() { float pv = 1.0 - vPageUv.y; return (uRevealOn > 0.5 && pv > uLine.x && pv < uLine.y && vPageUv.x > uRevealU && vPageUv.x < uLine.w) ? 1.0 : 0.0; }',
      )
      .replace('#include <map_fragment>', '#include <map_fragment>\n\tif (ftHidden() > 0.5) diffuseColor.rgb = uPaper;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\tif (ftHidden() > 0.5) totalEmissiveRadiance = emissive * uPaper;')
  }
  frontMat.customProgramCacheKey = () => 'ft-message-sheet'
  // the outside of the fold: plain paper with the address on it
  const backCanvas = document.createElement('canvas')
  backCanvas.width = o.tier === 'low' ? 256 : 512
  backCanvas.height = backCanvas.width / 2
  const backTex = toTexture(backCanvas)
  const backMat = material(o.tier, { map: backTex, color: 0xe6dccb, shininess: 3 })
  const paperHex = `#${mix(o.paper, 0xffffff, 0.08).toString(16).padStart(6, '0')}`
  const drawOutside = (text: string, lang: 'en' | 'hi', ink: boolean) => {
    try {
      const g = backCanvas.getContext('2d')
      if (!g) return
      const W = backCanvas.width
      const Hc = backCanvas.height
      g.fillStyle = paperHex
      g.fillRect(0, 0, W, Hc)
      for (let i = 0; i < 160; i++) {
        g.fillStyle = `rgba(110,80,45,${(0.03 + ((i * 37) % 11) / 160).toFixed(3)})`
        g.fillRect(((i * 97) % W) + 0.5, ((i * 61) % Hc) + 0.5, 1.5, 1.5)
      }
      if (!text) return
      g.save()
      g.translate(W / 2, Hc * 0.56)
      g.rotate(-0.03)
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillStyle = ink ? 'rgba(44,26,15,0.9)' : 'rgba(52,54,62,0.85)'
      let size = Hc * 0.2
      const face = lang === 'hi' ? FACE.deva : FACE.hand
      g.font = `${size}px ${face}`
      while (g.measureText(text).width > W * 0.8 && size > 8) {
        size *= 0.92
        g.font = `${size}px ${face}`
      }
      g.fillText(text, 0, 0)
      if (ink) {
        // a looping flourish under the address, as a munshi would sign off the outside
        g.strokeStyle = 'rgba(125,32,22,0.7)'
        g.lineWidth = Math.max(1, Hc * 0.012)
        g.beginPath()
        g.moveTo(-W * 0.22, size * 0.75)
        g.bezierCurveTo(-W * 0.05, size * 1.15, W * 0.05, size * 0.35, W * 0.22, size * 0.8)
        g.stroke()
      }
      g.restore()
    } catch {
      // decorative: never let it stop an arrival
    } finally {
      backTex.needsUpdate = true
    }
  }
  drawOutside('', 'en', false)
  const segX = o.tier === 'low' ? 4 : 6
  const segZ = o.tier === 'low' ? 4 : 8
  const plainBack = material(o.tier, { color: mix(o.paper, 0x6b5a40, 0.12), shininess: 3 })
  const panels = [makePanel(frontMat, backMat, segX, segZ), makePanel(frontMat, plainBack, segX, segZ), makePanel(frontMat, plainBack, segX, segZ)] as const
  const group = new THREE.Group()
  group.name = 'message-sheet'
  const body = new THREE.Group()
  body.position.y = SHEET_Y
  const hingeT = new THREE.Group()
  const hingeB = new THREE.Group()
  hingeT.add(panels[0].front, panels[0].back)
  hingeB.add(panels[2].front, panels[2].back)
  body.add(panels[1].front, panels[1].back, hingeT, hingeB)
  group.add(body)

  // the wax seal: two halves, so it can crack
  const waxMat = material(o.tier, { color: 0x8e1b14, shininess: 60, specular: 0x5a2a20 })
  const seal = new THREE.Group()
  const half = (t0: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0178, 0.003, 20, 1, false, t0, Math.PI), waxMat)
    m.castShadow = true
    seal.add(m)
    return m
  }
  const halves: [THREE.Mesh, THREE.Mesh] = [half(0), half(Math.PI)]
  const stampRing = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.0013, 6, 22).rotateX(Math.PI / 2), waxMat)
  stampRing.position.y = -0.0014
  halves[0].add(stampRing)
  seal.visible = false
  hingeT.add(seal)

  // the stamp imprint: a decal over the sheet, so stamping uploads nothing
  const decalPx = o.tier === 'low' ? 256 : 512
  const decalCanvases: Record<StampKind, HTMLCanvasElement> = { asli: document.createElement('canvas'), tota: document.createElement('canvas') }
  const decals = {} as Record<StampKind, THREE.CanvasTexture>
  for (const k of ['asli', 'tota'] as const) {
    decalCanvases[k].width = decalCanvases[k].height = decalPx
    decals[k] = toTexture(decalCanvases[k])
  }
  const drawDecals = () => {
    for (const k of ['asli', 'tota'] as const) {
      try {
        const g = decalCanvases[k].getContext('2d')
        if (!g) continue
        g.clearRect(0, 0, decalPx, decalPx)
        drawStampImprint(g, k, decalPx / 2, decalPx / 2, decalPx * 0.98, 0, k === 'asli' ? 11 : 23, 'erase')
        decals[k].needsUpdate = true
      } catch {
        // an imprint that cannot be drawn must never take the stage down; the stamp still lands
      }
    }
  }
  drawDecals()
  const decalMat = material(o.tier, { map: decals.asli, transparent: true, decal: true, shininess: 4 })
  const decalSize = SHEET_W * STAMP_SHARE * 1.02
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(decalSize, decalSize).rotateX(-Math.PI / 2), decalMat)
  decal.visible = false
  decal.renderOrder = 2
  body.add(decal)

  // the verdict: a transparent pencil layer over the front, and the back face, used flat only
  const overlayTex = o.overlayCanvas ? toTexture(o.overlayCanvas) : null
  const overlay = overlayTex
    ? new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: overlayTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6, toneMapped: true }))
    : null
  if (overlay) {
    // above the curl of the sheet's edges (2.2 mm at the corners), or the edges would hide the pencil
    overlay.position.y = 0.0028
    overlay.renderOrder = 3
    overlay.visible = false
    body.add(overlay)
  }
  const reverseTex = o.backCanvas ? toTexture(o.backCanvas, { anisotropy: s.anisotropy }) : null
  let reverse: THREE.Mesh | null = null
  if (reverseTex) {
    const geo = new THREE.PlaneGeometry(1, 1, 1, 1).rotateX(Math.PI / 2)
    // facing down until the sheet turns over about its long axis; then it reads upright and unmirrored
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const uv = geo.getAttribute('uv') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 - pos.getX(i), 0.5 - pos.getZ(i))
    const mat = material(o.tier, { map: reverseTex, shininess: 5, specular: 0x0b0b0b }) as THREE.MeshLambertMaterial
    mat.emissiveMap = reverseTex
    mat.emissive.setRGB(0.3, 0.3, 0.3)
    reverse = new THREE.Mesh(geo, mat)
    reverse.position.y = -0.0003
    reverse.receiveShadow = true
    reverse.visible = false
    body.add(reverse)
  }
  let flipK = 0

  let aspect = 4 / 3
  let mode: FoldMode = 'flat'
  let feed = 1
  let stamp: PaperStamp | null = null
  const open: [number, number] = [1, 1]

  const H = () => SHEET_W * aspect
  const layout = () => {
    const h = H()
    const half = h / 2
    const show = (p: Panel, on: boolean, backs: boolean) => {
      p.front.visible = on
      p.back.visible = on && backs
    }
    if (mode === 'flat') {
      show(panels[0], false, false)
      show(panels[2], false, false)
      show(panels[1], true, false)
      const f = clamp01(feed)
      fillPanel(panels[1], -half, -half + h * f, 0, f, f >= 1 ? 1 : 0, half)
      hingeT.position.set(0, 0, 0)
      hingeB.position.set(0, 0, 0)
    } else if (mode === 'half') {
      show(panels[0], true, true)
      show(panels[1], true, true)
      show(panels[2], false, false)
      fillPanel(panels[1], 0, half, 0.5, 1, 0, half)
      fillPanel(panels[0], -half, 0, 0, 0.5, 0, half)
      hingeT.position.set(0, 0, 0)
    } else {
      show(panels[0], true, true)
      show(panels[1], true, true)
      show(panels[2], true, true)
      const third = h / 3
      fillPanel(panels[1], -third / 2, third / 2, 1 / 3, 2 / 3, 0, half)
      fillPanel(panels[0], -third, 0, 0, 1 / 3, 0, half)
      fillPanel(panels[2], 0, third, 2 / 3, 1, 0, half)
      hingeT.position.set(0, 0, -third / 2)
      hingeB.position.set(0, 0, third / 2)
    }
    // the seal sits on the top flap's back, near its free edge
    const flapLen = mode === 'letter' ? h / 3 : half
    seal.position.set(0, -0.0016, -flapLen + 0.024)
    applyOpen()
    placeDecal()
  }
  const applyOpen = () => {
    const kT = mode === 'flat' ? 1 : open[0]
    const kB = mode === 'letter' ? open[1] : 1
    hingeT.rotation.x = Math.PI * (1 - kT)
    hingeT.position.y = 0.0016 * (1 - kT)
    hingeB.rotation.x = -Math.PI * (1 - kB)
    hingeB.position.y = 0.0008 * (1 - kB)
  }
  const placeDecal = () => {
    if (!stamp || mode !== 'flat') {
      decal.visible = false
      return
    }
    decalMat.map = decals[stamp.kind]
    decal.position.set((stamp.u - 0.5) * SHEET_W, 0.0006, (stamp.v - 0.5) * H())
    decal.rotation.y = stamp.rot
    decal.visible = true
  }
  const setRepeat = () => {
    const used = Math.min(1, (aspect * o.canvas.width) / o.canvas.height)
    texture.repeat.set(1, used)
    texture.offset.set(0, 1 - used)
    for (const [t, c] of [[overlayTex, o.overlayCanvas], [reverseTex, o.backCanvas]] as const) {
      if (!t || !c) continue
      const u = Math.min(1, (aspect * c.width) / c.height)
      t.repeat.set(1, u)
      t.offset.set(0, 1 - u)
    }
    overlay?.scale.set(SHEET_W, 1, SHEET_W * aspect)
    reverse?.scale.set(SHEET_W, 1, SHEET_W * aspect)
  }
  setRepeat()
  layout()

  return {
    group,
    texture,
    canvas: o.canvas,
    h: H,
    setAspect(a) {
      aspect = Math.min(MAX_ASPECT, Math.max(1, a))
      setRepeat()
      layout()
    },
    setFold(m) {
      mode = m
      if (m !== 'flat') feed = 1
      layout()
    },
    fold: () => mode,
    setOpen(i, k) {
      open[i] = clamp01(k)
      applyOpen()
    },
    setFeed(f) {
      feed = clamp01(f)
      if (mode === 'flat') layout()
    },
    setReveal(r, tint) {
      uniforms.uRevealOn.value = r ? 1 : 0
      if (r) {
        uniforms.uLine.value.set(r.top, r.bottom, r.x0, r.x1)
        uniforms.uRevealU.value = r.u
      }
      if (tint !== undefined) uniforms.uPaper.value.setHex(tint)
    },
    setStamp(st) {
      stamp = st
      placeDecal()
    },
    setInk(k) {
      decalMat.opacity = 0.9 * clamp01(k)
    },
    setGlow(k) {
      const g = 0.12 + 0.2 * clamp01(k)
      frontMat.emissive.setRGB(g, g, g)
    },
    setSeal(visible, crack = 0) {
      seal.visible = visible
      const c = clamp01(crack)
      halves[0].position.set(0.006 * c, 0.0014 * c, 0)
      halves[0].rotation.z = -0.4 * c
      halves[1].position.set(-0.006 * c, 0.0014 * c, 0)
      halves[1].rotation.z = 0.4 * c
    },
    pointAt(u, v) {
      group.updateWorldMatrix(true, true)
      return body.localToWorld(new THREE.Vector3((u - 0.5) * SHEET_W, 0.0006, (v - 0.5) * H()))
    },
    overlay: overlayTex,
    setOverlay(visible) {
      if (overlay) overlay.visible = visible && mode === 'flat'
    },
    reverse: reverseTex,
    setFlip(k) {
      flipK = clamp01(k)
      // lifted toward the camera, turned over about its long axis like a page, and laid down
      body.rotation.z = Math.PI * flipK
      body.position.y = SHEET_Y + Math.sin(Math.PI * flipK) * 0.13
      body.position.x = Math.sin(Math.PI * flipK) * 0.012
      if (reverse) reverse.visible = flipK > 0.001
    },
    flip: () => flipK,
    backPointAt(u, v) {
      group.updateWorldMatrix(true, true)
      return body.localToWorld(new THREE.Vector3((0.5 - u) * SHEET_W, -0.0006, (v - 0.5) * H()))
    },
    drawDecals,
    setOutside: drawOutside,
    dispose() {
      disposeTree(group)
      texture.dispose()
      backTex.dispose()
      overlayTex?.dispose()
      reverseTex?.dispose()
      decals.asli.dispose()
      decals.tota.dispose()
    },
  }
}

// ---------------------------------------------------------------- the 1942 courier's envelope

export interface Envelope {
  group: THREE.Group
  /** Sizes it around a folded slip of the given height and writes the pencil note. */
  setup(slipH: number, lang: 'en' | 'hi'): void
  /** 0 = closed, 1 = open flat. */
  setFlap(k: number): void
  w: number
  h(): number
  dispose(): void
}

export function createEnvelope(tier: QualityTier): Envelope {
  const W = 0.236
  let Hh = 0.17
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 288
  const tex = toTexture(c)
  const manila = 0xc49a5c
  const frontMat = material(tier, { map: tex, shininess: 6 })
  const backMat = material(tier, { color: mix(manila, 0x000000, 0.12), shininess: 4 })
  const flapMat = material(tier, { color: mix(manila, 0xffffff, 0.04), shininess: 6, side: THREE.DoubleSide })
  const group = new THREE.Group()
  group.name = 'envelope'
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, 1).rotateX(-Math.PI / 2), backMat)
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W, 1).rotateX(-Math.PI / 2), frontMat)
  // the folded slip (about 4.5 mm up with its flap) travels between the back and the front
  back.position.y = 0.0012
  front.position.y = 0.0058
  for (const m of [back, front]) {
    m.receiveShadow = true
    group.add(m)
  }
  // the flap: a shallow triangle hinged on the back panel's top edge
  const flapGeo = new THREE.BufferGeometry()
  const L = 0.07
  flapGeo.setAttribute('position', new THREE.Float32BufferAttribute([-W / 2, 0, 0, W / 2, 0, 0, 0, 0, -L], 3))
  flapGeo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3))
  flapGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2))
  flapGeo.setIndex([0, 1, 2])
  const flap = new THREE.Mesh(flapGeo, flapMat)
  flap.castShadow = true
  const pivot = new THREE.Group()
  pivot.add(flap)
  group.add(pivot)
  let flapK = 0
  const place = () => {
    back.scale.z = Hh
    front.scale.z = Hh
    pivot.position.set(0, 0.0012 + 0.005 * (1 - flapK), -Hh / 2)
    pivot.rotation.x = Math.PI * (1 - flapK)
  }
  const draw = (lang: 'en' | 'hi') => {
    const g = c.getContext('2d')
    if (!g) return
    g.fillStyle = '#c69c5e'
    g.fillRect(0, 0, c.width, c.height)
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(90,60,25,${(0.03 + Math.random() * 0.06).toFixed(3)})`
      g.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    g.strokeStyle = 'rgba(70,45,20,0.35)'
    g.lineWidth = 3
    g.strokeRect(6, 6, c.width - 12, c.height - 12)
    g.save()
    g.translate(c.width * 0.52, c.height * 0.58)
    g.rotate(-0.06)
    g.fillStyle = 'rgba(48,46,52,0.85)'
    g.textAlign = 'center'
    g.font = `46px ${lang === 'hi' ? FACE.deva : FACE.hand}`
    g.fillText(lang === 'hi' ? 'दस्ती' : 'By hand', 0, 0)
    g.strokeStyle = 'rgba(160,40,30,0.8)'
    g.lineWidth = 5
    g.beginPath()
    g.moveTo(-90, 24)
    g.lineTo(90, 18)
    g.stroke()
    g.restore()
    tex.needsUpdate = true
  }
  draw('en')
  place()
  return {
    group,
    w: W,
    h: () => Hh,
    setup(slipH, lang) {
      Hh = slipH + 0.03
      draw(lang)
      place()
    },
    setFlap(k) {
      flapK = clamp01(k)
      place()
    },
    dispose() {
      disposeTree(group)
      tex.dispose()
    },
  }
}

// ---------------------------------------------------------------- the day title in the room

export interface TitleBoard {
  group: THREE.Group
  /** Draws the lettering (fonts must be loaded) and places the board. */
  set(t: DayTitle, tone: TitleTone): void
  /** 0 hidden … 1 shown; `settle` 0..1 presses the type into place. */
  setShow(k: number, settle?: number): void
  place(hook: NonNullable<DressingHooks['title']>): void
  dispose(): void
}

export function createTitleBoard(tier: QualityTier): TitleBoard {
  const c = document.createElement('canvas')
  c.width = tier === 'low' ? 512 : 1024
  c.height = c.width / 2
  const tex = toTexture(c)
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false, opacity: 0 })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), mat)
  mesh.renderOrder = 3
  const group = new THREE.Group()
  group.name = 'day-title'
  group.add(mesh)
  group.visible = false
  let width = 0.4
  return {
    group,
    set(t, tone) {
      const g = c.getContext('2d')
      if (g) drawDayTitle(g, c.width, c.height, t, tone)
      tex.needsUpdate = true
    },
    place(hook) {
      width = hook.w
      group.position.set(hook.pos[0], hook.pos[1], hook.pos[2])
      group.rotation.y = hook.yaw ?? 0
      mesh.scale.setScalar(width)
    },
    setShow(k, settle = 1) {
      const kk = clamp01(k)
      group.visible = kk > 0.001
      mat.opacity = kk
      // type pressed onto the surface: a touch large and proud, then flat and exact
      const st = clamp01(settle)
      const over = 1 + 0.07 * (1 - st)
      mesh.scale.set(width * over, width * over, 1)
      mesh.position.z = 0.012 * (1 - st)
    },
    dispose() {
      disposeTree(group)
      tex.dispose()
    },
  }
}

// ---------------------------------------------------------------- the 1947 countdown calendar

export interface CalendarLeaves {
  group: THREE.Group
  /** Shows `days` on the pad (over the built texture). */
  show(days: number): void
  /** Starts a flip from `from` to `to`; `k` 0..1 runs it. */
  prepareFlip(from: number, to: number): void
  setFlip(k: number): void
  dispose(): void
}

export function createCalendar(hook: NonNullable<DressingHooks['calendar']>, tier: QualityTier): CalendarLeaves {
  const pw = tier === 'low' ? 192 : 320
  const ph = Math.round((pw * hook.h) / hook.w)
  const mk = () => {
    const cv = document.createElement('canvas')
    cv.width = pw
    cv.height = ph
    return { cv, tex: toTexture(cv) }
  }
  const under = mk()
  const leaf = mk()
  const mat = (t: THREE.Texture) => material(tier, { map: t, shininess: 6, side: THREE.DoubleSide })
  const underMesh = new THREE.Mesh(new THREE.PlaneGeometry(hook.w, hook.h), mat(under.tex))
  const leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(hook.w, hook.h), mat(leaf.tex))
  const group = new THREE.Group()
  group.name = 'calendar-leaves'
  underMesh.position.set(hook.pos[0], hook.pos[1], hook.pos[2] + 0.0008)
  const pivot = new THREE.Group()
  pivot.position.set(hook.pos[0], hook.pos[1] + hook.h / 2, hook.pos[2] + 0.0016)
  leafMesh.position.y = -hook.h / 2
  pivot.add(leafMesh)
  group.add(underMesh, pivot)
  underMesh.visible = false
  pivot.visible = false
  const draw = (t: { cv: HTMLCanvasElement; tex: THREE.CanvasTexture }, days: number) => {
    const g = t.cv.getContext('2d')
    if (g) hook.draw(g, pw, ph, days)
    t.tex.needsUpdate = true
  }
  return {
    group,
    show(days) {
      draw(under, days)
      underMesh.visible = true
    },
    prepareFlip(from, to) {
      draw(leaf, from)
      draw(under, to)
      underMesh.visible = true
      pivot.visible = true
      pivot.rotation.set(0, 0, 0)
    },
    setFlip(k) {
      const kk = clamp01(k)
      // the leaf lifts off the binding, swings up and over, and is gone
      pivot.rotation.x = -kk * Math.PI * 0.92
      pivot.position.z = hook.pos[2] + 0.0016 + Math.sin(kk * Math.PI) * 0.03
      pivot.visible = kk < 0.999
    },
    dispose() {
      disposeTree(group)
      under.tex.dispose()
      leaf.tex.dispose()
    },
  }
}

// ---------------------------------------------------------------- the verdict flash

const FLASH_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const FLASH_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAmount;
uniform float uSpread;
uniform float uInk;
uniform float uWash;
uniform float uAspect;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float r = length(p) / (0.5 * length(vec2(uAspect, 1.0)));
  float a;
  vec3 col = uColor;
  if (uInk > 0.5) {
    // the room washes red for a beat, the edges sink to black-red, and red ink bleeds in
    float field = r + (noise(vUv * vec2(uAspect, 1.0) * 5.0) - 0.5) * 0.32 + (noise(vUv * 17.0) - 0.5) * 0.08;
    float front = 1.0 - uSpread * 0.62;
    float inked = smoothstep(front - 0.03, front + 0.02, field);
    float rim = smoothstep(front - 0.03, front, field) - smoothstep(front, front + 0.05, field);
    float vig = smoothstep(0.42, 1.05, r);
    col = mix(uColor, vec3(0.06, 0.0, 0.0), clamp(vig * 0.85 + rim * 0.4, 0.0, 1.0));
    a = clamp(uWash * 0.42 + inked * 0.5 + rim * 0.3 + vig * 0.6, 0.0, 0.92) * uAmount;
  } else {
    // a warm saffron-gold bloom over the room, a little stronger toward the edges
    a = (0.28 + 0.36 * smoothstep(0.2, 1.1, r)) * uAmount;
  }
  gl_FragColor = vec4(col, a);
}`

export interface Flash {
  mesh: THREE.Mesh
  /** `amount` fades the whole effect; `spread` drives the ink; `wash` the red beat over the room. */
  set(kind: 'right' | 'wrong', amount: number, spread: number, wash?: number): void
  fit(camera: THREE.PerspectiveCamera): void
  dispose(): void
}

export function createFlash(): Flash {
  const mat = new THREE.ShaderMaterial({
    vertexShader: FLASH_VS,
    fragmentShader: FLASH_FS,
    uniforms: {
      uColor: { value: new THREE.Color(0xf0a640) },
      uAmount: { value: 0 },
      uSpread: { value: 0 },
      uInk: { value: 0 },
      uWash: { value: 0 },
      uAspect: { value: 1 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    fog: false,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
  mesh.name = 'verdict-flash'
  mesh.renderOrder = 1000
  mesh.frustumCulled = false
  mesh.visible = false
  mesh.position.z = -0.1
  return {
    mesh,
    set(kind, amount, spread, wash = 0) {
      const u = mat.uniforms
      const ink = kind === 'wrong'
      if (u.uInk) u.uInk.value = ink ? 1 : 0
      if (u.uWash) u.uWash.value = wash
      // (written straight to the screen, so these are display colours)
      if (u.uColor) (u.uColor.value as THREE.Color).setRGB(ink ? 0.74 : 1.0, ink ? 0.05 : 0.7, ink ? 0.03 : 0.24)
      if (u.uAmount) u.uAmount.value = amount
      if (u.uSpread) u.uSpread.value = spread
      mat.blending = ink ? THREE.NormalBlending : THREE.AdditiveBlending
      mesh.visible = amount > 0.002
    },
    fit(camera) {
      const h = 2 * 0.1 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      mesh.scale.set(h * camera.aspect * 1.02, h * 1.02, 1)
      const u = mat.uniforms.uAspect
      if (u) u.value = camera.aspect
    },
    dispose: () => disposeTree(mesh),
  }
}

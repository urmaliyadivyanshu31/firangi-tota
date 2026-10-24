// A smooth closed surface from a signed distance field (negative inside), by naive surface nets:
// one point in every grid cell the surface passes through, at the mean of the crossings on its
// edges, a quad across every grid edge that crosses it, then each point pulled onto the surface
// along the field's gradient, which also gives it its normal. Used for the hands, so a hand is one
// seamless skin (fingers grown out of the palm) rather than parts butted together.

export type Field = (x: number, y: number, z: number) => number

export interface NetMesh {
  positions: Float32Array
  normals: Float32Array
  indices: Uint32Array
}

// the eight corners of a cell (bit 0 = +x, bit 1 = +y, bit 2 = +z) and its twelve edges
const EDGES: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
]

/**
 * Meshes the surface d = 0 of `sdf` inside the box [min, max], on a grid of `cell` metres. `relax`
 * passes pull each point onto the surface (the field should be close to a true distance there).
 */
export function surfaceNets(sdf: Field, min: readonly [number, number, number], max: readonly [number, number, number], cell: number, relax = 2): NetMesh {
  const nx = Math.ceil((max[0] - min[0]) / cell) + 1
  const ny = Math.ceil((max[1] - min[1]) / cell) + 1
  const nz = Math.ceil((max[2] - min[2]) / cell) + 1
  const field = new Float32Array(nx * ny * nz)
  for (let k = 0, n = 0; k < nz; k++) {
    const z = min[2] + k * cell
    for (let j = 0; j < ny; j++) {
      const y = min[1] + j * cell
      for (let i = 0; i < nx; i++, n++) field[n] = sdf(min[0] + i * cell, y, z)
    }
  }
  const at = (i: number, j: number, k: number) => i + nx * (j + ny * k)
  const cx = nx - 1
  const cy = ny - 1
  const cz = nz - 1
  const cellVert = new Int32Array(cx * cy * cz).fill(-1)
  const pos: number[] = []
  const v = new Float64Array(8)
  for (let k = 0; k < cz; k++) {
    for (let j = 0; j < cy; j++) {
      for (let i = 0; i < cx; i++) {
        let mask = 0
        for (let c = 0; c < 8; c++) {
          const d = field[at(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))] ?? 1
          v[c] = d
          if (d < 0) mask |= 1 << c
        }
        if (mask === 0 || mask === 255) continue
        let sx = 0
        let sy = 0
        let sz = 0
        let n = 0
        for (const [a, b] of EDGES) {
          const va = v[a] ?? 0
          const vb = v[b] ?? 0
          if (va < 0 === vb < 0) continue
          const t = va / (va - vb)
          sx += (a & 1) + ((b & 1) - (a & 1)) * t
          sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t
          sz += ((a >> 2) & 1) + (((b >> 2) & 1) - ((a >> 2) & 1)) * t
          n++
        }
        cellVert[i + cx * (j + cy * k)] = pos.length / 3
        pos.push(min[0] + (i + sx / n) * cell, min[1] + (j + sy / n) * cell, min[2] + (k + sz / n) * cell)
      }
    }
  }
  const cellAt = (i: number, j: number, k: number) => cellVert[i + cx * (j + cy * k)] ?? -1
  const idx: number[] = []
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    if (flip) [b, d] = [d, b]
    // split along the shorter diagonal
    const dac = (pos[a * 3]! - pos[c * 3]!) ** 2 + (pos[a * 3 + 1]! - pos[c * 3 + 1]!) ** 2 + (pos[a * 3 + 2]! - pos[c * 3 + 2]!) ** 2
    const dbd = (pos[b * 3]! - pos[d * 3]!) ** 2 + (pos[b * 3 + 1]! - pos[d * 3 + 1]!) ** 2 + (pos[b * 3 + 2]! - pos[d * 3 + 2]!) ** 2
    if (dac <= dbd) idx.push(a, b, c, a, c, d)
    else idx.push(b, c, d, b, d, a)
  }
  // every grid edge the surface crosses gets a quad of the four cells round it, facing out
  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const d0 = field[at(i, j, k)] ?? 1
        const in0 = d0 < 0
        if (i < cx && j > 0 && k > 0 && j < cy && k < cz && in0 !== (field[at(i + 1, j, k)] ?? 1) < 0)
          quad(cellAt(i, j - 1, k - 1), cellAt(i, j, k - 1), cellAt(i, j, k), cellAt(i, j - 1, k), !in0)
        if (j < cy && i > 0 && k > 0 && i < cx && k < cz && in0 !== (field[at(i, j + 1, k)] ?? 1) < 0)
          quad(cellAt(i - 1, j, k - 1), cellAt(i - 1, j, k), cellAt(i, j, k), cellAt(i, j, k - 1), !in0)
        if (k < cz && i > 0 && j > 0 && i < cx && j < cy && in0 !== (field[at(i, j, k + 1)] ?? 1) < 0)
          quad(cellAt(i - 1, j - 1, k), cellAt(i, j - 1, k), cellAt(i, j, k), cellAt(i - 1, j, k), !in0)
      }
    }
  }
  // onto the surface, and the normals from the field's gradient
  const count = pos.length / 3
  const positions = new Float32Array(pos)
  const normals = new Float32Array(count * 3)
  const h = cell * 0.05
  const grad = (x: number, y: number, z: number, out: Float64Array) => {
    out[0] = sdf(x + h, y, z) - sdf(x - h, y, z)
    out[1] = sdf(x, y + h, z) - sdf(x, y - h, z)
    out[2] = sdf(x, y, z + h) - sdf(x, y, z - h)
    const l = Math.hypot(out[0], out[1], out[2]) || 1
    out[0] /= l
    out[1] /= l
    out[2] /= l
  }
  const g = new Float64Array(3)
  for (let n = 0; n < count; n++) {
    let x = positions[n * 3]!
    let y = positions[n * 3 + 1]!
    let z = positions[n * 3 + 2]!
    // each pass steps along the gradient by the distance; the last gradient is the normal
    for (let r = 0; r < Math.max(1, relax); r++) {
      grad(x, y, z, g)
      const s = Math.max(-cell, Math.min(cell, sdf(x, y, z)))
      x -= g[0]! * s
      y -= g[1]! * s
      z -= g[2]! * s
    }
    positions[n * 3] = x
    positions[n * 3 + 1] = y
    positions[n * 3 + 2] = z
    normals[n * 3] = g[0]!
    normals[n * 3 + 1] = g[1]!
    normals[n * 3 + 2] = g[2]!
  }
  return { positions, normals, indices: Uint32Array.from(idx) }
}

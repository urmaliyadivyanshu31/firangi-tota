// Rasterizes a share card's SVG with resvg (off the main thread) and encodes it as a JPEG. The
// SVG holds only paths, so no font is loaded and no system font can creep in. A JPEG, not a PNG:
// the card's paper grain makes a PNG of about 750 KB, and WhatsApp drops preview images much over
// 300 KB; at this quality the card is about 150 KB. Server only.
import { renderAsync } from '@resvg/resvg-js'
import jpeg from 'jpeg-js'

const QUALITY = 84

export async function renderCard(svg: string): Promise<Uint8Array> {
  const image = await renderAsync(svg, {
    font: { loadSystemFonts: false },
    fitTo: { mode: 'original' },
    logLevel: 'off',
  })
  // the card is opaque (the desk fills it), so the pixels need no un-premultiplying
  const out = jpeg.encode({ data: image.pixels, width: image.width, height: image.height }, QUALITY)
  return new Uint8Array(out.data)
}

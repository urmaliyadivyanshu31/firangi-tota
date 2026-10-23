// A tiny element helper. No framework: screens build plain DOM and replace the root's contents.

export type Child = Node | string | number | null | undefined | false
type AttrValue = string | number | boolean | null | undefined | ((e: Event) => void)
export type Attrs = Record<string, AttrValue>

/**
 * h('button', { class: 'btn', onclick: fn, 'data-x': 1, hidden: true }, 'Label')
 * `on*` functions become listeners; `true` sets an empty attribute; null/undefined/false are skipped.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue
      if (typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v)
      else if (k === 'class') el.className = String(v)
      else el.setAttribute(k, v === true ? '' : String(v))
    }
  }
  append(el, children)
  return el
}

function append(el: Element, children: (Child | Child[])[]): void {
  for (const c of children) {
    if (Array.isArray(c)) append(el, c)
    else if (c === null || c === undefined || c === false) continue
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)))
  }
}

/** Parse a trusted, static SVG string (our own drawings and icons; never content or user text). */
export function svg(markup: string): SVGSVGElement {
  const tpl = document.createElement('template')
  tpl.innerHTML = markup.trim().replace(/>\s+</g, '><') // no stray whitespace text in the drawing
  return tpl.content.firstElementChild as SVGSVGElement
}

/** Replace everything inside `root` with `nodes`. */
export function mount(root: HTMLElement, ...nodes: Node[]): void {
  root.textContent = ''
  for (const n of nodes) root.appendChild(n)
}

/** Screen-reader announcement through one persistent polite live region. */
export function announce(text: string): void {
  let live = document.getElementById('ft-live')
  if (!live) {
    live = h('div', { id: 'ft-live', class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' })
    document.body.appendChild(live)
  }
  // Clear first so the same text twice is still announced.
  live.textContent = ''
  live.textContent = text
}

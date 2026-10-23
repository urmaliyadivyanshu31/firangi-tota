import { h, type Attrs, type Child } from './h'
import { backIcon } from './icons'
import { jaali } from './ornament'

// The paper card every overlay screen uses: handmade paper, a block-print border band (CSS) and a
// jaali corner. `body` scrolls inside the card; `foot` stays at the bottom with the actions.

export function card(cls: string, body: Child[], foot?: Child[], attrs: Attrs = {}): HTMLElement {
  return h('section', { ...attrs, class: `pcard ${cls}`.trim() },
    jaali('pcard__jaali'),
    h('div', { class: 'pcard__scroll' }, body),
    foot ? h('footer', { class: 'pcard__foot' }, foot) : null)
}

/** The back button that sits over the room, top left. */
export function backButton(label: string, onBack: () => void): HTMLButtonElement {
  return h('button', { class: 'back', type: 'button', 'data-action': 'back', onclick: onBack }, backIcon(), h('span', null, label))
}

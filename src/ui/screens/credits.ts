import creditsMd from '../../../CREDITS.md?raw'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { h, mount, type Child } from '../h'
import { backIcon } from '../icons'

const INSPIRATION = 'https://github.com/atomiquest/Politburo-or-Parrot'

export function renderCredits(root: HTMLElement, on: { back(): void }): void {
  const lang = getLang()
  const [before = '', after = ''] = t('creditsInspired', lang).split('{title}')
  mount(root, h('div', { class: 'screen screen--credits', lang },
    h('div', { class: 'scroll credits__scroll' },
      h('button', { class: 'back', type: 'button', 'data-action': 'back', onclick: () => on.back() }, backIcon(), h('span', null, t('back', lang))),
      h('article', { class: 'credits__paper mat-radio' },
        h('h1', null, t('credits', lang)),
        h('p', { class: 'credits__inspired' }, before, h('a', { href: INSPIRATION, target: '_blank', rel: 'noopener noreferrer' }, 'Politburo or Parrot'), after),
        h('ul', { class: 'credits__list' },
          h('li', null, t('creditsCode', lang)),
          h('li', null, t('creditsText', lang)),
          h('li', null, t('creditsFonts', lang))),
        h('p', null, t('creditsAssets', lang))),
      creditsDoc(creditsMd))))
}

// CREDITS.md, drawn from the file itself so the screen never drifts from the record. It handles
// the subset that file uses: ## headings, paragraphs, "- " lists and tables (one entry per row).

const URL_RE = /(https:\/\/[^\s;|)]*[^\s;|),.])/ // a trailing comma or full stop is not part of the link

/** Text with `code` unwrapped and https links made clickable. */
function inline(text: string): Child[] {
  return text.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').split(URL_RE).map((part, i) =>
    i % 2 === 1 ? h('a', { href: part, target: '_blank', rel: 'noopener noreferrer' }, part.replace(/^https:\/\//, '').replace(/\/$/, '')) : part)
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

function creditsDoc(md: string): HTMLElement {
  const out: HTMLElement[] = []
  const lines = md.split(/\r?\n/)
  let para: string[] = []
  const flush = () => {
    if (para.length) out.push(h('p', null, inline(para.join(' '))))
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim()
    if (line.startsWith('|')) {
      flush()
      const head = cells(line)
      const rows: string[][] = []
      while (i + 1 < lines.length && lines[i + 1]!.trim().startsWith('|')) {
        i++
        const row = cells(lines[i]!)
        if (!row.every((c) => /^:?-+:?$/.test(c))) rows.push(row)
      }
      out.push(h('ul', { class: 'credits__table' }, rows.map((row) =>
        h('li', null,
          h('strong', null, inline(row[0] ?? '')),
          row.slice(1).map((c, k) => (c ? h('span', { class: 'credits__cell' }, `${head[k + 1] ?? ''}: `, inline(c)) : null))))))
    } else if (line.startsWith('- ')) {
      flush()
      const items = [line.slice(2)]
      while (i + 1 < lines.length && lines[i + 1]!.trim().startsWith('- ')) items.push(lines[++i]!.trim().slice(2))
      out.push(h('ul', { class: 'credits__list' }, items.map((x) => h('li', null, inline(x)))))
    } else if (line.startsWith('## ')) {
      flush()
      out.push(h('h2', null, line.slice(3)))
    } else if (line.startsWith('# ') || line === '') {
      flush() // the screen has its own title
    } else {
      para.push(line)
    }
  }
  flush()
  return h('article', { class: 'credits__doc credits__paper mat-radio', lang: 'en' }, h('h2', { class: 'credits__file' }, 'CREDITS.md'), out)
}

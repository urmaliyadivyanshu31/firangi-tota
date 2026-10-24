import { devices, expect, test, type Browser, type Page } from '@playwright/test'

// Mobile smoke tests: the production build on a Pixel 5 (Chromium) and an iPhone 13 (WebKit).
// ?inspect exposes the game state (window.__ft) without the stage's debug overlay.

const START = '/?seed=1&lang=hi&tier=low&inspect'

interface FtState {
  screen: string
  intro: { settled: boolean } | null
  readable: boolean
  revealed: boolean
  desk: 'stage' | 'fallback' | null
  play: { era: { id: string }; state: { day: number; queue: { real: boolean }[] } } | null
  paperRect(): { x: number; y: number; w: number; h: number } | null
}

const ft = <T>(page: Page, pick: (f: FtState) => T): Promise<T> =>
  page.evaluate(`(${pick.toString()})(window.__ft)`) as Promise<T>

// every console error or uncaught exception, on every page a test opens, fails that test
let errors: string[] = []
function track(page: Page): Page {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}${m.location().url ? ` (${m.location().url})` : ''}`)
  })
  page.on('pageerror', (e) => errors.push(`uncaught: ${e.message}`))
  return page
}
test.beforeEach(({ page }) => {
  errors = []
  track(page)
})
test.afterEach(() => {
  expect(errors, 'console errors').toEqual([])
})

/** Begin opens the intro (who you are, who the Tota is); its Continue slip goes on to day 1. */
async function begin1857Easy(page: Page): Promise<void> {
  await expect(page.locator('.screen--main')).toBeVisible()
  await page.locator('[data-era="delhi-1857"]').click()
  await page.locator('[data-mode="easy"]').click()
  await page.locator('[data-action="begin"]').click()
  await expect(page.locator('.screen--intro')).toBeVisible()
  await page.locator('[data-action="intro-go"]').click()
  await expect(page.locator('.screen--day')).toBeVisible()
}

/** The paper has arrived: the stamps wake and the hidden copy carries the message. */
async function readable(page: Page): Promise<void> {
  await expect(page.locator('[data-stamp="asli"]')).toBeEnabled({ timeout: 30_000 })
  await expect(page.locator('[data-stamp="tota"]')).toBeEnabled()
  await expect(page.locator('.screen--day')).not.toHaveClass(/is-arriving/)
  await expect(page.locator('.day__message .msg__body')).not.toBeEmpty()
  await expect.poll(() => ft(page, (f) => f.readable)).toBe(true)
}

async function rightStamp(page: Page): Promise<'asli' | 'tota'> {
  const real = await ft(page, (f) => f.play!.state.queue[f.play!.state.day - 1]!.real)
  return real ? 'asli' : 'tota'
}

/** Stamp today's paper correctly and wait for the verdict on its back. */
async function stampAndReveal(page: Page): Promise<void> {
  await page.locator(`[data-stamp="${await rightStamp(page)}"]`).click()
  await expect(page.locator('.paper-result')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('[data-action="next"]')).toBeVisible()
  await expect(page.locator('.paper-result__mirror')).not.toBeEmpty()
  expect(await ft(page, (f) => f.revealed)).toBe(true)
}

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth)

test('loads in Hindi, begins 1857 Easy and the paper becomes readable', async ({ page }) => {
  await page.goto(START)
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await begin1857Easy(page)
  await readable(page)
  expect(await ft(page, (f) => f.play?.era.id)).toBe('delhi-1857')
  // the paper sits on screen, wide enough to read, clear of the top bar and the stamps
  const paper = await ft(page, (f) => f.paperRect())
  const vp = page.viewportSize()!
  expect(paper).not.toBeNull()
  expect(paper!.w).toBeGreaterThan(vp.width * 0.8)
  expect(paper!.x).toBeGreaterThanOrEqual(-1)
  expect(paper!.x + paper!.w).toBeLessThanOrEqual(vp.width + 1)
  const hudBottom = await page.locator('.hud').evaluate((el) => el.getBoundingClientRect().bottom)
  const stampsTop = await page.locator('.day__controls .tabs').evaluate((el) => el.getBoundingClientRect().top)
  expect(paper!.y).toBeGreaterThanOrEqual(hudBottom - 1)
  expect(paper!.y + paper!.h).toBeLessThanOrEqual(stampsTop + 1)
})

test('Begin shows who you are and who the Tota is, with their portraits, then goes on by itself', async ({ page }) => {
  const art = new Map<string, number>()
  page.on('response', (r) => {
    const p = new URL(r.url()).pathname
    if (p.startsWith('/art/')) art.set(p, r.status())
  })
  await page.goto('/?seed=1&lang=en&tier=low&inspect')
  await expect(page.locator('.screen--main')).toBeVisible()
  // the main page no longer carries the two lines, and no portrait loads before Begin
  await expect(page.locator('.doc__line')).toHaveCount(0)
  await page.waitForTimeout(500)
  expect(art.size).toBe(0)
  await page.locator('[data-era="bombay-1942"]').click()
  await page.locator('[data-action="begin"]').click()
  await expect(page.locator('.screen--intro')).toBeVisible()
  await expect(page.locator('.intro__copy')).toContainText('The Tota:')
  await expect.poll(() => ft(page, (f) => f.intro?.settled ?? null), { timeout: 15_000 }).toBe(true)
  expect(art.get('/art/bombay-1942-you.webp')).toBe(200)
  expect(art.get('/art/bombay-1942-tota.webp')).toBe(200)
  // about 6 s after the cards settle, day 1 begins without a tap
  await expect(page.locator('.screen--day')).toBeVisible({ timeout: 12_000 })
  await readable(page)
  expect(await ft(page, (f) => f.play?.era.id)).toBe('bombay-1942')
})

test('no horizontal scroll at 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto(START)
  await expect(page.locator('.screen--main')).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.locator('[data-action="begin"]').click()
  await expect(page.locator('.screen--intro')).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.locator('[data-action="intro-go"]').click()
  await expect(page.locator('.screen--day')).toBeVisible()
  await page.locator('[data-action="quit"]').click()
  await begin1857Easy(page)
  await readable(page)
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.locator('[data-tab="file"]').click()
  await expect(page.locator('.sheet--file')).toHaveClass(/is-open/)
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.locator('.sheet--file .sheet__close').click()
  await stampAndReveal(page)
  expect(await noHorizontalScroll(page)).toBe(true)
})

test('a stamp brings the reveal, then the next day', async ({ page }) => {
  await page.goto(START)
  await begin1857Easy(page)
  await readable(page)
  await stampAndReveal(page)
  await page.locator('[data-action="next"]').click()
  await readable(page)
  expect(await ft(page, (f) => f.play?.state.day)).toBe(2)
})

test('plays day 1 on the 2D fallback when WebGL is disabled', async ({ page, browserName, playwright }) => {
  let p = page
  let browser: Browser | null = null
  if (browserName === 'chromium') {
    browser = await playwright.chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] })
    p = track(await (await browser.newContext({ ...devices['Pixel 5'] })).newPage())
  } else {
    // WebKit has no switch for it: take the context away before the page asks for one
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null
        return (get as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => RenderingContext | null).call(this, type, ...rest)
      } as typeof HTMLCanvasElement.prototype.getContext
    })
  }
  try {
    await p.goto(START)
    await begin1857Easy(p)
    await readable(p)
    expect(await ft(p, (f) => f.desk)).toBe('fallback')
    await expect(p.locator('#stage canvas').first()).toBeVisible()
    await stampAndReveal(p)
  } finally {
    await browser?.close()
  }
})

test('a lost WebGL context mid-day keeps the stamps working', async ({ page }) => {
  await page.goto(START)
  await begin1857Easy(page)
  await readable(page)
  // a browser without WebGL (WebKit on a CI box) is on the 2D desk already: nothing to lose
  test.skip((await ft(page, (f) => f.desk)) !== 'stage', 'this browser has no WebGL context to lose')
  await page.evaluate(() => {
    const canvas = document.querySelector('#stage canvas')
    if (!canvas) throw new Error('no stage canvas')
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  })
  await expect.poll(() => ft(page, (f) => f.desk)).toBe('fallback')
  // the same day carries on: the stamps still work and the verdict still shows
  expect(await ft(page, (f) => f.play?.state.day)).toBe(1)
  await expect(page.locator('[data-stamp="asli"]')).toBeEnabled()
  await stampAndReveal(page)
})

test('plays offline after the first visit (read-aloud excepted)', async ({ page, context }) => {
  await page.goto(START)
  await expect(page.locator('.screen--main')).toBeVisible()
  // the service worker installs (precaching the shell) and takes this page
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 })
  await expect.poll(() => ft(page, (f) => f.desk), { timeout: 30_000 }).not.toBeNull()
  const cachedUrls = () => page.evaluate(async () => {
    const out: Record<string, string[]> = {}
    for (const name of await caches.keys()) out[name] = (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname)
    return out
  })
  // the precache holds the shell (the lazy stage chunk too) and the core fonts, never recorded audio (R34)
  const before = await cachedUrls()
  const precache = Object.entries(before).filter(([n]) => n.includes('precache')).flatMap(([, u]) => u)
  expect(precache).toContain('/index.html')
  expect(precache.some((u) => /\/assets\/stage-.*\.js$/.test(u))).toBe(true)
  expect(precache).toContain('/fonts/mukta-400-latin.woff2')
  expect(precache.some((u) => u.startsWith('/audio/'))).toBe(false)
  expect(precache.some((u) => /mukta-700/.test(u))).toBe(false)
  // the first visit plays a day: the first tap starts the room's sound, and the recording and the
  // day's fonts (the bolder weights, the pencil hand) are cached on that first use
  await begin1857Easy(page)
  await readable(page)
  await stampAndReveal(page)
  await expect.poll(async () => Object.values(await cachedUrls()).flat().includes('/audio/delhi-1857.m4a'), { timeout: 30_000 }).toBe(true)
  // the intro's two portraits were fetched at Begin and kept for next time
  await expect.poll(async () => Object.values(await cachedUrls()).flat().filter((u) => u.startsWith('/art/delhi-1857-')).length, { timeout: 30_000 }).toBe(2)
  expect(precache.some((u) => u.startsWith('/art/'))).toBe(false)
  await expect.poll(async () => Object.values(await cachedUrls()).flat().some((u) => /\/assets\/note-hand-.*\.woff2$/.test(u)), { timeout: 30_000 }).toBe(true)
  expect(Object.values(await cachedUrls()).flat().some((u) => u.startsWith('/api/'))).toBe(false)
  await context.setOffline(true)
  try {
    await page.reload()
    await begin1857Easy(page)
    await readable(page)
    // the lazy stage chunk came from the cache (WebKit without WebGL uses the 2D desk, also cached)
    expect(await ft(page, (f) => f.desk)).not.toBeNull()
    await stampAndReveal(page)
  } finally {
    await context.setOffline(false)
  }
})

test('plays under the production security headers (vercel.json) with no policy violations', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] }
    w.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
  })
  const res = await page.goto(START)
  const csp = res!.headers()['content-security-policy'] ?? ''
  expect(csp).toContain("script-src 'self'")
  expect(csp).toContain("frame-ancestors 'none'")
  expect(csp).not.toContain('unsafe-eval')
  expect(res!.headers()['x-content-type-options']).toBe('nosniff')
  expect(res!.headers()['permissions-policy']).toContain('microphone=()')
  await begin1857Easy(page)
  await readable(page)
  await stampAndReveal(page)
  // a tap area over the paper's source line, or the visible chit when the flip wasn't done in time
  await page.locator('[data-action="source"]').click()
  expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)).toEqual([])
})

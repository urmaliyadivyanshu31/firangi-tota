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

/** Stamp today's paper correctly and wait for the verdict on its back (no Next: it leads on by itself). */
async function stampAndReveal(page: Page): Promise<void> {
  await page.locator(`[data-stamp="${await rightStamp(page)}"]`).click()
  await expect(page.locator('.paper-result')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.screen--day.is-auto')).toBeVisible()
  await expect(page.locator('[data-action="next"]')).toHaveCount(0)
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

test('a right stamp brings the reveal, then the paper goes in the basket and the next day starts by itself', async ({ page }) => {
  await page.goto(START)
  await begin1857Easy(page)
  await readable(page)
  await stampAndReveal(page)
  // the verdict holds to be read: still day 1 a moment later
  await page.waitForTimeout(1200)
  expect(await ft(page, (f) => f.play?.state.day)).toBe(1)
  await expect.poll(() => ft(page, (f) => f.play?.state.day), { timeout: 15_000 }).toBe(2)
  await readable(page)
})

test('a tap on the room sends the read paper on at once', async ({ page }) => {
  await page.goto(START)
  await begin1857Easy(page)
  await readable(page)
  await stampAndReveal(page)
  await page.waitForTimeout(700) // the first moment is the tail of a skip, not a toss
  const vp = page.viewportSize()!
  await page.mouse.click(vp.width / 2, vp.height * 0.4)
  // the toss takes about 1.5 s; without the tap the hold alone would run 3 s first
  await expect.poll(() => ft(page, (f) => f.play?.state.day), { timeout: 2600, intervals: [100] }).toBe(2)
  await readable(page)
})

test('a wrong stamp plays out over time, then ends the chapter on the paper; a tap skips it', async ({ page }) => {
  const wrongStamp = async () => {
    await readable(page)
    const t0 = Date.now()
    await page.locator(`[data-stamp="${(await rightStamp(page)) === 'asli' ? 'tota' : 'asli'}"]`).click()
    await expect(page.locator('.screen--day.is-stamping')).toBeVisible()
    return t0
  }
  await page.goto(START)
  await begin1857Easy(page)
  // the stamp, a beat of silence, the alarm, the room answering it and the dark, then the verdict
  const t0 = await wrongStamp()
  await expect(page.locator('.paper-result')).toBeVisible({ timeout: 30_000 })
  const whole = Date.now() - t0
  expect(whole).toBeGreaterThan(3500)
  await expect(page.locator('[data-action="again"]')).toBeVisible()
  expect(await ft(page, (f) => f.revealed)).toBe(true)
  // again, and this time a tap on the Skip chip during the alarm goes straight to the verdict
  await page.locator('[data-action="again"]').click()
  const t1 = await wrongStamp()
  await page.waitForTimeout(1600) // the stamp has come home and the alarm is sounding
  await page.locator('[data-action="skip"]').click()
  await expect(page.locator('.paper-result')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('[data-action="again"]')).toBeVisible()
  expect(Date.now() - t1).toBeLessThan(whole - 1500) // the rest of the alarm and the dark were skipped
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

test('a caught chapter shares a post card whose link previews as a large card and opens the chapter for a friend', async ({ page, request, browser }) => {
  await page.goto(START)
  await begin1857Easy(page)
  await readable(page)
  await page.locator(`[data-stamp="${(await rightStamp(page)) === 'asli' ? 'tota' : 'asli'}"]`).click()
  await expect(page.locator('[data-action="share"]')).toBeVisible({ timeout: 30_000 })
  await page.locator('[data-action="share"]').click()
  const slip = page.locator('.share-slip')
  await expect(slip).toBeVisible()
  for (const k of ['whatsapp', 'x', 'copy']) await expect(slip.locator(`[data-share="${k}"]`)).toBeVisible()
  await expect(slip.locator('.share-slip__link')).toHaveText(/\/s\/1857-e0c-hi$/)
  await expect(slip.locator('.share-slip__msg')).toContainText('दिल्ली 1857 में बहादुर शाह ज़फ़र के दरबार में पहले दिन')
  expect(await noHorizontalScroll(page)).toBe(true)
  await slip.locator('[data-action="close-share"]').click()
  await expect(slip).toHaveCount(0)

  // what a link-preview crawler sees: the card tags, an absolute image URL, a 1200x630 JPEG behind it
  const shared = await request.get('/s/1857-e0c-hi', { headers: { 'User-Agent': 'Twitterbot/1.0' } })
  expect(shared.status()).toBe(200)
  const html = await shared.text()
  expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
  const image = html.match(/property="og:image" content="([^"]+)"/)![1]!.replace(/&amp;/g, '&')
  expect(image).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/api\/og\?c=1857-e0c-hi&v=[0-9a-f]{8}$/)
  const card = await request.get(image)
  expect(card.status()).toBe(200)
  expect(card.headers()['content-type']).toBe('image/jpeg')
  expect(card.headers()['cache-control']).toContain('immutable')
  expect((await card.body()).length).toBeLessThan(300 * 1024)

  // a friend who taps it, with no offline copy yet, lands on the main page with the chapter and mode picked
  const friendCtx = await browser.newContext()
  const friend = track(await friendCtx.newPage())
  try {
    await friend.goto('/s/1857-h3c-en')
    await expect(friend.locator('.screen--main')).toBeVisible({ timeout: 20_000 })
    await expect(friend.locator('[data-era="delhi-1857"]')).toHaveClass(/is-on/)
    await expect(friend.locator('[data-mode="hard"]')).toHaveClass(/is-on/)
    expect(new URL(friend.url()).pathname + new URL(friend.url()).search).toBe('/')
  } finally {
    await friendCtx.close()
  }
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

import { describe, expect, it, vi } from 'vitest'

function fakeWindow(controller: object | null) {
  const listeners: (() => void)[] = []
  const reload = vi.fn()
  const win = {
    navigator: { serviceWorker: { controller, addEventListener: (_: string, fn: () => void) => listeners.push(fn) } },
    location: { reload },
  } as unknown as Window
  return { win, reload, fire: () => listeners.forEach((f) => f()) }
}

describe('watchForUpdate', () => {
  it('reloads at once when a new version takes over on the main page', async () => {
    vi.resetModules()
    const { watchForUpdate, updateWaiting } = await import('../src/update')
    const w = fakeWindow({})
    watchForUpdate(() => true, w.win)
    w.fire()
    expect(w.reload).toHaveBeenCalledTimes(1)
    expect(updateWaiting()).toBe(true)
  })

  it('waits for the main page when the player is mid-chapter', async () => {
    vi.resetModules()
    const { watchForUpdate, updateWaiting } = await import('../src/update')
    const w = fakeWindow({})
    watchForUpdate(() => false, w.win)
    w.fire()
    expect(w.reload).not.toHaveBeenCalled()
    expect(updateWaiting()).toBe(true)
  })

  it('ignores the first worker of a first visit', async () => {
    vi.resetModules()
    const { watchForUpdate, updateWaiting } = await import('../src/update')
    const w = fakeWindow(null)
    watchForUpdate(() => true, w.win)
    w.fire()
    expect(w.reload).not.toHaveBeenCalled()
    expect(updateWaiting()).toBe(false)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { silentUnderAutomation } from '../../src/audio/automation'

describe('silentUnderAutomation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.history.replaceState(null, '', '/')
  })

  it('is silent when a browser is driven by automation', () => {
    vi.stubGlobal('navigator', { ...navigator, webdriver: true })
    expect(silentUnderAutomation()).toBe(true)
  })

  it('plays for a person, and for automation that asks for ?sound=1', () => {
    vi.stubGlobal('navigator', { ...navigator, webdriver: false })
    expect(silentUnderAutomation()).toBe(false)
    vi.stubGlobal('navigator', { ...navigator, webdriver: true })
    window.history.replaceState(null, '', '/?sound=1')
    expect(silentUnderAutomation()).toBe(false)
  })
})

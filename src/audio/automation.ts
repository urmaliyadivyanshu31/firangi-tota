// A browser driven by automation (Playwright captures, the e2e suite) plays the game silently, so
// test runs never sound through the speakers of the machine running them. Add ?sound=1 to hear it.
export function silentUnderAutomation(): boolean {
  try {
    return navigator.webdriver === true && !/[?&]sound=1(?:&|$)/.test(location.search)
  } catch {
    return false
  }
}

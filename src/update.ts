// A new version took over: the service worker updates in the background (autoUpdate, skipWaiting,
// clientsClaim), but the open page still runs the old code until it reloads. So it reloads at a
// safe moment: at once on the main page, or the next time the player comes back to it, never in
// the middle of a chapter (owner 10-24: players met the old sound and build until a later visit).

let waiting = false

export function watchForUpdate(onMainPage: () => boolean, win: Window = window): void {
  const sw = win.navigator.serviceWorker as ServiceWorkerContainer | undefined
  // a first visit has no worker yet: the first one taking control replaces nothing
  if (!sw || !sw.controller) return
  sw.addEventListener('controllerchange', () => {
    if (waiting) return
    waiting = true
    if (onMainPage()) win.location.reload()
  })
}

/** A newer version is waiting for the next safe moment (the main page). */
export function updateWaiting(): boolean {
  return waiting
}

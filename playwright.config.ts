import { defineConfig, devices } from '@playwright/test'

// Mobile smoke tests against the production build (`npm run build` first): `vite preview` serves
// dist/ with the service worker, as a player gets it. Chromium needs SwiftShader for WebGL2 on
// machines without a GPU (CI); WebKit stands in for iPhone Safari.
const PORT = Number(process.env.E2E_PORT ?? 4318) // two worktrees can run the suite side by side
const CI = !!process.env.CI

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  workers: CI ? 2 : 3,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'], launchOptions: { args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] } },
    },
    { name: 'iPhone 13', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
})

// Entry point: styles, then the controller. three.js is not imported here (it loads lazily).
import './ui/styles.css'
import { startApp } from './app'
import { warmFirstUseCache } from './offline'

const stage = document.getElementById('stage')
const ui = document.getElementById('ui')
if (stage && ui) startApp({ stage, ui }, { now: Date.now, random: Math.random, url: new URL(location.href) })
warmFirstUseCache()

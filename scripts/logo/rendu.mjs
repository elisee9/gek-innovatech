// node scripts/logo/rendu.mjs <rendu.json> (appelé par generer.py) : rend chaque SVG en PNG à fond transparent, à la taille exacte,
// avec un Chrome à part (profil temporaire, port libre choisi par Chrome).
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

const pause = ms => new Promise(r => setTimeout(r, ms))
const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const profil = mkdtempSync(join(tmpdir(), 'cr-'))
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--hide-scrollbars', `--user-data-dir=${profil}`, 'about:blank'],
  { stdio: ['ignore', 'pipe', 'pipe'] })
const wsBrowser = await new Promise((res, rej) => {
  let t = ''
  const lire = d => { t += d; const m = t.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]) }
  chrome.stderr.on('data', lire); chrome.stdout.on('data', lire)
  setTimeout(() => rej(new Error('Chrome muet')), 30000)
})
const host = new URL(wsBrowser).host
const page = (await (await fetch(`http://${host}/json/list`)).json()).find(t => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let n = 0
const att = new Map()
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id) } })
const cmd = (method, params = {}) => new Promise((res, rej) => { const id = ++n; att.set(id, m => m.error ? rej(new Error(method + ' : ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id, method, params })) })

await cmd('Runtime.enable')
await cmd('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
let done = 0
for (const job of jobs) {
  await cmd('Emulation.setDeviceMetricsOverride', { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false })
  const html = `<style>html,body{margin:0;background:transparent}svg{display:block;width:${job.w}px;height:${job.h}px}</style>${job.svg}`
  await cmd('Runtime.evaluate', { expression: `document.documentElement.innerHTML=${JSON.stringify(html)}; new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))`, awaitPromise: true })
  const shot = await cmd('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: job.w, height: job.h, scale: 1 } })
  mkdirSync(dirname(job.out), { recursive: true })
  writeFileSync(job.out, Buffer.from(shot.data, 'base64'))
  done++
}
console.log(`${done} images rendues`)
const wb = new WebSocket(wsBrowser)
await new Promise(res => wb.addEventListener('open', res))
wb.send(JSON.stringify({ id: 1, method: 'Browser.close' }))
await pause(1200)
try { rmSync(profil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch {}
process.exit(0)

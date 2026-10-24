// The caught sequence's score: one per era, the alarm first, the room answering it, then the dark.
import { describe, expect, it } from 'vitest'
import type { EraId } from '../../src/content/types'
import {
  BUGLE_FIGURES_MS, CAUGHT_MS, DARK_MS, DRUM_ACCENT_MS, KNOCK_RAPS_MS, PHONE_RINGS_MS, SILENCE_MS, WAIL_RISE_MS,
  beamAt, caughtScore, redAt,
} from '../../src/scene/caught'

const ERAS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']
const ALARM_CUES = new Set(['bugleAlarm', 'kettleDrum', 'whistleShort', 'whistleLong', 'bootsRunning', 'airRaidWail', 'phoneBell'])

describe('caughtScore', () => {
  for (const era of ERAS) {
    it(`${era}: silence, the alarm with 2-4 red pulses on it, three knocks coming closer, then the dark`, () => {
      const s = caughtScore(era)
      const at = s.beats.map((b) => b.at)
      expect(at).toEqual([...at].sort((a, b) => a - b))
      // nothing sounds in the silence; the alarm is the first thing heard
      const first = s.beats.find((b) => b.cue)!
      expect(first.at).toBeGreaterThanOrEqual(SILENCE_MS)
      expect(first.at).toBeLessThanOrEqual(SILENCE_MS + 30)
      expect(ALARM_CUES.has(first.cue!)).toBe(true)
      expect(s.flicker[0]).toBeGreaterThan(0)
      expect(s.flicker[1]).toBeLessThan(s.alarm)
      // the red light keeps the alarm's time: every pulse is during the alarm, before the knocks
      const pulses = s.beats.filter((b) => b.pulse)
      expect(pulses.length).toBeGreaterThanOrEqual(2)
      expect(pulses.length).toBeLessThanOrEqual(4)
      expect(pulses[0]!.at - first.at).toBeLessThanOrEqual(30) // (1857: the drum roll starts a hair before the bugle)
      const knocks = s.beats.filter((b) => b.cue?.startsWith('knock'))
      expect(knocks.map((b) => b.cue)).toEqual(['knockFar', 'knockNear', 'knockDoor'])
      for (const p of pulses) expect(p.at).toBeLessThan(knocks[0]!.at)
      // each knock's raps shake the room; the door is struck three times
      expect(s.beats.filter((b) => b.rap === 'door')).toHaveLength(KNOCK_RAPS_MS.door.length)
      expect(s.beats.filter((b) => b.rap).length).toBe(KNOCK_RAPS_MS.far.length + KNOCK_RAPS_MS.near.length + KNOCK_RAPS_MS.door.length)
      // every rap is over before the dark, which cuts the alarm off and lays a swell under the quiet
      for (const b of s.beats.filter((x) => x.rap)) expect(b.at).toBeLessThan(s.dark)
      expect(s.beats.filter((b) => b.at === s.dark).map((b) => b.cue)).toEqual(['caughtHush', 'caughtDark'])
      expect(s.beats[s.beats.length - 1]!.at).toBe(s.dark)
      // the beam sweeps while the alarm sounds; the camera closes in before the dark
      expect(s.beam.from).toBeGreaterThan(s.alarm)
      expect(s.beam.to).toBeLessThan(s.dark)
      expect(s.push[0]).toBeGreaterThan(s.alarm + 950)
      expect(s.push[1]).toBe(s.dark)
      // about four seconds, unhurried, with a held beat in the dark before the verdict
      expect(s.end).toBe(CAUGHT_MS)
      expect(s.end - s.dark).toBeGreaterThanOrEqual(500)
      expect(s.end).toBeGreaterThanOrEqual(3500)
      expect(s.end).toBeLessThanOrEqual(4500)
    })
  }

  it('sounds like its own time in every chapter', () => {
    const alarms = ERAS.map((e) => caughtScore(e).beats.filter((b) => b.cue && ALARM_CUES.has(b.cue)).map((b) => b.cue).join(' '))
    expect(new Set(alarms).size).toBe(ERAS.length)
    expect(alarms[0]).toContain('bugleAlarm')
    expect(alarms[0]).toContain('kettleDrum')
    expect(alarms[1]).toContain('bootsRunning')
    expect(alarms[2]).toContain('airRaidWail')
    expect(alarms[3]).toContain('phoneBell')
  })

  it('pulses land on the hits inside the cues: the bugle figures, the drum accent, the rings, the siren rise', () => {
    const at = (era: EraId) => caughtScore(era).beats.filter((b) => b.pulse).map((b) => b.at)
    const bugle = caughtScore('delhi-1857').beats.find((b) => b.cue === 'bugleAlarm')!.at
    const drum = caughtScore('delhi-1857').beats.find((b) => b.cue === 'kettleDrum')!.at
    expect(at('delhi-1857')).toEqual([bugle + BUGLE_FIGURES_MS[0], bugle + BUGLE_FIGURES_MS[1], drum + DRUM_ACCENT_MS])
    expect(drum + DRUM_ACCENT_MS).toBe(bugle + BUGLE_FIGURES_MS[2]) // the roll ends with the last figure
    const phone = caughtScore('delhi-1947').beats.find((b) => b.cue === 'phoneBell')!.at
    expect(at('delhi-1947').slice(0, 2)).toEqual(PHONE_RINGS_MS.map((d) => phone + d))
    const wail = caughtScore('bombay-1942').beats.find((b) => b.cue === 'airRaidWail')!.at
    expect(at('bombay-1942')).toContain(wail + WAIL_RISE_MS)
  })

  it('a shorter silence (the stamp already held the pause) moves everything up, the flicker inside it', () => {
    const full = caughtScore('lahore-1929')
    const short = caughtScore('lahore-1929', 120)
    const shift = SILENCE_MS - 120
    expect(short.alarm).toBe(120)
    expect(short.beats.map((b) => b.at)).toEqual(full.beats.map((b) => b.at - shift))
    expect(short.dark).toBe(DARK_MS - shift)
    expect(short.end).toBe(CAUGHT_MS - shift)
    expect(short.flicker[1]).toBeLessThan(short.alarm)
    expect(caughtScore('lahore-1929', 9999).alarm).toBe(SILENCE_MS)
    expect(caughtScore('lahore-1929', -5).beats[0]!.at).toBeGreaterThanOrEqual(0)
  })
})

describe('the red light and the beam', () => {
  it('no red before the alarm; each pulse strikes and fades; the ink creeps further in with each one', () => {
    const s = caughtScore('delhi-1857')
    const [p1, p2] = s.beats.filter((b) => b.pulse)
    expect(redAt(s, s.alarm - 10).pulse).toBe(0)
    expect(redAt(s, p1!.at + 70).pulse).toBeCloseTo(p1!.pulse!, 5)
    expect(redAt(s, p1!.at + 400).pulse).toBeLessThan(redAt(s, p1!.at + 70).pulse * 0.6)
    expect(redAt(s, p2!.at + 400).creep).toBeGreaterThan(redAt(s, p1!.at + 400).creep)
    expect(redAt(s, s.end).creep).toBeLessThanOrEqual(1)
  })

  it('the beam is dark outside its window and is carried across from one side to the other', () => {
    const { beam } = caughtScore('bombay-1942')
    expect(beamAt(beam, beam.from - 1).amount).toBe(0)
    expect(beamAt(beam, beam.to + 1).amount).toBe(0)
    const early = beamAt(beam, beam.from + (beam.to - beam.from) * 0.1)
    const mid = beamAt(beam, (beam.from + beam.to) / 2)
    const late = beamAt(beam, beam.from + (beam.to - beam.from) * 0.9)
    expect(early.sweep).toBeLessThan(-0.8)
    expect(Math.abs(mid.sweep)).toBeLessThan(0.05)
    expect(late.sweep).toBeGreaterThan(0.8)
    expect(mid.amount).toBeGreaterThan(early.amount)
    expect(mid.amount).toBeCloseTo(1, 5) // a bulb does not flicker; a mashaal would
  })
})

describe('the light from outside fits its year', () => {
  it('a flame (1857 mashaal) or an oil lantern (1929) spills a glow; only electric lights (1942, 1947) make a beam', () => {
    expect(caughtScore('delhi-1857').beam.shape).toBe('glow')
    expect(caughtScore('lahore-1929').beam.shape).toBe('glow')
    expect(caughtScore('bombay-1942').beam.shape).toBe('cone')
    expect(caughtScore('delhi-1947').beam.shape).toBe('cone')
  })
})

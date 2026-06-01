// =============================================================================
// Tests — ein kleines Beispiel
//
// Tests prüfen automatisch, ob Ihr Code das macht, was er soll.
// Dieses Beispiel zeigt, wie ein Test aussieht. Mehr brauchen Sie nicht,
// um anzufangen — ergänzen Sie weitere Tests, wenn Sie eigene Funktionen
// schreiben.
//
// Ausführen:  npm test
// =============================================================================

// Hinweis: In Pages/Components brauchen Sie KEIN `import` für Funktionen
// aus `app/utils/` — Nuxt importiert sie automatisch. Hier (im Test) läuft
// jedoch nur Vitest ohne Nuxt-Runtime, deshalb ist der Import explizit.
import { describe, it, expect } from 'vitest'
import { isValidMatrikel } from '../app/utils/booking.js'

describe('isValidMatrikel', () => {
  it('akzeptiert 5- bis 8-stellige Zahlen', () => {
    expect(isValidMatrikel('12345')).toBe(true)
    expect(isValidMatrikel('12345678')).toBe(true)
  })

  it('lehnt zu kurze oder zu lange Eingaben ab', () => {
    expect(isValidMatrikel('1234')).toBe(false)
    expect(isValidMatrikel('123456789')).toBe(false)
  })

  it('lehnt Buchstaben ab', () => {
    expect(isValidMatrikel('abc12')).toBe(false)
  })
})

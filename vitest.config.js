// Vitest-Konfiguration für Unit-Tests
//
// Wir verwenden hier bewusst NICHT @nuxt/test-utils/config,
// da unsere Tests reine Hilfsfunktionen prüfen und keine
// Nuxt-Instanz benötigen. Das beschleunigt die Tests erheblich
// und vermeidet Kompatibilitätsprobleme mit neueren Node-Versionen.

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
    testTimeout: 10000
  }
})

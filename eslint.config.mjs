// ESLint-Konfiguration
//
// `withNuxt` zieht die von Nuxt generierte Config mit ein. Dadurch kennt
// ESLint alle Nuxt-Auto-Imports (useFetch, defineNuxtConfig, …) und meldet
// sie nicht mehr als undefiniert.
//
// Voraussetzung: `npx nuxi prepare` wurde mindestens einmal ausgeführt
// (passiert automatisch beim `npm install` durch das prepare-Skript).

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'vue/html-self-closing': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off'
  },
  ignores: ['.nuxt/', '.output/', 'dist/', 'node_modules/']
})

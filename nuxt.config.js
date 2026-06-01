// Nuxt-Konfiguration
// Doku: https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // In Nuxt 4 liegt der Anwendungscode standardmäßig in `app/`.
  // (In Nuxt 3 lagen pages/, components/, layouts/, app.vue im Root.)
  //srcDir: 'app/',

  modules: [
    '@nuxt/eslint'
  ],

  // Supabase-Verbindung über Environment-Variablen.
  // Werte in `.env` eintragen — siehe `.env.example`.
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },

  devtools: { enabled: true }
})

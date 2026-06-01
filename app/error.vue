<!--
  Error-Page (z. B. 404 — Seite nicht gefunden)
  ---------------------------------------------------------------------------
  Diese Datei ersetzt die Standard-Fehlerseite von Nuxt. Sie wird automatisch
  angezeigt, wenn eine URL nicht existiert oder mit `createError` ein Fehler
  geworfen wird.

  Beispiel: http://localhost:3000/gibtsnicht  → diese Seite

  → Vorlesung S. 434–435
-->
<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p class="message">{{ errorMessage }}</p>
    <NuxtLink to="/" class="back">Zurück zur Startseite</NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// Freundliche Standardmeldung, falls keine eigene gesetzt ist.
const errorMessage = props.error?.statusCode === 404
  ? 'Diese Seite existiert nicht.'
  : (props.error?.message || 'Ein unerwarteter Fehler ist aufgetreten.')
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.error-page h1 {
  font-size: 6rem;
  margin: 0;
  color: #003366;
}

.message {
  font-size: 1.5rem;
  color: #444;
  margin: 1rem 0 2rem;
}

.back {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #003366;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
}

.back:hover {
  background: #00509e;
}
</style>

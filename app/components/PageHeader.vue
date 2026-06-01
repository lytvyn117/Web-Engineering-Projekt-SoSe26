<!--
  PageHeader — wiederverwendbare Komponente
  ---------------------------------------------------------------------------
  Komponenten in `app/components/` werden von Nuxt automatisch global
  registriert. Sie können <PageHeader> in jeder Seite verwenden, ohne
  vorher etwas zu importieren.

  Verwendung:
    <PageHeader title="Mein Titel" subtitle="Optional" />

  → Vorlesung S. 425–428
-->
<template>
  <header class="page-header">
    <h1>{{ title }}</h1>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup>
// defineProps macht Werte verfügbar, die von außen übergeben werden.
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e5e5;
}

.page-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  color: #003366;
}

.subtitle {
  margin: 0;
  color: #666;
}
</style>
